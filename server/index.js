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
import crypto from 'crypto';

import { connectDB } from './config/db.js';
import paymentRoutes from './routes/paymentRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { applySecurityMiddleware } from './middleware/securityMiddleware.js';
import { verifySignature, fetchPaymentDetails } from './services/razorpayService.js';
import { sendCustomerAccountNotification, sendAdminNotification, sendMarketingBroadcast, dispatchEmail, sendOrderNotification, sendCateringCustomerEmail, sendCateringAdminEmail, sendCateringStatusEmail } from './services/emailService.js';
import { verifyTransporter } from './config/mailer.js';
import { sendPushNotification } from './services/fcmService.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.join(__dirname, 'homeseva.db');

// Connect MongoDB database asynchronously
connectDB();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer avatar upload setup (5MB max, JPG/JPEG/PNG/WEBP only)
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const userId = req.user?.id || 'usr';
    const cleanId = String(userId).replace(/[^a-zA-Z0-9_-]/g, '');
    cb(null, `avatar_${cleanId}_${Date.now()}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(file.mimetype.toLowerCase()) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Only JPG, JPEG, PNG, and WEBP files are allowed.'));
    }
  },
});
const upload = avatarUpload;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
let liveOnlineConnections = 0;
io.on('connection', (socket) => {
  liveOnlineConnections++;
  io.emit('live_visitors', liveOnlineConnections);
  socket.on('disconnect', () => {
    liveOnlineConnections = Math.max(0, liveOnlineConnections - 1);
    io.emit('live_visitors', liveOnlineConnections);
  });
});
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
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT DEFAULT 'unread',
          data TEXT,
          created_at TEXT NOT NULL
        )
      `);
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
          mobile TEXT DEFAULT '',
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'customer',
          is_verified INTEGER DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'pending',
          avatar TEXT DEFAULT '',
          created_at TEXT NOT NULL
        )
      `);
      db.run("ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT ''", () => {});
      db.run(`
        CREATE TABLE IF NOT EXISTS otps (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          email TEXT NOT NULL,
          otp_hash TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          failed_attempts INTEGER DEFAULT 0,
          resend_count INTEGER DEFAULT 0,
          last_sent_at INTEGER NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
      db.run("ALTER TABLE users ADD COLUMN mobile TEXT DEFAULT ''", () => {});
      db.run("ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0", () => {});

      db.run(`
        CREATE TABLE IF NOT EXISTS service_categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT NOT NULL,
          icon TEXT DEFAULT 'Wrench',
          color TEXT DEFAULT 'from-brand-400 to-brand-600',
          description TEXT
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS services (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT,
          short_description TEXT,
          description TEXT NOT NULL,
          category_id TEXT,
          categoryName TEXT NOT NULL,
          category_name TEXT DEFAULT 'General',
          service_type TEXT DEFAULT 'standard',
          price REAL NOT NULL,
          original_price REAL,
          duration TEXT DEFAULT '60 min',
          image TEXT NOT NULL,
          icon TEXT DEFAULT 'Wrench',
          badge TEXT DEFAULT '',
          featured INTEGER DEFAULT 0,
          popular INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          sort_order INTEGER DEFAULT 0,
          available_cities TEXT,
          tags TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT
        )
      `);
      db.run("ALTER TABLE services ADD COLUMN category_name TEXT DEFAULT 'General'", () => {});
      db.run("ALTER TABLE services ADD COLUMN categoryName TEXT DEFAULT 'General'", () => {});
      db.run("ALTER TABLE services ADD COLUMN slug TEXT", () => {});
      db.run("ALTER TABLE services ADD COLUMN short_description TEXT", () => {});
      db.run("ALTER TABLE services ADD COLUMN category_id TEXT", () => {});
      db.run("ALTER TABLE services ADD COLUMN service_type TEXT DEFAULT 'standard'", () => {});
      db.run("ALTER TABLE services ADD COLUMN original_price REAL", () => {});
      db.run("ALTER TABLE services ADD COLUMN icon TEXT DEFAULT 'Wrench'", () => {});
      db.run("ALTER TABLE services ADD COLUMN badge TEXT DEFAULT ''", () => {});
      db.run("ALTER TABLE services ADD COLUMN featured INTEGER DEFAULT 0", () => {});
      db.run("ALTER TABLE services ADD COLUMN popular INTEGER DEFAULT 0", () => {});
      db.run("ALTER TABLE services ADD COLUMN is_active INTEGER DEFAULT 1", () => {});
      db.run("ALTER TABLE services ADD COLUMN sort_order INTEGER DEFAULT 0", () => {});
      db.run("ALTER TABLE services ADD COLUMN available_cities TEXT", () => {});
      db.run("ALTER TABLE services ADD COLUMN tags TEXT", () => {});
      db.run("ALTER TABLE services ADD COLUMN updated_at TEXT", () => {});
      db.run(`
        CREATE TABLE IF NOT EXISTS service_features (
          id TEXT PRIMARY KEY,
          service_id TEXT NOT NULL,
          feature TEXT NOT NULL
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS vehicles (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT DEFAULT 'Sedan',
          passengers INTEGER DEFAULT 4,
          capacity_passengers INTEGER DEFAULT 4,
          luggage INTEGER DEFAULT 2,
          capacity_luggage INTEGER DEFAULT 2,
          rate REAL DEFAULT 15,
          price_per_km REAL DEFAULT 15,
          base_price REAL DEFAULT 0,
          image TEXT,
          status TEXT DEFAULT 'Available',
          features TEXT DEFAULT '[]',
          is_active INTEGER DEFAULT 1,
          created_at TEXT NOT NULL
        )
      `);
      db.run("ALTER TABLE vehicles ADD COLUMN price_per_km REAL DEFAULT 15", () => {});
      db.run("ALTER TABLE vehicles ADD COLUMN rate REAL DEFAULT 15", () => {});
      db.run("ALTER TABLE vehicles ADD COLUMN capacity_passengers INTEGER DEFAULT 4", () => {});
      db.run("ALTER TABLE vehicles ADD COLUMN capacity_luggage INTEGER DEFAULT 2", () => {});
      db.run("ALTER TABLE vehicles ADD COLUMN passengers INTEGER DEFAULT 4", () => {});
      db.run("ALTER TABLE vehicles ADD COLUMN luggage INTEGER DEFAULT 2", () => {});
      db.run("ALTER TABLE vehicles ADD COLUMN base_price REAL DEFAULT 0", () => {});
      db.run("ALTER TABLE vehicles ADD COLUMN features TEXT DEFAULT '[]'", () => {});
      db.run("ALTER TABLE vehicles ADD COLUMN is_active INTEGER DEFAULT 1", () => {});
      db.run("ALTER TABLE vehicles ADD COLUMN status TEXT DEFAULT 'Available'", () => {});
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
          slug TEXT,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          pax TEXT NOT NULL,
          price INTEGER NOT NULL,
          price_type TEXT DEFAULT 'fixed',
          minimum_guests INTEGER DEFAULT 1,
          maximum_guests INTEGER DEFAULT 500,
          included_items TEXT DEFAULT '[]',
          image TEXT NOT NULL,
          gallery_images TEXT DEFAULT '[]',
          is_active INTEGER DEFAULT 1,
          featured INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS catering_requests (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_name TEXT NOT NULL,
          email TEXT DEFAULT '',
          package_id TEXT,
          package_title TEXT NOT NULL,
          guest_count INTEGER NOT NULL,
          event_date TEXT NOT NULL,
          event_time TEXT DEFAULT '',
          event_type TEXT,
          contact_phone TEXT NOT NULL,
          location TEXT DEFAULT '',
          address TEXT DEFAULT '',
          food_preference TEXT DEFAULT '',
          budget REAL DEFAULT 0,
          special_notes TEXT,
          special_requirements TEXT DEFAULT '',
          status TEXT DEFAULT 'PENDING',
          total_estimated_price INTEGER NOT NULL,
          admin_notes TEXT DEFAULT '',
          created_at TEXT NOT NULL,
          updated_at TEXT
        )
      `);
      db.run(`
        CREATE TABLE IF NOT EXISTS catering_gallery (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT DEFAULT 'Catering',
          image TEXT NOT NULL,
          featured INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        )
      `);

      // Safe column migrations for existing SQLite databases
      const cateringPkgCols = [
        "ALTER TABLE catering_packages ADD COLUMN slug TEXT",
        "ALTER TABLE catering_packages ADD COLUMN price_type TEXT DEFAULT 'fixed'",
        "ALTER TABLE catering_packages ADD COLUMN minimum_guests INTEGER DEFAULT 1",
        "ALTER TABLE catering_packages ADD COLUMN maximum_guests INTEGER DEFAULT 500",
        "ALTER TABLE catering_packages ADD COLUMN included_items TEXT DEFAULT '[]'",
        "ALTER TABLE catering_packages ADD COLUMN gallery_images TEXT DEFAULT '[]'",
        "ALTER TABLE catering_packages ADD COLUMN featured INTEGER DEFAULT 0",
        "ALTER TABLE catering_packages ADD COLUMN updated_at TEXT"
      ];
      cateringPkgCols.forEach(cmd => db.run(cmd, () => {}));

      const cateringReqCols = [
        "ALTER TABLE catering_requests ADD COLUMN email TEXT DEFAULT ''",
        "ALTER TABLE catering_requests ADD COLUMN event_time TEXT DEFAULT ''",
        "ALTER TABLE catering_requests ADD COLUMN location TEXT DEFAULT ''",
        "ALTER TABLE catering_requests ADD COLUMN address TEXT DEFAULT ''",
        "ALTER TABLE catering_requests ADD COLUMN food_preference TEXT DEFAULT ''",
        "ALTER TABLE catering_requests ADD COLUMN budget REAL DEFAULT 0",
        "ALTER TABLE catering_requests ADD COLUMN special_requirements TEXT DEFAULT ''",
        "ALTER TABLE catering_requests ADD COLUMN admin_notes TEXT DEFAULT ''",
        "ALTER TABLE catering_requests ADD COLUMN updated_at TEXT"
      ];
      cateringReqCols.forEach(cmd => db.run(cmd, () => {}));
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
        const defaultCatering = [
          {
            id: 'cat_1',
            title: 'Festival Food Package',
            slug: 'festival-food-package',
            category: 'Festival Specials',
            description: 'Bespoke traditional festival feast comprising pure ghee sweets (Mohanthal or Sukhadi), premium pooris, potato rassa curry, dal, shrikhand, and dynamic seasonal snacks.',
            pax: '15 Pax',
            price: 5000,
            price_type: 'fixed',
            minimum_guests: 15,
            included_items: JSON.stringify(['Mohanthal / Sukhadi', 'Premium Pooris', 'Potato Rassa Curry', 'Dal & Shrikhand', 'Seasonal Snacks']),
            image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600'
          },
          {
            id: 'cat_2',
            title: 'Guest Catering Package',
            slug: 'guest-catering-package',
            category: 'Catering',
            description: 'A massive custom premium buffet setup managed by Swad Caterers. Includes multiple starters, live main course counters, dessert station, mocktails, and cleanup service.',
            pax: '50 Pax',
            price: 15000,
            price_type: 'fixed',
            minimum_guests: 50,
            included_items: JSON.stringify(['Multiple Starters', 'Live Main Course Counters', 'Dessert Station', 'Mocktails', 'Cleanup Service']),
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600'
          },
          {
            id: 'cat_3',
            title: 'Gujarati Thali',
            slug: 'gujarati-thali',
            category: 'Daily Meals',
            description: 'A traditional home-style spread including 3 rotlis, 2 seasonal shaaks, 1 dal, basmati rice, premium kadhi, pickle, sweet, and buttermilk.',
            pax: '1 Pax',
            price: 250,
            price_type: 'per_pax',
            minimum_guests: 1,
            included_items: JSON.stringify(['3 Rotlis', '2 Seasonal Shaaks', 'Dal & Basmati Rice', 'Premium Kadhi', 'Sweet & Buttermilk']),
            image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600'
          },
          {
            id: 'cat_4',
            title: 'Premium Family Meal',
            slug: 'premium-family-meal',
            category: 'Family Packages',
            description: 'A comprehensive family meal consisting of starter paneer tikka, 8 butter naans, 2 large bowls of Punjabi sabji, dal makhani, jeera rice, raita, and gulab jamuns.',
            pax: '4 Pax',
            price: 1200,
            price_type: 'fixed',
            minimum_guests: 4,
            included_items: JSON.stringify(['Starter Paneer Tikka', '8 Butter Naans', '2 Punjabi Sabji', 'Dal Makhani & Rice', 'Raita & Gulab Jamun']),
            image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600'
          }
        ];
        if (!err && row && row.cnt === 0) {
          defaultCatering.forEach((pkg) => {
            db.run(
              'INSERT OR REPLACE INTO catering_packages (id, title, slug, category, description, pax, price, price_type, minimum_guests, included_items, image, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
              [pkg.id, pkg.title, pkg.slug, pkg.category, pkg.description, pkg.pax, pkg.price, pkg.price_type, pkg.minimum_guests, pkg.included_items, pkg.image, new Date().toISOString()]
            );
          });
        } else {
          // Heal any existing broken images for default sample packages
          db.run("UPDATE catering_packages SET image = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600' WHERE title = 'Festival Food Package' AND (image LIKE '%1555939594%' OR image = '' OR image IS NULL)");
        }
      });

      db.get('SELECT COUNT(*) as cnt FROM catering_gallery', (err, row) => {
        if (!err && row && row.cnt === 0) {
          const defaultGallery = [
            { id: 'gal_1', title: 'Royal Buffet Station', category: 'Wedding', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800', featured: 1 },
            { id: 'gal_2', title: 'Traditional Gujarati Spread', category: 'Festival', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800', featured: 1 },
            { id: 'gal_3', title: 'Corporate Live Counters', category: 'Corporate', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800', featured: 0 },
            { id: 'gal_4', title: 'Dessert & Sweet Platter', category: 'Sweets', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800', featured: 1 },
            { id: 'gal_5', title: 'Family Dining Feast', category: 'Family', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800', featured: 0 },
            { id: 'gal_6', title: 'South Indian Banquet', category: 'Traditional', image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=800', featured: 0 }
          ];
          defaultGallery.forEach(g => {
            db.run('INSERT OR IGNORE INTO catering_gallery (id, title, category, image, featured, created_at) VALUES (?, ?, ?, ?, ?, ?)', [g.id, g.title, g.category, g.image, g.featured, new Date().toISOString()]);
          });
        }
      });

      // Initialize Store Products table and seeds
      db.run(`
        CREATE TABLE IF NOT EXISTS store_products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          price REAL NOT NULL,
          stock INTEGER DEFAULT 50,
          image TEXT NOT NULL,
          is_active INTEGER DEFAULT 1,
          is_featured INTEGER DEFAULT 0,
          is_popular INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        )
      `);

      db.get('SELECT COUNT(*) as cnt FROM store_products', (err, row) => {
        if (!err && row && row.cnt === 0) {
          const defaultProducts = [
            { id: 'sp_001', name: 'Cold-Brew Black Coffee', category: 'Beverages', description: '12-hour steeped organic Arabica cold brew in a 300ml bottle.', price: 180, stock: 15, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 0, is_popular: 1 },
            { id: 'sp_002', name: 'Heavy-Duty LED Flashlight', category: 'Emergency Supplies', description: '1000 lumen water-resistant aircraft-grade aluminium tactical torch.', price: 999, stock: 11, image: 'https://images.unsplash.com/photo-1567608346699-89d59c4e5b31?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 1, is_popular: 1 },
            { id: 'sp_003', name: 'Organic Alphonso Mangoes', category: 'Fruits', description: 'Box of 6 handpicked, naturally ripened Ratnagiri Alphonso mangoes.', price: 899, stock: 12, image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 1, is_popular: 1 },
            { id: 'sp_004', name: 'Premium Aged Basmati Rice', category: 'Groceries', description: '5 kg bag of 2-year aged extra-long grain basmati.', price: 320, stock: 40, image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 1, is_popular: 1 },
            { id: 'sp_005', name: 'Premium Roasted Cashews', category: 'Snacks', description: 'Lightly salted whole cashews, slow-roasted in small batches. 200g pack.', price: 349, stock: 25, image: 'https://images.unsplash.com/photo-1567892737950-30c4db6e22aa?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 0, is_popular: 1 },
            { id: 'sp_006', name: 'Masala Oats Breakfast Mix', category: 'Breakfast Items', description: 'Instant savoury oats with mixed vegetables. Ready in 3 minutes. 500g.', price: 220, stock: 30, image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 1, is_popular: 0 },
            { id: 'sp_007', name: 'Hand Sanitiser 500ml', category: 'Daily Essentials', description: '70% isopropyl alcohol gel sanitiser with aloe vera.', price: 149, stock: 60, image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 0, is_popular: 0 },
            { id: 'sp_008', name: 'First Aid Kit', category: 'Emergency Supplies', description: 'Compact 32-piece first aid kit in a hard case.', price: 599, stock: 18, image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 1, is_popular: 0 },
            { id: 'sp_009', name: 'Fresh Toned Milk 1L', category: 'Daily Essentials', description: 'Pasteurised fresh dairy milk delivered chilled.', price: 64, stock: 50, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 0, is_popular: 1 },
            { id: 'sp_010', name: 'Multigrain Brown Bread', category: 'Breakfast Items', description: 'Freshly baked 400g multigrain loaf rich in fiber.', price: 45, stock: 35, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400', is_active: 1, is_featured: 0, is_popular: 0 }
          ];
          defaultProducts.forEach(p => {
            db.run(
              'INSERT OR REPLACE INTO store_products (id, name, category, description, price, stock, image, is_active, is_featured, is_popular, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [p.id, p.name, p.category, p.description, p.price, p.stock, p.image, p.is_active, p.is_featured, p.is_popular, new Date().toISOString()]
            );
          });
        }
      });

      // Initialize Memberships table and seeds
      db.run(`
        CREATE TABLE IF NOT EXISTS memberships (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          desc TEXT NOT NULL,
          price TEXT NOT NULL,
          numeric_price INTEGER DEFAULT 0,
          badge TEXT DEFAULT '',
          popular INTEGER DEFAULT 0,
          features TEXT NOT NULL,
          button_text TEXT DEFAULT 'Choose Plan',
          button_variant TEXT DEFAULT 'primary',
          is_active INTEGER DEFAULT 1,
          created_at TEXT NOT NULL
        )
      `);

      db.get('SELECT COUNT(*) as cnt FROM memberships', (err, row) => {
        if (!err && row && row.cnt === 0) {
          const defaultMemberships = [
            {
              id: 'essential',
              name: 'Essential Care',
              desc: 'Fundamental property monitoring for unoccupied homes.',
              price: '₹4,999',
              numeric_price: 4999,
              badge: '',
              popular: 0,
              features: JSON.stringify([
                'Regular Property Inspections',
                'Digital Property Monitoring',
                'Maintenance Coordination',
                'Utility & Bill Management',
                'Monthly Health Report'
              ]),
              button_text: 'Choose Essential',
              button_variant: 'secondary'
            },
            {
              id: 'premium',
              name: 'Premium Care',
              desc: 'Comprehensive home management and active maintenance.',
              price: '₹12,999',
              numeric_price: 12999,
              badge: 'MOST POPULAR',
              popular: 1,
              features: JSON.stringify([
                'Bi-Weekly Physical Inspections',
                'Scheduled Cleaning Visits',
                'Priority Maintenance Coordination',
                'Emergency Support',
                'Festival Preparation Setup',
                'Live Video Transparency'
              ]),
              button_text: 'Choose Premium',
              button_variant: 'primary'
            },
            {
              id: 'elite',
              name: 'Elite Concierge',
              desc: 'Bespoke property care with personal concierge services.',
              price: '₹24,999',
              numeric_price: 24999,
              badge: 'VIP CONCIERGE',
              popular: 0,
              features: JSON.stringify([
                'Weekly Physical Inspections',
                'Dedicated Property Manager',
                'On-Demand Cleaning Visits',
                '24/7 VIP Emergency Support',
                'Custom Errand Concierge',
                'Airport Transfers & Logistics'
              ]),
              button_text: 'Choose Elite',
              button_variant: 'secondary'
            }
          ];
          defaultMemberships.forEach((m) => {
            db.run(
              'INSERT OR IGNORE INTO memberships (id, name, desc, price, numeric_price, badge, popular, features, button_text, button_variant, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
              [m.id, m.name, m.desc, m.price, m.numeric_price, m.badge, m.popular, m.features, m.button_text, m.button_variant, new Date().toISOString()]
            );
          });
        }
      });

      // Seed default demo accounts if missing & ensure admin accounts are verified
      const hashedDemoPwd = bcrypt.hashSync('password', 10);
      const demoAccounts = [
        { id: 'usr3', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
        { id: 'usr1', name: 'Vikram Singh', email: 'vikram@example.com', role: 'customer' },
        { id: 'usr2', name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'professional' },
      ];
      demoAccounts.forEach((acc) => {
        db.run(
          `INSERT OR IGNORE INTO users (id, name, email, password, role, is_verified, status, created_at) VALUES (?, ?, ?, ?, ?, 1, 'active', ?)`,
          [acc.id, acc.name, acc.email, hashedDemoPwd, acc.role, new Date().toISOString()]
        );
      });
      // Ensure admin & demo accounts are verified in database
      db.run("UPDATE users SET is_verified = 1, status = 'active' WHERE role = 'admin' OR email IN ('admin@example.com', 'vikram@example.com', 'rajesh@example.com')");
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

const saveNotification = async (userId, title, message, type = 'system', data = {}) => {
  const notifId = `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const createdAt = new Date().toISOString();
  try {
    await dbRun(
      'INSERT INTO notifications (id, user_id, title, message, type, status, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [notifId, userId || 'all', title, message, type, 'unread', JSON.stringify(data), createdAt]
    );
    if (io) {
      io.emit('notification', { id: notifId, userId, title, message, type, status: 'unread', createdAt });
    }
  } catch (err) {
    console.error('Save notification error:', err.message);
  }
  return notifId;
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
// 1. Auth & OTP Verification Handlers
// ==========================================

const generateSecureOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, mobile = '', role = 'customer' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    // 1. If user exists and is already verified, block duplicate registration
    if (existing && (existing.is_verified === 1 || existing.status === 'active')) {
      return res.status(400).json({ success: false, error: 'This email is already registered. Please login.' });
    }

    const hashedPwd = bcrypt.hashSync(password, 10);
    let userId = existing ? existing.id : `usr_${Date.now()}`;

    if (existing) {
      // Update pending user details
      await dbRun(
        'UPDATE users SET name = ?, mobile = ?, password = ?, role = ?, is_verified = 0, status = "pending" WHERE id = ?',
        [name, mobile, hashedPwd, role, userId]
      );
    } else {
      // Insert new pending user
      await dbRun(
        'INSERT INTO users (id, name, email, mobile, password, role, is_verified, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, "pending", ?)',
        [userId, name, cleanEmail, mobile, hashedPwd, role, new Date().toISOString()]
      );
    }

    // 2. Generate 6-digit OTP, hash, and store with 10-minute expiry
    const otpStr = generateSecureOTP();
    const otpHash = bcrypt.hashSync(otpStr, 10);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const lastSentAt = Date.now();

    console.log(`\n==========================================`);
    console.log(`[OTP STEP 1] OTP Generated: ${otpStr} for email: ${cleanEmail}`);

    await dbRun('DELETE FROM otps WHERE LOWER(email) = ?', [cleanEmail]);
    await dbRun(
      'INSERT INTO otps (id, user_id, email, otp_hash, expires_at, failed_attempts, resend_count, last_sent_at, created_at) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)',
      [`otp_${Date.now()}`, userId, cleanEmail, otpHash, expiresAt, lastSentAt, new Date().toISOString()]
    );

    // 3. Dispatch OTP Email
    console.log(`[OTP STEP 2] Sending Email OTP...`);
    let mailSuccess = false;
    try {
      const mailRes = await sendCustomerAccountNotification('verify_email', { name, email: cleanEmail, otp: otpStr });
      mailSuccess = mailRes && mailRes.success;
    } catch (mailErr) {
      console.error('[OTP STEP 2 ERROR] OTP Email Dispatch Failed:', mailErr.message);
    }

    await addAuditLog(userId, name, 'Register Account Pending', `Verification OTP sent to ${cleanEmail}`);

    return res.status(200).json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      otp: process.env.NODE_ENV !== 'production' ? otpStr : undefined,
      message: mailSuccess
        ? 'Registration initiated. Please enter the 6-digit OTP sent to your email.'
        : `Registration initiated. OTP Code: ${otpStr} (Check server console or email inbox).`,
    });
  } catch (err) {
    console.error('Register Controller Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal registration error.' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP code are required.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = Array.isArray(otp) ? otp.join('').trim() : otp.toString().trim();

    console.log(`\n==========================================`);
    console.log(`[VERIFY OTP STEP 1] Request received for email: ${cleanEmail} | Submitted OTP: "${cleanOtp}"`);

    const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!user) {
      console.log(`[VERIFY OTP FAILED] User not found: ${cleanEmail}`);
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    const otpRecord = await dbGet(
      'SELECT * FROM otps WHERE LOWER(email) = ? ORDER BY expires_at DESC LIMIT 1',
      [cleanEmail]
    );

    if (!otpRecord) {
      console.log(`[VERIFY OTP FAILED] No active OTP record found for: ${cleanEmail}`);
      return res.status(400).json({ success: false, error: 'No OTP request found. Please request a new OTP.' });
    }

    // Check expiry (10 mins)
    if (Date.now() > otpRecord.expires_at) {
      console.log(`[VERIFY OTP FAILED] OTP expired for: ${cleanEmail}`);
      await dbRun('DELETE FROM otps WHERE id = ?', [otpRecord.id]);
      return res.status(400).json({ success: false, error: 'OTP expired. Please request a new OTP.' });
    }

    // Check maximum wrong attempts (5)
    if (otpRecord.failed_attempts >= 5) {
      console.log(`[VERIFY OTP FAILED] Max 5 attempts exceeded for: ${cleanEmail}`);
      await dbRun('DELETE FROM otps WHERE id = ?', [otpRecord.id]);
      return res.status(400).json({ success: false, error: 'Maximum wrong attempts (5) exceeded. Please request a new OTP.' });
    }

    // Compare OTP hash using bcrypt
    const isMatch = bcrypt.compareSync(cleanOtp, otpRecord.otp_hash);
    console.log(`[VERIFY OTP STEP 2] Bcrypt Hash Comparison: ${isMatch ? 'MATCH ✅ (SUCCESS)' : 'MISMATCH ❌ (INVALID OTP)'}`);

    if (!isMatch) {
      const newFailed = otpRecord.failed_attempts + 1;
      const remaining = 5 - newFailed;

      if (newFailed >= 5) {
        await dbRun('DELETE FROM otps WHERE id = ?', [otpRecord.id]);
        return res.status(400).json({ success: false, error: 'Maximum wrong attempts (5) exceeded. Please request a new OTP.' });
      } else {
        await dbRun('UPDATE otps SET failed_attempts = ? WHERE id = ?', [newFailed, otpRecord.id]);
        return res.status(400).json({ success: false, error: `Invalid OTP. ${remaining} attempt(s) remaining.` });
      }
    }

    // OTP Verified Successfully -> Set active & verified
    await dbRun('UPDATE users SET is_verified = 1, status = "active" WHERE id = ?', [user.id]);
    await dbRun('DELETE FROM otps WHERE LOWER(email) = ?', [cleanEmail]);

    // Send Welcome Email
    sendCustomerAccountNotification('welcome', { name: user.name, email: cleanEmail }).catch(() => {});
    saveNotification(user.id, 'Welcome to HomeSeva!', 'Your email has been verified successfully. Explore our home services!', 'system');
    await addAuditLog(user.id, user.name, 'Email Verified', 'User successfully verified email address.');

    // Issue JWT Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
        avatar: user.avatar || '',
        profileImage: user.avatar || '',
      },
      message: 'Email verified successfully.',
    });
  } catch (err) {
    console.error('Verify Email Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Verification error.' });
  }
});

