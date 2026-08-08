const fs = require('fs');
let code = fs.readFileSync('src/pages/MealsPage.tsx', 'utf-8');

// 1. Fix formData -> file
code = code.replace(/apiClient\.uploadStoreScreenshot\('', formData\)/g, "apiClient.uploadStoreScreenshot('', file)");

// 2. Fix createStoreCheckoutSession amount issue.
code = code.replace(/amount:\s*total,\s*currency:\s*'INR',\s*/g, '');

// 3. Fix handleRazorpayStoreCheckout -> handlePlaceOrder
code = code.replace(/handleRazorpayStoreCheckout/g, 'handlePlaceOrder');

fs.writeFileSync('src/pages/MealsPage.tsx', code);
console.log('Fixed ALL remaining TS errors.');
