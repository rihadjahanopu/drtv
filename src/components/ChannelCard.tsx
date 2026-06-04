'use client';

import React from 'react';
import { Channel } from '@/types';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';
import { Heart, Play } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface ChannelCardProps {
  channel: Channel;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  const { currentChannel, setCurrentChannel, toggleFavorite, favorites } = usePlayerStore();
  const isSelected = currentChannel?.url === channel.url;
  const isFavorite = favorites.some((c) => c.url === channel.url);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '100px 0px',
  });

  return (
    <div
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border",
        isSelected 
          ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
          : "hover:bg-zinc-800/80 hover:border-zinc-700 bg-zinc-900/50 border-transparent backdrop-blur-sm"
      )}
      onClick={() => setCurrentChannel(channel)}
    >
      <div ref={ref} className="relative w-16 h-16 rounded-lg bg-zinc-950/50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-800/80 shadow-inner">
        {inView && channel.logo ? (
          <img 
            src={channel.logo} 
            alt={channel.name} 
            className="w-full h-full object-contain p-2 drop-shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM1MjUyNWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIyIiB5PSI3IiB3aWR0aD0iMjAiIGhlaWdodD0iMTUiIHJ4PSIyIiByeT0iMiI+PC9yZWN0Pjxwb2x5bGluZSBwb2ludHM9IjE3IDIgMTIgNyA3IDIiPjwvcG9seWxpbmU+PC9zdmc+';
            }}
          />
        ) : (
          <div className="w-8 h-8 text-zinc-700">📺</div>
        )}
        
        <div className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          {isSelected ? (
            <div className="flex gap-1 items-center justify-center">
              <div className="w-1 h-3 bg-blue-500 rounded-full animate-[bounce_1s_infinite]"></div>
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
              <div className="w-1 h-3 bg-blue-500 rounded-full animate-[bounce_1s_infinite_0.4s]"></div>
            </div>
          ) : (
            <Play className="w-6 h-6 text-white ml-1 drop-shadow-md" fill="currentColor" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 py-1">
        <h3 className={cn(
          "font-semibold truncate transition-colors text-sm",
          isSelected ? "text-blue-400" : "text-zinc-200 group-hover:text-white"
        )}>
          {channel.name}
        </h3>
        <p className="text-xs text-zinc-500 mt-1 truncate font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-zinc-500 transition-colors"></span>
          {channel.group}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(channel);
        }}
        className="p-2.5 rounded-full hover:bg-zinc-700/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110 active:scale-95"
        aria-label="Toggle favorite"
      >
        <Heart 
          className={cn("w-4 h-4 transition-colors", isFavorite ? "text-red-500" : "text-zinc-400")} 
          fill={isFavorite ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
}
