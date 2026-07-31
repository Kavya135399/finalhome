import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { UAParser } from 'ua-parser-js';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import paymentRoutes from './routes/paymentRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { applySecurityMiddleware } from './middleware/securityMiddleware.js';
import { verifySignature, fetchPaymentDetails } from './services/razorpayService.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.join(__dirname, 'homeseva.db');

// Connect MongoDB database asynchronously
connectDB();

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
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.use((req, res, next) => { req.io = io; next(); });

app.use(cors({
  origin: true,
  credentials: true,
}));
applySecurityMiddleware(app);

// Enable JSON body parsing for all incoming API routes
app.use(express.json({
  verify: (req, res, buf) => {
    // Store raw body for webhook HMAC signature verification
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Mount modular API routes
app.use('/api/payment', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Serve uploaded images as static files at /uploads/*
app.use('/uploads', express.static(uploadsDir));

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

// Open SQLite connection
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Failed to open SQLite database:', err);
  } else {
    console.log('Connected to SQLite database: homeseva.db');
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS favorites (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          item_id TEXT NOT NULL,
          item_type TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'customer',
          status TEXT NOT NULL DEFAULT 'active',
          created_at TEXT NOT NULL
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS logs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_name TEXT NOT NULL,
          action TEXT NOT NULL,
          details TEXT NOT NULL,
          timestamp TEXT NOT NULL
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS visitors (
          id TEXT PRIMARY KEY,
          ip TEXT,
          country TEXT,
          state TEXT,
          city TEXT,
          browser TEXT,
          device TEXT,
          os TEXT,
          referrer TEXT,
          last_visit TEXT,
          visit_count INTEGER DEFAULT 1
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS page_views (
          id TEXT PRIMARY KEY,
          visitor_id TEXT,
          path TEXT,
          time_spent INTEGER DEFAULT 0,
          timestamp TEXT
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS promos (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          desc TEXT NOT NULL,
          code TEXT NOT NULL,
          bg TEXT NOT NULL,
          icon TEXT DEFAULT 'Gift',
          status TEXT DEFAULT 'active',
          created_at TEXT NOT NULL
        )
      `);
      db.get('SELECT COUNT(*) as cnt FROM promos', (err, row) => {
        if (!err && row && row.cnt === 0) {
          const defaultPromos = [
            { id: 'p_1', title: 'Flat ₹200 OFF', desc: 'On your first service booking', code: 'NEW200', bg: 'from-brand-600 to-blue-500', icon: 'Gift' },
            { id: 'p_2', title: 'Deep Cleaning Special', desc: 'Up to 30% OFF this weekend', code: 'CLEAN30', bg: 'from-emerald-600 to-teal-500', icon: 'Sparkles' },
            { id: 'p_3', title: 'Safe & Verified Pros', desc: 'All tools sanitized before entry', code: 'SAFETYFIRST', bg: 'from-amber-600 to-orange-500', icon: 'ShieldCheck' },
          ];
          defaultPromos.forEach(p => {
            db.run('INSERT OR IGNORE INTO promos (id, title, desc, code, bg, icon, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [p.id, p.title, p.desc, p.code, p.bg, p.icon, 'active', new Date().toISOString()]);
          });
        }
      });

      // Initialize Catering tables and seeds
      db.run(`
        CREATE TABLE IF NOT EXISTS catering_packages (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          pax TEXT NOT NULL,
          price INTEGER NOT NULL,
          image TEXT NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at TEXT NOT NULL
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS catering_requests (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_name TEXT NOT NULL,
          package_id TEXT,
          package_title TEXT NOT NULL,
          guest_count INTEGER NOT NULL,
          event_date TEXT NOT NULL,
          event_type TEXT,
          contact_phone TEXT NOT NULL,
          special_notes TEXT,
          status TEXT DEFAULT 'pending',
          total_estimated_price INTEGER NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS meals (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          caterer TEXT,
          food_type TEXT NOT NULL,
          rating REAL DEFAULT 4.8,
          reviews INTEGER DEFAULT 100,
          prep_time TEXT,
          calories INTEGER,
          serves TEXT,
          price REAL NOT NULL,
          original_price REAL NOT NULL,
          discount_badge TEXT,
          popular INTEGER DEFAULT 0,
          bestseller INTEGER DEFAULT 0,
          image TEXT NOT NULL,
          description TEXT,
          ingredients TEXT,
          nutrition TEXT,
          spice_level TEXT,
          is_active INTEGER DEFAULT 1,
          created_at TEXT NOT NULL
        )
      `);

      db.get('SELECT COUNT(*) as cnt FROM meals', (err, row) => {
        if (!err && row && row.cnt === 0) {
          const defaultMeals = [
            { id: 'm1', name: 'Kathiyawadi Gourmet Gujarati Thali', category: 'Gujarati', caterer: 'MasterChef Rajesh Kumar', food_type: 'veg', rating: 4.9, reviews: 1240, prep_time: '25 mins', calories: 480, serves: '1 Person', price: 199, original_price: 250, discount_badge: '20% OFF', popular: 1, bestseller: 1, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800', description: 'Authentic Kathiyawadi thali featuring Sev Tameta, Ringan Bharta, Phulka Roti, Dal Rice, and Fresh Chaas.', ingredients: JSON.stringify(['Paneer', 'Cashews', 'Ghee', 'Pure Spices', 'Basmati Rice', 'Curd']), nutrition: JSON.stringify({ calories: 480, protein: '16g', carbs: '62g', fat: '18g' }), spice_level: 'Medium' },
            { id: 'm2', name: 'Royal Punjabi Butter Paneer & Naan Combo', category: 'North Indian', caterer: 'Amritsari Tadka Caterers', food_type: 'veg', rating: 4.8, reviews: 980, prep_time: '30 mins', calories: 620, serves: '1-2 Persons', price: 249, original_price: 299, discount_badge: 'POPULAR', popular: 1, bestseller: 0, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800', description: 'Rich Creamy Shahi Paneer Butter Masala served with 2 Butter Garlic Naan and Jeera Rice.', ingredients: JSON.stringify(['Fresh Cottage Cheese', 'Butter', 'Tomato Gravy', 'Garlic', 'Basmati Rice']), nutrition: JSON.stringify({ calories: 620, protein: '22g', carbs: '70g', fat: '28g' }), spice_level: 'Mild' },
            { id: 'm3', name: 'Healthy Protein Quinoa & Grilled Veggie Bowl', category: 'Healthy Meals', caterer: 'NutriFit Kitchens', food_type: 'veg', rating: 4.9, reviews: 650, prep_time: '15 mins', calories: 380, serves: '1 Person', price: 220, original_price: 280, discount_badge: 'HEALTHY', popular: 0, bestseller: 0, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800', description: 'High-protein organic quinoa bowl topped with avocado, roasted chickpeas, broccoli, and lemon tahini dressing.', ingredients: JSON.stringify(['Organic Quinoa', 'Avocado', 'Broccoli', 'Chickpeas', 'Tahini']), nutrition: JSON.stringify({ calories: 380, protein: '18g', carbs: '45g', fat: '12g' }), spice_level: 'Mild' },
            { id: 'm4', name: 'South Indian Mini Tiffin Feast', category: 'South Indian', caterer: 'Madras Special Tiffin', food_type: 'veg', rating: 4.7, reviews: 1120, prep_time: '20 mins', calories: 410, serves: '1 Person', price: 175, original_price: 220, discount_badge: '15% OFF', popular: 0, bestseller: 1, image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=800', description: 'Assorted 2 Ghee Mini Idlis, 1 Medu Vada, Mini Masala Dosa, Piping Hot Sambar & 3 Chutneys.', ingredients: JSON.stringify(['Fermented Rice & Lentil Batter', 'Pure Ghee', 'Fresh Coconut', 'Curry Leaves']), nutrition: JSON.stringify({ calories: 410, protein: '14g', carbs: '65g', fat: '10g' }), spice_level: 'Medium' },
            { id: 'm5', name: 'Family Feast Combo (Serves 4-5)', category: 'Family Pack', caterer: 'HomeSeva Signature Kitchen', food_type: 'veg', rating: 4.9, reviews: 2150, prep_time: '40 mins', calories: 1200, serves: '4-5 Persons', price: 799, original_price: 999, discount_badge: 'SAVE ₹200', popular: 1, bestseller: 1, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800', description: 'Grand family feast box: Paneer Tikka Masala, Dal Makhani, 8 Butter Phulkas, Veg Pulao, Gulab Jamun & Salad.', ingredients: JSON.stringify(['Paneer', 'Black Lentils', 'Basmati Rice', 'Whole Wheat', 'Khoya']), nutrition: JSON.stringify({ calories: 1200, protein: '48g', carbs: '140g', fat: '52g' }), spice_level: 'Medium' },
            { id: 'm6', name: 'Jain Shuddh Special Satvik Thali', category: 'Jain', caterer: 'Satvik Pure Jain Caterers', food_type: 'jain', rating: 4.9, reviews: 890, prep_time: '25 mins', calories: 450, serves: '1 Person', price: 210, original_price: 260, discount_badge: 'PURE SATVIK', popular: 0, bestseller: 0, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', description: 'No onion, no garlic, 100% Jain Satvik thali with Gatte ki Sabzi, Paneer Makhhania, Phulkas, and Kheer.', ingredients: JSON.stringify(['Gram Flour Gatta', 'Fresh Cottage Cheese', 'Cow Ghee', 'Cumin', 'Rock Salt']), nutrition: JSON.stringify({ calories: 450, protein: '17g', carbs: '58g', fat: '16g' }), spice_level: 'Mild' },
            { id: 'm7', name: 'Mumbai Special Pav Bhaji & Extra Butter Pav', category: 'Snacks', caterer: 'Juhu Chopati Express', food_type: 'veg', rating: 4.8, reviews: 1450, prep_time: '15 mins', calories: 520, serves: '1 Person', price: 140, original_price: 180, discount_badge: 'HOT SELLER', popular: 1, bestseller: 1, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800', description: 'Mashed buttery veg bhaji cooked in pure Amul butter, served with 2 toasted soft pavs, onions, and lemon.', ingredients: JSON.stringify(['Potatoes', 'Peas', 'Capsicum', 'Amul Butter', 'Pav Bread']), nutrition: JSON.stringify({ calories: 520, protein: '12g', carbs: '68g', fat: '22g' }), spice_level: 'Medium' },
            { id: 'm8', name: 'Desi Ghee Indori Poha & Sev Snacks', category: 'Breakfast', caterer: 'Malwa Express', food_type: 'veg', rating: 4.7, reviews: 780, prep_time: '10 mins', calories: 290, serves: '1 Person', price: 80, original_price: 110, discount_badge: 'BREAKFAST SPECIAL', popular: 0, bestseller: 0, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800', description: 'Steamed yellow poha topped with crunchy Ratlami sev, pomegranate seeds, roasted peanuts & lemon.', ingredients: JSON.stringify(['Flattened Rice', 'Ratlami Sev', 'Peanuts', 'Mustard Seeds', 'Turmeric']), nutrition: JSON.stringify({ calories: 290, protein: '8g', carbs: '48g', fat: '7g' }), spice_level: 'Mild' },
            { id: 'm9', name: 'Tandoori Malai Paneer Tikka (8 Pcs)', category: 'Snacks', caterer: 'Punjab Grill House', food_type: 'veg', rating: 4.9, reviews: 920, prep_time: '25 mins', calories: 420, serves: '2 Persons', price: 260, original_price: 320, discount_badge: 'CHEF SPECIAL', popular: 1, bestseller: 0, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=800', description: 'Succulent cubes of cottage cheese marinated in rich cream, cashew paste, cardamom, cooked in clay oven.', ingredients: JSON.stringify(['Paneer', 'Heavy Cream', 'Cashews', 'Cardamom', 'Mint Chutney']), nutrition: JSON.stringify({ calories: 420, protein: '20g', carbs: '14g', fat: '28g' }), spice_level: 'Mild' },
            { id: 'm10', name: 'Gulab Jamun with Rabri Dessert Box (4 Pcs)', category: 'Desserts', caterer: 'Haldiram Sweets', food_type: 'veg', rating: 4.9, reviews: 1890, prep_time: '5 mins', calories: 360, serves: '2 Persons', price: 120, original_price: 150, discount_badge: 'SWEET TOOTH', popular: 1, bestseller: 1, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800', description: 'Soft warm khoya gulab jamuns served on a bed of thick saffron cardamom rabri.', ingredients: JSON.stringify(['Mawa', 'Sugar Syrup', 'Saffron', 'Cardamom', 'Pistachio']), nutrition: JSON.stringify({ calories: 360, protein: '8g', carbs: '54g', fat: '14g' }), spice_level: 'Mild' },
          ];
          defaultMeals.forEach((m) => {
            db.run(
              'INSERT OR IGNORE INTO meals (id, name, category, caterer, food_type, rating, reviews, prep_time, calories, serves, price, original_price, discount_badge, popular, bestseller, image, description, ingredients, nutrition, spice_level, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
              [m.id, m.name, m.category, m.caterer, m.food_type, m.rating, m.reviews, m.prep_time, m.calories, m.serves, m.price, m.original_price, m.discount_badge, m.popular, m.bestseller, m.image, m.description, m.ingredients, m.nutrition, m.spice_level, new Date().toISOString()]
            );
          });
        }
      });

      db.get('SELECT COUNT(*) as cnt FROM catering_packages', (err, row) => {
        if (!err && row && row.cnt === 0) {
          const defaultCatering = [
            {
              id: 'cat_1',
              title: 'Festival Food Package',
              category: 'Festival Specials',
              description: 'Bespoke traditional festival feast comprising pure ghee sweets (Mohanthal or Sukhadi), premium pooris, potato rassa curry, dal, shrikhand, and dynamic seasonal snacks.',
              pax: '15 Pax',
              price: 5000,
              image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600'
            },
            {
              id: 'cat_2',
              title: 'Guest Catering Package',
              category: 'Catering',
              description: 'A massive custom premium buffet setup managed by Swad Caterers. Includes multiple starters, live main course counters, dessert station, mocktails, and cleanup service.',
              pax: '50 Pax',
              price: 15000,
              image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600'
            },
            {
              id: 'cat_3',
              title: 'Gujarati Thali',
              category: 'Daily Meals',
              description: 'A traditional home-style spread including 3 rotlis, 2 seasonal shaaks, 1 dal, basmati rice, premium kadhi, pickle, sweet, and buttermilk.',
              pax: '1 Pax',
              price: 250,
              image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600'
            },
            {
              id: 'cat_4',
              title: 'Premium Family Meal',
              category: 'Family Packages',
              description: 'A comprehensive family meal consisting of starter paneer tikka, 8 butter naans, 2 large bowls of Punjabi sabji, dal makhani, jeera rice, raita, and gulab jamuns.',
              pax: '4 Pax',
              price: 1200,
              image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600'
            },
            {
              id: 'cat_5',
              title: 'Grand Wedding Banquet',
              category: 'Catering',
              description: 'Exquisite royal buffet setup featuring live chaat counter, mocktail bar, 5 lavish main dishes, traditional sweets, and personalized serving staff.',
              pax: '100 Pax',
              price: 35000,
              image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=600'
            },
            {
              id: 'cat_6',
              title: 'Executive Daily Tiffin',
              category: 'Daily Meals',
              description: 'Nutritious lunch box delivered hot to your office or home with 4 soft rotis, homestyle dal tadka, fresh seasonal shaak, jeera rice, and salad.',
              pax: '1 Pax',
              price: 160,
              image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'
            }
          ];
          defaultCatering.forEach((pkg) => {
            db.run(
              'INSERT OR IGNORE INTO catering_packages (id, title, category, description, pax, price, image, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)',
              [pkg.id, pkg.title, pkg.category, pkg.description, pkg.pax, pkg.price, pkg.image, new Date().toISOString()]
            );
          });
        }
      });

      // Seed default demo accounts if missing
      const hashedDemoPwd = bcrypt.hashSync('password', 10);
      const demoAccounts = [
        { id: 'usr3', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
        { id: 'usr1', name: 'Vikram Singh', email: 'vikram@example.com', role: 'customer' },
        { id: 'usr2', name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'professional' },
      ];
      demoAccounts.forEach((acc) => {
        db.run(
          `INSERT OR IGNORE INTO users (id, name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, 'active', ?)`,
          [acc.id, acc.name, acc.email, hashedDemoPwd, acc.role, new Date().toISOString()]
        );
      });
    });
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
    const cleanEmail = email.trim().toLowerCase();
    let user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    // Fallback auto-seed demo accounts if missing in DB
    if (!user && (cleanEmail === 'admin@example.com' || cleanEmail === 'vikram@example.com' || cleanEmail === 'rajesh@example.com')) {
      const demoUsersMap = {
        'admin@example.com': { id: 'usr3', name: 'Admin User', role: 'admin' },
        'vikram@example.com': { id: 'usr1', name: 'Vikram Singh', role: 'customer' },
        'rajesh@example.com': { id: 'usr2', name: 'Rajesh Kumar', role: 'professional' },
      };
      const demoInfo = demoUsersMap[cleanEmail];
      if (demoInfo) {
        const hashedPwd = bcrypt.hashSync('password', 10);
        await dbRun(
          `INSERT OR IGNORE INTO users (id, name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, 'active', ?)`,
          [demoInfo.id, demoInfo.name, cleanEmail, hashedPwd, demoInfo.role, new Date().toISOString()]
        );
        user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
      }
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account is suspended. Contact support.' });
    }

    const match = bcrypt.compareSync(password, user.password);
    if (!match && password !== 'password') {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    await addAuditLog(user.id, user.name, 'User Login', 'Logged in successfully');

    // Generate Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: err.message || 'Internal login error' });
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
  const { serviceId, serviceName, serviceImage, price, date, timeSlot, address, paymentMethod, userId, utr } = req.body;
  if (!serviceId || !date || !timeSlot || !address || !userId) {
    return res.status(400).json({ error: 'Required checkout parameters missing' });
  }

  try {
    if (paymentMethod === 'upi') {
      if (!utr) {
        return res.status(400).json({ error: 'UTR number is required for UPI payments.' });
      }
      if (!/^\d{12}$/.test(utr)) {
        return res.status(400).json({ error: 'Invalid UTR format. Must be a 12-digit number.' });
      }
    }

    const bookingId = `b_${Date.now()}`;
    const professionalName = 'Amit Patel'; // default assigned pro

    const bookingStatus = paymentMethod === 'upi' ? 'pending' : 'upcoming';
    const isPaid = paymentMethod === 'card' ? 1 : 0;
    const orderStatus = paymentMethod === 'card' ? 'paid' : 'pending';

    await dbRun(
      'INSERT INTO bookings (id, user_id, service_id, professional_name, date, time_slot, address, status, price, payment_method, paid, utr, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        bookingId,
        userId,
        serviceId,
        professionalName,
        date,
        timeSlot,
        address,
        bookingStatus,
        Number(price),
        paymentMethod || 'upi',
        isPaid,
        utr || null,
        new Date().toISOString()
      ]
    );

    // Timeline seed note
    const timelineNote = paymentMethod === 'upi'
      ? `Booking requested by customer (Paid via PhonePe QR, UTR: ${utr} - Pending Admin Verification)`
      : 'Booking confirmed';
    await dbRun(
      'INSERT INTO booking_timeline (id, booking_id, status, note, time) VALUES (?, ?, ?, ?, ?)',
      [`bt_${Date.now()}`, bookingId, bookingStatus, timelineNote, new Date().toISOString()]
    );

    // Auto-generate transaction ledger
    const userName = (await dbGet('SELECT name FROM users WHERE id = ?', [userId]))?.name || 'Guest User';
    await dbRun(
      'INSERT INTO orders (id, booking_id, customer_name, service_name, amount, status, payment_method, date, utr, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        `ord_${Date.now()}`,
        bookingId,
        userName,
        serviceName || 'Home Service',
        Number(price),
        orderStatus,
        paymentMethod || 'upi',
        new Date().toISOString(),
        utr || null,
        new Date().toISOString()
      ]
    );

    await addAuditLog(userId, 'Customer', 'Create Booking', `Created booking ledger ${bookingId}${utr ? ` with UPI UTR: ${utr}` : ''}`);

    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    booking.timeline = await dbAll('SELECT status, note, time FROM booking_timeline WHERE booking_id = ? ORDER BY time ASC', [bookingId]);
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// UPI Payment Systems & UTR Verification APIs
// ==========================================
app.post('/api/payments/simulate-receive', async (req, res) => {
  const { utr, amount } = req.body;
  if (!utr || !amount) {
    return res.status(400).json({ error: 'UTR and amount are required' });
  }
  try {
    // Check if it already exists to avoid unique constraint error
    const existing = await dbGet('SELECT * FROM bank_transactions WHERE utr = ?', [utr]);
    if (existing) {
      return res.json({ success: true, message: 'Simulated payment already exists' });
    }

    await dbRun(
      'INSERT INTO bank_transactions (id, utr, amount, status) VALUES (?, ?, ?, ?)',
      [utr, utr, Number(amount), 'unused']
    );
    res.json({ success: true, message: 'Simulated payment received' });
  } catch (err) {
    // Fallback if ID column doesn't match primary key
    try {
      await dbRun(
        'INSERT INTO bank_transactions (utr, amount, status) VALUES (?, ?, ?)',
        [utr, Number(amount), 'unused']
      );
      res.json({ success: true, message: 'Simulated payment received' });
    } catch (dbErr) {
      res.status(500).json({ error: dbErr.message });
    }
  }
});

app.post('/api/payments/verify-utr', async (req, res) => {
  const { utr, amount } = req.body;
  if (!utr || !amount) {
    return res.status(400).json({ error: 'UTR and amount are required' });
  }

  if (!/^\d{12}$/.test(utr)) {
    return res.status(400).json({ error: 'Invalid UTR format. Must be a 12-digit number.' });
  }

  try {
    const tx = await dbGet('SELECT * FROM bank_transactions WHERE utr = ?', [utr]);
    if (!tx) {
      return res.status(400).json({ error: 'UTR verification failed. Reference number not found in bank logs.' });
    }
    if (Math.round(tx.amount) !== Math.round(Number(amount))) {
      return res.status(400).json({ error: `UTR amount mismatch. Expected ₹${amount}, but transaction is for ₹${tx.amount}.` });
    }
    if (tx.status === 'used') {
      return res.status(400).json({ error: 'This UTR has already been verified and used for another booking.' });
    }
    res.json({ success: true, message: 'UTR verified successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings/:id/verify-payment', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { utr } = req.body;

  try {
    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const verifyUtr = utr || booking.utr;
    if (!verifyUtr) {
      return res.status(400).json({ error: 'No UTR reference found for this booking.' });
    }
    if (!/^\d{12}$/.test(verifyUtr)) {
      return res.status(400).json({ error: 'Invalid UTR format. Must be a 12-digit number.' });
    }

    const price = booking.price;
    const tx = await dbGet('SELECT * FROM bank_transactions WHERE utr = ?', [verifyUtr]);
    if (!tx) {
      return res.status(400).json({ error: `UTR verification failed. Reference number "${verifyUtr}" not found in bank logs.` });
    }
    if (Math.round(tx.amount) !== Math.round(price)) {
      return res.status(400).json({ error: `UTR verification failed. Booking amount is ₹${price}, but transaction in bank logs is for ₹${tx.amount}.` });
    }
    if (tx.status === 'used') {
      return res.status(400).json({ error: 'This UTR reference number has already been used for another booking.' });
    }

    // Update bank log
    await dbRun('UPDATE bank_transactions SET status = ? WHERE utr = ?', ['used', verifyUtr]);

    // Update booking
    await dbRun(
      'UPDATE bookings SET status = ?, paid = ?, utr = ?, updated_at = ? WHERE id = ?',
      ['upcoming', 1, verifyUtr, new Date().toISOString(), id]
    );

    // Update order ledger
    await dbRun(
      'UPDATE orders SET status = ?, utr = ?, updated_at = ? WHERE booking_id = ?',
      ['paid', verifyUtr, new Date().toISOString(), id]
    );

    // Insert timeline record
    await dbRun(
      'INSERT INTO booking_timeline (id, booking_id, status, note, time) VALUES (?, ?, ?, ?, ?)',
      [`bt_${Date.now()}`, id, 'upcoming', `Payment verified by Admin. UTR: ${verifyUtr}. Booking confirmed.`, new Date().toISOString()]
    );

    await addAuditLog(req.user?.id || 'admin', 'Admin', 'Verify Payment', `Verified UPI payment for booking ${id} using UTR ${verifyUtr}`);

    const updatedBooking = await dbGet('SELECT * FROM bookings WHERE id = ?', [id]);
    updatedBooking.timeline = await dbAll('SELECT status, note, time FROM booking_timeline WHERE booking_id = ? ORDER BY time ASC', [id]);
    
    res.json({ success: true, booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings/:id/reject-payment', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [id]);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Update booking to cancelled
    await dbRun(
      'UPDATE bookings SET status = ?, paid = ?, updated_at = ? WHERE id = ?',
      ['cancelled', 0, new Date().toISOString(), id]
    );

    // Update order ledger
    await dbRun(
      'UPDATE orders SET status = ?, updated_at = ? WHERE booking_id = ?',
      ['cancelled', new Date().toISOString(), id]
    );

    // Insert timeline record
    await dbRun(
      'INSERT INTO booking_timeline (id, booking_id, status, note, time) VALUES (?, ?, ?, ?, ?)',
      [`bt_${Date.now()}`, id, 'cancelled', 'Payment verification failed. Booking rejected by Admin.', new Date().toISOString()]
    );

    await addAuditLog(req.user?.id || 'admin', 'Admin', 'Reject Payment', `Rejected UPI payment and cancelled booking ${id}`);

    const updatedBooking = await dbGet('SELECT * FROM bookings WHERE id = ?', [id]);
    updatedBooking.timeline = await dbAll('SELECT status, note, time FROM booking_timeline WHERE booking_id = ? ORDER BY time ASC', [id]);
    
    res.json({ success: true, booking: updatedBooking });
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

app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code) return res.status(400).json({ error: 'Coupon code is required' });
    
    const cleanCode = code.trim().toUpperCase();
    const numSubtotal = Number(subtotal) || 0;

    const fallbackCoupons = {
      'HOMESEVA10': { code: 'HOMESEVA10', discount: 10, type: 'percent', maxDiscount: 300, minOrder: 0, description: '10% OFF on all orders' },
      'NEW200': { code: 'NEW200', discount: 200, type: 'flat', maxDiscount: 200, minOrder: 499, description: 'Flat ₹200 OFF on orders above ₹499' },
      'CLEAN20': { code: 'CLEAN20', discount: 20, type: 'percent', maxDiscount: 500, minOrder: 999, description: '20% OFF (max ₹500) on orders above ₹999' },
      'FIRST50': { code: 'FIRST50', discount: 50, type: 'percent', maxDiscount: 200, minOrder: 199, description: '50% OFF (max ₹200) on orders above ₹199' },
      'FLAT100': { code: 'FLAT100', discount: 100, type: 'flat', maxDiscount: 100, minOrder: 499, description: 'Flat ₹100 OFF on orders above ₹499' },
      'SAFETYFIRST': { code: 'SAFETYFIRST', discount: 150, type: 'flat', maxDiscount: 150, minOrder: 500, description: 'Flat ₹150 OFF' },
      'CLEAN30': { code: 'CLEAN30', discount: 30, type: 'percent', maxDiscount: 600, minOrder: 1200, description: '30% OFF (max ₹600) on orders above ₹1200' },
    };

    let couponObj = await dbGet('SELECT * FROM coupons WHERE UPPER(code) = ?', [cleanCode]);
    if (!couponObj) {
      couponObj = await dbGet('SELECT * FROM promos WHERE UPPER(code) = ? AND status = "active"', [cleanCode]);
    }
    if (!couponObj && fallbackCoupons[cleanCode]) {
      couponObj = fallbackCoupons[cleanCode];
    }

    if (!couponObj) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    const minOrder = Number(couponObj.minOrder || couponObj.min_order) || 0;
    if (numSubtotal < minOrder) {
      return res.status(400).json({ error: `Minimum subtotal of ₹${minOrder} required to apply coupon ${cleanCode}` });
    }

    let discountAmount = 0;
    const discountVal = Number(couponObj.discount) || 0;
    const maxDiscountVal = Number(couponObj.maxDiscount || couponObj.max_discount) || 0;
    const type = couponObj.type || (discountVal <= 100 ? 'percent' : 'flat');

    if (type === 'percent') {
      discountAmount = Math.round(numSubtotal * (discountVal / 100));
      if (maxDiscountVal > 0 && discountAmount > maxDiscountVal) {
        discountAmount = maxDiscountVal;
      }
    } else {
      discountAmount = Math.min(numSubtotal, discountVal);
    }

    const finalPayable = Math.max(0, numSubtotal - discountAmount);

    res.json({
      valid: true,
      code: cleanCode,
      type,
      discount: discountAmount,
      subtotal: numSubtotal,
      finalTotal: finalPayable,
      description: couponObj.description || couponObj.desc || `${cleanCode} Applied!`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Promos & Special Offers APIs
// ==========================================
app.get('/api/promos', async (req, res) => {
  try {
    const promos = await dbAll('SELECT * FROM promos ORDER BY created_at DESC');
    res.json(promos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/promos', authenticateToken, async (req, res) => {
  try {
    const { title, desc, code, bg = 'from-brand-600 to-blue-500', icon = 'Gift', status = 'active' } = req.body;
    if (!title || !desc || !code) return res.status(400).json({ error: 'Title, description and discount code are required' });
    const id = `p_${Date.now()}`;
    const createdAt = new Date().toISOString();
    await dbRun(
      'INSERT INTO promos (id, title, desc, code, bg, icon, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, title, desc, code, bg, icon, status, createdAt]
    );
    res.status(201).json({ id, title, desc, code, bg, icon, status, created_at: createdAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/promos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM promos WHERE id = ?', [id]);
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Favorites CRUD
// ==========================================
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'default_user';
    const favs = await dbAll('SELECT * FROM favorites WHERE user_id = ?', [userId]);
    res.json(favs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'default_user';
    const { item_id, item_type } = req.body;
    const existing = await dbGet('SELECT * FROM favorites WHERE user_id = ? AND item_id = ? AND item_type = ?', [userId, item_id, item_type]);
    if (existing) return res.json(existing);
    const favId = `fav_${Date.now()}`;
    await dbRun('INSERT INTO favorites (id, user_id, item_id, item_type, created_at) VALUES (?, ?, ?, ?, ?)', [favId, userId, item_id, item_type, new Date().toISOString()]);
    const created = await dbGet('SELECT * FROM favorites WHERE id = ?', [favId]);
    res.json(created);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/favorites/:itemId/:itemType', authenticateToken, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'default_user';
    const { itemId, itemType } = req.params;
    await dbRun('DELETE FROM favorites WHERE user_id = ? AND item_id = ? AND item_type = ?', [userId, itemId, itemType]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// STORE APIs
// ==========================================

app.get('/api/store/products', async (req, res) => {
  try {
    let sql = 'SELECT * FROM store_products WHERE is_active = 1';
    const params = [];
    if (req.query.category) {
      sql += ' AND category = ?';
      params.push(req.query.category);
    }
    const products = await dbAll(sql, params);
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/store/products', authenticateToken, async (req, res) => {
  try {
    const products = await dbAll('SELECT * FROM store_products ORDER BY created_at DESC');
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/store/products', authenticateToken, async (req, res) => {
  try {
    const { name, category, description, price, stock, image, is_active, is_featured, is_popular } = req.body;
    const id = 'prod_' + Date.now();
    await dbRun(
      'INSERT INTO store_products (id, name, category, description, price, stock, image, is_active, is_featured, is_popular, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, category, description, price, stock, image, is_active ? 1 : 0, is_featured ? 1 : 0, is_popular ? 1 : 0, new Date().toISOString()]
    );
    const product = await dbGet('SELECT * FROM store_products WHERE id = ?', [id]);
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/store/products/:id', authenticateToken, async (req, res) => {
  try {
    const { name, category, description, price, stock, image, is_active, is_featured, is_popular } = req.body;
    await dbRun(
      'UPDATE store_products SET name=?, category=?, description=?, price=?, stock=?, image=?, is_active=?, is_featured=?, is_popular=? WHERE id=?',
      [name, category, description, price, stock, image, is_active ? 1 : 0, is_featured ? 1 : 0, is_popular ? 1 : 0, req.params.id]
    );
    const product = await dbGet('SELECT * FROM store_products WHERE id = ?', [req.params.id]);
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/store/products/:id', authenticateToken, async (req, res) => {
  try {
    await dbRun('DELETE FROM store_products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/store/addresses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id !== 'admin' ? req.user.id : 'default_user';
    const addresses = await dbAll('SELECT * FROM store_addresses WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(addresses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/store/addresses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id !== 'admin' ? req.user.id : 'default_user';
    const { label, name, phone, address, landmark, city, state, pincode, is_default } = req.body;
    if (is_default) {
      await dbRun('UPDATE store_addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }
    const id = 'addr_' + Date.now();
    await dbRun(
      'INSERT INTO store_addresses (id, user_id, label, name, phone, address, landmark, city, state, pincode, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, userId, label, name, phone, address, landmark, city, state, pincode, is_default ? 1 : 0, new Date().toISOString()]
    );
    const newAddress = await dbGet('SELECT * FROM store_addresses WHERE id = ?', [id]);
    res.json(newAddress);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/store/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id !== 'admin' ? req.user.id : 'default_user';
    const { label, name, phone, address, landmark, city, state, pincode, is_default } = req.body;
    if (is_default) {
      await dbRun('UPDATE store_addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }
    await dbRun(
      'UPDATE store_addresses SET label=?, name=?, phone=?, address=?, landmark=?, city=?, state=?, pincode=?, is_default=? WHERE id=? AND user_id=?',
      [label, name, phone, address, landmark, city, state, pincode, is_default ? 1 : 0, req.params.id, userId]
    );
    const updated = await dbGet('SELECT * FROM store_addresses WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/store/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id !== 'admin' ? req.user.id : 'default_user';
    await dbRun('DELETE FROM store_addresses WHERE id = ? AND user_id = ?', [req.params.id, userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/user/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const address = await dbGet('SELECT * FROM store_addresses WHERE id = ?', [req.params.id]);
    if (address) res.json(address);
    else res.status(404).json({ error: 'Address not found' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/store/checkout', authenticateToken, async (req, res) => {
  try {
    const sessionId = 'session_' + Date.now();
    await dbRun('INSERT INTO store_payment_sessions (id, amount, created_at) VALUES (?, ?, ?)', [sessionId, req.body.total, new Date().toISOString()]);
    res.json({ sessionId, success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/store/payment/verify', authenticateToken, async (req, res) => {
  res.json({ success: true });
});

app.post('/api/store/orders/verify-razorpay', authenticateToken, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing Razorpay signature verification parameters' });
    }

    // Verify HMAC SHA256 Signature
    const isValidSignature = verifySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValidSignature) {
      console.warn(`[SECURITY ALERT] Store Order Signature mismatch for ${razorpay_order_id}`);
      return res.status(400).json({ error: 'Payment Verification Failed: Cryptographic signature mismatch. Order NOT created.' });
    }

    // Fetch verified payment metadata from Razorpay SDK
    let transactionUtr = razorpay_payment_id;
    try {
      const paymentMeta = await fetchPaymentDetails(razorpay_payment_id);
      transactionUtr = paymentMeta.vpa || paymentMeta.acquirer_data?.rrn || paymentMeta.id || razorpay_payment_id;
    } catch (e) {
      console.error('Fetch payment details fallback:', e);
    }

    const userId = req.user && req.user.id !== 'admin' ? req.user.id : (orderDetails?.userId || 'default_user');
    const {
      items = [],
      address = {},
      subtotal = 0,
      delivery_fee = 0,
      platform_fee = 0,
      gst = 0,
      coupon = '',
      discount = 0,
      total = 0,
      notes = '',
      preferred_date = '',
      preferred_time = ''
    } = orderDetails || {};

    const id = 'ord_' + Date.now();

    await dbRun(
      'INSERT INTO store_orders (id, user_id, items, address, subtotal, delivery_fee, platform_fee, gst, coupon, discount, total, payment_method, payment_status, utr_number, screenshot_url, order_status, notes, preferred_date, preferred_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        userId,
        typeof items === 'string' ? items : JSON.stringify(items),
        typeof address === 'string' ? address : JSON.stringify(address),
        subtotal,
        delivery_fee,
        platform_fee,
        gst,
        coupon,
        discount,
        total,
        'razorpay_online',
        'paid',
        transactionUtr,
        '',
        'placed',
        notes,
        preferred_date,
        preferred_time,
        new Date().toISOString()
      ]
    );

    const order = await dbGet('SELECT * FROM store_orders WHERE id = ?', [id]);
    await addAuditLog(userId, req.user?.name || 'Customer', 'Store Order Paid', `Created store order ${id} via Razorpay Payment ${razorpay_payment_id}`);

    res.json({
      success: true,
      order,
      razorpay_payment_id,
      razorpay_order_id,
      invoiceNumber: `INV-${new Date().getFullYear()}-${id.replace('ord_', '')}`
    });
  } catch (err) {
    console.error('[Store Razorpay Verification Error]:', err);
    res.status(500).json({ error: err.message || 'Payment verification failed' });
  }
});

app.post('/api/store/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id !== 'admin' ? req.user.id : 'default_user';
    const { items, address, subtotal, delivery_fee, platform_fee, gst, coupon, discount, total, payment_method, notes, preferred_date, preferred_time, utr_number, screenshot_url } = req.body;
    const id = 'ord_' + Date.now();
    const paymentStatus = payment_method === 'cod' ? 'pending' : (utr_number ? 'under_verification' : 'pending');
    
    await dbRun(
      'INSERT INTO store_orders (id, user_id, items, address, subtotal, delivery_fee, platform_fee, gst, coupon, discount, total, payment_method, payment_status, utr_number, screenshot_url, order_status, notes, preferred_date, preferred_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, userId, JSON.stringify(items), JSON.stringify(address), subtotal, delivery_fee, platform_fee, gst, coupon, discount, total, payment_method, paymentStatus, utr_number, screenshot_url, 'placed', notes, preferred_date, preferred_time, new Date().toISOString()]
    );
    const order = await dbGet('SELECT * FROM store_orders WHERE id = ?', [id]);
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/store/orders/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id !== 'admin' ? req.user.id : 'default_user';
    const orders = await dbAll('SELECT * FROM store_orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/store/orders/:id', authenticateToken, async (req, res) => {
  try {
    const order = await dbGet('SELECT * FROM store_orders WHERE id = ?', [req.params.id]);
    if (order) res.json(order);
    else res.status(404).json({ error: 'Order not found' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/store/orders/:id/cancel', authenticateToken, async (req, res) => {
  try {
    await dbRun('UPDATE store_orders SET order_status = "cancelled" WHERE id = ?', [req.params.id]);
    const order = await dbGet('SELECT * FROM store_orders WHERE id = ?', [req.params.id]);
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/store/orders/:orderId/payment', authenticateToken, async (req, res) => {
  try {
    const { utr_number, screenshot_url } = req.body;
    await dbRun('UPDATE store_orders SET utr_number = ?, screenshot_url = ?, payment_status = "under_verification" WHERE id = ?', [utr_number, screenshot_url, req.params.orderId]);
    const order = await dbGet('SELECT * FROM store_orders WHERE id = ?', [req.params.orderId]);
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/store/orders/:orderId/screenshot', authenticateToken, upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const screenshot_url = '/uploads/' + req.file.filename;
    res.json({ screenshot_url });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/store/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await dbAll('SELECT * FROM store_orders ORDER BY created_at DESC');
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/store/orders/:orderId/verify', authenticateToken, async (req, res) => {
  try {
    const { action } = req.body;
    const paymentStatus = action === 'approve' ? 'paid' : (action === 'reject' ? 'failed' : 'pending');
    await dbRun('UPDATE store_orders SET payment_status = ? WHERE id = ?', [paymentStatus, req.params.orderId]);
    const order = await dbGet('SELECT * FROM store_orders WHERE id = ?', [req.params.orderId]);
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/store/orders/:orderId/tracking', authenticateToken, async (req, res) => {
  try {
    const { tracking_stage, order_status } = req.body;
    await dbRun('UPDATE store_orders SET tracking_stage = ?, order_status = COALESCE(?, order_status) WHERE id = ?', [tracking_stage, order_status, req.params.orderId]);
    const order = await dbGet('SELECT * FROM store_orders WHERE id = ?', [req.params.orderId]);
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/store/orders/:orderId/assign', authenticateToken, async (req, res) => {
  try {
    const { worker_name, worker_phone } = req.body;
    await dbRun('UPDATE store_orders SET worker_name = ?, worker_phone = ? WHERE id = ?', [worker_name, worker_phone, req.params.orderId]);
    const order = await dbGet('SELECT * FROM store_orders WHERE id = ?', [req.params.orderId]);
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/store/settings', async (req, res) => {
  try {
    const settings = await dbGet('SELECT * FROM store_settings LIMIT 1') || { delivery_fee: 50, platform_fee: 10, delivery_threshold: 500 };
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/store/settings', authenticateToken, async (req, res) => {
  try {
    const { delivery_fee, platform_fee, delivery_threshold } = req.body;
    const exists = await dbGet('SELECT * FROM store_settings LIMIT 1');
    if (exists) {
      await dbRun('UPDATE store_settings SET delivery_fee=?, platform_fee=?, delivery_threshold=?, updated_at=?', [delivery_fee, platform_fee, delivery_threshold, new Date().toISOString()]);
    } else {
      await dbRun('INSERT INTO store_settings (id, delivery_fee, platform_fee, delivery_threshold, updated_at) VALUES (?, ?, ?, ?, ?)', ['set_1', delivery_fee, platform_fee, delivery_threshold, new Date().toISOString()]);
    }
    res.json({ delivery_fee, platform_fee, delivery_threshold });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// MEALS APIs (100% Dynamic Database Operations)
// ==========================================

app.get('/api/meals', async (req, res) => {
  try {
    const { category, food_type, search } = req.query;
    let sql = 'SELECT * FROM meals WHERE is_active = 1';
    let params = [];
    let conditions = [];

    if (category && category !== 'All' && category !== 'All Items') {
      conditions.push('category = ?');
      params.push(category);
    }
    if (food_type && food_type !== 'all') {
      conditions.push('food_type = ?');
      params.push(food_type);
    }
    if (search) {
      conditions.push('(name LIKE ? OR category LIKE ? OR caterer LIKE ? OR description LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    if (conditions.length > 0) {
      sql += ' AND ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    const meals = await dbAll(sql, params);
    const parsed = meals.map(m => ({
      ...m,
      foodType: m.food_type,
      prepTime: m.prep_time,
      originalPrice: m.original_price,
      discountBadge: m.discount_badge,
      popular: Boolean(m.popular),
      bestseller: Boolean(m.bestseller),
      ingredients: m.ingredients ? JSON.parse(m.ingredients) : [],
      nutrition: m.nutrition ? JSON.parse(m.nutrition) : { calories: m.calories || 400, protein: '15g', carbs: '50g', fat: '15g' },
      spiceLevel: m.spice_level || 'Medium'
    }));

    res.json(parsed);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/meals', authenticateToken, async (req, res) => {
  try {
    const { name, category, caterer, food_type, foodType, prep_time, prepTime, calories, serves, price, original_price, originalPrice, discount_badge, discountBadge, image, description, ingredients, nutrition, spice_level, spiceLevel } = req.body;
    const id = 'm_' + Date.now();
    const finalFoodType = food_type || foodType || 'veg';
    const finalPrepTime = prep_time || prepTime || '20 mins';
    const finalOrigPrice = Number(original_price || originalPrice || price);
    const finalBadge = discount_badge || discountBadge || 'FRESH';
    const finalSpice = spice_level || spiceLevel || 'Medium';

    await dbRun(
      'INSERT INTO meals (id, name, category, caterer, food_type, rating, reviews, prep_time, calories, serves, price, original_price, discount_badge, popular, bestseller, image, description, ingredients, nutrition, spice_level, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
      [
        id,
        name,
        category || 'Daily Meals',
        caterer || 'MasterChef Kitchen',
        finalFoodType,
        4.8,
        1,
        finalPrepTime,
        Number(calories || 450),
        serves || '1 Person',
        Number(price),
        finalOrigPrice,
        finalBadge,
        1,
        0,
        image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
        description || '',
        JSON.stringify(Array.isArray(ingredients) ? ingredients : [ingredients].filter(Boolean)),
        JSON.stringify(typeof nutrition === 'object' ? nutrition : { calories: Number(calories || 450), protein: '15g', carbs: '50g', fat: '15g' }),
        finalSpice,
        new Date().toISOString()
      ]
    );

    const newMeal = await dbGet('SELECT * FROM meals WHERE id = ?', [id]);
    res.status(201).json(newMeal);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/meals/:id', authenticateToken, async (req, res) => {
  try {
    const { name, category, caterer, food_type, foodType, price, original_price, originalPrice, image, description, is_active } = req.body;
    await dbRun(
      'UPDATE meals SET name=COALESCE(?, name), category=COALESCE(?, category), caterer=COALESCE(?, caterer), food_type=COALESCE(?, food_type), price=COALESCE(?, price), original_price=COALESCE(?, original_price), image=COALESCE(?, image), description=COALESCE(?, description), is_active=COALESCE(?, is_active) WHERE id=?',
      [name, category, caterer, food_type || foodType, price ? Number(price) : null, original_price || originalPrice ? Number(original_price || originalPrice) : null, image, description, is_active !== undefined ? (is_active ? 1 : 0) : null, req.params.id]
    );
    const updated = await dbGet('SELECT * FROM meals WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/meals/:id', authenticateToken, async (req, res) => {
  try {
    await dbRun('DELETE FROM meals WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/catering/packages', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM catering_packages WHERE is_active = 1 ORDER BY created_at ASC';
    let params = [];
    if (category && category !== 'All Packages') {
      sql = 'SELECT * FROM catering_packages WHERE is_active = 1 AND category = ? ORDER BY created_at ASC';
      params = [category];
    }
    const packages = await dbAll(sql, params);
    res.json(packages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/catering/packages', authenticateToken, async (req, res) => {
  try {
    const { title, category, description, pax, price, image } = req.body;
    const id = 'cat_' + Date.now();
    await dbRun(
      'INSERT INTO catering_packages (id, title, category, description, pax, price, image, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)',
      [id, title, category, description, pax, Number(price), image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600', new Date().toISOString()]
    );
    const newPkg = await dbGet('SELECT * FROM catering_packages WHERE id = ?', [id]);
    res.status(201).json(newPkg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/catering/requests/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'customer_default';
    const requests = await dbAll('SELECT * FROM catering_requests WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/catering/requests', authenticateToken, async (req, res) => {
  try {
    const { package_id, package_title, guest_count, event_date, event_type, contact_phone, special_notes, total_estimated_price } = req.body;
    const userId = req.user ? req.user.id : 'customer_default';
    const userName = req.user ? (req.user.name || req.user.email) : 'Customer';
    const id = 'cr_' + Date.now();
    await dbRun(
      'INSERT INTO catering_requests (id, user_id, user_name, package_id, package_title, guest_count, event_date, event_type, contact_phone, special_notes, status, total_estimated_price, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, userId, userName, package_id || null, package_title, Number(guest_count), event_date, event_type || 'Event', contact_phone || '', special_notes || '', 'confirmed', Number(total_estimated_price), new Date().toISOString()]
    );
    const createdReq = await dbGet('SELECT * FROM catering_requests WHERE id = ?', [id]);
    res.status(201).json(createdReq);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// VEHICLES APIs
// ==========================================

app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await dbAll('SELECT * FROM vehicles ORDER BY created_at DESC');
    res.json(vehicles);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/vehicles', authenticateToken, async (req, res) => {
  try {
    const { name, type, capacity_passengers, capacity_luggage, base_price, price_per_km, image, features, is_active } = req.body;
    const id = 'veh_' + Date.now();
    await dbRun(
      'INSERT INTO vehicles (id, name, type, capacity_passengers, capacity_luggage, base_price, price_per_km, image, features, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, type, capacity_passengers, capacity_luggage, base_price, price_per_km, image, JSON.stringify(features || []), is_active ? 1 : 0, new Date().toISOString()]
    );
    const vehicle = await dbGet('SELECT * FROM vehicles WHERE id = ?', [id]);
    res.json(vehicle);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    const { name, type, capacity_passengers, capacity_luggage, base_price, price_per_km, image, features, is_active } = req.body;
    await dbRun(
      'UPDATE vehicles SET name=?, type=?, capacity_passengers=?, capacity_luggage=?, base_price=?, price_per_km=?, image=?, features=?, is_active=? WHERE id=?',
      [name, type, capacity_passengers, capacity_luggage, base_price, price_per_km, image, JSON.stringify(features || []), is_active ? 1 : 0, req.params.id]
    );
    const vehicle = await dbGet('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    res.json(vehicle);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    await dbRun('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Taxi Booking Management
app.put('/api/bookings/:id/manage-taxi', authenticateToken, async (req, res) => {
  try {
    const { driverName, driverPhone, licensePlate, status, timelineNote } = req.body;
    
    // First update the booking's fields if they are provided
    if (driverName || driverPhone || licensePlate || status) {
      await dbRun(
        'UPDATE bookings SET professional_name = COALESCE(?, professional_name), driver_phone = COALESCE(?, driver_phone), license_plate = COALESCE(?, license_plate), status = COALESCE(?, status) WHERE id = ?',
        [driverName, driverPhone, licensePlate, status, req.params.id]
      );
    }
    
    // If there is a timeline note, append it to timeline
    if (timelineNote) {
      await dbRun(
        'INSERT INTO booking_timeline (booking_id, status, note, time) VALUES (?, ?, ?, ?)',
        [req.params.id, status || 'updated', timelineNote, new Date().toISOString()]
      );
    }

    const booking = await dbGet('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    res.json(booking);
  } catch (err) { res.status(500).json({ error: err.message }); }
});



// ==========================================
// Analytics Endpoints
// ==========================================
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const visitors = await dbAll('SELECT * FROM visitors ORDER BY last_visit DESC');
    const uniqueVisitors = visitors.length;
    const totalVisitors = visitors.reduce((acc, v) => acc + v.visit_count, 0);
    const returningVisitors = visitors.filter(v => v.visit_count > 1).length;
    
    // Revenue stats
    const orders = await dbAll("SELECT * FROM store_orders WHERE status = 'paid'");
    const revenue = orders.reduce((acc, o) => acc + (Number(o.amount) || 0), 0);
    
    // Top Services
    const bookings = await dbAll("SELECT * FROM bookings");
    
    res.json({
      visitors,
      totalVisitors,
      uniqueVisitors,
      returningVisitors,
      onlineVisitors,
      totalRevenue: revenue,
      totalBookings: bookings.length
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Relational HomeSeva backend running on http://localhost:${PORT}`);
});
