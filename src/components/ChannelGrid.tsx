'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import ChannelCard from './ChannelCard';
import { Search } from 'lucide-react';

export default function ChannelGrid() {
  const { channels, searchQuery, activeGroup, favorites } = usePlayerStore();
  const [displayCount, setDisplayCount] = useState(50);

  const filteredChannels = useMemo(() => {
    let result = channels;
    
    if (activeGroup === 'Favorites') {
      result = favorites;
    } else if (activeGroup !== 'All') {
      result = result.filter(c => c.group === activeGroup);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [channels, searchQuery, activeGroup, favorites]);

  useEffect(() => {
    setDisplayCount(50);
  }, [searchQuery, activeGroup]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 400;
    if (bottom && displayCount < filteredChannels.length) {
      setDisplayCount(prev => prev + 50);
    }
  };

  if (filteredChannels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center flex-1">
        <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-5 border border-zinc-700/50 shadow-inner">
          <Search className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-xl font-semibold text-zinc-200 tracking-tight">No channels found</h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-[200px]">Try adjusting your search or category filter</p>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-y-auto px-4 pb-6 pt-2 space-y-2 custom-scrollbar scroll-smooth"
      onScroll={handleScroll}
    >
      <div className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-md pb-3 pt-1 text-xs font-bold text-zinc-400 uppercase tracking-widest flex justify-between items-center px-1">
        <span>{activeGroup === 'All' ? 'All Channels' : activeGroup}</span>
        <span className="bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full text-[10px] border border-zinc-700/50">{filteredChannels.length}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
        {filteredChannels.slice(0, displayCount).map((channel, idx) => (
          <ChannelCard key={`${channel.url}-${idx}`} channel={channel} />
        ))}
      </div>
    </div>
  );
}
