import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat, Utensils, Plus, Minus, Check, Calendar, Users, Phone, MapPin,
  Sparkles, ArrowRight, ArrowLeft, Clock, ShieldCheck, CreditCard,
  Heart, ShoppingCart, Search, UtensilsCrossed, CookingPot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export interface MealItem {
  id: string;
  name: string;
  category: string;
  caterer: string;
  foodType: 'veg' | 'nonveg' | 'jain';
  rating: number;
  reviews: number;
  prepTime: string;
  calories: number;
  serves: string;
  price: number;
  originalPrice: number;
  image: string;
  description: string;
  popular?: boolean;
  bestseller?: boolean;
  discountBadge?: string;
  ingredients: string[];
  nutrition: { calories: number; protein: string; carbs: string; fat: string };
  spiceLevel: 'Mild' | 'Medium' | 'Spicy';
}

const SAMPLE_MEALS: MealItem[] = [
  {
    id: 'm1',
    name: 'Kathiyawadi Gourmet Gujarati Thali',
    category: 'Gujarati',
    caterer: 'MasterChef Rajesh Kumar',
    foodType: 'veg',
    rating: 4.9,
    reviews: 1240,
    prepTime: '25 min',
    calories: 480,
    serves: '1 Person',
    price: 199,
    originalPrice: 250,
    discountBadge: '20% OFF',
    popular: true,
    bestseller: true,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
    description: 'Authentic Kathiyawadi thali featuring Sev Tameta, Ringan Bharta, Phulka Roti, Dal Rice, and Fresh Chaas.',
    ingredients: ['Paneer', 'Cashews', 'Ghee', 'Pure Spices', 'Basmati Rice', 'Curd'],
    nutrition: { calories: 480, protein: '16g', carbs: '62g', fat: '18g' },
    spiceLevel: 'Medium',
  },
  {
    id: 'm2',
    name: 'Royal Punjabi Butter Paneer & Naan Combo',
    category: 'North Indian',
    caterer: 'Amritsari Tadka Caterers',
    foodType: 'veg',
    rating: 4.8,
    reviews: 980,
    prepTime: '30 min',
    calories: 620,
    serves: '1-2 Persons',
    price: 249,
    originalPrice: 299,
    discountBadge: 'POPULAR',
    popular: true,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=800',
    description: 'Rich Creamy Shahi Paneer Butter Masala served with 2 Butter Garlic Naan and Jeera Rice.',
    ingredients: ['Fresh Cottage Cheese', 'Butter', 'Tomato Gravy', 'Garlic', 'Basmati Rice'],
    nutrition: { calories: 620, protein: '22g', carbs: '70g', fat: '28g' },
    spiceLevel: 'Mild',
  },
  {
    id: 'm3',
    name: 'Healthy Protein Quinoa & Grilled Veggie Bowl',
    category: 'Healthy Meals',
    caterer: 'NutriFit Kitchens',
    foodType: 'veg',
    rating: 4.9,
    reviews: 650,
    prepTime: '15 min',
    calories: 380,
    serves: '1 Person',
    price: 220,
    originalPrice: 280,
    discountBadge: 'HEALTHY',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    description: 'High-protein organic quinoa bowl topped with avocado, roasted chickpeas, broccoli, and lemon tahini dressing.',
    ingredients: ['Organic Quinoa', 'Avocado', 'Broccoli', 'Chickpeas', 'Tahini'],
    nutrition: { calories: 380, protein: '18g', carbs: '45g', fat: '12g' },
    spiceLevel: 'Mild',
  },
  {
    id: 'm4',
    name: 'South Indian Mini Tiffin Feast',
    category: 'South Indian',
    caterer: 'Madras Special Tiffin',
    foodType: 'veg',
    rating: 4.7,
    reviews: 1120,
    prepTime: '20 min',
    calories: 410,
    serves: '1 Person',
    price: 175,
    originalPrice: 220,
    discountBadge: '15% OFF',
    bestseller: true,
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=800',
    description: 'Assorted 2 Ghee Mini Idlis, 1 Medu Vada, Mini Masala Dosa, Piping Hot Sambar & 3 Chutneys.',
    ingredients: ['Fermented Rice & Lentil Batter', 'Pure Ghee', 'Fresh Coconut', 'Curry Leaves'],
    nutrition: { calories: 410, protein: '14g', carbs: '65g', fat: '10g' },
    spiceLevel: 'Medium',
  },
  {
    id: 'm5',
    name: 'Family Celebration Meal Box (Serves 4-5)',
    category: 'Family Pack',
    caterer: 'HomeSeva Signature Kitchen',
    foodType: 'veg',
    rating: 4.9,
    reviews: 2150,
    prepTime: '40 min',
    calories: 1200,
    serves: '4-5 Persons',
    price: 799,
    originalPrice: 999,
    discountBadge: 'SAVE ₹200',
    popular: true,
    bestseller: true,
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=800',
    description: 'Grand family feast box: Paneer Tikka Masala, Dal Makhani, 8 Butter Phulkas, Veg Pulao, Gulab Jamun & Salad.',
    ingredients: ['Paneer', 'Black Lentils', 'Basmati Rice', 'Whole Wheat', 'Khoya'],
    nutrition: { calories: 1200, protein: '48g', carbs: '140g', fat: '52g' },
    spiceLevel: 'Medium',
  },
  {
    id: 'm6',
    name: 'Jain Shuddh Special Satvik Thali',
    category: 'Jain',
    caterer: 'Satvik Pure Jain Caterers',
    foodType: 'jain',
    rating: 4.9,
    reviews: 890,
    prepTime: '25 min',
    calories: 450,
    serves: '1 Person',
    price: 210,
    originalPrice: 260,
    discountBadge: 'PURE SATVIK',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
    description: 'No onion, no garlic, 100% Jain Satvik thali with Gatte ki Sabzi, Paneer Makhhania, Phulkas, and Kheer.',
    ingredients: ['Gram Flour Gatta', 'Fresh Cottage Cheese', 'Cow Ghee', 'Cumin', 'Rock Salt'],
    nutrition: { calories: 450, protein: '17g', carbs: '58g', fat: '16g' },
    spiceLevel: 'Mild',
  },
];