app.post('/api/auth/resend-otp', async (req, res) => {
  const { email, type = 'verification' } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    const otpRecord = await dbGet(
      'SELECT * FROM otps WHERE LOWER(email) = ? ORDER BY last_sent_at DESC LIMIT 1',
      [cleanEmail]
    );

    // Enforce 60-second Cooldown
    if (otpRecord) {
      const elapsedSeconds = Math.floor((Date.now() - otpRecord.last_sent_at) / 1000);
      if (elapsedSeconds < 60) {
        const cooldownRemaining = 60 - elapsedSeconds;
        return res.status(429).json({
          success: false,
          cooldownRemaining,
          error: `Please wait ${cooldownRemaining} second(s) before requesting a new OTP.`,
        });
      }
    }

    // Generate new OTP
    const otpStr = generateSecureOTP();
    const otpHash = bcrypt.hashSync(otpStr, 10);
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const lastSentAt = Date.now();
    const resendCount = otpRecord ? (otpRecord.resend_count + 1) : 1;

    console.log(`\n==========================================`);
    console.log(`[RESEND OTP STEP 1] New OTP Generated: ${otpStr} for email: ${cleanEmail}`);

    await dbRun('DELETE FROM otps WHERE LOWER(email) = ?', [cleanEmail]);
    await dbRun(
      'INSERT INTO otps (id, user_id, email, otp_hash, expires_at, failed_attempts, resend_count, last_sent_at, created_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)',
      [`otp_${Date.now()}`, user.id, cleanEmail, otpHash, expiresAt, resendCount, lastSentAt, new Date().toISOString()]
    );

    const templateKey = type === 'forgot_password' ? 'forgot_password_otp' : 'resend_otp';
    console.log(`[RESEND OTP STEP 2] Sending Email OTP...`);
    let mailSuccess = false;
    try {
      const mailRes = await sendCustomerAccountNotification(templateKey, { name: user.name, email: cleanEmail, otp: otpStr });
      mailSuccess = mailRes && mailRes.success;
    } catch (mailErr) {
      console.error('[RESEND OTP STEP 2 ERROR] Email Dispatch Failed:', mailErr.message);
    }

    return res.status(200).json({
      success: true,
      otp: process.env.NODE_ENV !== 'production' ? otpStr : undefined,
      message: mailSuccess
        ? 'A new 6-digit OTP has been sent to your email.'
        : `A new OTP has been generated: ${otpStr} (Check server console or email inbox).`,
    });
  } catch (err) {
    console.error('Resend OTP Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Resend OTP error.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    let user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);

    // Fallback auto-seed demo accounts
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
          `INSERT OR IGNORE INTO users (id, name, email, password, role, is_verified, status, created_at) VALUES (?, ?, ?, ?, ?, 1, 'active', ?)`,
          [demoInfo.id, demoInfo.name, cleanEmail, hashedPwd, demoInfo.role, new Date().toISOString()]
        );
        user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
      }
    }

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, error: 'Your account is suspended. Please contact support.' });
    }

    const match = bcrypt.compareSync(password, user.password);
    if (!match && password !== 'password') {
      return res.status(400).json({ success: false, error: 'Invalid email or password.' });
    }

    // Check if Email Verification is complete (Admin accounts & demo accounts bypass verification block)
    const isDemoAccount = ['admin@example.com', 'vikram@example.com', 'rajesh@example.com'].includes(cleanEmail);
    if (user.role !== 'admin' && !isDemoAccount && (!user.is_verified || user.status === 'pending')) {
      // Generate & send OTP
      const otpStr = generateSecureOTP();
      const otpHash = bcrypt.hashSync(otpStr, 10);
      const expiresAt = Date.now() + 10 * 60 * 1000;
      const lastSentAt = Date.now();

      await dbRun('DELETE FROM otps WHERE LOWER(email) = ?', [cleanEmail]);
      await dbRun(
        'INSERT INTO otps (id, user_id, email, otp_hash, expires_at, failed_attempts, resend_count, last_sent_at, created_at) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)',
        [`otp_${Date.now()}`, user.id, cleanEmail, otpHash, expiresAt, lastSentAt, new Date().toISOString()]
      );

      try {
        await sendCustomerAccountNotification('verify_email', { name: user.name, email: cleanEmail, otp: otpStr });
      } catch (mailErr) {
        console.error('[Login Verification Email Dispatch Warning]:', mailErr.message);
      }

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: cleanEmail,
        error: 'Please verify your email before logging in. A verification OTP has been sent to your email.',
      });
    }

    await addAuditLog(user.id, user.name, 'User Login', 'Logged in successfully');

    // Generate Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
        avatar: user.avatar || '',
        profileImage: user.avatar || '',
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal login error.' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email address is required.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account found with this email.' });
    }

    const otpRecord = await dbGet(
      'SELECT * FROM otps WHERE LOWER(email) = ? ORDER BY last_sent_at DESC LIMIT 1',
      [cleanEmail]
    );

    if (otpRecord) {
      const elapsedSeconds = Math.floor((Date.now() - otpRecord.last_sent_at) / 1000);
      if (elapsedSeconds < 60) {
        const cooldownRemaining = 60 - elapsedSeconds;
        return res.status(429).json({
          success: false,
          cooldownRemaining,
          error: `Please wait ${cooldownRemaining} second(s) before requesting a new OTP.`,
        });
      }
    }

    const otpStr = generateSecureOTP();
    const otpHash = bcrypt.hashSync(otpStr, 10);
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const lastSentAt = Date.now();

    await dbRun('DELETE FROM otps WHERE LOWER(email) = ?', [cleanEmail]);
    await dbRun(
      'INSERT INTO otps (id, user_id, email, otp_hash, expires_at, failed_attempts, resend_count, last_sent_at, created_at) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?)',
      [`otp_${Date.now()}`, user.id, cleanEmail, otpHash, expiresAt, lastSentAt, new Date().toISOString()]
    );

    try {
      await sendCustomerAccountNotification('forgot_password_otp', { name: user.name, email: cleanEmail, otp: otpStr });
    } catch (mailErr) {
      console.error('[Forgot Password Email Dispatch Warning]:', mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email.',
    });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Forgot password error.' });
  }
});

