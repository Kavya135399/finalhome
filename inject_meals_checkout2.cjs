const fs = require('fs');
const path = require('path');

const mealsFile = path.join(__dirname, 'src', 'pages', 'MealsPage.tsx');
let mealsCode = fs.readFileSync(mealsFile, 'utf8');

const storeFile = path.join(__dirname, 'src', 'pages', 'StorePage.tsx');
const storeCode = fs.readFileSync(storeFile, 'utf8');

const sheetStartStr = '4-STEP STORE CHECKOUT WIZARD';
const sheetStartIndex = storeCode.indexOf(sheetStartStr);
const actualStart = storeCode.lastIndexOf('{/*', sheetStartIndex);
const sheetEndIndex = storeCode.lastIndexOf('</BottomSheet>') + 14;

let sheetsBlock = storeCode.substring(actualStart, sheetEndIndex);

sheetsBlock = sheetsBlock.replace(/cart\.length/g, 'mealCart.length');
sheetsBlock = sheetsBlock.replace(/cart\.map/g, 'mealCart.map');
sheetsBlock = sheetsBlock.replace(/cart\.reduce/g, 'mealCart.reduce');
sheetsBlock = sheetsBlock.replace(/item\.product\.name/g, 'item.meal.name');
sheetsBlock = sheetsBlock.replace(/item\.product\.image/g, 'item.meal.image');
sheetsBlock = sheetsBlock.replace(/item\.product\.price/g, 'item.meal.price');
sheetsBlock = sheetsBlock.replace(/item\.product\.id/g, 'item.meal.id');
sheetsBlock = sheetsBlock.replace(/item\.product/g, 'item.meal');
sheetsBlock = sheetsBlock.replace(/updateQty\(/g, 'updateMealQty(');
sheetsBlock = sheetsBlock.replace(/setCart\(\[\]\)/g, 'setMealCart([])');
sheetsBlock = sheetsBlock.replace(/removeFromCart\(item\.meal\.id\)/g, 'updateMealQty(item.meal.id, -item.qty)');

const stickyBottomBar = `
      {/* Sticky Bottom Bar */}
      {cartCount > 0 && sheet === 'none' && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
          className="fixed bottom-20 left-4 right-4 z-30 max-w-lg mx-auto">
          <div className="bg-amber-600 rounded-2xl shadow-xl shadow-amber-600/30 p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
               onClick={() => setSheet('cart')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white relative">
                <CookingPot className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-white text-amber-700 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              </div>
              <div className="flex flex-col text-white">
                <span className="text-xs font-semibold opacity-90">{cartCount} items selected</span>
                <span className="font-black text-lg leading-none">₹{total}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-white font-bold bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
              View Cart <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      )}
`;

// we need to inject stickyBottomBar and sheetsBlock just before the final `    </div>\n  );\n}`
// let's use a regex to replace the last `</div>` block, regardless of newlines.

const injection = stickyBottomBar + '\n' + sheetsBlock;

// match the very end of the file
const regex = /<\/div>\s*\);\s*}\s*$/;
if (regex.test(mealsCode)) {
  mealsCode = mealsCode.replace(regex, injection + '\n    </div>\n  );\n}\n');
  fs.writeFileSync(mealsFile, mealsCode);
  console.log('Successfully injected BottomSheets into MealsPage.tsx');
} else {
  console.log('Regex did not match the end of MealsPage.tsx');
}
