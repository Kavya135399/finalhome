const fs = require('fs');
let code = fs.readFileSync('src/pages/MealsPage.tsx', 'utf-8');

// Remove duplicate CookingPot
code = code.replace(/import { CookingPot, MapPin, Search } from 'lucide-react';/g, "import { MapPin, Search } from 'lucide-react';");

// Fix amount issue
code = code.replace(/apiClient\.createStoreCheckoutSession\(\{ amount: total \}\);/g, "apiClient.createStoreCheckoutSession({\n" +
    "          items: mealCart.map(i => ({ id: i.meal.id, name: i.meal.name, quantity: i.qty, price: i.meal.price })),\n" +
    "          address: addrForm,\n" +
    "          subtotal,\n" +
    "          delivery_fee: deliveryFee,\n" +
    "          platform_fee: storeSettings.platform_fee,\n" +
    "          gst: 0,\n" +
    "          coupon: appliedCouponCode || undefined,\n" +
    "          discount,\n" +
    "          total,\n" +
    "          payment_method: 'razorpay'\n" +
    "        });");

// Fix ChevronRight and Tag missing
code = code.replace(/import { ChevronLeft, ChevronRight, Tag, X, /g, "import { ChevronLeft, X, "); // undo from fix_all
code = code.replace(/import { Plus, Minus, CheckCircle2, CookingPot, ChevronLeft, /g, "import { Plus, Minus, CheckCircle2, CookingPot, ChevronLeft, ChevronRight, Tag, ");

fs.writeFileSync('src/pages/MealsPage.tsx', code);
console.log('Fixed last TS errors');
