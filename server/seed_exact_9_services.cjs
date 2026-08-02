const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'homeseva.db');
const db = new sqlite3.Database(dbPath);

console.log('--- SEEDING EXACT 9 SCREENSHOT SERVICES INTO DATABASE ---');

const services = [
  {
    id: 's34',
    name: 'Key Holding & Surveillance',
    slug: 'key-holding-surveillance',
    short_description: 'Secure key custody, verified inspections and round-the-clock property surveillance.',
    description: 'Complete peace of mind with encrypted key custody, regular visual inspection checks, emergency response capability, and automated photo updates for your residential or commercial property.',
    category_id: 'c8',
    categoryName: 'Luxury Premium Package',
    service_type: 'standard',
    price: 1499,
    original_price: 1999,
    duration: 'Monthly plan',
    image: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&q=80&w=800',
    icon: 'Box',
    badge: '',
    featured: 1,
    popular: 1,
    is_active: 1,
    sort_order: 10,
    tags: JSON.stringify(['Security', 'Surveillance', 'Key Holding']),
    features: JSON.stringify(['Encrypted key custody', 'Weekly photo check-in', 'Emergency access protocol', 'Instant incident report'])
  },
  {
    id: 's35',
    name: 'Plumbing & Water Systems',
    slug: 'plumbing-water-systems',
    short_description: 'Comprehensive plumbing inspection, leak remediation and water tank pressure diagnostics.',
    description: 'Full-spectrum plumbing solutions by master plumbers covering piping system pressure testing, faucet restoration, leakage sealing, motor testing, and tank purification setup.',
    category_id: 'c5',
    categoryName: 'Plumbing',
    service_type: 'standard',
    price: 799,
    original_price: 1099,
    duration: '60-120 min',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&q=80&w=800',
    icon: 'Droplets',
    badge: '',
    featured: 0,
    popular: 0,
    is_active: 1,
    sort_order: 20,
    tags: JSON.stringify(['Plumbing', 'Water', 'Leakage', 'Pipes']),
    features: JSON.stringify(['Pressure testing', 'Complete leak sealing', 'Motor & valve inspection', 'Photo updates'])
  },
  {
    id: 's36',
    name: 'Electrical Repairs & Wiring',
    slug: 'electrical-repairs-wiring',
    short_description: 'Certified electrical troubleshooting, wiring upgrading, switch panel repairs and safety auditing.',
    description: 'Expert electrical intervention for short circuits, voltage fluctuations, wiring faults, circuit breaker recalibration, and complete room rewiring with certified safety equipment.',
    category_id: 'c6',
    categoryName: 'Electrical',
    service_type: 'standard',
    price: 699,
    original_price: 999,
    duration: '60-90 min',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=800',
    icon: 'Zap',
    badge: '',
    featured: 0,
    popular: 0,
    is_active: 1,
    sort_order: 30,
    tags: JSON.stringify(['Electrical', 'Wiring', 'MCB', 'Safety Audit']),
    features: JSON.stringify(['MCB & panel audit', 'Load distribution check', 'Faulty wire replacement', 'Safety certification'])
  },
  {
    id: 's37',
    name: 'AC Maintenance & HVAC',
    slug: 'ac-maintenance-hvac',
    short_description: 'Deep foam cooling coil wash, gas pressure restoration, refrigerant top-up and filter disinfection.',
    description: 'Preventative and diagnostic HVAC service by licensed cooling engineers. Includes hydro-pressure foam jet coil clean, condenser brushing, coolant leakage check, and airflow velocity tuning.',
    category_id: 'c6',
    categoryName: 'AC Repair',
    service_type: 'standard',
    price: 1199,
    original_price: 1599,
    duration: '90-120 min',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
    icon: 'Wind',
    badge: '',
    featured: 0,
    popular: 0,
    is_active: 1,
    sort_order: 40,
    tags: JSON.stringify(['AC Repair', 'Cooling', 'Gas Refill', 'HVAC']),
    features: JSON.stringify(['Hydro-foam jet clean', 'Gas pressure test', 'Cooling velocity tune-up', 'Sanitized filter treatment'])
  },
  {
    id: 's38',
    name: 'Artisan Painting & Touchups',
    slug: 'artisan-painting-touchups',
    short_description: 'Flawless wall touchups, dampness sealing, waterproof coating and accent wall artisan painting.',
    description: 'Premium interior paint restoration utilizing low-VOC luxury emulsion paints. Covers putty crack filling, damp resistant primer coating, texture matching, and spotless cleanup.',
    category_id: 'c8',
    categoryName: 'Painting',
    service_type: 'standard',
    price: 4500,
    original_price: 5999,
    duration: 'Full day',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800',
    icon: 'Paintbrush',
    badge: '',
    featured: 0,
    popular: 0,
    is_active: 1,
    sort_order: 50,
    tags: JSON.stringify(['Painting', 'Wall Repair', 'Waterproofing']),
    features: JSON.stringify(['Low-VOC premium paint', 'Crack putty sealing', 'Damp-proof undercoating', 'Zero-mess furniture masking'])
  },
  {
    id: 's39',
    name: 'Property Inspection Check',
    slug: 'property-inspection-check',
    short_description: 'Multi-point architectural, electrical and structural health evaluation with digital assessment report.',
    description: 'Exhaustive structural and appliance health evaluation covering moisture penetration, electrical load safety, plumbing integrity, pest presence, and detailed remediation cost estimation.',
    category_id: 'c8',
    categoryName: 'Inspection',
    service_type: 'standard',
    price: 999,
    original_price: 1499,
    duration: '60-90 min',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    icon: 'ClipboardCheck',
    badge: '',
    featured: 0,
    popular: 0,
    is_active: 1,
    sort_order: 60,
    tags: JSON.stringify(['Inspection', 'Audit', 'Health Check']),
    features: JSON.stringify(['40-point inspection list', 'Infrared leak checking', 'Detailed PDF health audit', 'Priority remediation rates'])
  },
  {
    id: 's40',
    name: 'Festival & Event Preparation',
    slug: 'festival-event-preparation',
    short_description: 'Pre-event whole villa deep sanitization, chandelier polishing, guest arrangement and decor assistance.',
    description: 'Make your home festival and guest ready in a single day. Includes complete floor scrubbing, glass polishing, upholstery steam treatment, kitchen degreasing, and event lighting checks.',
    category_id: 'c7',
    categoryName: 'Deep Cleaning',
    service_type: 'standard',
    price: 3999,
    original_price: 4999,
    duration: '4-6 hours',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800',
    icon: 'Sparkles',
    badge: '',
    featured: 1,
    popular: 1,
    is_active: 1,
    sort_order: 70,
    tags: JSON.stringify(['Festival', 'Cleaning', 'Event Prep']),
    features: JSON.stringify(['Villa steam disinfection', 'Chandelier & glass polish', 'Guest area staging', 'Pantry intensive clean'])
  },
  {
    id: 's41',
    name: 'Emergency Support & Assistance',
    slug: 'emergency-support-assistance',
    short_description: 'Rapid deployment for severe plumbing flooding, power blackout restoration and critical home emergencies.',
    description: 'Priority emergency response dispatch within 45 minutes for critical household disruptions including electrical breakdown, pipe bursts, lockouts, and storm leakage abatement.',
    category_id: 'c8',
    categoryName: 'Emergency',
    service_type: 'standard',
    price: 1999,
    original_price: 2499,
    duration: 'Instant response',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    icon: 'PhoneCall',
    badge: '',
    featured: 0,
    popular: 0,
    is_active: 1,
    sort_order: 80,
    tags: JSON.stringify(['Emergency', 'Rapid Response', '24/7']),
    features: JSON.stringify(['45-minute rapid dispatch', 'Master technician on call', 'Emergency mitigation tools', 'Post-crisis clean-up'])
  },
  {
    id: 's42',
    name: 'Premium Deep Cleaning',
    slug: 'premium-deep-cleaning',
    short_description: 'Hospital-grade sanitization using eco-friendly solutions, high-powered suction and stain excavation.',
    description: 'Executive home restoration featuring German cleaning technology. Deep mattress dust-mite evacuation, bathroom descaling, grout whitening, kitchen degreasing, and air sanitization.',
    category_id: 'c7',
    categoryName: 'Deep Cleaning',
    service_type: 'standard',
    price: 2999,
    original_price: 3999,
    duration: '4-6 hours',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    icon: 'Sparkles',
    badge: '',
    featured: 1,
    popular: 1,
    is_active: 1,
    sort_order: 90,
    tags: JSON.stringify(['Cleaning', 'Deep Clean', 'Sanitization']),
    features: JSON.stringify(['German equipment suction', 'Eco-certified detergents', 'Mattress mite evacuation', 'Complete tile descaling'])
  }
];

db.serialize(() => {
  // Clear services table first so we have clean, exact dataset
  db.run('DELETE FROM services');
  db.run('DELETE FROM service_features');

  services.forEach((s) => {
    db.run(
      `INSERT INTO services (
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

    const featList = JSON.parse(s.features);
    featList.forEach((f) => {
      db.run(
        'INSERT INTO service_features (id, service_id, feature) VALUES (?, ?, ?)',
        [`sf_${s.id}_${Math.random().toString().slice(-4)}`, s.id, f]
      );
    });
  });

  console.log(`✅ Successfully seeded EXACT 9 SCREENSHOT SERVICES into homeseva.db!`);
});