const CATEGORIES = ['All', 'Daily Meals', 'Healthy Meals', 'Family Pack', 'Gujarati', 'North Indian', 'South Indian', 'Jain'];
const CAT_EMOJI: Record<string, string> = { All: '🍛', 'Daily Meals': '🍱', 'Healthy Meals': '🥗', 'Family Pack': '👨‍👩‍👧‍👦', Gujarati: '🫓', 'North Indian': '🥘', 'South Indian': '🫓', Jain: '🟡' };

export function MealsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [foodTypeFilter, setFoodTypeFilter] = useState<'all' | 'veg' | 'nonveg' | 'jain'>('all');
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Cart
  const [mealCart, setMealCart] = useState<{ meal: MealItem; qty: number }[]>(() => {
    try {
      const stored = localStorage.getItem('homeseva_meal_cart');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [dbMeals, setDbMeals] = useState<MealItem[]>(SAMPLE_MEALS);

  useEffect(() => {
    try {
      localStorage.setItem('homeseva_meal_cart', JSON.stringify(mealCart));
    } catch (e) {}
  }, [mealCart]);

  useEffect(() => {
    fetchMealsFromApi();
  }, [activeCategory, foodTypeFilter]);

  const fetchMealsFromApi = async () => {
    try {
      let url = `/api/meals?food_type=${foodTypeFilter}`;
      if (activeCategory !== 'All' && activeCategory !== 'Favorites') {
        url += `&category=${encodeURIComponent(activeCategory)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDbMeals(data.length > 0 ? data : SAMPLE_MEALS);
        }
      }
    } catch (e) {
      console.error('API fetch error for meals:', e);
    }
  };

  const addToMealCart = (meal: MealItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMealCart((prev) => {
      const existing = prev.find((item) => item.meal.id === meal.id);
      if (existing) {
        return prev.map((item) => (item.meal.id === meal.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { meal, qty: 1 }];
    });
    toast(`${meal.name} added to cart!`, 'success');
  };

  const updateMealQty = (mealId: string, delta: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setMealCart((prev) => {
      return prev
        .map((item) => {
          if (item.meal.id === mealId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { meal: MealItem; qty: number }[];
    });
  };

  const cartCount = mealCart.reduce((sum, item) => sum + item.qty, 0);

  const filteredMeals = dbMeals.filter((m) => {
    if (activeCategory === 'Favorites') {
      return wishlist.includes(m.id) && (!searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    const matchesSearch =
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.caterer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === 'All' || m.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesFoodType = foodTypeFilter === 'all' || m.foodType === foodTypeFilter;

    return matchesSearch && matchesCategory && matchesFoodType;
  });

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-slate-950 min-h-screen pb-28 select-none">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800/60 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-4 pb-3.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 shrink-0 drop-shadow-2xs" />
              <div>
                <span className="text-[11px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 leading-tight block">Delivering to</span>
                <h2 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white leading-snug tracking-tight">Patan, Gujarat</h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/catering')}
                className="px-3.5 py-2 rounded-xl border border-amber-200 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition shadow-2xs flex items-center gap-1.5"
              >
                <ChefHat className="w-4 h-4 text-amber-600" />
                <span>Catering Packages</span>
              </button>
              <button
                onClick={() => cartCount > 0 && setIsCartOpen(true)}
                className="relative w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition border border-gray-200 dark:border-slate-700/80"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mb-3.5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search daily meals, thali, tiffin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 sm:h-12 pl-11 pr-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-800 dark:text-white placeholder-gray-400 outline-none focus:border-amber-500 focus:bg-white transition shadow-xs"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar pb-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold border transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-gray-300'
                }`}
              >
                <span>{CAT_EMOJI[cat] || '🍛'}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-6 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
            {activeCategory} Daily Meals & Tiffins ({filteredMeals.length})
          </h3>

          <div className="flex items-center gap-1.5">
            {(['all', 'veg', 'nonveg', 'jain'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFoodTypeFilter(type)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                  foodTypeFilter === type
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-gray-500 border border-gray-200 dark:border-slate-800'
                }`}
              >
                {type === 'veg' ? '🟢 Veg' : type === 'nonveg' ? '🔴 Non-Veg' : type === 'jain' ? '🟡 Jain' : 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {filteredMeals.map((meal) => {
            const inCart = mealCart.find((i) => i.meal.id === meal.id);
            const qty = inCart ? inCart.qty : 0;
            return (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-150 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <img src={meal.image} alt={meal.name} className="w-full h-36 sm:h-40 object-cover" />
                <div className="p-3 flex flex-col flex-1">
                  <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider mb-0.5">{meal.category}</p>
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white leading-snug line-clamp-2 flex-1">{meal.name}</h4>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-slate-800/60">
                    <span className="font-black text-sm text-gray-900 dark:text-white">₹{meal.price}</span>
                    {qty === 0 ? (
                      <button
                        onClick={(e) => addToMealCart(meal, e)}
                        className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black px-3 py-1.5 rounded-xl transition shadow-2xs"
                      >
                        <Plus className="w-3 h-3" /> ADD
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-amber-600 rounded-xl px-1.5 py-1 text-white">
                        <button onClick={(e) => updateMealQty(meal.id, -1, e)} className="w-4 h-4 flex items-center justify-center font-black"><Minus className="w-2.5 h-2.5" /></button>
                        <span className="font-black text-xs min-w-[12px] text-center">{qty}</span>
                        <button onClick={(e) => updateMealQty(meal.id, 1, e)} className="w-4 h-4 flex items-center justify-center font-black"><Plus className="w-2.5 h-2.5" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
