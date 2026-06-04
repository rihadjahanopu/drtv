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
  const { currentChannel, setCurrentChannel, toggleFavorite, favorites, viewMode } = usePlayerStore();
  const isSelected = currentChannel?.url === channel.url;
  const isFavorite = favorites.some((c) => c.url === channel.url);
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '100px 0px',
  });

  const isGridView = viewMode === 'grid';

  return (
    <div
      className={cn(
        "group relative cursor-pointer transition-all duration-200 border",
        isGridView
          ? cn(
              "flex flex-col items-center justify-center p-3 text-center min-h-[135px] rounded-2xl active:scale-95 hover:scale-[1.02]",
              isSelected
                ? "bg-gradient-to-b from-blue-600/15 to-transparent border-blue-500/60 selected-glow"
                : "hover:bg-zinc-800/80 hover:border-zinc-700/80 bg-zinc-900/40 border-transparent"
            )
          : cn(
              "flex items-center gap-3 p-2.5 rounded-xl active:scale-[0.98] hover:scale-[1.01]",
              isSelected
                ? "bg-blue-600/10 border-blue-500/40 selected-glow"
                : "hover:bg-zinc-800/80 hover:border-zinc-700/40 bg-zinc-900/40 border-transparent"
            )
      )}
      onClick={() => setCurrentChannel(channel)}
    >
      {/* Thumbnail container */}
      <div
        ref={ref}
        className={cn(
          "relative rounded-xl bg-zinc-950/40 flex-shrink-0 flex items-center justify-center overflow-hidden border transition-all duration-300 shadow-inner",
          isSelected ? "border-blue-500/40" : "border-zinc-850",
          isGridView ? "w-14 h-14 mb-2" : "w-13 h-13"
        )}
      >
        {inView && channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain p-1.5 drop-shadow-md select-none transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM1MjUyNWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIyIiB5PSI3IiB3aWR0aD0iMjAiIGhlaWdodD0iMTUiIHJ4PSIyIiByeT0iMiI+PC9yZWN0Pjxwb2x5bGluZSBwb2ludHM9IjE3IDIgMTIgNyA3IDIiPjwvcG9seWxpbmU+PC9zdmc+';
            }}
          />
        ) : (
          <div className="w-6 h-6 text-zinc-650 flex items-center justify-center select-none text-lg">📺</div>
        )}

        {/* Selected or Play overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center transition-opacity duration-200",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          {isSelected ? (
            <div className="flex gap-[3px] items-end justify-center">
              <span className="eq-bar"></span>
              <span className="eq-bar"></span>
              <span className="eq-bar"></span>
            </div>
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5 drop-shadow-md" fill="currentColor" />
          )}
        </div>
      </div>

      {/* Info labels */}
      <div
        className={cn(
          "min-w-0 flex-1",
          isGridView ? "w-full flex flex-col items-center text-center" : "text-left py-0.5"
        )}
      >
        <h3
          className={cn(
            "font-semibold truncate transition-colors text-xs w-full",
            isSelected ? "text-blue-400 font-bold" : "text-zinc-200 group-hover:text-white"
          )}
        >
          {channel.name}
        </h3>
        <p
          className={cn(
            "text-[10px] text-zinc-500 mt-0.5 truncate font-medium flex items-center gap-1",
            isGridView ? "justify-center w-full" : "w-full"
          )}
        >
          {!isGridView && (
            <span
              className={cn(
                "w-1 h-1 rounded-full transition-colors",
                isSelected ? "bg-blue-500" : "bg-zinc-700 group-hover:bg-zinc-500"
              )}
            ></span>
          )}
          {channel.group}
        </p>
      </div>

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(channel);
        }}
        className={cn(
          "rounded-full hover:bg-zinc-800/80 text-zinc-400 hover:text-white transition-all flex items-center justify-center flex-shrink-0 active:scale-90 hover:scale-110",
          isGridView
            ? "absolute top-1.5 right-1.5 p-1.5 bg-zinc-950/75 border border-zinc-850/80 opacity-80 md:opacity-0 md:group-hover:opacity-100 shadow-md backdrop-blur-xs"
            : "p-2 opacity-80 md:opacity-0 md:group-hover:opacity-100"
        )}
        aria-label="Toggle favorite"
      >
        <Heart
          className={cn("w-3.5 h-3.5 transition-colors", isFavorite ? "text-red-500 fill-red-500" : "text-zinc-400")}
        />
      </button>
    </div>
  );
}
