const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('homeseva.db');
db.run("ALTER TABLE vehicles ADD COLUMN created_at TEXT", (err) => {
  if (err) {
    if (err.message.includes('duplicate column')) {
      console.log('Column already exists!');
    } else {
      console.error('Error adding column:', err.message);
    }
  } else {
    console.log('Added created_at column to vehicles!');
  }
});
