'use client';

import React, { useEffect } from 'react';
import ChannelSidebar from './ChannelSidebar';
import IPTVPlayer from './IPTVPlayer';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Channel } from '@/types';

export default function MainLayout({ initialChannels }: { initialChannels: Channel[] }) {
  const { setChannels } = usePlayerStore();

  useEffect(() => {
    if (initialChannels && initialChannels.length > 0) {
      setChannels(initialChannels);
    }
  }, [initialChannels, setChannels]);

  return (
    <main className="flex h-[100dvh] w-full bg-black overflow-hidden text-zinc-100 font-sans selection:bg-blue-500/30">
      <div className="flex flex-col md:flex-row w-full h-full relative">
        <div className="flex-1 h-[40dvh] md:h-full relative z-10 bg-black md:p-6 p-0 order-1 md:order-2 flex items-center justify-center">
          <div className="w-full h-full max-w-7xl mx-auto flex items-center justify-center relative">
            <div className="hidden md:block absolute inset-0 bg-blue-500/5 blur-[120px] pointer-events-none rounded-full" />
            <IPTVPlayer />
          </div>
        </div>

        <div className="w-full h-[60dvh] md:h-full md:w-[380px] lg:w-[420px] flex-shrink-0 z-20 shadow-[0_0_50px_rgba(0,0,0,0.5)] order-2 md:order-1 relative">
          <ChannelSidebar />
        </div>
      </div>
    </main>
  );
}
