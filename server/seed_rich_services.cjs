const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'homeseva.db');
const db = new sqlite3.Database(dbPath);

console.log('--- SEEDING RICH EXECUTIVE SERVICES INTO DATABASE ---');

const services = [
  {
    id: 's34',
    name: 'Full Home Deep Cleaning & Sanitization',
    slug: 'full-home-deep-cleaning',
    short_description: 'Complete deep cleaning of all rooms, kitchen, balcony, and bathrooms with eco-friendly solutions.',
    description: 'Comprehensive deep cleaning of your entire residence using certified German suction machines, eco-friendly Degreasers, and anti-bacterial sanitizing solutions. Includes floor scrubbing, window pane degreasing, bathroom descaling, and balcony wash.',
    category_id: 'cat_cleaning',
    categoryName: 'Cleaning',
    service_type: 'standard',
    price: 2499,
    original_price: 3499,
    duration: '4-5 hrs',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    icon: 'Sparkles',
    badge: '28% OFF',
    featured: 1,
    popular: 1,
    is_active: 1,
    sort_order: 10,
    tags: JSON.stringify(['Cleaning', 'Deep Clean', 'Sanitization', 'Home Care']),
    features: JSON.stringify(['4-5 Hours Duration', 'German Suction Equipment', 'Eco-friendly Chemicals', '30-Day Re-clean Guarantee'])
  },
  {
    id: 's35',
    name: 'Plumbing Repair & Leakage Specialist',
    slug: 'plumbing-repair-leakage-specialist',
    short_description: 'Expert diagnostics for concealed pipe leaks, tap replacements, and bathroom drainage blockages.',
    description: 'Professional plumbing diagnostic & repair service. Our licensed master plumbers bring pressure testing kits, high-grade brass fittings, and specialized drainage snakes to fix any blockage, faucet drip, or concealed wall leak.',
    category_id: 'cat_plumbing',
    categoryName: 'Plumbing',
    service_type: 'standard',
    price: 399,
    original_price: 599,
    duration: '45 min',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&q=80&w=800',
    icon: 'Droplets',
    badge: 'MOST POPULAR',
    featured: 1,
    popular: 1,
    is_active: 1,
    sort_order: 20,
    tags: JSON.stringify(['Plumbing', 'Pipe Fix', 'Leak', 'Drainage']),
    features: JSON.stringify(['Same-day 30 min arrival', 'Free 60-day repair warranty', 'Original spare parts included'])
  },
  {
    id: 's36',
    name: 'Complete House Electrical Safety & Repair',
    slug: 'complete-house-electrical-safety-repair',
    short_description: 'Certified electrical inspection, MCB switch repairs, wiring audit, and light fixture installations.',
    description: 'Comprehensive electrical health & safety inspection by certified wiremen. Covers DB box circuit breaker diagnostics, earthing leakage checks, socket replacements, chandelier hanging, and inverter wiring.',
    category_id: 'cat_electrical',
    categoryName: 'Electrical',
    service_type: 'standard',
    price: 499,
    original_price: 699,
    duration: '60 min',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=800',
    icon: 'Zap',
    badge: 'CERTIFIED',
    featured: 1,
    popular: 1,
    is_active: 1,
    sort_order: 30,
    tags: JSON.stringify(['Electrical', 'Wiring', 'MCB', 'Safety Audit']),
    features: JSON.stringify(['Licensed electricians', 'Thermal fault detection', 'Zero extra visit charge'])
  },
  {
    id: 's37',
    name: 'AC Master Servicing & Gas Top-Up',
    slug: 'ac-master-servicing-gas-topup',
    short_description: 'Complete high-pressure jet cleaning, coil descaling, and R32/R410 refrigerant recharge.',
    description: 'Pro air conditioning jet wash servicing. Includes indoor unit foam cleaning, outdoor condenser coil jet wash, drain pipe clearing, temperature drop inspection, and eco-refrigerant topping up.',
    category_id: 'cat_ac',
    categoryName: 'AC Repair',
    service_type: 'standard',
    price: 1499,
    original_price: 1999,
    duration: '90 min',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
    icon: 'Wind',
    badge: 'COOLING GUARANTEE',
    featured: 1,
    popular: 1,
    is_active: 1,
    sort_order: 40,
    tags: JSON.stringify(['AC Repair', 'Cooling', 'Gas Refill', 'Jet Wash']),
    features: JSON.stringify(['Deep Foam Jet Cleaning', 'Refrigerant leak detection', '100% Cooling performance boost'])
  },
  {
    id: 's38',
    name: 'Artisan Wall Painting & Waterproofing',
    slug: 'artisan-wall-painting-waterproofing',
    short_description: 'Asian Paints certified interior wall repainting, waterproofing, and texture wall designs.',
    description: 'Transform your home with dust-free mechanized sanding, putty smoothing, anti-dampness treatment, and double coat luxury acrylic emulsion paint by trained painters.',
    category_id: 'cat_painting',
    categoryName: 'Painting',
    service_type: 'standard',
    price: 4999,
    original_price: 6999,
    duration: '1-2 Days',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800',
    icon: 'Paintbrush',
    badge: 'DUST FREE',
    featured: 0,
    popular: 1,
    is_active: 1,
    sort_order: 50,
    tags: JSON.stringify(['Painting', 'Asian Paints', 'Waterproofing', 'Home Renovation']),
    features: JSON.stringify(['Mechanized sanding tools', 'Asian Paints certified products', 'Post-paint floor cleaning included'])
  },
  {
    id: 's39',
    name: 'Sofa & Fabric Upholstery Foam Wash',
    slug: 'sofa-fabric-upholstery-foam-wash',
    short_description: 'Deep foam shampooing and extraction for fabric/leather sofas to eliminate stains & allergens.',
    description: 'Specialized 3-step upholstery care: deep vacuuming, active foam injection to dissolve stubborn grease stains, and high-suction moisture extraction leaving sofas clean and fresh.',
    category_id: 'cat_cleaning',
    categoryName: 'Cleaning',
    service_type: 'standard',
    price: 999,
    original_price: 1399,
    duration: '2 hrs',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800',
    icon: 'Sparkles',
    badge: 'STAIN REMOVER',
    featured: 0,
    popular: 0,
    is_active: 1,
    sort_order: 60,
    tags: JSON.stringify(['Sofa Cleaning', 'Shampoo', 'Furniture Care']),
    features: JSON.stringify(['99% dust mite elimination', 'Fabric colour lock formulation', 'Dries within 3-4 hours'])
  },
  {
    id: 's40',
    name: 'Royal Feast Catering Package (50 Pax)',
    slug: 'royal-feast-catering-package',
    short_description: 'Lavish buffet setup with live counters, 3 starters, 4 main courses, desserts, and staff.',
    description: 'Exquisite event catering setup by master chefs. Includes live chaat/starter counters, 4 lavish main course dishes, hot breads, traditional sweet bar, mocktails, elegant presentation, and dedicated uniformed servers.',
    category_id: 'cat_catering',
    categoryName: 'Catering',
    service_type: 'standard',
    price: 15000,
    original_price: 18000,
    duration: '5 hrs',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800',
    icon: 'UtensilsCrossed',
    badge: 'GRAND EVENTS',
    featured: 1,
    popular: 1,
    is_active: 1,
    sort_order: 70,
    tags: JSON.stringify(['Catering', 'Buffet', 'Party', 'Event Food']),
    features: JSON.stringify(['50 Guests capacity', 'Live starter counters', 'Complete buffet & server staff included'])
  },
  {
    id: 's41',
    name: 'Executive Daily Tiffin & Gourmet Thali',
    slug: 'executive-daily-tiffin-gourmet-thali',
    short_description: 'Nutritious homestyle lunch delivered fresh: 4 phulkas, 2 sabjis, dal tadka, rice & sweet.',
    description: 'Authentic 100% pure ghee homestyle Gujarati / North Indian meal box delivered piping hot to your home or office. Hygienically packed in eco-friendly leakproof containers.',
    category_id: 'cat_meals',
    categoryName: 'Meal Services',
    service_type: 'standard',
    price: 199,
    original_price: 250,
    duration: '30 min delivery',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
    icon: 'UtensilsCrossed',
    badge: 'DAILY FRESH',
    featured: 0,
    popular: 1,
    is_active: 1,
    sort_order: 80,
    tags: JSON.stringify(['Meals', 'Tiffin', 'Thali', 'Daily Lunch']),
    features: JSON.stringify(['Low oil & pure Ghee prepared', 'Hot insulated thermal packaging', 'Daily menu rotation'])
  },
  {
    id: 's42',
    name: 'Outstation Luxury MUV Taxi (Innova Crysta)',
    slug: 'outstation-luxury-muv-taxi',
    short_description: 'Chauffeur-driven Innova Crysta for outstation trips, airport transfers & intercity travel.',
    description: 'Premium 7-seater Toyota Innova Crysta with experienced uniformed driver, GPS tracking, dual AC, plush leather seating, and complimentary mineral water for smooth intercity travel.',
    category_id: 'cat_taxi',
    categoryName: 'Taxi',
    service_type: 'standard',
    price: 18,
    original_price: 22,
    duration: 'Per KM',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
    icon: 'Car',
    badge: 'VIP RIDE',
    featured: 1,
    popular: 0,
    is_active: 1,
    sort_order: 90,
    tags: JSON.stringify(['Taxi', 'Innova', 'Outstation', 'Travel']),
    features: JSON.stringify(['Commercial T-Permit vehicle', 'Sanitized clean car guaranteed', 'Professional polite driver'])
  }
];

