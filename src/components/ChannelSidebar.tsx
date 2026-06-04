"use client";

import { useState } from "react";
import Link from "next/link";
import CategoryFilter from "./CategoryFilter";
import ChannelGrid from "./ChannelGrid";
import SearchBar from "./SearchBar";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Info, X, Grid, List } from "lucide-react";

export default function ChannelSidebar() {
	const [showInfo, setShowInfo] = useState(false);
	const { viewMode, setViewMode } = usePlayerStore();

	return (
		<aside className="flex flex-col h-full w-full bg-zinc-950/90 backdrop-blur-2xl border-r border-zinc-800/50 relative">
			<div className="flex justify-between items-center py-3.5 px-4 md:pt-6 md:pb-4 md:px-6 border-b border-zinc-800/50 bg-gradient-to-b from-zinc-900/40 to-transparent">
				<h1 className="shrink-0 text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 tracking-tighter flex items-center gap-2">
					<div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/10">
						<svg
							className="w-4 h-4 md:w-5 md:h-5 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2.5}
								d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					Dr TV
				</h1>

				<div className="flex items-center gap-2">
					{/* Grid/List View Mode Toggle */}
					<div className="flex items-center bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-800/50">
						<button
							onClick={() => setViewMode("grid")}
							className={`p-1.5 rounded-md transition-all ${
								viewMode === "grid"
									? "bg-zinc-800 text-blue-400 shadow-xs"
									: "text-zinc-500 hover:text-zinc-300"
							}`}
							title="Grid View"
						>
							<Grid className="w-3.5 h-3.5 md:w-4 md:h-4" />
						</button>
						<button
							onClick={() => setViewMode("list")}
							className={`p-1.5 rounded-md transition-all ${
								viewMode === "list"
									? "bg-zinc-800 text-blue-400 shadow-xs"
									: "text-zinc-500 hover:text-zinc-300"
							}`}
							title="List View"
						>
							<List className="w-3.5 h-3.5 md:w-4 md:h-4" />
						</button>
					</div>

					<button
						onClick={() => setShowInfo(true)}
						className="p-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-inner"
						title="About Developer"
					>
						<Info className="w-3.5 h-3.5 md:w-4 md:h-4" />
					</button>
				</div>
			</div>

			<div className="flex-shrink-0 bg-zinc-950/50">
				<SearchBar />
				<CategoryFilter />
			</div>

			<div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>

			<ChannelGrid />

			{/* Info Dialog Overlay */}
			{showInfo && (
				<div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 transition-all duration-300">
					<div className="bg-zinc-900/95 border border-zinc-800/80 rounded-2xl p-6 max-w-xs w-full relative shadow-2xl backdrop-blur-xl">
						<button
							onClick={() => setShowInfo(false)}
							className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-full transition-colors"
						>
							<X className="w-4 h-4" />
						</button>
						<div className="flex flex-col items-center text-center mt-2">
							<div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10 mb-4">
								<svg
									className="w-8 h-8 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2.5}
										d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-bold text-white mb-0.5">Dr TV</h3>
							<p className="text-[10px] text-zinc-500 mb-3 font-mono">v1.2.0</p>
							<p className="text-xs text-zinc-300 mb-5 leading-relaxed">
								A modern, fast IPTV streaming application designed for the best live television experience.
							</p>
							<Link
								href="https://www.rihadjahanopu.com"
								target="_blank"
								rel="noopener noreferrer"
								onClick={() => setShowInfo(false)}
								className="w-full text-center py-2 px-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-98"
							>
								Developed by Rihad
							</Link>
						</div>
					</div>
				</div>
			)}
		</aside>
	);
}
