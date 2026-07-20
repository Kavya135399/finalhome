const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'server', 'index.js');

let content = fs.readFileSync(p, 'utf8');
if (content.includes('\0')) content = fs.readFileSync(p, 'utf16le');

if (!content.includes('/api/vehicles')) {
  const vehicleEndpoints = `
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
`;

  content = content.replace('// Start Express server', vehicleEndpoints + '\n\n// Start Express server');
  fs.writeFileSync(p, content, 'utf8');
  console.log('Appended vehicles endpoints successfully.');
} else {
  console.log('Vehicle endpoints already exist.');
}
