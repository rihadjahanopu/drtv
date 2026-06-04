'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { usePlayerStore } from '@/store/usePlayerStore';
import { AlertCircle, Loader2, Play, Settings, Check } from 'lucide-react';

interface QualityLevel {
  index: number;
  height: number;
  bitrate?: number;
}

export default function IPTVPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { currentChannel } = usePlayerStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  
  // Quality state
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [showSettings, setShowSettings] = useState(false);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setLevels([]);
    setCurrentLevel(-1);
    setShowSettings(false);
  }, []);

  const loadChannel = useCallback((url: string) => {
    const video = videoRef.current;
    if (!video) return;

    destroyHls();
    setError(null);
    setIsLoading(true);
    setPaused(false);

    const isMp4 = url.toLowerCase().endsWith('.mp4');

    if (isMp4) {
      video.src = url;
      video.play().catch(e => {
        if (e.name !== 'AbortError') {
          setError('Cannot play this stream. Try another channel.');
          setIsLoading(false);
        }
      });
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        // Map and sort levels by height descending for the UI
        const availableLevels = data.levels
          .map((l, index) => ({ index, height: l.height || 0, bitrate: l.bitrate }))
          .sort((a, b) => b.height - a.height);
          
        setLevels(availableLevels);
        setCurrentLevel(-1); // Default to Auto
        
        video.play().catch(e => {
          if (e.name !== 'AbortError') {
            setError('Click the play button to start.');
            setIsLoading(false);
          }
        });
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setIsLoading(false);
              setError('Stream failed to load. Please try another channel.');
              destroyHls();
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari) does not support manual quality switching easily
      video.src = url;
      video.play().catch(e => {
        if (e.name !== 'AbortError') {
          setError('Cannot play this stream.');
          setIsLoading(false);
        }
      });
    } else {
      setError('Your browser does not support HLS streams.');
      setIsLoading(false);
    }
  }, [destroyHls]);

  // Load new channel when it changes
  useEffect(() => {
    if (currentChannel) {
      loadChannel(currentChannel.url);
    }
  }, [currentChannel, loadChannel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => destroyHls();
  }, [destroyHls]);

  // Video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => { setIsLoading(false); setError(null); };
    const onPause = () => setPaused(true);
    const onPlay = () => { setPaused(false); setIsLoading(false); };
    const onError = () => {
      setIsLoading(false);
      setError('Playback error. The stream may be expired.');
    };

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);
    video.addEventListener('play', onPlay);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('error', onError);
    };
  }, []);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(console.error);
  };

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
      setShowSettings(false);
    }
  };

  if (!currentChannel) {
    return (
      <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800/50 shadow-2xl">
        <div className="text-zinc-600 mb-6 bg-zinc-800/50 p-6 rounded-full border border-zinc-700/50">
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">No Channel Selected</h2>
        <p className="text-zinc-400 max-w-sm text-center">Select a channel from the list to start watching live TV.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black shadow-2xl group border border-zinc-800/50">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        controls
      />

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20 p-6 text-center backdrop-blur-sm">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
          <p className="text-white font-medium text-lg mb-2">Playback Error</p>
          <p className="text-zinc-400 text-sm max-w-md mb-6">{error}</p>
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all"
          >
            <Play className="w-4 h-4" fill="currentColor" />
            Try Again
          </button>
        </div>
      )}

      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10 pointer-events-none transition-all duration-300">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="text-white font-medium tracking-wide">Loading stream...</p>
        </div>
      )}

      {paused && !error && !isLoading && (
        <div
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer bg-black/30"
        >
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all">
            <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex justify-between items-start">
        <div className="flex items-center gap-3">
          {currentChannel.logo && (
            <img
              src={currentChannel.logo}
              alt={currentChannel.name}
              className="w-12 h-12 object-contain bg-white/5 rounded-xl p-2 border border-white/10"
            />
          )}
          <div>
            <h2 className="text-white text-xl font-bold">{currentChannel.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded tracking-wider uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Live
              </span>
              <span className="text-zinc-300 text-xs bg-white/10 px-2 py-0.5 rounded">{currentChannel.group}</span>
            </div>
          </div>
        </div>
        
        {/* Quality Selector */}
        {levels.length > 0 && (
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full bg-black/50 border border-white/10 text-white hover:bg-zinc-800 transition-colors backdrop-blur-md"
              title="Quality Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {showSettings && (
              <div className="absolute right-0 top-12 w-48 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-zinc-800">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Quality</h3>
                </div>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => handleQualityChange(-1)}
                    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-zinc-800/80 transition-colors flex items-center justify-between"
                  >
                    <span>Auto</span>
                    {currentLevel === -1 && <Check className="w-4 h-4 text-blue-500" />}
                  </button>
                  {levels.map((level) => (
                    <button
                      key={level.index}
                      onClick={() => handleQualityChange(level.index)}
                      className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-zinc-800/80 transition-colors flex items-center justify-between"
                    >
                      <span>
                        {level.height > 0 ? `${level.height}p` : level.bitrate ? `${Math.round(level.bitrate / 1000)} kbps` : `Level ${level.index}`}
                        {level.height >= 720 && <span className="ml-1 text-[10px] bg-red-600 px-1 py-0.5 rounded text-white font-bold">HD</span>}
                      </span>
                      {currentLevel === level.index && <Check className="w-4 h-4 text-blue-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
