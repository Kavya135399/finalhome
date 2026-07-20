const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'homeseva.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Tables:');
      rows.forEach((row) => {
        console.log(row.name);
      });
    }
  });
});
db.close();
