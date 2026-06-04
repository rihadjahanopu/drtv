export interface Channel {
  name: string;
  logo: string;
  group: string;
  url: string;
}

export interface PlayerState {
  channels: Channel[];
  currentChannel: Channel | null;
  favorites: Channel[];
  recentChannels: Channel[];
  searchQuery: string;
  activeGroup: string;
  
  setChannels: (channels: Channel[]) => void;
  setCurrentChannel: (channel: Channel) => void;
  toggleFavorite: (channel: Channel) => void;
  setSearchQuery: (query: string) => void;
  setActiveGroup: (group: string) => void;
}
