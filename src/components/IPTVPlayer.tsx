"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import Hls from "hls.js";
import { AlertCircle, Cast, Check, Play, Settings } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface QualityLevel {
	index: number;
	height: number;
	bitrate?: number;
}

const getProxiedUrl = (url: string): string => {
	if (url.startsWith("http://198.195.239.50:8095/")) {
		return url.replace("http://198.195.239.50:8095/", "/api/live/");
	}
	return url;
};

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

	// Cast state
	const [isCasting, setIsCasting] = useState(false);
	const [castDeviceName, setCastDeviceName] = useState<string | null>(null);

	useEffect(() => {
		const checkCast = setInterval(() => {
			if (typeof cast !== "undefined" && cast.framework) {
				clearInterval(checkCast);
				const castContext = cast.framework.CastContext.getInstance();

				const handleCastStateChange = (event: any) => {
					if (
						event.sessionState ===
							cast.framework.SessionState.SESSION_STARTED ||
						event.sessionState === cast.framework.SessionState.SESSION_RESUMED
					) {
						setIsCasting(true);
						const session = castContext.getCurrentSession();
						if (session && session.getCastDevice()) {
							setCastDeviceName(session.getCastDevice().friendlyName);
						}
						// If we are currently playing something locally, move it to cast
						if (currentChannel) {
							loadChannel(currentChannel.url);
						}
					} else if (
						event.sessionState === cast.framework.SessionState.SESSION_ENDED
					) {
						setIsCasting(false);
						setCastDeviceName(null);
						// Resume locally if we stopped casting
						if (currentChannel) {
							loadChannel(currentChannel.url);
						}
					}
				};

				castContext.addEventListener(
					cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
					handleCastStateChange
				);
			}
		}, 500);

		return () => clearInterval(checkCast);
	}, []);

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
			// 1. Check if chrome, cast, and chrome.cast.media are fully available
			if (
				typeof cast !== "undefined" &&
				cast.framework &&
				typeof chrome !== "undefined" &&
				chrome.cast?.media
			) {
				const session =
					cast.framework.CastContext.getInstance().getCurrentSession();
				if (session) {
					// We are casting, play on Cast device instead of local
					setIsCasting(true);

					const castUrl = url.startsWith("http://198.195.239.50:8095/")
						? window.location.origin + getProxiedUrl(url)
						: url;

					const mediaInfo = new chrome.cast.media.MediaInfo(
						castUrl,
						"application/x-mpegurl"
					);
					if (currentChannel) {
						const metadata = new chrome.cast.media.GenericMediaMetadata();
						metadata.title = currentChannel.name;
						if (currentChannel.logo) {
							metadata.images = [new chrome.cast.Image(currentChannel.logo)];
						}
						mediaInfo.metadata = metadata;
					}
					const request = new chrome.cast.media.LoadRequest(mediaInfo);
					session.loadMedia(request).catch(console.error);

					// Stop local playback
					destroyHls();
					const video = videoRef.current;
					if (video) {
						video.pause();
						video.removeAttribute("src");
						video.load();
					}
					setError(null);
					setPaused(false);
					return;
				}
			} // <--- Ekhone if logic shesh

			// Baki local playback-er code ekhon nicher dike thikbhabe run hobe
			const video = videoRef.current;
			if (!video) return;

			destroyHls();
			setIsCasting(false);
			setError(null);
			setPaused(false);

			const proxiedUrl = getProxiedUrl(url);
			const isMp4 = proxiedUrl.toLowerCase().endsWith(".mp4");

			if (isMp4) {
				video.src = proxiedUrl;
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
					lowLatencyMode: false,
					startLevel: 0,
					abrEwmaDefaultEstimate: 5000000,
					capLevelToPlayerSize: false,
					maxBufferLength: 60,
					maxMaxBufferLength: 120,
					backBufferLength: 60,
					abrBandWidthFactor: 0.95,
					abrBandWidthUpFactor: 0.7,
					fragLoadingMaxRetry: 6,
					manifestLoadingMaxRetry: 3,
					levelLoadingMaxRetry: 4,
				});
				hlsRef.current = hls;

				hls.loadSource(proxiedUrl);
				hls.attachMedia(video);

				hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
					const availableLevels = data.levels
						.map((l, index) => ({
							index,
							height: l.height || 0,
							bitrate: l.bitrate,
						}))
						.sort((a, b) => b.height - a.height);

					setLevels(availableLevels);
					setCurrentLevel(-1);

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
				video.src = proxiedUrl;
				video.play().catch((e) => {
					if (e.name !== "AbortError") {
						setPaused(true);
					}
				});
			} else {
				setError("Your browser does not support HLS streams.");
			}
		},
		[destroyHls, currentChannel]
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
			<div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800/50 shadow-2xl ">
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
		<div className="relative w-full h-full overflow-hidden bg-black shadow-2xl group border border-zinc-800/50 pt-20 md:pt-0">
			<video
				ref={videoRef}
				className="w-full h-full object-contain"
				playsInline
				controls
			/>

			{error && !isCasting && (
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

			{isCasting && (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 z-20 p-6 text-center backdrop-blur-md">
					<div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
						<svg
							className="w-10 h-10 text-blue-500"
							fill="currentColor"
							viewBox="0 0 24 24">
							<path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c6.08 0 11 4.93 11 11h2c0-7.18-5.82-13-13-13zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
						</svg>
					</div>
					<h2 className="text-2xl font-bold text-white mb-2">
						Casting to {castDeviceName || "TV"}
					</h2>
					<p className="text-zinc-400">Playing {currentChannel.name}</p>
				</div>
			)}

			{paused && !error && !isCasting && (
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

			<div className="absolute top-0 left-0 right-0 p-4 bg-linear-to-b from-black/80 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10 flex justify-between items-start pointer-events-none">
				<div className="flex items-center gap-3">
					{currentChannel.logo && (
						<img
							src={currentChannel.logo}
							alt={currentChannel.name}
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

				{/* Controls */}
				<div className="flex items-center gap-3 relative pointer-events-auto">
					<button
						onClick={() => {
							if (typeof cast !== "undefined" && cast.framework) {
								try {
									const castContext = cast.framework.CastContext.getInstance();
									
									// Ensure options are set before requesting session
									// This prevents 'session_error' if initialization failed or hasn't happened yet
									castContext.setOptions({
										receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
										autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
									});

									castContext.requestSession().catch((err: any) => {
										// Ignore user cancellation, log other errors
										if (err !== 'cancel') {
											console.error("Cast session request failed:", err);
										}
									});
								} catch (e: any) {
									console.error("Cast error:", e);
									alert(
										"Please make sure you are using Google Chrome or Edge with Cast support enabled."
									);
								}
							} else {
								alert(
									"Google Cast is not supported or not loaded in this browser."
								);
							}
						}}
						className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 border border-white/10 hover:bg-zinc-800 text-white transition-colors backdrop-blur-md mr-1"
						title="Cast to TV">
						<Cast className="w-5 h-5" />
					</button>

					{levels.length > 0 && !isCasting && (
						<div className="relative">
							<button
								onClick={() => setShowSettings(!showSettings)}
								className="p-2.5 rounded-full bg-black/50 border border-white/10 text-white hover:bg-zinc-800 transition-colors backdrop-blur-md flex items-center justify-center"
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
		</div>
	);
}