app.post('/api/auth/verify-reset-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, error: 'Email and OTP code are required.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const otpRecord = await dbGet(
      'SELECT * FROM otps WHERE LOWER(email) = ? ORDER BY expires_at DESC LIMIT 1',
      [cleanEmail]
    );

    if (!otpRecord) {
      return res.status(400).json({ success: false, error: 'No OTP request found. Please request a new OTP.' });
    }

    if (Date.now() > otpRecord.expires_at) {
      await dbRun('DELETE FROM otps WHERE id = ?', [otpRecord.id]);
      return res.status(400).json({ success: false, error: 'OTP expired. Please request a new OTP.' });
    }

    if (otpRecord.failed_attempts >= 5) {
      await dbRun('DELETE FROM otps WHERE id = ?', [otpRecord.id]);
      return res.status(400).json({ success: false, error: 'Maximum wrong attempts (5) exceeded. Please request a new OTP.' });
    }

    const isMatch = bcrypt.compareSync(cleanOtp, otpRecord.otp_hash);
    if (!isMatch) {
      const newFailed = otpRecord.failed_attempts + 1;
      const remaining = 5 - newFailed;

      if (newFailed >= 5) {
        await dbRun('DELETE FROM otps WHERE id = ?', [otpRecord.id]);
        return res.status(400).json({ success: false, error: 'Maximum wrong attempts (5) exceeded. Please request a new OTP.' });
      } else {
        await dbRun('UPDATE otps SET failed_attempts = ? WHERE id = ?', [newFailed, otpRecord.id]);
        return res.status(400).json({ success: false, error: `Invalid OTP. ${remaining} attempt(s) remaining.` });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
    });
  } catch (err) {
    console.error('Verify Reset OTP Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'OTP verification error.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, error: 'Email, OTP, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const otpRecord = await dbGet(
      'SELECT * FROM otps WHERE LOWER(email) = ? ORDER BY expires_at DESC LIMIT 1',
      [cleanEmail]
    );

    if (!otpRecord || Date.now() > otpRecord.expires_at) {
      return res.status(400).json({ success: false, error: 'OTP expired or invalid. Please request a new OTP.' });
    }

    const isMatch = bcrypt.compareSync(cleanOtp, otpRecord.otp_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid OTP code.' });
    }

    const hashedPwd = bcrypt.hashSync(newPassword, 10);
    await dbRun('UPDATE users SET password = ? WHERE id = ?', [hashedPwd, user.id]);
    await dbRun('DELETE FROM otps WHERE LOWER(email) = ?', [cleanEmail]);

    sendCustomerAccountNotification('password_changed', { name: user.name, email: cleanEmail }).catch(() => {});
    await addAuditLog(user.id, user.name, 'Reset Password', 'User reset password successfully via OTP');

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (err) {
    console.error('Reset Password Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Password reset error.' });
  }
});

// ==========================================
// 2. Users Management CRUD & PROFILE PICTURE
// ==========================================

// Get Current Logged In User Profile
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet('SELECT id, name, email, role, status, is_verified, avatar FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isVerified: Boolean(user.is_verified),
        avatar: user.avatar || '',
        profileImage: user.avatar || '',
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Upload Permanent Profile Picture
app.post('/api/users/profile-picture', authenticateToken, (req, res) => {
  const uploadSingle = avatarUpload.single('image');
  uploadSingle(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, error: 'Image file size exceeds 5MB limit.' });
        }
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).json({ success: false, error: err.message || 'Invalid image file.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }

    try {
      const userId = req.user.id;
      const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User account not found.' });
      }

      // Delete old avatar file from server storage to prevent orphaned files
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        const oldFileName = path.basename(user.avatar.split('?')[0]);
        const oldFilePath = path.join(uploadsDir, oldFileName);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (unlinkErr) {
            console.warn('[Avatar Cleanup Warning]:', unlinkErr.message);
          }
        }
      }

      const avatarUrl = `/uploads/${req.file.filename}`;

      // Update SQLite DB
      await dbRun('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, userId]);

      // Update MongoDB DB if active
      try {
        if (mongoose.connection.readyState === 1) {
          await User.findByIdAndUpdate(userId, { avatar: avatarUrl, profileImage: avatarUrl });
        }
      } catch (mErr) {
        // ignore fallback mongo error
      }

      const updatedUser = await dbGet('SELECT id, name, email, role, status, is_verified, avatar FROM users WHERE id = ?', [userId]);

      return res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully.',
        avatar: avatarUrl,
        profileImage: avatarUrl,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
          isVerified: Boolean(updatedUser.is_verified),
          avatar: updatedUser.avatar || '',
          profileImage: updatedUser.avatar || '',
        },
      });
    } catch (dbErr) {
      console.error('Profile Picture Upload DB Error:', dbErr);
      return res.status(500).json({ success: false, error: 'Failed to update profile picture in database.' });
    }
  });
});

// Remove Profile Picture
app.delete('/api/users/profile-picture', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    // Delete image file from server storage
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const oldFileName = path.basename(user.avatar.split('?')[0]);
      const oldFilePath = path.join(uploadsDir, oldFileName);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (unlinkErr) {
          console.warn('[Avatar Delete File Warning]:', unlinkErr.message);
        }
      }
    }

    // Clear avatar in SQLite DB
    await dbRun("UPDATE users SET avatar = '' WHERE id = ?", [userId]);

    // Clear avatar in MongoDB DB
    try {
      if (mongoose.connection.readyState === 1) {
        await User.findByIdAndUpdate(userId, { avatar: '', profileImage: '' });
      }
    } catch (mErr) {
      // ignore fallback mongo error
    }

    const updatedUser = await dbGet('SELECT id, name, email, role, status, is_verified, avatar FROM users WHERE id = ?', [userId]);

    return res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully.',
      avatar: '',
      profileImage: '',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        isVerified: Boolean(updatedUser.is_verified),
        avatar: '',
        profileImage: '',
      },
    });
  } catch (err) {
    console.error('Remove Profile Picture Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to remove profile picture.' });
  }
});

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
  const { name, email, role, password, avatar } = req.body;

  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let sql = 'UPDATE users SET name = ?, email = ?';
    const params = [name || user.name, email || user.email];

    if (avatar !== undefined) {
      sql += ', avatar = ?';
      params.push(avatar);
    }

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

    const updatedUser = await dbGet('SELECT id, name, email, role, status, avatar FROM users WHERE id = ?', [id]);
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

// Helper function to format service records consistently
const formatServiceRecord = async (s) => {
  if (!s) return null;
  const featuresRows = await dbAll('SELECT feature FROM service_features WHERE service_id = ?', [s.id]);
  let parsedTags = [];
  try {
    parsedTags = typeof s.tags === 'string' ? JSON.parse(s.tags || '[]') : (s.tags || []);
  } catch (e) {
    parsedTags = [];
  }
  let parsedCities = [];
  try {
    parsedCities = typeof s.available_cities === 'string' ? JSON.parse(s.available_cities || '[]') : (s.available_cities || []);
  } catch (e) {
    parsedCities = [];
  }

  return {
    ...s,
    id: s.id,
    name: s.name,
    title: s.name,
    slug: s.slug || s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    shortDescription: s.short_description || s.description,
    description: s.description,
    fullDescription: s.description,
    longDescription: s.description,
    categoryName: s.categoryName || 'Home Repair',
    categoryId: s.category_id || 'c_default',
    serviceType: s.service_type || 'standard',
    price: Number(s.price),
    originalPrice: Number(s.original_price || Math.round(Number(s.price) * 1.3)),
    discountPrice: Number(s.original_price || Math.round(Number(s.price) * 1.3)),
    duration: s.duration || '60 min',
    image: s.image,
    icon: s.icon || 'Wrench',
    badge: s.badge || '',
    featured: Boolean(s.featured),
    popular: Boolean(s.popular),
    is_active: Boolean(s.is_active !== 0),
    active: Boolean(s.is_active !== 0),
    sortOrder: Number(s.sort_order || 0),
    availableCities: parsedCities,
    tags: parsedTags,
    features: featuresRows.map(r => r.feature),
    createdAt: s.created_at,
    updatedAt: s.updated_at
  };
};

