const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'DashboardPage.tsx');
const content = fs.readFileSync(p, 'utf-16le');
fs.writeFileSync(p, content, 'utf8');
