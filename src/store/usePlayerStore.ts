import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Channel, PlayerState } from "@/types";

export const usePlayerStore = create<PlayerState>()(
	persist(
		(set) => ({
			channels: [],

			currentChannel: {
				name: "T Sports HD",
				url: "https://tvsen7.aynaott.com/tsports-hd/index.m3u8?e=1779283784&u=78be6644-0a65-48ec-81a4-089ac65a2619&token=3b4c5a2cfa872fa7f91ffbfb4aa0f658",
				logo: "https://s3.aynaott.com/storage/dbc585f70a60b9855b6e13a8ce4cb6f4",
				group: "Sports",
			},

			favorites: [],
			recentChannels: [],
			searchQuery: "",
			activeGroup: "All",

			// 🟢 ২. এখানেও সামান্য পরিবর্তন করতে হবে যেন প্লেলিস্ট লোড হলেও এটি মুছে না যায়
			setChannels: (channels) =>
				set((state) => ({
					channels,
					currentChannel: state.currentChannel || channels[0] || null,
				})),

			setCurrentChannel: (channel) => {
				set((state) => {
					const filteredRecents = state.recentChannels.filter(
						(c) => c.url !== channel.url
					);
					const newRecents = [channel, ...filteredRecents].slice(0, 10);
					return { currentChannel: channel, recentChannels: newRecents };
				});
			},

			toggleFavorite: (channel) => {
				set((state) => {
					const isFav = state.favorites.some((c) => c.url === channel.url);
					if (isFav) {
						return {
							favorites: state.favorites.filter((c) => c.url !== channel.url),
						};
					}
					return { favorites: [...state.favorites, channel] };
				});
			},

			setSearchQuery: (searchQuery) => set({ searchQuery }),
			setActiveGroup: (activeGroup) => set({ activeGroup }),
		}),
		{
			name: "iptv-player-storage",
			partialize: (state) => ({
				favorites: state.favorites,
				recentChannels: state.recentChannels,
			}),
		}
	)
);