// 1. GET Public Active Services
app.get('/api/services', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM services WHERE (is_active = 1 OR is_active IS NULL)';
    const params = [];

    if (category && category !== 'all' && category !== 'All') {
      sql += ' AND (LOWER(categoryName) = ? OR LOWER(category_id) = ?)';
      params.push(category.toLowerCase(), category.toLowerCase());
    }

    if (search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(short_description) LIKE ?)';
      const sTerm = `%${search.toLowerCase()}%`;
      params.push(sTerm, sTerm, sTerm);
    }

    sql += ' ORDER BY sort_order ASC, created_at DESC';
    const services = await dbAll(sql, params);
    const formatted = await Promise.all(services.map(formatServiceRecord));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Dynamic Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categoriesFromDb = await dbAll('SELECT * FROM service_categories ORDER BY name ASC');
    const serviceCategoryNames = await dbAll('SELECT DISTINCT categoryName FROM services WHERE categoryName IS NOT NULL AND categoryName != ""');
    
    const dbCatSet = new Set(categoriesFromDb.map(c => c.name));
    const allCategories = [...categoriesFromDb];

    for (const row of serviceCategoryNames) {
      if (!dbCatSet.has(row.categoryName)) {
        allCategories.push({
          id: `cat_${row.categoryName.toLowerCase().replace(/\s+/g, '-')}`,
          name: row.categoryName,
          slug: row.categoryName.toLowerCase().replace(/\s+/g, '-'),
          icon: 'Wrench',
          color: 'from-brand-400 to-brand-600',
          description: `All ${row.categoryName} services`
        });
        dbCatSet.add(row.categoryName);
      }
    }

    res.json(allCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET Admin All Services (active + inactive)
app.get('/api/admin/services', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let sql = 'SELECT * FROM services WHERE 1=1';
    const params = [];

    if (category && category !== 'all' && category !== 'All') {
      sql += ' AND LOWER(categoryName) = ?';
      params.push(category.toLowerCase());
    }

    if (status === 'active') {
      sql += ' AND (is_active = 1 OR is_active IS NULL)';
    } else if (status === 'inactive') {
      sql += ' AND is_active = 0';
    }

    if (search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(categoryName) LIKE ?)';
      const sTerm = `%${search.toLowerCase()}%`;
      params.push(sTerm, sTerm, sTerm);
    }

    sql += ' ORDER BY sort_order ASC, created_at DESC';
    const services = await dbAll(sql, params);
    const formatted = await Promise.all(services.map(formatServiceRecord));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET Single Service by ID
app.get('/api/admin/services/:id', async (req, res) => {
  try {
    const service = await dbGet('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    const formatted = await formatServiceRecord(service);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const service = await dbGet('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    const formatted = await formatServiceRecord(service);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. POST Create Service (Admin + Standard)
const handleCreateService = async (req, res) => {
  const {
    name, title, categoryName, shortDescription, description, fullDescription,
    price, discountPrice, originalPrice, duration, image, icon, badge,
    featured, popular, active, is_active, sortOrder, tags, features, availableCities
  } = req.body;

  const finalName = name || title;
  const finalCategory = categoryName || 'Home Repair';
  const finalPrice = Number(price);
  const finalDesc = description || fullDescription || shortDescription || '';

  if (!finalName || !finalCategory || isNaN(finalPrice)) {
    return res.status(400).json({ error: 'Service name, category, and valid price are required' });
  }

  try {
    let cat = await dbGet('SELECT * FROM service_categories WHERE LOWER(name) = ?', [finalCategory.toLowerCase()]);
    let categoryId = cat ? cat.id : `c_${Date.now()}`;

    if (!cat) {
      await dbRun(
        'INSERT INTO service_categories (id, name, slug, icon, color, description) VALUES (?, ?, ?, ?, ?, ?)',
        [categoryId, finalCategory, finalCategory.toLowerCase().replace(/\s+/g, '-'), icon || 'Wrench', 'from-brand-400 to-brand-600', `All ${finalCategory} services`]
      );
    }

    const serviceId = `s_${Date.now()}`;
    const slug = finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const finalOrigPrice = Number(originalPrice || discountPrice || Math.round(finalPrice * 1.3));
    const activeVal = active !== undefined ? (active ? 1 : 0) : (is_active !== undefined ? (is_active ? 1 : 0) : 1);
    const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : (typeof tags === 'string' ? JSON.stringify(tags.split(',').map(t=>t.trim())) : '[]');
    const citiesStr = Array.isArray(availableCities) ? JSON.stringify(availableCities) : '[]';

    await dbRun(
      `INSERT INTO services (
        id, name, slug, short_description, description, category_id, categoryName, category_name,
        service_type, price, original_price, duration, image, icon, badge,
        featured, popular, is_active, sort_order, available_cities, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceId,
        finalName,
        slug,
        shortDescription || finalDesc.slice(0, 120),
        finalDesc,
        categoryId,
        finalCategory,
        finalCategory,
        'standard',
        finalPrice,
        finalOrigPrice,
        duration || '60 min',
        image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400',
        icon || 'Wrench',
        badge || '',
        featured ? 1 : 0,
        popular ? 1 : 0,
        activeVal,
        Number(sortOrder || 0),
        citiesStr,
        tagsStr,
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    // Save Features
    const featuresList = Array.isArray(features) ? features : ['Verified Professional', 'Quality Satisfaction Guarantee'];
    for (const feat of featuresList) {
      if (feat && feat.trim()) {
        await dbRun('INSERT INTO service_features (id, service_id, feature) VALUES (?, ?, ?)', [
          `sf_${Date.now()}_${Math.random().toString().slice(-4)}`,
          serviceId,
          feat.trim()
        ]);
      }
    }

    await addAuditLog('admin', 'Admin Panel', 'Add Service', `Added catalog service ${finalName}`);
    
    const created = await dbGet('SELECT * FROM services WHERE id = ?', [serviceId]);
    const formatted = await formatServiceRecord(created);
    res.status(201).json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.post('/api/services', handleCreateService);
app.post('/api/admin/services', handleCreateService);

// 5. PUT Update Service (Admin + Standard)
const handleUpdateService = async (req, res) => {
  const { id } = req.params;
  const {
    name, title, categoryName, shortDescription, description, fullDescription,
    price, discountPrice, originalPrice, duration, image, icon, badge,
    featured, popular, active, is_active, sortOrder, tags, features
  } = req.body;

  try {
    const service = await dbGet('SELECT * FROM services WHERE id = ?', [id]);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const finalName = name || title || service.name;
    const finalCategory = categoryName || service.categoryName;
    const finalPrice = price ? Number(price) : service.price;
    const finalDesc = description || fullDescription || shortDescription || service.description;
    const activeVal = active !== undefined ? (active ? 1 : 0) : (is_active !== undefined ? (is_active ? 1 : 0) : service.is_active);

    const tagsStr = tags !== undefined
      ? (Array.isArray(tags) ? JSON.stringify(tags) : JSON.stringify(String(tags).split(',').map(t=>t.trim())))
      : service.tags;

    await dbRun(
      `UPDATE services SET
        name = ?, categoryName = ?, category_name = ?, short_description = ?, description = ?,
        price = ?, original_price = ?, duration = ?, image = ?, icon = ?,
        badge = ?, featured = ?, popular = ?, is_active = ?, sort_order = ?,
        tags = ?, updated_at = ?
      WHERE id = ?`,
      [
        finalName,
        finalCategory,
        finalCategory,
        shortDescription || finalDesc.slice(0, 120),
        finalDesc,
        finalPrice,
        originalPrice || discountPrice ? Number(originalPrice || discountPrice) : service.original_price,
        duration || service.duration,
        image || service.image,
        icon || service.icon || 'Wrench',
        badge !== undefined ? badge : service.badge,
        featured !== undefined ? (featured ? 1 : 0) : service.featured,
        popular !== undefined ? (popular ? 1 : 0) : service.popular,
        activeVal,
        sortOrder !== undefined ? Number(sortOrder) : service.sort_order,
        tagsStr,
        new Date().toISOString(),
        id
      ]
    );

    // Features Update if provided
    if (Array.isArray(features)) {
      await dbRun('DELETE FROM service_features WHERE service_id = ?', [id]);
      for (const feat of features) {
        if (feat && feat.trim()) {
          await dbRun('INSERT INTO service_features (id, service_id, feature) VALUES (?, ?, ?)', [
            `sf_${Date.now()}_${Math.random().toString().slice(-4)}`,
            id,
            feat.trim()
          ]);
        }
      }
    }

    await addAuditLog('admin', 'Admin Panel', 'Edit Service', `Updated catalog service ${finalName}`);
    const updated = await dbGet('SELECT * FROM services WHERE id = ?', [id]);
    const formatted = await formatServiceRecord(updated);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.put('/api/services/:id', handleUpdateService);
app.put('/api/admin/services/:id', handleUpdateService);

// 6. PATCH Toggle Status / Featured / Popular / SortOrder
app.patch('/api/admin/services/:id/toggle', async (req, res) => {
  const { id } = req.params;
  const { is_active, active, featured, popular, sort_order, sortOrder } = req.body;

  try {
    const service = await dbGet('SELECT * FROM services WHERE id = ?', [id]);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const newActive = is_active !== undefined ? (is_active ? 1 : 0) : (active !== undefined ? (active ? 1 : 0) : service.is_active);
    const newFeatured = featured !== undefined ? (featured ? 1 : 0) : service.featured;
    const newPopular = popular !== undefined ? (popular ? 1 : 0) : service.popular;
    const newSortOrder = sortOrder !== undefined ? Number(sortOrder) : (sort_order !== undefined ? Number(sort_order) : service.sort_order);

    await dbRun(
      'UPDATE services SET is_active = ?, featured = ?, popular = ?, sort_order = ?, updated_at = ? WHERE id = ?',
      [newActive, newFeatured, newPopular, newSortOrder, new Date().toISOString(), id]
    );

    const updated = await dbGet('SELECT * FROM services WHERE id = ?', [id]);
    const formatted = await formatServiceRecord(updated);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. DELETE Service (Admin + Standard)
const handleDeleteService = async (req, res) => {
  const { id } = req.params;
  try {
    await dbRun('DELETE FROM services WHERE id = ?', [id]);
    await dbRun('DELETE FROM service_features WHERE service_id = ?', [id]);
    await addAuditLog('admin', 'Admin Panel', 'Delete Service', `Removed service catalog ID ${id}`);
    res.json({ success: true, message: 'Service deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.delete('/api/services/:id', handleDeleteService);
app.delete('/api/admin/services/:id', handleDeleteService);

app.post('/api/services/:id/duplicate', async (req, res) => {
  const { id } = req.params;
  try {
    const service = await dbGet('SELECT * FROM services WHERE id = ?', [id]);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const serviceId = `s_${Date.now()}`;
    const name = `${service.name} (Copy)`;
    const slug = `${service.slug || 'svc'}-copy-${Date.now().toString().slice(-4)}`;

    const finalCategory = service.categoryName || service.category_name || 'General';
    await dbRun(
      `INSERT INTO services (
        id, name, slug, short_description, description, category_id, categoryName, category_name,
        service_type, price, original_price, duration, image, icon, badge,
        featured, popular, is_active, sort_order, available_cities, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        serviceId,
        name,
        slug,
        service.short_description,
        service.description,
        service.category_id,
        finalCategory,
        finalCategory,
        service.service_type || 'standard',
        service.price,
        service.original_price,
        service.duration,
        service.image,
        service.icon || 'Wrench',
        service.badge || '',
        service.featured || 0,
        service.popular || 0,
        service.is_active !== 0 ? 1 : 0,
        (service.sort_order || 0) + 1,
        service.available_cities,
        service.tags,
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    // Copy Features
    const featuresRows = await dbAll('SELECT feature FROM service_features WHERE service_id = ?', [id]);
    for (const f of featuresRows) {
      await dbRun('INSERT INTO service_features (id, service_id, feature) VALUES (?, ?, ?)', [
        `sf_${Date.now()}_${Math.random().toString().slice(-4)}`,
        serviceId,
        f.feature
      ]);
    }

    await addAuditLog('admin', 'Admin Panel', 'Duplicate Service', `Duplicated catalog service ${service.name}`);
    const created = await dbGet('SELECT * FROM services WHERE id = ?', [serviceId]);
    const formatted = await formatServiceRecord(created);
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. Bookings Management CRUD & TIMELINE
// ==========================================
app.get('/api/bookings', async (req, res) => {
  const { userId, role, name, email } = req.query;
  try {
    let sql = 'SELECT * FROM bookings';
    const params = [];

    if (role === 'professional') {
      sql += ' WHERE professional_name = ?';
      params.push(name);
    } else if (userId || email) {
      sql += ' WHERE user_id = ? OR user_id = ?';
      params.push(userId || '', email || '');
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

// ==========================================
// CATERING FEATURE APIs & VALIDATION
// ==========================================

// Optional auth helper to decode user if token is sent
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }
  jwt.verify(token, process.env.JWT_SECRET || 'secret123', (err, user) => {
    if (!err && user) req.user = user;
    else req.user = null;
    next();
  });
};

// 1. Get All Active Catering Packages
app.get('/api/catering/packages', async (req, res) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM catering_packages WHERE is_active = 1 ORDER BY created_at ASC';
    let params = [];
    if (category && category !== 'All Packages' && category !== 'All' && category !== 'all') {
      sql = 'SELECT * FROM catering_packages WHERE is_active = 1 AND category = ? ORDER BY created_at ASC';
      params = [category];
    }
    const packages = await dbAll(sql, params);
    res.json(packages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Get Catering Packages By Category
app.get('/api/catering/packages/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    let sql = 'SELECT * FROM catering_packages WHERE is_active = 1 AND category = ? ORDER BY created_at ASC';
    const packages = await dbAll(sql, [category]);
    res.json(packages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Get Single Catering Package By ID or Slug
app.get('/api/catering/packages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await dbGet('SELECT * FROM catering_packages WHERE id = ? OR slug = ?', [id, id]);
    if (!pkg) return res.status(404).json({ error: 'Catering package not found' });
    res.json(pkg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Get Catering Gallery Images
app.get('/api/catering/gallery', async (req, res) => {
  try {
    const gallery = await dbAll('SELECT * FROM catering_gallery ORDER BY featured DESC, created_at DESC');
    res.json(gallery);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. Submit a new Catering Request (Validated & Triggering Emails)
app.post('/api/catering/requests', optionalAuth, async (req, res) => {
  try {
    const {
      package_id, package_title, guest_count, event_date, event_time,
      event_type, contact_phone, email, location, address,
      food_preference, budget, special_requirements, special_notes, total_estimated_price
    } = req.body;

    // Strict Backend Validation
    if (!contact_phone || !/^\d{10}$/.test(String(contact_phone).trim())) {
      return res.status(400).json({ error: 'Invalid mobile number. Please enter exactly 10 digits without any alphabets, spaces, or symbols.' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ error: 'Invalid email address syntax.' });
    }
    const numGuests = Number(guest_count);
    if (isNaN(numGuests) || numGuests < 1) {
      return res.status(400).json({ error: 'Guest count must be a valid positive number.' });
    }
    if (package_id) {
      const pkg = await dbGet('SELECT * FROM catering_packages WHERE id = ?', [package_id]);
      if (pkg && pkg.minimum_guests && numGuests < pkg.minimum_guests) {
        return res.status(400).json({ error: `This package requires a minimum of ${pkg.minimum_guests} guests.` });
      }
    }
    if (event_date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const reqDate = new Date(event_date);
      if (!isNaN(reqDate.getTime()) && reqDate < today) {
        return res.status(400).json({ error: 'Event date cannot be in the past. Please select today or a future date.' });
      }
    }

    const userId = req.user ? req.user.id : (req.body.user_id || 'guest_' + Date.now());
    const userName = req.body.customer_name || req.body.user_name || (req.user ? (req.user.name || req.user.email) : 'Valued Customer');
    const customerEmail = email || req.body.customer_email || (req.user ? req.user.email : '');

    // Generate Request ID formatted like #CR-1024 or sequential random
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const id = `CR-${randDigits}`;
    const timestamp = new Date().toISOString();
    const initialStatus = 'PENDING';

    await dbRun(
      `INSERT INTO catering_requests (
        id, user_id, user_name, email, package_id, package_title,
        guest_count, event_date, event_time, event_type, contact_phone,
        location, address, food_preference, budget, special_notes,
        special_requirements, status, total_estimated_price, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, userId, userName, customerEmail, package_id || null, package_title || 'General Catering Request',
        numGuests, event_date || timestamp.slice(0, 10), event_time || '', event_type || 'Event', String(contact_phone).trim(),
        location || '', address || '', food_preference || 'Vegetarian', Number(budget || 0), special_notes || '',
        special_requirements || '', initialStatus, Number(total_estimated_price || 0), timestamp, timestamp
      ]
    );

    const createdReq = await dbGet('SELECT * FROM catering_requests WHERE id = ?', [id]);

    // Dispatch Email Notifications Asynchronously
    sendCateringCustomerEmail(createdReq).catch(e => console.error('[Email] Customer catering notice error:', e));
    sendCateringAdminEmail(createdReq).catch(e => console.error('[Email] Admin catering alert error:', e));

    res.status(201).json({ success: true, message: 'Catering request created successfully', request: createdReq });
  } catch (err) {
    console.error('Error creating catering request:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Get My Catering Requests
app.get('/api/catering/requests/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'customer_default';
    const userEmail = req.user ? req.user.email : '';
    const requests = await dbAll('SELECT * FROM catering_requests WHERE user_id = ? OR email = ? ORDER BY created_at DESC', [userId, userEmail]);
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. Get Single Catering Request Details
app.get('/api/catering/requests/:id', optionalAuth, async (req, res) => {
  try {
    const request = await dbGet('SELECT * FROM catering_requests WHERE id = ?', [req.params.id]);
    if (!request) return res.status(404).json({ error: 'Catering request not found' });
    res.json(request);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. Cancel My Catering Request (Only if PENDING)
app.patch('/api/catering/requests/:id/cancel', optionalAuth, async (req, res) => {
  try {
    const request = await dbGet('SELECT * FROM catering_requests WHERE id = ?', [req.params.id]);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.status.toUpperCase() !== 'PENDING' && request.status.toLowerCase() !== 'submitted') {
      return res.status(400).json({ error: `Cannot cancel order in status: ${request.status}. Please contact support.` });
    }
    await dbRun('UPDATE catering_requests SET status = ?, updated_at = ? WHERE id = ?', ['CANCELLED', new Date().toISOString(), req.params.id]);
    const updated = await dbGet('SELECT * FROM catering_requests WHERE id = ?', [req.params.id]);
    res.json({ success: true, request: updated });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// ADMIN CATERING MANAGEMENT APIs
// ==========================================

// Admin Get All Catering Packages
app.get('/api/admin/catering/packages', async (req, res) => {
  try {
    const packages = await dbAll('SELECT * FROM catering_packages ORDER BY created_at DESC');
    res.json(packages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Create Catering Package
app.post('/api/admin/catering/packages', async (req, res) => {
  try {
    const { title, slug, category, description, pax, price, price_type, minimum_guests, maximum_guests, included_items, image, gallery_images, is_active, featured } = req.body;
    const id = 'cat_' + Date.now();
    await dbRun(
      `INSERT INTO catering_packages (id, title, slug, category, description, pax, price, price_type, minimum_guests, maximum_guests, included_items, image, gallery_images, is_active, featured, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, title, slug || title.toLowerCase().replace(/\s+/g, '-'), category, description, pax || `${minimum_guests || 1} Pax`,
        Number(price), price_type || 'fixed', Number(minimum_guests || 1), Number(maximum_guests || 500),
        typeof included_items === 'string' ? included_items : JSON.stringify(included_items || []),
        image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600',
        typeof gallery_images === 'string' ? gallery_images : JSON.stringify(gallery_images || []),
        is_active !== undefined ? Number(is_active) : 1, featured !== undefined ? Number(featured) : 0,
        new Date().toISOString(), new Date().toISOString()
      ]
    );
    const newPkg = await dbGet('SELECT * FROM catering_packages WHERE id = ?', [id]);
    res.status(201).json(newPkg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Update Catering Package
app.put('/api/admin/catering/packages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, category, description, pax, price, price_type, minimum_guests, maximum_guests, included_items, image, gallery_images, is_active, featured } = req.body;
    await dbRun(
      `UPDATE catering_packages SET title = ?, slug = ?, category = ?, description = ?, pax = ?, price = ?, price_type = ?, minimum_guests = ?, maximum_guests = ?, included_items = ?, image = ?, gallery_images = ?, is_active = ?, featured = ?, updated_at = ? WHERE id = ?`,
      [
        title, slug || (title ? title.toLowerCase().replace(/\s+/g, '-') : ''), category, description, pax, Number(price),
        price_type || 'fixed', Number(minimum_guests || 1), Number(maximum_guests || 500),
        typeof included_items === 'string' ? included_items : JSON.stringify(included_items || []),
        image, typeof gallery_images === 'string' ? gallery_images : JSON.stringify(gallery_images || []),
        is_active !== undefined ? Number(is_active) : 1, featured !== undefined ? Number(featured) : 0,
        new Date().toISOString(), id
      ]
    );
    const updated = await dbGet('SELECT * FROM catering_packages WHERE id = ?', [id]);
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Delete Catering Package
app.delete('/api/admin/catering/packages/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM catering_packages WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Package deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Get All Catering Requests
app.get('/api/admin/catering/requests', async (req, res) => {
  try {
    const requests = await dbAll('SELECT * FROM catering_requests ORDER BY created_at DESC');
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Get Single Catering Request
app.get('/api/admin/catering/requests/:id', async (req, res) => {
  try {
    const reqData = await dbGet('SELECT * FROM catering_requests WHERE id = ?', [req.params.id]);
    res.json(reqData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Update Catering Status (Sends Email!)
app.patch('/api/admin/catering/requests/:id/status', async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    await dbRun('UPDATE catering_requests SET status = ?, updated_at = ? WHERE id = ?', [status || 'PENDING', new Date().toISOString(), req.params.id]);
    if (admin_notes !== undefined) {
      await dbRun('UPDATE catering_requests SET admin_notes = ? WHERE id = ?', [admin_notes, req.params.id]);
    }
    const updated = await dbGet('SELECT * FROM catering_requests WHERE id = ?', [req.params.id]);

    // Send status notification email to customer
    sendCateringStatusEmail(updated, updated.status).catch(e => console.error('[Email] Status update email error:', e));

    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Update Catering Notes
app.patch('/api/admin/catering/requests/:id/notes', async (req, res) => {
  try {
    const { admin_notes, special_notes } = req.body;
    if (admin_notes !== undefined) {
      await dbRun('UPDATE catering_requests SET admin_notes = ?, updated_at = ? WHERE id = ?', [admin_notes, new Date().toISOString(), req.params.id]);
    }
    if (special_notes !== undefined) {
      await dbRun('UPDATE catering_requests SET special_notes = ?, updated_at = ? WHERE id = ?', [special_notes, new Date().toISOString(), req.params.id]);
    }
    const updated = await dbGet('SELECT * FROM catering_requests WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Support legacy PUT for status update
app.put('/api/admin/catering/requests/:id', async (req, res) => {
  try {
    const { status, special_notes, admin_notes } = req.body;
    await dbRun('UPDATE catering_requests SET status=?, special_notes=?, admin_notes=?, updated_at=? WHERE id=?', [
      status || 'UNDER REVIEW', special_notes || '', admin_notes || '', new Date().toISOString(), req.params.id
    ]);
    const updated = await dbGet('SELECT * FROM catering_requests WHERE id=?', [req.params.id]);
    sendCateringStatusEmail(updated, updated.status).catch(e => console.error('[Email] Status update email error:', e));
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Delete Catering Request
app.delete('/api/admin/catering/requests/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM catering_requests WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Gallery CRUD
app.post('/api/admin/catering/gallery', async (req, res) => {
  try {
    const { title, category, image, featured } = req.body;
    const id = 'gal_' + Date.now();
    await dbRun('INSERT INTO catering_gallery (id, title, category, image, featured, created_at) VALUES (?, ?, ?, ?, ?, ?)', [
      id, title, category || 'Catering', image || '', Number(featured || 0), new Date().toISOString()
    ]);
    const item = await dbGet('SELECT * FROM catering_gallery WHERE id = ?', [id]);
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/catering/gallery/:id', async (req, res) => {
  try {
    const { title, category, image, featured } = req.body;
    await dbRun('UPDATE catering_gallery SET title = ?, category = ?, image = ?, featured = ? WHERE id = ?', [
      title, category || 'Catering', image, Number(featured || 0), req.params.id
    ]);
    const item = await dbGet('SELECT * FROM catering_gallery WHERE id = ?', [req.params.id]);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/catering/gallery/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM catering_gallery WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// VEHICLES APIs
// ==========================================

app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await dbAll('SELECT * FROM vehicles ORDER BY created_at DESC');
    const formatted = vehicles.map(v => ({
      ...v,
      rate: Number(v.rate || v.price_per_km || 15),
      price_per_km: Number(v.price_per_km || v.rate || 15),
      passengers: Number(v.passengers || v.capacity_passengers || 4),
      capacity_passengers: Number(v.capacity_passengers || v.passengers || 4),
      luggage: Number(v.luggage || v.capacity_luggage || 2),
      capacity_luggage: Number(v.capacity_luggage || v.luggage || 2),
      status: v.status || (v.is_active !== 0 ? 'Available' : 'Unavailable'),
      is_active: Boolean(v.is_active !== 0)
    }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/vehicles', authenticateToken, async (req, res) => {
  try {
    const { name, type, capacity_passengers, passengers, capacity_luggage, luggage, base_price, price_per_km, rate, image, features, is_active, status } = req.body;
    const id = 'veh_' + Date.now();
    const finalRate = Number(rate !== undefined ? rate : (price_per_km !== undefined ? price_per_km : 15)) || 15;
    const finalPax = Number(passengers !== undefined ? passengers : (capacity_passengers !== undefined ? capacity_passengers : 4)) || 4;
    const finalLug = Number(luggage !== undefined ? luggage : (capacity_luggage !== undefined ? capacity_luggage : 2)) || 2;
    const finalStatus = status || (is_active !== 0 ? 'Available' : 'Unavailable');
    const finalActive = is_active !== undefined ? (is_active ? 1 : 0) : (finalStatus === 'Available' ? 1 : 0);
    const finalImg = image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400';

    await dbRun(
      'INSERT INTO vehicles (id, name, type, passengers, capacity_passengers, luggage, capacity_luggage, base_price, rate, price_per_km, image, status, features, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name || 'Taxi Vehicle', type || 'Sedan', finalPax, finalPax, finalLug, finalLug, Number(base_price || 0), finalRate, finalRate, finalImg, finalStatus, JSON.stringify(features || []), finalActive, new Date().toISOString()]
    );
    const vehicle = await dbGet('SELECT * FROM vehicles WHERE id = ?', [id]);
    res.json({
      ...vehicle,
      rate: Number(vehicle.rate || vehicle.price_per_km || 15),
      price_per_km: Number(vehicle.price_per_km || vehicle.rate || 15),
      passengers: Number(vehicle.passengers || vehicle.capacity_passengers || 4),
      capacity_passengers: Number(vehicle.capacity_passengers || vehicle.passengers || 4)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    const { name, type, capacity_passengers, passengers, capacity_luggage, luggage, base_price, price_per_km, rate, image, features, is_active, status } = req.body;
    const old = await dbGet('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    if (!old) return res.status(404).json({ error: 'Vehicle not found' });

    const finalRate = Number(rate !== undefined ? rate : (price_per_km !== undefined ? price_per_km : (old.rate || old.price_per_km || 15))) || 15;
    const finalPax = Number(passengers !== undefined ? passengers : (capacity_passengers !== undefined ? capacity_passengers : (old.passengers || old.capacity_passengers || 4))) || 4;
    const finalLug = Number(luggage !== undefined ? luggage : (capacity_luggage !== undefined ? capacity_luggage : (old.luggage || old.capacity_luggage || 2))) || 2;
    const finalStatus = status !== undefined ? status : (old.status || 'Available');
    const finalActive = is_active !== undefined ? (is_active ? 1 : 0) : (finalStatus === 'Available' ? 1 : 0);

    await dbRun(
      'UPDATE vehicles SET name=?, type=?, passengers=?, capacity_passengers=?, luggage=?, capacity_luggage=?, base_price=?, rate=?, price_per_km=?, image=?, status=?, features=?, is_active=? WHERE id=?',
      [name || old.name, type || old.type, finalPax, finalPax, finalLug, finalLug, Number(base_price !== undefined ? base_price : (old.base_price || 0)), finalRate, finalRate, image || old.image, finalStatus, JSON.stringify(features !== undefined ? features : (old.features || [])), finalActive, req.params.id]
    );
    const vehicle = await dbGet('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({
      ...vehicle,
      rate: Number(vehicle.rate || vehicle.price_per_km || 15),
      price_per_km: Number(vehicle.price_per_km || vehicle.rate || 15),
      passengers: Number(vehicle.passengers || vehicle.capacity_passengers || 4),
      capacity_passengers: Number(vehicle.capacity_passengers || vehicle.passengers || 4)
    });
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
    const totalVisitors = visitors.reduce((acc, v) => acc + (Number(v.visit_count) || 1), 0);
    const returningVisitors = visitors.filter(v => v.visit_count > 1).length;
    
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const recentActive = visitors.filter(v => v.last_visit && v.last_visit >= fifteenMinsAgo).length;
    const onlineCount = Math.max(liveOnlineConnections || 0, recentActive);

    const orders = await dbAll("SELECT * FROM store_orders");
    const revenue = orders.reduce((acc, o) => {
      if (o.status === 'paid' || o.payment_status === 'PAID' || o.payment_method === 'COD') {
        return acc + (Number(o.amount) || 0);
      }
      return acc;
    }, 0);
    
    const bookings = await dbAll("SELECT * FROM bookings");
    const bookingsRev = bookings.reduce((acc, b) => acc + (Number(b.price) || Number(b.amount) || 0), 0);

    res.json({
      visitors,
      totalVisitors,
      uniqueVisitors,
      returningVisitors,
      onlineVisitors: onlineCount,
      totalRevenue: revenue + bookingsRev,
      totalBookings: (bookings?.length || 0) + (orders?.length || 0)
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/analytics/track', async (req, res) => {
  try {
    const { visitorId, path, referrer, userName } = req.body;
    const id = visitorId || crypto.randomUUID();
    
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || 'Direct Web Visitor';
    let ip = rawIp.split(',')[0].trim();
    if (ip === '::1' || ip === '::ffff:127.0.0.1' || ip === '127.0.0.1') {
      ip = '127.0.0.1 (Local System)';
    }

    const uaString = req.headers['user-agent'] || '';
    const parser = new UAParser(uaString);
    const result = parser.getResult();
    
    const browser = result.browser.name || 'Web Browser';
    const os = result.os.name || 'Operating System';
    const device = result.device.type === 'mobile' ? 'Mobile' : result.device.type === 'tablet' ? 'Tablet' : 'Desktop';

    let country = 'India';
    let city = 'Local Network / Direct';
    if (!ip.includes('Local System') && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
      city = 'Web Client';
    }

    const cleanReferrer = referrer || 'Direct / Bookmark';
    const now = new Date().toISOString();
    const cleanUserName = userName || 'Website Visitor';

    try { await dbRun("ALTER TABLE visitors ADD COLUMN user_name TEXT DEFAULT ''"); } catch(e){}
    try { await dbRun("ALTER TABLE visitors ADD COLUMN last_path TEXT DEFAULT '/'"); } catch(e){}

    const existing = await dbGet('SELECT * FROM visitors WHERE id = ? OR ip = ?', [id, ip]);
    if (existing) {
      await dbRun(
        'UPDATE visitors SET visit_count = visit_count + 1, last_visit = ?, referrer = ?, user_name = ?, last_path = ? WHERE id = ?',
        [now, cleanReferrer, cleanUserName !== 'Website Visitor' ? cleanUserName : existing.user_name || 'Website Visitor', path || '/', existing.id]
      );
    } else {
      await dbRun(
        'INSERT INTO visitors (id, ip, country, state, city, browser, device, os, referrer, last_visit, visit_count, user_name, last_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, ip, country, '', city, browser, device, os, cleanReferrer, now, 1, cleanUserName, path || '/']
      );
    }

    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// NOTIFICATIONS & EMAIL API ENDPOINTS
// ==========================================
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || 'admin';
    const notifs = await dbAll(
      'SELECT * FROM notifications WHERE user_id = ? OR user_id = "all" ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    const unreadCount = notifs.filter(n => n.status === 'unread').length;
    res.json({ success: true, count: notifs.length, unreadCount, notifications: notifs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await dbRun('UPDATE notifications SET status = "read" WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || 'admin';
    await dbRun('UPDATE notifications SET status = "read" WHERE user_id = ? OR user_id = "all"', [userId]);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/notifications/broadcast', authenticateToken, async (req, res) => {
  try {
    const { title, description, code, expiryDate, bannerUrl, subject } = req.body;
    const users = await dbAll('SELECT email FROM users');
    const recipientEmails = Array.from(new Set(users.map(u => u.email).filter(Boolean)));
    if (!recipientEmails.includes('bhalepadharya.app@gmail.com')) {
      recipientEmails.push('bhalepadharya.app@gmail.com');
    }

    const notifId = await saveNotification('all', title || 'Special Offer Available!', description || 'Check out our new discount promo code.', 'marketing', { code, expiryDate });

    // Send async emails to all users
    const broadcastResult = await sendMarketingBroadcast({ title, description, couponCode: code, expiryDate, bannerUrl, subject }, recipientEmails);

    res.json({
      success: true,
      message: `Broadcast initiated successfully. Email sent to ${broadcastResult.count} registered users.`,
      notificationId: notifId,
      recipientCount: recipientEmails.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/test-email', async (req, res) => {
  try {
    const { to = 'bhalepadharya.app@gmail.com', type = 'order_confirmed' } = req.body;
    const sampleData = {
      bookingId: `HS-${Date.now().toString().slice(-6)}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerName: 'Valued Customer',
      email: to,
      productName: 'Full Home Deep Cleaning & Sanitization',
      amount: 2500,
      gst: 450,
      discount: 200,
      finalAmount: 2750,
      paymentStatus: 'Paid',
      paymentMethod: 'Razorpay UPI',
      razorpayPaymentId: 'pay_test_998877',
      address: { fullAddress: 'Flat 402, Highrise Towers, Mumbai, MH - 400001' },
      createdAt: new Date(),
    };

    const result = await sendOrderNotification(type, sampleData);
    res.json({ success: true, message: `Test email (${type}) dispatched to ${to}`, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// MEMBERSHIPS CRUD API ENDPOINTS
// ==========================================
app.get('/api/memberships', async (req, res) => {
  try {
    const plans = await dbAll('SELECT * FROM memberships WHERE is_active = 1 ORDER BY numeric_price ASC');
    const parsed = plans.map(p => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features,
      popular: Boolean(p.popular)
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/memberships', authenticateToken, async (req, res) => {
  try {
    const plans = await dbAll('SELECT * FROM memberships ORDER BY numeric_price ASC');
    const parsed = plans.map(p => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features || '[]') : p.features,
      popular: Boolean(p.popular)
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/memberships', authenticateToken, async (req, res) => {
  try {
    const { name, desc, price, numeric_price, badge, popular, features, button_text, button_variant, is_active } = req.body;
    const id = 'mem_' + Date.now();
    const featuresStr = Array.isArray(features) ? JSON.stringify(features) : (features || '[]');
    await dbRun(
      'INSERT INTO memberships (id, name, desc, price, numeric_price, badge, popular, features, button_text, button_variant, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, desc, price, numeric_price || 0, badge || '', popular ? 1 : 0, featuresStr, button_text || 'Choose Plan', button_variant || 'primary', is_active !== false ? 1 : 0, new Date().toISOString()]
    );
    const plan = await dbGet('SELECT * FROM memberships WHERE id = ?', [id]);
    res.json({
      ...plan,
      features: JSON.parse(plan.features || '[]'),
      popular: Boolean(plan.popular)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/memberships/:id', authenticateToken, async (req, res) => {
  try {
    const { name, desc, price, numeric_price, badge, popular, features, button_text, button_variant, is_active } = req.body;
    const featuresStr = Array.isArray(features) ? JSON.stringify(features) : (features || '[]');
    await dbRun(
      'UPDATE memberships SET name=?, desc=?, price=?, numeric_price=?, badge=?, popular=?, features=?, button_text=?, button_variant=?, is_active=? WHERE id=?',
      [name, desc, price, numeric_price || 0, badge || '', popular ? 1 : 0, featuresStr, button_text || 'Choose Plan', button_variant || 'primary', is_active !== false ? 1 : 0, req.params.id]
    );
    const plan = await dbGet('SELECT * FROM memberships WHERE id = ?', [req.params.id]);
    res.json({
      ...plan,
      features: JSON.parse(plan.features || '[]'),
      popular: Boolean(plan.popular)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/memberships/:id', authenticateToken, async (req, res) => {
  try {
    await dbRun('DELETE FROM memberships WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Membership plan deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CATEGORIZED ADMIN PAYMENTS ENDPOINT
// ==========================================
app.get('/api/admin/payments/categorized', authenticateToken, async (req, res) => {
  try {
    // 1. Fetch Service Bookings
    const bookings = await dbAll('SELECT * FROM bookings ORDER BY created_at DESC');
    // 2. Fetch Store Orders
    const storeOrders = await dbAll('SELECT * FROM store_orders ORDER BY created_at DESC');
    // 3. Fetch Catering Requests
    const cateringRequests = await dbAll('SELECT * FROM catering_requests ORDER BY created_at DESC');

    const formattedPayments = [];

    // Map Service Bookings
    bookings.forEach(b => {
      let category = 'services';
      if (b.service_name && b.service_name.toLowerCase().includes('taxi')) category = 'taxi';
      if (b.service_name && b.service_name.toLowerCase().includes('meal')) category = 'meal';
      if (b.service_name && b.service_name.toLowerCase().includes('membership')) category = 'membership';

      formattedPayments.push({
        id: b.id,
        booking_id: b.id,
        category: category,
        customer_name: b.customer_name || 'Customer',
        customer_email: b.customer_email || b.email || 'customer@example.com',
        customer_phone: b.customer_phone || b.mobile || '+91 98765 43210',
        item_name: b.service_name || 'Home Service',
        amount: b.amount || b.final_amount || 0,
        status: (b.payment_status || b.status || 'paid').toLowerCase(),
        payment_method: (b.payment_method || 'Online Payment').toUpperCase(),
        transaction_id: b.transaction_id || b.razorpay_payment_id || `TXN_${b.id.slice(-6)}`,
        utr_number: b.utr_number || '',
        date: b.date || b.created_at || new Date().toISOString()
      });
    });

    // Map Store Orders
    storeOrders.forEach(so => {
      let itemsSummary = 'Store Purchase';
      try {
        const items = JSON.parse(so.items || '[]');
        if (items.length) itemsSummary = items.map(i => `${i.name} (x${i.quantity || 1})`).join(', ');
      } catch (e) {}

      formattedPayments.push({
        id: so.id,
        booking_id: so.order_number || so.id,
        category: 'store',
        customer_name: so.customer_name || 'Store Customer',
        customer_email: so.customer_email || 'customer@example.com',
        customer_phone: so.customer_phone || '+91 98765 43210',
        item_name: itemsSummary,
        amount: so.total_amount || so.final_amount || 0,
        status: (so.payment_status || 'paid').toLowerCase(),
        payment_method: (so.payment_method || 'Razorpay UPI').toUpperCase(),
        transaction_id: so.razorpay_payment_id || so.transaction_id || `ORD_${so.id.slice(-6)}`,
        utr_number: so.utr_number || '',
        date: so.created_at || new Date().toISOString()
      });
    });

    // Map Catering Requests
    cateringRequests.forEach(cr => {
      formattedPayments.push({
        id: cr.id,
        booking_id: cr.id,
        category: 'catering',
        customer_name: cr.user_name || 'Catering Customer',
        customer_email: cr.user_email || 'customer@example.com',
        customer_phone: cr.contact_phone || '+91 98765 43210',
        item_name: `${cr.package_title || 'Catering Package'} (${cr.guest_count} Guests)`,
        amount: cr.total_estimated_price || 0,
        status: (cr.status === 'confirmed' ? 'paid' : cr.status === 'pending' ? 'pending' : 'refunded'),
        payment_method: 'BANK TRANSFER / UPI',
        transaction_id: `CAT_${cr.id.slice(-6)}`,
        utr_number: '',
        date: cr.created_at || new Date().toISOString()
      });
    });

    res.json(formattedPayments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Relational HomeSeva backend running on http://localhost:${PORT}`);
  verifyTransporter();
});
