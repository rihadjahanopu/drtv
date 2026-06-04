import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Channel, PlayerState } from '@/types';

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      channels: [],
      currentChannel: null,
      favorites: [],
      recentChannels: [],
      searchQuery: '',
      activeGroup: 'All',

      setChannels: (channels) => set({ channels }),
      
      setCurrentChannel: (channel) => {
        set((state) => {
          const filteredRecents = state.recentChannels.filter(c => c.url !== channel.url);
          const newRecents = [channel, ...filteredRecents].slice(0, 10);
          return { currentChannel: channel, recentChannels: newRecents };
        });
      },

      toggleFavorite: (channel) => {
        set((state) => {
          const isFav = state.favorites.some(c => c.url === channel.url);
          if (isFav) {
            return { favorites: state.favorites.filter(c => c.url !== channel.url) };
          }
          return { favorites: [...state.favorites, channel] };
        });
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setActiveGroup: (activeGroup) => set({ activeGroup }),
    }),
    {
      name: 'iptv-player-storage',
      partialize: (state) => ({ 
        favorites: state.favorites,
        recentChannels: state.recentChannels 
      }),
    }
  )
);
