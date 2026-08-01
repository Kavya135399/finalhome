const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8');

const regex = /app\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g;
let match;
console.log('--- ALL API ROUTES IN SERVER/INDEX.JS ---');
while ((match = regex.exec(content)) !== null) {
  console.log(`${match[1].toUpperCase().padEnd(6)} -> ${match[2]}`);
}

const tableRegex = /CREATE TABLE IF NOT EXISTS ([a-z0-9_]+)/gi;
console.log('\n--- ALL DB TABLES CREATED IN SERVER/INDEX.JS ---');
while ((match = tableRegex.exec(content)) !== null) {
  console.log(`TABLE -> ${match[1]}`);
}
