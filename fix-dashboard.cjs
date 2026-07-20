const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, 'src', 'pages', 'DashboardPage.tsx');
let content = fs.readFileSync(p, 'utf8');

// 1. Add import
if (!content.includes('useFavorites')) {
  content = content.replace(
    "import { useAuth } from '../context/AuthContext';",
    "import { useAuth } from '../context/AuthContext';\nimport { useFavorites } from '../context/FavoritesContext';"
  );
}

// 2. Replace local state with context
content = content.replace(
  "const [favorites, setFavorites] = useState<string[]>(['s1', 's5']);",
  "const { favorites, isFavorite, toggleFavorite } = useFavorites();"
);

// 3. Remove local toggleFavorite function
content = content.replace(
  `  const toggleFavorite = (id: string) => {\n    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));\n  };`,
  ""
);

// 4. Update favoriteServices logic
content = content.replace(
  "const favoriteServices = services.filter((s) => favorites.includes(s.id));",
  "const favoriteServices = services.filter((s) => isFavorite(s.id));"
);

fs.writeFileSync(p, content, 'utf8');
console.log('Fixed dashboard');
