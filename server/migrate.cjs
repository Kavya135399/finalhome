const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'homeseva.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("ALTER TABLE store_orders ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'pending'", (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column already exists.');
      } else {
        console.error('Error:', err.message);
      }
    } else {
      console.log('Column verification_status added successfully.');
    }
  });
});

db.close();
