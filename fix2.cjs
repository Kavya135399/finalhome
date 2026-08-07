const fs = require('fs');
let code = fs.readFileSync('src/pages/MealsPage.tsx', 'utf-8');

code = code.replace(/apiClient\.createStoreOrder\(/g, 'apiClient.createStoreCheckoutSession(');
code = code.replace(/const applyCoupon = async \(\) => {/g, 'const applyCoupon = async (codeStr: string = coupon) => {');
code = code.replace(/if \(coupon.trim/g, 'if (codeStr.trim');
code = code.replace(/setAppliedCouponCode\(coupon\)/g, 'setAppliedCouponCode(codeStr)');

fs.writeFileSync('src/pages/MealsPage.tsx', code);
console.log('Fixed final TS errors in MealsPage.tsx');
