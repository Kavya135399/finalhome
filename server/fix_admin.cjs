const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'homeseva.db'));

db.serialize(() => {
  db.run("UPDATE users SET is_verified = 1, status = 'active' WHERE role = 'admin' OR email IN ('admin@example.com', 'vikram@example.com', 'rajesh@example.com')", function(err) {
    if (err) {
      console.error('Error updating DB:', err.message);
    } else {
      console.log('Successfully verified admin & demo accounts! Rows updated:', this.changes);
    }
  });
});

db.close();
