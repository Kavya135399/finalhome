const fs = require('fs');
const path = require('path');

const historyDir = 'C:\\Users\\Parmar Trupti\\AppData\\Roaming\\Code\\User\\History';
let latestEntry = null;
let latestTime = 0;

try {
  const folders = fs.readdirSync(historyDir);
  for (const folder of folders) {
    const entriesPath = path.join(historyDir, folder, 'entries.json');
    if (fs.existsSync(entriesPath)) {
      const data = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
      if (data.resource && data.resource.includes('DashboardPage.tsx')) {
        const entries = data.entries || [];
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          if (lastEntry.timestamp > latestTime) {
            latestTime = lastEntry.timestamp;
            latestEntry = path.join(historyDir, folder, lastEntry.id);
          }
        }
      }
    }
  }
} catch (e) {
  console.error(e);
}

if (latestEntry) {
  console.log('Found:', latestEntry);
  const content = fs.readFileSync(latestEntry, 'utf8');
  fs.writeFileSync('e:\\homesevaa\\finalhome\\src\\pages\\DashboardPage.tsx', content);
  console.log('Restored DashboardPage.tsx from history.');
} else {
  console.log('Not found in history.');
}
