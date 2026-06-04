import { PlayerState } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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

			// 🟢 ১. নতুন স্টেট যুক্ত করা হলো (আপনার টাইপ ডেফিনিশন অনুযায়ী ভ্যালু 'grid' বা 'list' হতে পারে)
			viewMode: "grid",

			setChannels: (channels) =>
				set((state) => ({
					channels,
					currentChannel:
						state.currentChannel?.url ?
							state.currentChannel
						:	channels[0] || state.currentChannel,
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

			// 🟢 ২. ভিউ মোড পরিবর্তন করার ফাংশন যুক্ত করা হলো
			setViewMode: (viewMode) => set({ viewMode }),
		}),
		{
			name: "iptv-player-storage",
			partialize: (state) => ({
				currentChannel: state.currentChannel,
				favorites: state.favorites,
				recentChannels: state.recentChannels,
				// অপশনাল: ইউজার যদি চান পেজ রিফ্রেশ করলেও তার গ্রিড/লিস্ট ভিউ সিলেকশন বজায় থাকুক, তবে নিচের লাইনটি আনকমেন্ট করুন
				// viewMode: state.viewMode,
			}),
		}
	)
);
