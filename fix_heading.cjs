const fs = require('fs');
let code = fs.readFileSync('src/pages/MealsPage.tsx', 'utf-8');

const brokenSegment = `          </div>
                className={\`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition \${
                  foodTypeFilter === type
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-gray-500 border border-gray-200 dark:border-slate-800'
                }\`}
              >
                {type === 'veg' ? '🟢 Veg' : type === 'nonveg' ? '🔴 Non-Veg' : type === 'jain' ? '🟡 Jain' : 'All'}
              </button>
            ))}
          </div>
        </div>`;

const fixedSegment = `          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-6 flex-1 w-full space-y-6">
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center gap-1.5">
            {(['all', 'veg', 'nonveg', 'jain'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFoodTypeFilter(type)}
                className={\`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition \${
                  foodTypeFilter === type
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-gray-500 border border-gray-200 dark:border-slate-800'
                }\`}
              >
                {type === 'veg' ? '🟢 Veg' : type === 'nonveg' ? '🔴 Non-Veg' : type === 'jain' ? '🟡 Jain' : 'All'}
              </button>
            ))}
          </div>
        </div>`;

if (code.includes(brokenSegment)) {
    code = code.replace(brokenSegment, fixedSegment);
    fs.writeFileSync('src/pages/MealsPage.tsx', code);
    console.log('Fixed MealsPage.tsx successfully.');
} else {
    console.log('Could not find broken segment.');
}
