"use client";

import CategoryFilter from "./CategoryFilter";
import ChannelGrid from "./ChannelGrid";
import SearchBar from "./SearchBar";

export default function ChannelSidebar() {
	return (
		<aside className="flex flex-col h-full w-full bg-zinc-950/90 backdrop-blur-2xl border-r border-zinc-800/50">
			<div className="flex justify-between items-center pt-6 pb-4 px-6 border-b border-zinc-800/50 bg-gradient-to-b from-zinc-900/40 to-transparent">
				<h1 className="shrink-0 text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 tracking-tighter flex items-center gap-2.5">
					<div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/10">
						<svg
							className="w-5 h-5 text-white"
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
					TV ME
				</h1>
				{/* application caretor info */}
				<div className="bottom-4 right-4 text-white/80 text-xs pointer-events-none">
					Made with ❤️ by Rihad
				</div>
			</div>

			<div className="flex-shrink-0 bg-zinc-950/50">
				<SearchBar />
				<CategoryFilter />
			</div>

			<div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>

			<ChannelGrid />
		</aside>
	);
}
