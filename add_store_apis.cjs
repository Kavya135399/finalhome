const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'server', 'index.js');

let content = fs.readFileSync(p, 'utf8');

// If there are null bytes, it might be utf-16, let's clean it up
if (content.includes('\0')) {
  content = fs.readFileSync(p, 'utf16le');
}

if (!content.includes('/api/store/addresses')) {
  const storeEndpoints = `
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
`;

  content = content.replace('// Start Express server', storeEndpoints + '\n\n// Start Express server');
  fs.writeFileSync(p, content, 'utf8');
  console.log('Appended store endpoints successfully.');
} else {
  console.log('Endpoints already exist.');
}
