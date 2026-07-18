import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbFile = path.join(__dirname, 'homeseva.db');

// Delete old db if exists to ensure fresh seed
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
}

const db = new sqlite3.Database(dbFile);

const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const createTables = async () => {
  console.log('Creating database tables...');

  // 1. Users table
  await runQuery(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('customer', 'professional', 'staff', 'manager', 'admin')) NOT NULL,
      status TEXT CHECK(status IN ('active', 'suspended')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Profiles table
  await runQuery(`
    CREATE TABLE profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      phone TEXT,
      avatar TEXT,
      preferences TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 3. Addresses table
  await runQuery(`
    CREATE TABLE addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      label TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 4. Service Categories table
  await runQuery(`
    CREATE TABLE service_categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Services table
  await runQuery(`
    CREATE TABLE services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category_id TEXT NOT NULL,
      categoryName TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      long_description TEXT,
      price REAL NOT NULL,
      original_price REAL,
      duration TEXT,
      rating REAL DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      image TEXT,
      popular INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
    )
  `);

  // 6. Service Features table
  await runQuery(`
    CREATE TABLE service_features (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      feature TEXT NOT NULL,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    )
  `);

  // 7. Bookings table
  await runQuery(`
    CREATE TABLE bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      professional_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      address TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending', 'upcoming', 'in-progress', 'completed', 'cancelled')) NOT NULL,
      price REAL NOT NULL,
      payment_method TEXT NOT NULL,
      paid INTEGER DEFAULT 1,
      utr TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    )
  `);

  // 8. Booking Timeline history table
  await runQuery(`
    CREATE TABLE booking_timeline (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      time DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    )
  `);

  // 9. Orders table
  await runQuery(`
    CREATE TABLE orders (
      id TEXT PRIMARY KEY,
      booking_id TEXT,
      customer_name TEXT NOT NULL,
      service_name TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      date TEXT NOT NULL,
      utr TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
    )
  `);

  // 10. Reviews table
  await runQuery(`
    CREATE TABLE reviews (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      author TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT,
      status TEXT DEFAULT 'pending',
      service_title TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    )
  `);

  // 11. Contact Messages table
  await runQuery(`
    CREATE TABLE messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 12. Settings table
  await runQuery(`
    CREATE TABLE settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // 13. Audit logs table
  await runQuery(`
    CREATE TABLE logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      action TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 14. Refresh tokens table
  await runQuery(`
    CREATE TABLE refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 15. Coupons table
  await runQuery(`
    CREATE TABLE coupons (
      code TEXT PRIMARY KEY,
      discount REAL NOT NULL,
      type TEXT NOT NULL,
      maxDiscount REAL,
      minOrder REAL,
      description TEXT
    )
  `);

  // 16. Bank transactions table (incoming UPI payments)
  await runQuery(`
    CREATE TABLE bank_transactions (
      utr TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      status TEXT CHECK(status IN ('unused', 'used')) DEFAULT 'unused',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for optimization
  await runQuery(`CREATE INDEX idx_users_email ON users(email)`);
  await runQuery(`CREATE INDEX idx_services_slug ON services(slug)`);
  await runQuery(`CREATE INDEX idx_bookings_user ON bookings(user_id)`);
  await runQuery(`CREATE INDEX idx_orders_booking ON orders(booking_id)`);

  console.log('Tables created successfully.');
};

const seedData = async () => {
  console.log('Seeding initial data...');

  const hashedPwd = bcrypt.hashSync('password', 10);

  // Seed Users
  const users = [
    { id: 'usr1', name: 'Vikram Singh', email: 'vikram@example.com', role: 'customer' },
    { id: 'usr2', name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'professional' },
    { id: 'usr3', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    { id: 'usr4', name: 'Amit Patel', email: 'amit@example.com', role: 'staff' },
    { id: 'usr5', name: 'Sunita Reddy', email: 'sunita@example.com', role: 'manager' }
  ];

  for (const u of users) {
    await runQuery(
      `INSERT INTO users (id, name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, hashedPwd, u.role, 'active']
    );
  }

  // Seed Profiles
  await runQuery(
    `INSERT INTO profiles (id, user_id, phone, avatar, preferences) VALUES (?, ?, ?, ?, ?)`,
    ['prof1', 'usr1', '+91 99999 88888', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram', '{}']
  );
  await runQuery(
    `INSERT INTO profiles (id, user_id, phone, avatar, preferences) VALUES (?, ?, ?, ?, ?)`,
    ['prof2', 'usr2', '+91 98765 43210', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh', '{}']
  );

  // Seed Addresses
  await runQuery(
    `INSERT INTO addresses (id, user_id, label, address, city, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['a1', 'usr1', 'Home', '221B, Hill Road, Bandra West', 'Mumbai', '400050', 1]
  );

  // Seed Categories
  const categories = [
    { id: 'c1', name: 'Catering', slug: 'catering', icon: 'UtensilsCrossed', color: 'from-rose-400 to-orange-500', description: 'Wedding, birthday and event food' },
    { id: 'c2', name: 'Meal Services', slug: 'meal-services', icon: 'CookingPot', color: 'from-emerald-400 to-teal-500', description: 'Daily meals, cooks and tiffins' },
    { id: 'c3', name: 'Taxi', slug: 'taxi', icon: 'CarTaxiFront', color: 'from-sky-400 to-blue-500', description: 'Local, airport and outstation rides' },
    { id: 'c4', name: 'Laundry', slug: 'laundry', icon: 'Shirt', color: 'from-indigo-400 to-blue-500', description: 'Wash, iron and dry cleaning' },
    { id: 'c5', name: 'Plumbing', slug: 'plumbing', icon: 'Wrench', color: 'from-cyan-400 to-blue-500', description: 'Leaks, taps and bathroom fittings' },
    { id: 'c6', name: 'Electrical', slug: 'electrical', icon: 'Zap', color: 'from-amber-400 to-orange-500', description: 'Inspection, wiring and installations' },
    { id: 'c7', name: 'Deep Cleaning', slug: 'deep-cleaning', icon: 'Sparkles', color: 'from-teal-400 to-emerald-500', description: 'Home, kitchen, office and sofa cleaning' },
    { id: 'c8', name: 'Luxury Premium Package', slug: 'luxury-premium-package', icon: 'Crown', color: 'from-violet-500 to-fuchsia-600', description: 'Priority VIP home maintenance plan' }
  ];

  for (const cat of categories) {
    await runQuery(
      `INSERT INTO service_categories (id, name, slug, icon, color, description) VALUES (?, ?, ?, ?, ?, ?)`,
      [cat.id, cat.name, cat.slug, cat.icon, cat.color, cat.description]
    );
  }

  // Seed Services
  const services = [
    { id: 's1', name: 'Wedding Catering', slug: 'wedding-catering', categoryId: 'c1', categoryName: 'Catering', description: 'Premium wedding catering with curated menus and live counters.', longDescription: 'Complete wedding catering for intimate and large events, including menu planning, chef team, buffet setup, live counters, service staff, and cleanup support.', features: ['Custom menu planning', 'Live counters', 'Service staff', 'Buffet setup', 'Event cleanup'], price: 49999, originalPrice: 64999, duration: 'Full event', rating: 4.9, reviewCount: 2840, image: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['bestseller'] },
    { id: 's2', name: 'Birthday Catering', slug: 'birthday-catering', categoryId: 'c1', categoryName: 'Catering', description: 'Fun party catering for kids and family celebrations.', longDescription: 'Birthday catering with snacks, mains, desserts, beverages, cake-table assistance, and flexible packages for small and large groups.', features: ['Party snacks', 'Dessert counter', 'Beverages', 'Kid-friendly menu', 'Setup support'], price: 11999, originalPrice: 15999, duration: '4-6 hours', rating: 4.7, reviewCount: 1625, image: 'https://images.pexels.com/photos/7180617/pexels-photo-7180617.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['same-day'] },
    { id: 's3', name: 'Corporate Catering', slug: 'corporate-catering', categoryId: 'c1', categoryName: 'Catering', description: 'Professional meals and refreshments for office events.', longDescription: 'Corporate catering for meetings, conferences, team lunches, seminars, and office celebrations with punctual delivery and professional presentation.', features: ['Packed meals', 'Buffet service', 'Tea and snacks', 'Invoice support', 'On-time delivery'], price: 8999, originalPrice: 11999, duration: '3-8 hours', rating: 4.8, reviewCount: 1190, image: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's4', name: 'Event Catering', slug: 'event-catering', categoryId: 'c1', categoryName: 'Catering', description: 'Flexible catering for social, cultural, and private events.', longDescription: 'End-to-end event catering with vegetarian and non-vegetarian menu options, buffet setup, serving staff, and guest-count based packages.', features: ['Veg and non-veg menus', 'Serving staff', 'Buffet setup', 'Guest-count packages', 'Cleanup support'], price: 14999, originalPrice: 19999, duration: 'Full event', rating: 4.7, reviewCount: 980, image: 'https://images.pexels.com/photos/5779787/pexels-photo-5779787.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's5', name: 'Daily Meals', slug: 'daily-meals', categoryId: 'c2', categoryName: 'Meal Services', description: 'Fresh daily lunch and dinner plans delivered to your home.', longDescription: 'Healthy daily meal subscriptions with rotating menus, balanced portions, hygienic packaging, and flexible weekly or monthly plans.', features: ['Lunch and dinner', 'Weekly menu', 'Hygienic packaging', 'Veg options', 'Subscription plans'], price: 249, originalPrice: 349, duration: 'Daily delivery', rating: 4.8, reviewCount: 3250, image: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['bestseller'] },
    { id: 's6', name: 'Home Cook', slug: 'home-cook', categoryId: 'c2', categoryName: 'Meal Services', description: 'Verified home cook for regular or occasional cooking.', longDescription: 'Hire a verified home cook for breakfast, lunch, dinner, meal prep, or family functions with cuisine preferences and flexible timings.', features: ['Verified cook', 'Cuisine preference', 'Flexible timings', 'Meal prep', 'Family cooking'], price: 799, originalPrice: 999, duration: '2-3 hours', rating: 4.7, reviewCount: 2140, image: 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['same-day'] },
    { id: 's7', name: 'Tiffin Service', slug: 'tiffin-service', categoryId: 'c2', categoryName: 'Meal Services', description: 'Affordable homemade tiffins for students and professionals.', longDescription: 'Daily tiffin delivery with fresh homemade food, customizable spice levels, weekly menu rotation, and convenient subscription options.', features: ['Homemade meals', 'Weekly plans', 'Custom spice level', 'Office delivery', 'Student friendly'], price: 149, originalPrice: 199, duration: 'Daily delivery', rating: 4.6, reviewCount: 2875, image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's8', name: 'Healthy Meal Plans', slug: 'healthy-meal-plans', categoryId: 'c2', categoryName: 'Meal Services', description: 'Calorie-conscious meals for fitness and wellness goals.', longDescription: 'Nutrition-focused meal plans for weight loss, muscle gain, diabetic-friendly diets, and clean eating with macro-balanced portions.', features: ['Calorie counted', 'Protein rich', 'Diet options', 'Weekly plan', 'Fresh ingredients'], price: 349, originalPrice: 499, duration: 'Daily delivery', rating: 4.8, reviewCount: 1430, image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's9', name: 'Local Taxi', slug: 'local-taxi', categoryId: 'c3', categoryName: 'Taxi', description: 'Reliable local city rides with transparent pricing.', longDescription: 'Book a local taxi for errands, appointments, shopping, and city travel with verified drivers and clean vehicles.', features: ['Verified driver', 'Clean cab', 'Transparent fare', 'City travel', 'Flexible pickup'], price: 299, originalPrice: 399, duration: 'As needed', rating: 4.6, reviewCount: 4320, image: 'https://images.pexels.com/photos/460634/pexels-photo-460634.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['same-day'] },
    { id: 's10', name: 'Airport Pickup', slug: 'airport-pickup', categoryId: 'c3', categoryName: 'Taxi', description: 'On-time airport pickup with flight-aware scheduling.', longDescription: 'Airport pickup service with professional drivers, flight timing coordination, luggage support, and comfortable cars.', features: ['Flight timing support', 'Luggage help', 'Meet and greet', 'Clean cab', 'Fixed fare'], price: 799, originalPrice: 999, duration: 'One-way ride', rating: 4.8, reviewCount: 2380, image: 'https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['bestseller'] },
    { id: 's11', name: 'Airport Drop', slug: 'airport-drop', categoryId: 'c3', categoryName: 'Taxi', description: 'Stress-free airport drop with punctual pickup.', longDescription: 'Book airport drop service with verified drivers, fixed pricing, and punctual doorstep pickup to help you reach on time.', features: ['Punctual pickup', 'Fixed fare', 'Verified driver', 'Luggage space', 'Route planning'], price: 749, originalPrice: 949, duration: 'One-way ride', rating: 4.8, reviewCount: 2510, image: 'https://images.pexels.com/photos/13861/pexels-photo-13861.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's12', name: 'Outstation Taxi', slug: 'outstation-taxi', categoryId: 'c3', categoryName: 'Taxi', description: 'Comfortable outstation rides for family and business trips.', longDescription: 'Outstation taxi booking for one-way and round trips with experienced drivers, clean cars, and transparent kilometer-based pricing.', features: ['One-way trips', 'Round trips', 'Experienced driver', 'Multiple car options', 'Transparent pricing'], price: 2499, originalPrice: 3199, duration: 'Full day', rating: 4.7, reviewCount: 1740, image: 'https://images.pexels.com/photos/210182/pexels-photo-210182.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's13', name: 'Hourly Rental', slug: 'hourly-rental', categoryId: 'c3', categoryName: 'Taxi', description: 'Cab rental by the hour for city errands and meetings.', longDescription: 'Hourly taxi rental packages for local travel, shopping, business meetings, hospital visits, and multiple stops in one booking.', features: ['Multiple stops', 'Hourly packages', 'Local travel', 'Wait time included', 'Verified driver'], price: 999, originalPrice: 1299, duration: '4 hours', rating: 4.6, reviewCount: 1360, image: 'https://images.pexels.com/photos/97079/pexels-photo-97079.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's14', name: 'Washing Clothes', slug: 'washing-clothes', categoryId: 'c4', categoryName: 'Laundry', description: 'Professional wash and fold service for daily clothes.', longDescription: 'Laundry washing for daily wear, bedsheets, towels, and household fabrics with hygienic process and doorstep pickup and delivery.', features: ['Wash and fold', 'Doorstep pickup', 'Hygienic wash', 'Fresh packaging', 'Per kg pricing'], price: 199, originalPrice: 299, duration: '24-48 hours', rating: 4.7, reviewCount: 2960, image: 'https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['same-day'] },
    { id: 's15', name: 'Iron Service', slug: 'iron-service', categoryId: 'c4', categoryName: 'Laundry', description: 'Crisp ironing for shirts, sarees, trousers, and linens.', longDescription: 'Doorstep ironing service with careful handling of delicate clothes, formal wear, sarees, and household linens.', features: ['Steam ironing', 'Formal wear', 'Saree care', 'Doorstep delivery', 'Neat packing'], price: 99, originalPrice: 149, duration: '24 hours', rating: 4.6, reviewCount: 2210, image: 'https://images.pexels.com/photos/5591663/pexels-photo-5591663.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's16', name: 'Dry Cleaning', slug: 'dry-cleaning', categoryId: 'c4', categoryName: 'Laundry', description: 'Premium dry cleaning for delicate and expensive garments.', longDescription: 'Specialized dry cleaning for suits, lehengas, jackets, silk sarees, woolens, and delicate fabrics with stain care.', features: ['Delicate fabric care', 'Stain treatment', 'Suit cleaning', 'Ethnic wear care', 'Premium packing'], price: 399, originalPrice: 549, duration: '2-3 days', rating: 4.8, reviewCount: 1185, image: 'https://images.pexels.com/photos/6197119/pexels-photo-6197119.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's17', name: 'Express Laundry', slug: 'express-laundry', categoryId: 'c4', categoryName: 'Laundry', description: 'Fast laundry pickup and delivery for urgent needs.', longDescription: 'Express laundry service for urgent clothes with priority processing, quick wash, drying, folding, and doorstep delivery.', features: ['Priority pickup', 'Quick wash', 'Same-day option', 'Folded delivery', 'Status updates'], price: 349, originalPrice: 499, duration: 'Same day', rating: 4.7, reviewCount: 920, image: 'https://images.pexels.com/photos/5217882/pexels-photo-5217882.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: ['same-day'] },
    { id: 's18', name: 'Pipe Leak Repair', slug: 'pipe-leak-repair', categoryId: 'c5', categoryName: 'Plumbing', description: 'Quick repair for leaking pipes and hidden seepage issues.', longDescription: 'Professional pipe leak repair with inspection, leakage detection, sealant or part replacement, and post-work testing.', features: ['Leak detection', 'Pipe repair', 'Part replacement', 'Water testing', 'Service warranty'], price: 299, originalPrice: 449, duration: '45-90 min', rating: 4.8, reviewCount: 3320, image: 'https://images.pexels.com/photos/8961345/pexels-photo-8961345.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['same-day'] },
    { id: 's19', name: 'Tap Repair', slug: 'tap-repair', categoryId: 'c5', categoryName: 'Plumbing', description: 'Repair leaking taps, mixers, faucets, and knobs.', longDescription: 'Tap and faucet repair service for leakage, low pressure, broken handles, mixer issues, and replacement support.', features: ['Faucet repair', 'Mixer repair', 'Washer replacement', 'Low pressure check', 'Warranty support'], price: 149, originalPrice: 249, duration: '30-60 min', rating: 4.7, reviewCount: 2845, image: 'https://images.pexels.com/photos/6195125/pexels-photo-6195125.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['same-day'] },
    { id: 's20', name: 'Bathroom Fittings', slug: 'bathroom-fittings', categoryId: 'c5', categoryName: 'Plumbing', description: 'Install or repair showers, health faucets, sinks, and fittings.', longDescription: 'Bathroom fitting installation and repair for showers, wash basins, toilet seats, health faucets, towel racks, and fixtures.', features: ['Shower fitting', 'Health faucet', 'Basin fitting', 'Fixture repair', 'Installation check'], price: 399, originalPrice: 599, duration: '60-120 min', rating: 4.7, reviewCount: 1690, image: 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's21', name: 'Water Tank Cleaning', slug: 'water-tank-cleaning', categoryId: 'c5', categoryName: 'Plumbing', description: 'Hygienic water tank cleaning and disinfection.', longDescription: 'Water tank cleaning with sludge removal, brushing, pressure wash, disinfection, and final rinse for overhead and underground tanks.', features: ['Sludge removal', 'Pressure wash', 'Disinfection', 'Final rinse', 'Before-after check'], price: 799, originalPrice: 1099, duration: '2-3 hours', rating: 4.8, reviewCount: 1450, image: 'https://images.pexels.com/photos/6197118/pexels-photo-6197118.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's22', name: 'Electrical Inspection', slug: 'electrical-inspection', categoryId: 'c6', categoryName: 'Electrical', description: 'Complete safety inspection for your home wiring and panels.', longDescription: 'Electrical safety inspection covering wiring, switchboards, MCB, earthing, load capacity, and risk points with technician recommendations.', features: ['Wiring check', 'MCB inspection', 'Earthing check', 'Load review', 'Safety report'], price: 499, originalPrice: 699, duration: '60-90 min', rating: 4.8, reviewCount: 1840, image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['bestseller'] },
    { id: 's23', name: 'Fan Installation', slug: 'fan-installation', categoryId: 'c6', categoryName: 'Electrical', description: 'Install ceiling, exhaust, and wall fans safely.', longDescription: 'Fan installation and replacement service with wiring check, mounting, balancing, regulator setup, and safety testing.', features: ['Ceiling fan install', 'Exhaust fan install', 'Regulator setup', 'Balancing', 'Safety test'], price: 249, originalPrice: 399, duration: '45-60 min', rating: 4.7, reviewCount: 3190, image: 'https://images.pexels.com/photos/6476753/pexels-photo-6476753.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['same-day'] },
    { id: 's24', name: 'Wiring Repair', slug: 'wiring-repair', categoryId: 'c6', categoryName: 'Electrical', description: 'Fix damaged wiring, short circuits, and loose connections.', longDescription: 'Electrical wiring repair for damaged wires, short circuits, loose connections, power fluctuations, and safety risks.', features: ['Short circuit repair', 'Wire replacement', 'Loose connection fix', 'Safety check', 'Material support'], price: 349, originalPrice: 499, duration: '60-120 min', rating: 4.7, reviewCount: 2255, image: 'https://images.pexels.com/photos/8005368/pexels-photo-8005368.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's25', name: 'Switch Repair', slug: 'switch-repair', categoryId: 'c6', categoryName: 'Electrical', description: 'Repair switches, sockets, boards, and minor electrical faults.', longDescription: 'Switchboard repair and replacement service for faulty switches, sockets, dimmers, regulators, and minor electrical faults.', features: ['Switch replacement', 'Socket repair', 'Board fitting', 'Fault diagnosis', 'Safety check'], price: 149, originalPrice: 249, duration: '30-60 min', rating: 4.6, reviewCount: 2680, image: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's26', name: 'Light Installation', slug: 'light-installation', categoryId: 'c6', categoryName: 'Electrical', description: 'Install lights, chandeliers, LED panels, and outdoor fixtures.', longDescription: 'Lighting installation for LED lights, panels, chandeliers, pendant lights, outdoor lamps, and decorative fixtures.', features: ['LED installation', 'Chandelier fitting', 'Outdoor fixtures', 'Wiring support', 'Safety testing'], price: 299, originalPrice: 449, duration: '45-90 min', rating: 4.8, reviewCount: 1765, image: 'https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's27', name: 'Full Home Cleaning', slug: 'full-home-cleaning', categoryId: 'c7', categoryName: 'Deep Cleaning', description: 'Professional deep cleaning for your entire home.', longDescription: 'A thorough home deep cleaning service covering rooms, bathrooms, kitchen, balconies, floors, windows, dusting, and sanitization.', features: ['All rooms covered', 'Professional equipment', 'Floor scrubbing', 'Dusting', 'Satisfaction check'], price: 2499, originalPrice: 3499, duration: '4-6 hours', rating: 4.8, reviewCount: 8932, image: 'https://images.pexels.com/photos/4239034/pexels-photo-4239034.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['bestseller'] },
    { id: 's28', name: 'Kitchen Cleaning', slug: 'kitchen-cleaning', categoryId: 'c7', categoryName: 'Deep Cleaning', description: 'Degrease and sanitize your kitchen thoroughly.', longDescription: 'Kitchen deep cleaning including platform, tiles, sink, cabinets exterior, appliances exterior, floor, and food-safe sanitization.', features: ['Grease removal', 'Tile scrubbing', 'Countertop sanitize', 'Cabinet exterior', 'Food-safe agents'], price: 599, originalPrice: 899, duration: '90-120 min', rating: 4.7, reviewCount: 5421, image: 'https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['same-day'] },
    { id: 's29', name: 'Bathroom Cleaning', slug: 'bathroom-cleaning', categoryId: 'c7', categoryName: 'Deep Cleaning', description: 'Sparkling bathroom cleaning with stain and odor removal.', longDescription: 'Bathroom deep cleaning that removes hard water stains, sanitizes surfaces, cleans tiles and grout, and polishes fixtures.', features: ['Hard water stain removal', 'Tile cleaning', 'Sanitization', 'Fixture polish', 'Odor removal'], price: 399, originalPrice: 599, duration: '60-90 min', rating: 4.8, reviewCount: 6754, image: 'https://images.pexels.com/photos/6585757/pexels-photo-6585757.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's30', name: 'Sofa Cleaning', slug: 'sofa-cleaning', categoryId: 'c7', categoryName: 'Deep Cleaning', description: 'Deep sofa shampoo cleaning with stain removal.', longDescription: 'Professional sofa shampoo cleaning that removes stains, dust, odor, and allergens from fabric and synthetic sofas.', features: ['Shampoo cleaning', 'Stain removal', 'Odor control', 'Fabric safe', 'Quick drying'], price: 449, originalPrice: 699, duration: '60-90 min', rating: 4.7, reviewCount: 3210, image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's31', name: 'Carpet Cleaning', slug: 'carpet-cleaning', categoryId: 'c7', categoryName: 'Deep Cleaning', description: 'Deep carpet cleaning for dust, stains, and odors.', longDescription: 'Carpet cleaning with vacuuming, shampooing, stain treatment, deodorizing, and drying support for homes and offices.', features: ['Deep vacuuming', 'Shampoo cleaning', 'Stain care', 'Deodorizing', 'Dust removal'], price: 699, originalPrice: 999, duration: '90-120 min', rating: 4.7, reviewCount: 1825, image: 'https://images.pexels.com/photos/4107112/pexels-photo-4107112.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's32', name: 'Office Cleaning', slug: 'office-cleaning', categoryId: 'c7', categoryName: 'Deep Cleaning', description: 'Professional deep cleaning for offices and workspaces.', longDescription: 'Office cleaning service for cabins, desks, floors, pantry, washrooms, glass partitions, and common areas with after-hours options.', features: ['Workstation cleaning', 'Floor care', 'Pantry cleaning', 'Washroom cleaning', 'After-hours option'], price: 2999, originalPrice: 3999, duration: '4-6 hours', rating: 4.8, reviewCount: 980, image: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: false, tags: [] },
    { id: 's33', name: 'Luxury Premium Package', slug: 'luxury-premium-package', categoryId: 'c8', categoryName: 'Luxury Premium Package', description: 'VIP home maintenance package with priority booking and premium support.', longDescription: 'A complete premium package with dedicated technician support, priority booking, monthly and annual maintenance, VIP customer support, electrical inspection, plumbing inspection, deep cleaning, and exclusive discounts.', features: ['Dedicated technician', 'Priority booking', 'Monthly maintenance', 'Annual maintenance', 'VIP support', 'Electrical inspection', 'Plumbing inspection', 'Deep cleaning', 'Premium discounts'], price: 9999, originalPrice: 14999, duration: 'Annual plan', rating: 4.9, reviewCount: 760, image: 'https://images.pexels.com/photos/7031607/pexels-photo-7031607.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', popular: true, tags: ['bestseller'] }
  ];

  for (const s of services) {
    await runQuery(
      `INSERT INTO services (id, name, slug, category_id, categoryName, description, long_description, price, original_price, duration, rating, review_count, image, popular, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.id,
        s.name,
        s.slug,
        s.categoryId,
        s.categoryName,
        s.description,
        s.longDescription,
        s.price,
        s.originalPrice,
        s.duration,
        s.rating,
        s.reviewCount,
        s.image,
        s.popular ? 1 : 0,
        JSON.stringify(s.tags)
      ]
    );

    // Save Features
    const indexStr = s.id.slice(1);
    for (let i = 0; i < s.features.length; i++) {
      await runQuery('INSERT INTO service_features (id, service_id, feature) VALUES (?, ?, ?)', [
        `sf_${indexStr}_${i}`,
        s.id,
        s.features[i]
      ]);
    }
  }

  // Seed Bookings & Orders & Timeline
  const bookings = [
    { id: 'b1', serviceId: 's1', serviceName: 'Wedding Catering', professionalName: 'Rajesh Kumar', date: '2026-08-20', timeSlot: '06:00 PM - 11:00 PM', address: '221B, Hill Road, Bandra West, Mumbai', status: 'upcoming', price: 49999, paymentMethod: 'upi', paid: 1, customerName: 'Vikram Singh', userId: 'usr1', utr: 'utr_mock_1' },
    { id: 'b2', serviceId: 's27', serviceName: 'Full Home Cleaning', professionalName: 'Sunita Reddy', date: '2026-08-15', timeSlot: '09:00 AM - 01:00 PM', address: '221B, Hill Road, Bandra West, Mumbai', status: 'upcoming', price: 2499, paymentMethod: 'card', paid: 1, customerName: 'Vikram Singh', userId: 'usr1', utr: null }
  ];

  for (const b of bookings) {
    await runQuery(
      `INSERT INTO bookings (id, user_id, service_id, professional_name, date, time_slot, address, status, price, payment_method, paid, utr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.id, b.userId, b.serviceId, b.professionalName, b.date, b.timeSlot, b.address, b.status, b.price, b.paymentMethod, b.paid, b.utr]
    );

    // Seed timeline
    await runQuery(
      `INSERT INTO booking_timeline (id, booking_id, status, note, time) VALUES (?, ?, ?, ?, ?)`,
      [`bt_${b.id}_1`, b.id, 'pending', 'Booking requested', '2026-07-17T21:00:00.000Z']
    );
    if (b.status !== 'pending') {
      await runQuery(
        `INSERT INTO booking_timeline (id, booking_id, status, note, time) VALUES (?, ?, ?, ?, ?)`,
        [`bt_${b.id}_2`, b.id, b.status, `Booking marked as ${b.status}`, '2026-07-17T21:05:00.000Z']
      );
    }

    // Seed orders ledger
    await runQuery(
      `INSERT INTO orders (id, booking_id, customer_name, service_name, amount, status, payment_method, date, utr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`ord_${b.id}`, b.id, b.customerName, b.serviceName, b.price, b.status === 'cancelled' ? 'refunded' : 'paid', b.paymentMethod, '2026-07-17T21:00:00.000Z', b.utr]
    );
  }

  // Seed Reviews
  const reviews = [
    { id: 'rev_1', serviceId: 's1', author: 'Vikram Singh', rating: 5, comment: 'Wedding catering was extremely well organized, very tasty, and served on time.', status: 'approved', serviceTitle: 'Wedding Catering', date: '2026-07-12' },
    { id: 'rev_2', serviceId: 's5', author: 'Neha Gupta', rating: 5, comment: 'Daily meals are fresh and neatly packed. Perfect for office lunch.', status: 'approved', serviceTitle: 'Daily Meals', date: '2026-07-09' },
    { id: 'rev_3', serviceId: 's10', author: 'Arjun Mehta', rating: 4, comment: 'Airport pickup was smooth and the driver helped with luggage.', status: 'approved', serviceTitle: 'Airport Pickup', date: '2026-07-05' },
    { id: 'rev_4', serviceId: 's27', author: 'Kavya Iyer', rating: 5, comment: 'The deep cleaning team was professional. My home looks sparkling new.', status: 'approved', serviceTitle: 'Full Home Cleaning', date: '2026-07-11' },
    { id: 'rev_5', serviceId: 's18', author: 'Rohit Das', rating: 5, comment: 'Pipe leak was fixed quickly with clear pricing and clean work.', status: 'approved', serviceTitle: 'Pipe Leak Repair', date: '2026-07-10' },
    { id: 'rev_6', serviceId: 's22', author: 'Meera Joshi', rating: 5, comment: 'Electrical inspection was detailed and the technician explained every safety point.', status: 'approved', serviceTitle: 'Electrical Inspection', date: '2026-07-08' }
  ];

  for (const rev of reviews) {
    await runQuery(
      `INSERT INTO reviews (id, service_id, author, rating, comment, status, service_title, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [rev.id, rev.serviceId, rev.author, rev.rating, rev.comment, rev.status, rev.serviceTitle, rev.date]
    );
  }

  // Seed Support Messages
  await runQuery(
    `INSERT INTO messages (id, name, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)`,
    ['msg_1', 'Karan Malhotra', 'karan@example.com', 'Catering Quote', 'Hi, I would like to get a quote for a birthday party catering for 50 people.', 'unread']
  );
  await runQuery(
    `INSERT INTO messages (id, name, email, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)`,
    ['msg_2', 'Pooja Nair', 'pooja@example.com', 'Plumbing service warranty query', 'Hi, I booked a pipe leak repair last week. Is there a service warranty?', 'archived']
  );

  // Seed settings
  await runQuery(`INSERT INTO settings (key, value) VALUES ('appName', 'HomeSeva Pro')`);
  await runQuery(`INSERT INTO settings (key, value) VALUES ('contactEmail', 'support@homeseva.com')`);
  await runQuery(`INSERT INTO settings (key, value) VALUES ('contactPhone', '+91 98765 43210')`);
  await runQuery(`INSERT INTO settings (key, value) VALUES ('address', '221B, Hill Road, Bandra West, Mumbai, India')`);
  await runQuery(`INSERT INTO settings (key, value) VALUES ('currency', 'INR')`);

  // Seed audit logs
  await runQuery(
    `INSERT INTO logs (id, user_id, user_name, action, details) VALUES (?, ?, ?, ?, ?)`,
    ['log_1', 'usr3', 'Admin User', 'Admin Login', 'Admin logged in from IP 192.168.1.1']
  );
  await runQuery(
    `INSERT INTO logs (id, user_id, user_name, action, details) VALUES (?, ?, ?, ?, ?)`,
    ['log_2', 'usr1', 'Vikram Singh', 'Create Booking', 'Created booking #b1 for Wedding Catering']
  );

  // Seed Coupons
  const coupons = [
    { code: 'FIRST50', discount: 50, type: 'percent', maxDiscount: 200, minOrder: 199, description: '50% off on first booking (max ₹200)' },
    { code: 'CLEAN20', discount: 20, type: 'percent', maxDiscount: 500, minOrder: 999, description: '20% off on cleaning services (max ₹500)' },
    { code: 'FLAT100', discount: 100, type: 'flat', maxDiscount: 100, minOrder: 499, description: 'Flat ₹100 off on orders above ₹499' }
  ];

  for (const c of coupons) {
    await runQuery(
      `INSERT INTO coupons (code, discount, type, maxDiscount, minOrder, description) VALUES (?, ?, ?, ?, ?, ?)`,
      [c.code, c.discount, c.type, c.maxDiscount, c.minOrder, c.description]
    );
  }

  // Seed Bank transactions (UTRs) for PhonePe verification
  const defaultUtrs = [
    { utr: '123456789012', amount: 49999 },
    { utr: '987654321098', amount: 2499 },
    { utr: '888888888888', amount: 499 }
  ];

  for (const item of defaultUtrs) {
    await runQuery(
      `INSERT INTO bank_transactions (utr, amount, status) VALUES (?, ?, ?)`,
      [item.utr, item.amount, 'unused']
    );
  }

  // Insert mock records for already used UTRs
  await runQuery(
    `INSERT INTO bank_transactions (utr, amount, status) VALUES (?, ?, ?)`,
    ['utr_mock_1', 49999, 'used']
  );

  console.log('Seeding completed successfully.');
};

const runMigration = async () => {
  try {
    await createTables();
    await seedData();
    db.close();
    console.log('Database successfully migrated and seeded.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

runMigration();
