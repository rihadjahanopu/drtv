"use client";

import { usePlayerStore } from "@/store/usePlayerStore";
import { Search, X } from "lucide-react";

export default function SearchBar() {
	const { searchQuery, setSearchQuery } = usePlayerStore();

	return (
		<div className="relative w-full px-4 pt-3 pb-1.5 md:pt-4 md:pb-2.5">
			<div className="relative group">
				<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
					<Search className="h-3.5 w-3.5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
				</div>
				<input
					type="text"
					className="block w-full pl-9 pr-9 py-2 bg-zinc-900/50 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all backdrop-blur-md shadow-inner"
					placeholder="Search channels..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				{searchQuery && (
					<button
						onClick={() => setSearchQuery("")}
						className="absolute inset-y-0 right-0 pr-3 flex items-center">
						<X className="h-3.5 w-3.5 text-zinc-400 hover:text-white transition-colors" />
					</button>
				)}
			</div>
		</div>
	);
}
