"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import Hls from "hls.js";
import { AlertCircle, Check, Play, Settings } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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

	const loadChannel = useCallback(
		(url: string) => {
			const video = videoRef.current;
			if (!video) return;

			destroyHls();
			setError(null);
			setPaused(false);

			const isMp4 = url.toLowerCase().endsWith(".mp4");

			if (isMp4) {
				video.src = url;
				video.play().catch((e) => {
					if (e.name !== "AbortError") {
						setPaused(true);
					}
				});
				return;
			}

			if (Hls.isSupported()) {
				const hls = new Hls({
					enableWorker: true,
					lowLatencyMode: false, // Disable low-latency to prioritize quality over speed
					startLevel: 0, // Start at highest quality level (sorted desc)
					abrEwmaDefaultEstimate: 5000000, // Assume 5Mbps bandwidth to start HD immediately
					capLevelToPlayerSize: false, // Don't cap quality based on player size
					maxBufferLength: 60, // Buffer 60 seconds for smooth playback
					maxMaxBufferLength: 120, // Allow up to 120 seconds buffer
					backBufferLength: 60,
					abrBandWidthFactor: 0.95, // Use 95% of measured bandwidth
					abrBandWidthUpFactor: 0.7, // More aggressive upscaling
					fragLoadingMaxRetry: 6,
					manifestLoadingMaxRetry: 3,
					levelLoadingMaxRetry: 4,
				});
				hlsRef.current = hls;

				hls.loadSource(url);
				hls.attachMedia(video);

				hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
					// Map and sort levels by height descending for the UI
					const availableLevels = data.levels
						.map((l, index) => ({
							index,
							height: l.height || 0,
							bitrate: l.bitrate,
						}))
						.sort((a, b) => b.height - a.height);

					setLevels(availableLevels);
					setCurrentLevel(-1); // Default to Auto

					video.play().catch((e) => {
						if (e.name !== "AbortError") {
							setPaused(true);
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
								setError("Stream failed to load. Please try another channel.");
								destroyHls();
						}
					}
				});
			} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
				// Native HLS (Safari) does not support manual quality switching easily
				video.src = url;
				video.play().catch((e) => {
					if (e.name !== "AbortError") {
						setPaused(true);
					}
				});
			} else {
				setError("Your browser does not support HLS streams.");
			}
		},
		[destroyHls]
	);

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

		const onPlaying = () => {
			setError(null);
			setPaused(false);
		};
		const onPause = () => setPaused(true);
		const onPlay = () => {
			setPaused(false);
			setError(null);
		};
		const onError = () => {
			setError("Playback error. The stream may be expired.");
		};

		video.addEventListener("playing", onPlaying);
		video.addEventListener("pause", onPause);
		video.addEventListener("play", onPlay);
		video.addEventListener("error", onError);

		return () => {
			video.removeEventListener("playing", onPlaying);
			video.removeEventListener("pause", onPause);
			video.removeEventListener("play", onPlay);
			video.removeEventListener("error", onError);
		};
	}, []);

	const handlePlay = () => {
		const video = videoRef.current;
		if (!video) return;
		video.play().catch(console.error);
	};

	const TARGET_RESOLUTIONS = [1080, 720, 480, 360];

	const handleQualityChange = (targetHeight: number) => {
		if (hlsRef.current) {
			if (targetHeight === -1) {
				hlsRef.current.currentLevel = -1;
			} else if (levels.length > 0) {
				// Find the closest available level
				let bestIndex = levels[0].index;
				let minDiff = Infinity;

				levels.forEach((l) => {
					// Guess height from bitrate if actual height is missing (e.g. 1500kbps ~ 720p)
					const effectiveHeight =
						l.height > 0 ? l.height
						: l.bitrate ? Math.round(l.bitrate / 2000)
						: 360;
					const diff = Math.abs(targetHeight - effectiveHeight);
					if (diff < minDiff) {
						minDiff = diff;
						bestIndex = l.index;
					}
				});

				hlsRef.current.currentLevel = bestIndex;
			}

			setCurrentLevel(targetHeight);
			setShowSettings(false);
		}
	};

	if (!currentChannel) {
		return (
			<div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800/50 shadow-2xl">
				<div className="text-zinc-600 mb-6 bg-zinc-800/50 p-6 rounded-full border border-zinc-700/50">
					<svg
						className="w-16 h-16"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1}
							d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
					No Channel Selected
				</h2>
				<p className="text-zinc-400 max-w-sm text-center">
					Select a channel from the list to start watching live TV.
				</p>
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
						className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all">
						<Play
							className="w-4 h-4"
							fill="currentColor"
						/>
						Try Again
					</button>
				</div>
			)}

			{paused && !error && (
				<div
					onClick={handlePlay}
					className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer bg-black/30">
					<div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all">
						<Play
							className="w-8 h-8 text-white ml-1"
							fill="currentColor"
						/>
					</div>
				</div>
			)}

			<div className="absolute top-0 left-0 right-0 p-4 bg-linear-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex justify-between items-start pointer-events-none">
				<div className="flex items-center gap-3">
					{currentChannel.logo && (
						<Image
							src={currentChannel.logo}
							alt={currentChannel.name}
							width={48}
							height={48}
							className="w-12 h-12 object-contain bg-white/5 rounded-xl p-2 border border-white/10"
						/>
					)}
					<div>
						<h2 className="text-white text-xl font-bold">
							{currentChannel.name}
						</h2>
						<div className="flex items-center gap-2 mt-1">
							<span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded tracking-wider uppercase flex items-center gap-1 shadow-sm shadow-red-900/50">
								<span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
								Live
							</span>
							<span className="text-zinc-300 text-xs font-medium bg-white/10 px-2 py-0.5 rounded border border-white/5">
								{currentChannel.group}
							</span>
						</div>
					</div>
				</div>

				{/* Quality Selector */}
				{levels.length > 0 && (
					<div className="relative pointer-events-auto">
						<button
							onClick={() => setShowSettings(!showSettings)}
							className="p-2 rounded-full bg-black/50 border border-white/10 text-white hover:bg-zinc-800 transition-colors backdrop-blur-md"
							title="Quality Settings">
							<Settings className="w-5 h-5" />
						</button>

						{showSettings && (
							<div className="absolute right-0 top-12 w-48 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl py-2 z-50">
								<div className="px-4 py-2 border-b border-zinc-800">
									<h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
										Quality
									</h3>
								</div>
								<div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
									<button
										onClick={() => handleQualityChange(-1)}
										className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-zinc-800/80 transition-colors flex items-center justify-between">
										<span>Auto</span>
										{currentLevel === -1 && (
											<Check className="w-4 h-4 text-blue-500" />
										)}
									</button>
									{TARGET_RESOLUTIONS.map((res) => (
										<button
											key={res}
											onClick={() => handleQualityChange(res)}
											className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-zinc-800/80 transition-colors flex items-center justify-between">
											<span>
												{res}p{" "}
												{res >= 720 && (
													<span className="ml-1 text-[10px] bg-red-600 px-1 py-0.5 rounded text-white font-bold">
														HD
													</span>
												)}
											</span>
											{currentLevel === res && (
												<Check className="w-4 h-4 text-blue-500" />
											)}
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
