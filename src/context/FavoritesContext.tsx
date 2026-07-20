import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface Favorite {
  id: string;
  user_id: string;
  item_id: string;
  item_type: 'service' | 'store_product';
  created_at: string;
}

interface FavoritesContextType {
  favorites: Favorite[];
  isFavorite: (itemId: string) => boolean;
  toggleFavorite: (itemId: string, itemType: 'service' | 'store_product') => Promise<void>;
  loadingFavs: boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoadingFavs(false);
      return;
    }
    try {
      setLoadingFavs(true);
      const data = await apiClient.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error('Failed to fetch favorites', err);
    } finally {
      setLoadingFavs(false);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [user]);

  const isFavorite = (itemId: string) => {
    return favorites.some(f => f.item_id === itemId);
  };

  const toggleFavorite = async (itemId: string, itemType: 'service' | 'store_product') => {
    if (!user) {
      toast('Please login to save favorites', 'error');
      return;
    }
    const isFav = isFavorite(itemId);
    
    // Optimistic update
    if (isFav) {
      setFavorites(prev => prev.filter(f => f.item_id !== itemId));
    } else {
      setFavorites(prev => [{ id: 'temp', user_id: user.id, item_id: itemId, item_type: itemType, created_at: new Date().toISOString() }, ...prev]);
    }

    try {
      if (isFav) {
        await apiClient.removeFavorite(itemId, itemType);
      } else {
        await apiClient.addFavorite(itemId, itemType);
      }
      // Re-fetch to get accurate IDs if needed
      await refreshFavorites();
    } catch (err) {
      // Revert on error
      await refreshFavorites();
      toast('Failed to update favorite', 'error');
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loadingFavs, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
