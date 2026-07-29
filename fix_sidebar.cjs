const fs = require('fs');
const path = 'src/pages/AdminDashboardPage.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `<div className="p-4 space-y-4">
          <div className="hidden md:flex items-center gap-2 mb-6 select-none pl-2">`;
          
const replacement = `<div className="p-4 space-y-4 flex-1 overflow-y-auto no-scrollbar">
          <div className="hidden md:flex items-center gap-2 mb-6 select-none pl-2">`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
console.log("Replaced successfully!");
