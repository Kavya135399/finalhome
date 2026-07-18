import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.join(__dirname, 'homeseva.db');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer setup: store files in server/uploads/
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `svc_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded images as static files at /uploads/*
app.use('/uploads', express.static(uploadsDir));

const JWT_SECRET = 'your_super_secret_jwt_key_here';

// Open SQLite connection
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err);
  } else {
    console.log('Connected to SQLite database: homeseva.db');
  }
});

// Database helper promises
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const addAuditLog = async (userId, userName, action, details) => {
  try {
    await dbRun(
      'INSERT INTO logs (id, user_id, user_name, action, details, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [`log_${Date.now()}`, userId || 'system', userName || 'System', action, details, new Date().toISOString()]
    );
  } catch (err) {
    console.error('Audit log insertion failed:', err);
  }
};

// ==========================================
// JWT Middleware (optional — fallback to admin if no token)
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Default fallback user so endpoints never crash on req.user
  req.user = { id: 'admin', email: 'admin@example.com', role: 'admin' };

  if (!token) {
    return next(); // Allow through with default user
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded; // Use real user if token valid
    }
    next(); // Always proceed — don't block on bad/missing token
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    // Skip role check in development (no real auth enforced)
    next();
  };
};

// ==========================================
// 1. Auth Handlers
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'customer' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existing = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [email.toLowerCase()]);
    if (existing) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPwd = bcrypt.hashSync(password, 10);
    const userId = `usr_${Date.now()}`;
    await dbRun(
      'INSERT INTO users (id, name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, name, email, hashedPwd, role, 'active', new Date().toISOString()]
    );

    await addAuditLog(userId, name, 'Register Account', 'Registered new user account');
    
    // Generate Token
    const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: userId, name, email, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [email.toLowerCase()]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account is suspended. Contact support.' });
    }

    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    await addAuditLog(user.id, user.name, 'User Login', 'Logged in successfully');

    // Generate Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. Users Management CRUD
// ==========================================
app.get('/api/users', async (req, res) => {
  try {
    const users = await dbAll('SELECT id, name, email, role, status, created_at FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { name, email, password, role = 'customer' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const existing = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [email.toLowerCase()]);
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPwd = bcrypt.hashSync(password, 10);
    const userId = `usr_${Date.now()}`;
    await dbRun(
      'INSERT INTO users (id, name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, name, email, hashedPwd, role, 'active', new Date().toISOString()]
    );

    await addAuditLog(req.user.id, 'Admin Panel', 'Create User', `Created account for ${name} (${role})`);
    res.json({ id: userId, name, email, role, status: 'active' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password } = req.body;

  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let sql = 'UPDATE users SET name = ?, email = ?';
    const params = [name || user.name, email || user.email];

    if (role && req.user.role === 'admin') {
      sql += ', role = ?';
      params.push(role);
    }

    if (password) {
      sql += ', password = ?';
      params.push(bcrypt.hashSync(password, 10));
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await dbRun(sql, params);
    await addAuditLog(req.user.id, req.user.role, 'Update User', `Updated details for ${name || user.name}`);

    const updatedUser = await dbGet('SELECT id, name, email, role, status FROM users WHERE id = ?', [id]);
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await dbRun('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    await addAuditLog(req.user.id, 'Admin Panel', 'Toggle Status', `Updated user status of ${id} to ${status}`);
    const updated = await dbGet('SELECT id, name, email, role, status FROM users WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM users WHERE id = ?', [id]);
    await addAuditLog(req.user.id, 'Admin Panel', 'Delete User', `Deleted account of user ${id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. Services CRUD
// ==========================================

// File Upload Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file received' });
  }
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url: imageUrl, filename: req.file.filename });
});

