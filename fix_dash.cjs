const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'DashboardPage.tsx');
let content = fs.readFileSync(p, 'utf8');

// Fix the toggleFavorite calls
content = content.replace(/toggleFavorite\(s\.id\)/g, "toggleFavorite(s.id, 'service')");
content = content.replace(/toggleFavorite\(p\.id\)/g, "toggleFavorite(p.id, 'store_product')");

// Fix the rupee symbol if it got mangled
content = content.replace(/Γé╣/g, '₹');

fs.writeFileSync(p, content, 'utf8');