db.serialize(() => {
  // Migration columns check
  const columnsToAdd = [
    { name: 'slug', type: 'TEXT' },
    { name: 'short_description', type: 'TEXT' },
    { name: 'category_id', type: 'TEXT' },
    { name: 'categoryName', type: "TEXT DEFAULT 'General'" },
    { name: 'category_name', type: "TEXT DEFAULT 'General'" },
    { name: 'service_type', type: "TEXT DEFAULT 'standard'" },
    { name: 'original_price', type: 'REAL' },
    { name: 'icon', type: "TEXT DEFAULT 'Wrench'" },
    { name: 'badge', type: "TEXT DEFAULT ''" },
    { name: 'featured', type: 'INTEGER DEFAULT 0' },
    { name: 'popular', type: 'INTEGER DEFAULT 0' },
    { name: 'is_active', type: 'INTEGER DEFAULT 1' },
    { name: 'sort_order', type: 'INTEGER DEFAULT 0' },
    { name: 'available_cities', type: 'TEXT' },
    { name: 'tags', type: 'TEXT' },
    { name: 'created_at', type: 'TEXT' },
    { name: 'updated_at', type: 'TEXT' }
  ];

  columnsToAdd.forEach((col) => {
    db.run(`ALTER TABLE services ADD COLUMN ${col.name} ${col.type}`, () => {});
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT,
      short_description TEXT,
      description TEXT NOT NULL,
      category_id TEXT,
      categoryName TEXT NOT NULL,
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

  db.run(`
    CREATE TABLE IF NOT EXISTS service_features (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      feature TEXT NOT NULL
    )
  `);

  services.forEach((s) => {
    db.run(
      `INSERT OR REPLACE INTO services (
        id, name, slug, short_description, description, category_id, categoryName, category_name,
        service_type, price, original_price, duration, image, icon, badge,
        featured, popular, is_active, sort_order, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.id, s.name, s.slug, s.short_description, s.description, s.category_id, s.categoryName, s.categoryName,
        s.service_type, s.price, s.original_price, s.duration, s.image, s.icon, s.badge,
        s.featured, s.popular, s.is_active, s.sort_order, s.tags,
        new Date().toISOString(), new Date().toISOString()
      ]
    );

    // Seed Features
    const featList = JSON.parse(s.features);
    featList.forEach((f) => {
      db.run(
        'INSERT OR IGNORE INTO service_features (id, service_id, feature) VALUES (?, ?, ?)',
        [`sf_${s.id}_${Math.random().toString().slice(-4)}`, s.id, f]
      );
    });
  });

  console.log(`✅ Successfully seeded ${services.length} Executive Services with full metadata into homeseva.db.`);
});