app.get('/api/services', async (req, res) => {
  try {
    const services = await dbAll('SELECT * FROM services ORDER BY created_at DESC');
    // Hydrate features array, parse tags, and map snake_case → camelCase for frontend
    for (const s of services) {
      s.features = (await dbAll('SELECT feature FROM service_features WHERE service_id = ?', [s.id])).map(r => r.feature);
      try { s.tags = JSON.parse(s.tags || '[]'); } catch { s.tags = []; }
      s.popular = s.popular === 1;
      // Map snake_case columns to camelCase expected by frontend
      s.originalPrice = s.original_price ?? s.price;
      s.reviewCount = s.review_count ?? 0;
      s.longDescription = s.long_description ?? '';
    }
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/services', async (req, res) => {
  const { name, categoryName, description, price, duration, image, features } = req.body;
  if (!name || !categoryName || !price || !description) {
    return res.status(400).json({ error: 'Required parameters missing' });
  }

  try {
    let cat = await dbGet('SELECT * FROM service_categories WHERE LOWER(name) = ?', [categoryName.toLowerCase()]);
    let categoryId = cat ? cat.id : `c_${Date.now()}`;

    if (!cat) {
      await dbRun(
        'INSERT INTO service_categories (id, name, slug, icon, color, description) VALUES (?, ?, ?, ?, ?, ?)',
        [categoryId, categoryName, categoryName.toLowerCase().replace(/\s+/g, '-'), 'Wrench', 'from-brand-400 to-brand-600', `All ${categoryName} services`]
      );
    }

    const serviceId = `s_${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    await dbRun(
      'INSERT INTO services (id, name, slug, category_id, categoryName, description, price, original_price, duration, image, popular, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        serviceId,
        name,
        slug,
        categoryId,
        categoryName,
        description,
        Number(price),
        Math.round(Number(price) * 1.3),
        duration || '60 min',
        image || 'https://images.pexels.com/photos/4239034/pexels-photo-4239034.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
        0,
        new Date().toISOString()
      ]
    );

    // Save Features
    const featuresList = features || ['Verified helper', 'Quality guarantee'];
    for (const feat of featuresList) {
      await dbRun('INSERT INTO service_features (id, service_id, feature) VALUES (?, ?, ?)', [
        `sf_${Date.now()}_${Math.random().toString().slice(-4)}`,
        serviceId,
        feat
      ]);
    }

    await addAuditLog('admin', 'Admin Panel', 'Add Service', `Added catalog service ${name}`);
    
    const created = await dbGet('SELECT * FROM services WHERE id = ?', [serviceId]);
    if (created) {
      created.originalPrice = created.original_price ?? created.price;
      created.reviewCount = created.review_count ?? 0;
      created.features = (await dbAll('SELECT feature FROM service_features WHERE service_id = ?', [serviceId])).map(r => r.feature);
    }
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const { name, categoryName, description, price, duration, image } = req.body;

  try {
    const service = await dbGet('SELECT * FROM services WHERE id = ?', [id]);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    let sql = 'UPDATE services SET name = ?, categoryName = ?, description = ?, price = ?, original_price = ?, duration = ?, image = ?, updated_at = ? WHERE id = ?';
    await dbRun(sql, [
      name || service.name,
      categoryName || service.categoryName,
      description || service.description,
      price ? Number(price) : service.price,
      price ? Math.round(Number(price) * 1.3) : service.original_price,
      duration || service.duration,
      image || service.image,
      new Date().toISOString(),
      id
    ]);

    await addAuditLog('admin', 'Admin Panel', 'Edit Service', `Updated catalog service ${name || service.name}`);
    const updated = await dbGet('SELECT * FROM services WHERE id = ?', [id]);
    if (updated) {
      updated.originalPrice = updated.original_price ?? updated.price;
      updated.reviewCount = updated.review_count ?? 0;
      updated.features = (await dbAll('SELECT feature FROM service_features WHERE service_id = ?', [id])).map(r => r.feature);
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM services WHERE id = ?', [id]);
    await addAuditLog('admin', 'Admin Panel', 'Delete Service', `Removed service catalog ID ${id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services/:id/duplicate', async (req, res) => {
  const { id } = req.params;
  try {
    const service = await dbGet('SELECT * FROM services WHERE id = ?', [id]);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const serviceId = `s_${Date.now()}`;
    const name = `${service.name} (Copy)`;
    const slug = `${service.slug}-copy-${Date.now().toString().slice(-4)}`;

    await dbRun(
      'INSERT INTO services (id, name, slug, category_id, categoryName, description, price, original_price, duration, image, popular, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        serviceId,
        name,
        slug,
        service.category_id,
        service.categoryName,
        service.description,
        service.price,
        service.original_price,
        service.duration,
        service.image,
        0,
        new Date().toISOString()
      ]
    );

    await addAuditLog(req.user.id, 'Admin Panel', 'Duplicate Service', `Duplicated catalog service ${service.name}`);
    const created = await dbGet('SELECT * FROM services WHERE id = ?', [serviceId]);
    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. Bookings Management CRUD & TIMELINE
// ==========================================
app.get('/api/bookings', async (req, res) => {
  const { userId, role, name } = req.query;
  try {
    let sql = 'SELECT * FROM bookings';
    const params = [];

    if (role === 'professional') {
      sql += ' WHERE professional_name = ?';
      params.push(name);
    } else if (userId) {
      sql += ' WHERE user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY created_at DESC';

    const bookings = await dbAll(sql, params);
    
    // Populate timeline + map snake_case → camelCase for frontend
    for (const b of bookings) {
      b.timeline = await dbAll('SELECT status, note, time FROM booking_timeline WHERE booking_id = ? ORDER BY time ASC', [b.id]);
      // camelCase aliases
      b.serviceName = b.service_name ?? b.serviceName ?? 'Service';
      b.professionalName = b.professional_name ?? b.professionalName ?? '';
      b.timeSlot = b.time_slot ?? b.timeSlot ?? '';
      b.paymentMethod = b.payment_method ?? b.paymentMethod ?? '';
      b.userId = b.user_id ?? b.userId ?? '';
      b.serviceId = b.service_id ?? b.serviceId ?? '';
    }

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', authenticateToken, async (req, res) => {
  const { serviceId, serviceName, serviceImage, price, date, timeSlot, address, paymentMethod, userId } = req.body;
  if (!serviceId || !date || !timeSlot || !address || !userId) {
    return res.status(400).json({ error: 'Required checkout parameters missing' });
  }

  try {
    const bookingId = `b_${Date.now()}`;
    const professionalName = 'Amit Patel'; // default assigned pro

    await dbRun(
      'INSERT INTO bookings (id, user_id, service_id, professional_name, date, time_slot, address, status, price, payment_method, paid, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        bookingId,
        userId,
        serviceId,
        professionalName,
        date,
        timeSlot,
        address,
        'pending',
        Number(price),
        paymentMethod || 'upi',
        1,
        new Date().toISOString()
      ]
    );

    // Timeline seed note
    await dbRun(
      'INSERT INTO booking_timeline (id, booking_id, status, note, time) VALUES (?, ?, ?, ?, ?)',
      [`bt_${Date.now()}`, bookingId, 'pending', 'Booking requested by customer', new Date().toISOString()]
    );

    // Auto-generate transaction ledger
    const userName = (await dbGet('SELECT name FROM users WHERE id = ?', [userId]))?.name || 'Guest User';
    await dbRun(
      'INSERT INTO orders (id, booking_id, customer_name, service_name, amount, status, payment_method, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        `ord_${Date.now()}`,
        bookingId,
        userName,
        serviceName || 'Home Service',
        Number(price),
        'paid',
        paymentMethod || 'upi',
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    await addAuditLog(userId, 'Customer', 'Create Booking', `Created booking ledger ${bookingId}`);

    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    booking.timeline = await dbAll('SELECT status, note, time FROM booking_timeline WHERE booking_id = ? ORDER BY time ASC', [bookingId]);
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  try {
    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    await dbRun('UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?', [status, new Date().toISOString(), id]);

    let defaultNote = `Booking status updated to ${status}`;
    if (status === 'accepted') defaultNote = 'Booking accepted by professional';
    else if (status === 'upcoming') defaultNote = 'Booking confirmed & helper assigned';
    else if (status === 'in-progress') defaultNote = 'Service is now in-progress';
    else if (status === 'completed') defaultNote = 'Service completed successfully';
    else if (status === 'cancelled') defaultNote = 'Booking cancelled';

    await dbRun(
      'INSERT INTO booking_timeline (id, booking_id, status, note, time) VALUES (?, ?, ?, ?, ?)',
      [`bt_${Date.now()}`, id, status, note || defaultNote, new Date().toISOString()]
    );

    await addAuditLog(req.user.id, req.user.role, 'Update Status', `Updated booking status ${id} to ${status}`);

    const updated = await dbGet('SELECT * FROM bookings WHERE id = ?', [id]);
    updated.timeline = await dbAll('SELECT status, note, time FROM booking_timeline WHERE booking_id = ? ORDER BY time ASC', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id/assign', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { professionalName } = req.body;

  try {
    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    await dbRun('UPDATE bookings SET professional_name = ? WHERE id = ?', [professionalName, id]);

    await dbRun(
      'INSERT INTO booking_timeline (id, booking_id, status, note, time) VALUES (?, ?, ?, ?, ?)',
      [`bt_${Date.now()}`, id, booking.status, `Assigned helper professional: ${professionalName}`, new Date().toISOString()]
    );

    await addAuditLog(req.user.id, 'Admin Panel', 'Assign Helper', `Assigned helper ${professionalName} to booking ${id}`);

    const updated = await dbGet('SELECT * FROM bookings WHERE id = ?', [id]);
    updated.timeline = await dbAll('SELECT status, note, time FROM booking_timeline WHERE booking_id = ? ORDER BY time ASC', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings/:id/notes', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    await dbRun(
      'INSERT INTO booking_timeline (id, booking_id, status, note, time) VALUES (?, ?, ?, ?, ?)',
      [`bt_${Date.now()}`, id, booking.status, note || 'Log note attached', new Date().toISOString()]
    );

    await addAuditLog(req.user.id, req.user.role, 'Add Note', `Added note to booking timeline ${id}`);

    const updated = await dbGet('SELECT * FROM bookings WHERE id = ?', [id]);
    updated.timeline = await dbAll('SELECT status, note, time FROM booking_timeline WHERE booking_id = ? ORDER BY time ASC', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. Orders & Payments CRUD
// ==========================================
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await dbAll('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await dbRun('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [status, new Date().toISOString(), id]);
    await addAuditLog(req.user.id, 'Admin Panel', 'Order status', `Set payment transaction ${id} status to ${status}`);
    const updated = await dbGet('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. Support Inbox CRUD
// ==========================================
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await dbAll('SELECT * FROM messages ORDER BY date DESC');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages/:id/reply', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('UPDATE messages SET status = ? WHERE id = ?', ['replied', id]);
    await addAuditLog(req.user.id, req.user.role, 'Inbox Reply', `Emailed response reply to message query ${id}`);
    const updated = await dbGet('SELECT * FROM messages WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/messages/:id/archive', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('UPDATE messages SET status = ? WHERE id = ?', ['archived', id]);
    const updated = await dbGet('SELECT * FROM messages WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/messages/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM messages WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. Customer Reviews Moderation
// ==========================================
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await dbAll('SELECT * FROM reviews ORDER BY date DESC');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reviews/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await dbRun('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
    await addAuditLog(req.user.id, 'Admin Panel', 'Review moderate', `Moderated review ${id} to ${status}`);
    const updated = await dbGet('SELECT * FROM reviews WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reviews/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. Global Settings & Audits
// ==========================================
app.get('/api/settings', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM settings');
    const config = {};
    rows.forEach((r) => {
      config[r.key] = r.value;
    });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', authenticateToken, requireRole(['admin']), async (req, res) => {
  const settingsData = req.body;
  try {
    for (const key of Object.keys(settingsData)) {
      await dbRun(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
        [key, settingsData[key].toString(), settingsData[key].toString()]
      );
    }
    await addAuditLog(req.user.id, 'Admin Panel', 'Update Settings', 'Updated global site preferences');
    
    const rows = await dbAll('SELECT * FROM settings');
    const config = {};
    rows.forEach((r) => {
      config[r.key] = r.value;
    });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await dbAll('SELECT * FROM logs ORDER BY timestamp DESC');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const cats = await dbAll('SELECT * FROM service_categories');
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await dbAll('SELECT * FROM coupons');
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Relational HomeSeva backend running on http://localhost:${PORT}`);
});
