const fs = require('fs');
let code = fs.readFileSync('src/pages/MealsPage.tsx', 'utf-8');

// fix_meals_ts.cjs
code = code.replace(/apiClient\.getAddresses\(\)/g, 'apiClient.getStoreAddresses()');
code = code.replace(/apiClient\.addAddress\(/g, 'apiClient.addStoreAddress(');
code = code.replace(/user\?\.mobile/g, 'user?.phone');
code = code.replace(/addToCart\(/g, 'addToMealCart(');
code = code.replace(/apiClient\.uploadStoreScreenshot\(formData\)/g, "apiClient.uploadStoreScreenshot('', formData)");
code = code.replace(/orderDetails:\s*order/g, 'orderDetails: {}');
code = code.replace(/razorpay_signature:\s*sig\s*}\)/g, 'razorpay_signature: sig, orderDetails: {} })');
code = code.replace(/ChevronLeft,\s*ChevronRight,/g, 'ChevronLeft, ChevronRight, Tag,');

const couponStates = `
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  
  const applyCoupon = async (codeStr = coupon) => {
    setValidatingCoupon(true);
    setTimeout(() => {
      setValidatingCoupon(false);
      if (codeStr.trim().length > 2) {
        setDiscount(20);
        setCouponApplied(true);
        setAppliedCouponCode(codeStr);
      }
    }, 1000);
  };
  
  const removeCoupon = () => {
    setCoupon('');
    setDiscount(0);
    setCouponApplied(false);
    setAppliedCouponCode('');
  };
`;
code = code.replace(/const handlePlaceOrder = async \(\) => {/, couponStates + '\n  const handlePlaceOrder = async () => {');

// fix2.cjs + fix3.cjs
code = code.replace(/apiClient\.createStoreCheckout\(/g, 'apiClient.createStoreCheckoutSession(');
code = code.replace(/apiClient\.uploadStoreScreenshot\('', formData\)/g, "apiClient.uploadStoreScreenshot('', file)");
code = code.replace(/amount:\s*total,\s*currency:\s*'INR',\s*/g, '');
code = code.replace(/handleRazorpayStoreCheckout/g, 'handlePlaceOrder');

// Fix the heading!
const headingPattern = /<h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">\s*\{activeCategory\} Daily Meals & Tiffins \(\{filteredMeals\.length\}\)\s*<\/h3>/g;
code = code.replace(headingPattern, '');

// Also change justify-between to justify-end for the flex container
code = code.replace(/<div className="flex items-center justify-between mb-4">\s*<div className="flex items-center gap-1\.5">/g, '<div className="flex items-center justify-end mb-4">\n          <div className="flex items-center gap-1.5">');

fs.writeFileSync('src/pages/MealsPage.tsx', code);
console.log('Successfully ran all fixes and removed heading');
