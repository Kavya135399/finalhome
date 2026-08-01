const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'homeseva.db');
const db = new sqlite3.Database(dbPath);

console.log('--- STARTING COMPLETE FRONTEND-TO-DATABASE SEEDING ---');

db.serialize(() => {
  // 1. STORE PRODUCTS TABLE
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

  const storeProducts = [
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

  storeProducts.forEach(p => {
    db.run(
      `INSERT OR REPLACE INTO store_products (id, name, category, description, price, stock, image, is_active, is_featured, is_popular, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.name, p.category, p.description, p.price, p.stock, p.image, p.is_active, p.is_featured, p.is_popular, new Date().toISOString()]
    );
  });
  console.log(`✅ Seeded ${storeProducts.length} Store Products in database.`);

  // 2. SERVICES TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      duration TEXT DEFAULT '60 min',
      image TEXT NOT NULL,
      features TEXT,
      created_at TEXT NOT NULL
    )
  `);

  const services = [
    { id: 's1', name: 'Full Home Deep Cleaning', category_name: 'Cleaning', description: 'Complete deep cleaning of all rooms, balcony, kitchen, and bathrooms using eco-friendly solutions.', price: 2499, duration: '4-5 hrs', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400', features: JSON.stringify(['Eco-friendly chemicals', 'Deep floor scrubbing', 'Kitchen degreasing', 'Sanitization included']) },
    { id: 's2', name: 'Sofa & Upholstery Shampooing', category_name: 'Cleaning', description: 'Deep foam shampooing and extraction for fabric and leather sofas to remove stains & dust mites.', price: 999, duration: '2 hrs', image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=400', features: JSON.stringify(['Fabric stain removal', 'Foam shampooing', '99% dust mite elimination']) },
    { id: 's3', name: 'AC Inspection & Gas Refill', category_name: 'AC Repair', description: 'Comprehensive AC servicing, coil cleaning, pressure testing, and R32/R410 gas topping.', price: 1499, duration: '90 min', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400', features: JSON.stringify(['Cooling efficiency check', 'Gas pressure leak test', 'Indoor unit jet wash']) },
    { id: 's4', name: 'Full House Electrical Audit & Repair', category_name: 'Electrical', description: 'Safety inspection of DB box, MCB switches, earthing, wiring, and appliance fix.', price: 499, duration: '60 min', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=400', features: JSON.stringify(['Certified electrician', 'Short circuit diagnostics', 'Safety earthing audit']) },
    { id: 's5', name: 'Bathroom Pipe Leak Repair', category_name: 'Plumbing', description: 'Fix concealed pipe leaks, flush tank faults, tap replacements, and drainage blockages.', price: 399, duration: '45 min', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&q=80&w=400', features: JSON.stringify(['Instant leak detection', 'High durability fittings', 'Same day service']) },
    { id: 's6', name: 'Deluxe Salon Facial & Head Massage', category_name: 'Salon for Women', description: 'Relaxing herbal facial treatment, de-tan pack, head oil massage, and manicures at home.', price: 1299, duration: '90 min', image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=400', features: JSON.stringify(['Single-use hygienic kits', 'Herbal premium products', 'Certified beauticians']) },
    { id: 's7', name: 'Men\'s Grooming & Haircut Package', category_name: 'Men\'s Grooming', description: 'Professional haircut, beard styling/trimming, head massage, and charcoal face pack.', price: 499, duration: '45 min', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400', features: JSON.stringify(['Sanitized tools', 'Trend haircuts', 'Charcoal scrub included']) }
  ];

  services.forEach(s => {
    db.run(
      `INSERT OR REPLACE INTO services (id, name, category_name, description, price, duration, image, features, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.name, s.category_name, s.description, s.price, s.duration, s.image, s.features, new Date().toISOString()]
    );
  });
  console.log(`✅ Seeded ${services.length} Services in database.`);

  // 3. VEHICLES / TAXI FLEET TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      passengers INTEGER DEFAULT 4,
      luggage INTEGER DEFAULT 2,
      rate REAL NOT NULL,
      image TEXT NOT NULL,
      status TEXT DEFAULT 'Available',
      created_at TEXT NOT NULL
    )
  `);

  const vehicles = [
    { id: 't_hatch', name: 'Economy Hatchback (Alto / Swift)', type: 'Hatchback', passengers: 4, luggage: 2, rate: 11, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400', status: 'Available' },
    { id: 't_sedan', name: 'Executive Sedan (Dzire / Etios)', type: 'Sedan', passengers: 4, luggage: 3, rate: 13, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400', status: 'Available' },
    { id: 't_suv', name: 'Compact SUV (Brezza / Creta)', type: 'SUV', passengers: 5, luggage: 3, rate: 15, image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400', status: 'Available' },
    { id: 't_muv', name: 'Luxury MUV (Toyota Innova Crysta)', type: 'MUV', passengers: 7, luggage: 5, rate: 18, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400', status: 'Available' },
    { id: 't_luxury', name: 'Elite Luxury Cruiser (Mustang / BMW)', type: 'Luxury Cruiser', passengers: 4, luggage: 3, rate: 25, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=400', status: 'Available' }
  ];

  vehicles.forEach(v => {
    db.run(
      `INSERT OR REPLACE INTO vehicles (id, name, type, passengers, luggage, rate, image, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [v.id, v.name, v.type, v.passengers, v.luggage, v.rate, v.image, v.status, new Date().toISOString()]
    );
  });
  console.log(`✅ Seeded ${vehicles.length} Vehicles in database.`);

});

db.close();
console.log('--- DATABASE SEEDING COMPLETED SUCCESSFULLY ---');
