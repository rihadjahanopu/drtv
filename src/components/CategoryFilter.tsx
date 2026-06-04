"use client";

import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/usePlayerStore";
import { Heart } from "lucide-react";
import { useMemo } from "react";

export default function CategoryFilter() {
	const { channels, activeGroup, setActiveGroup } = usePlayerStore();

	const groups = useMemo(() => {
		const uniqueGroups = new Set(channels.map((c) => c.group).filter(Boolean));
		return [
			"All",
			"Favorites",
			"Bangla",
			"Sports",
			"Movies",
			"News",
			"Indian Bangla",
			"Other",
		];
	}, [channels]);

	return (
		<div className="px-4 py-2 max-h-[25vh] overflow-y-auto custom-scrollbar">
			<div className="flex flex-wrap gap-2 pb-2">
				{groups.map((group) => (
					<button
						key={group}
						onClick={() => setActiveGroup(group)}
						className={cn(
							"shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 border",
							activeGroup === group ?
								"bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105"
							:	"bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white"
						)}>
						{group === "Favorites" && (
							<Heart
								className={cn(
									"w-3.5 h-3.5",
									activeGroup === group ? "text-red-500" : "text-zinc-500"
								)}
								fill={activeGroup === group ? "currentColor" : "none"}
							/>
						)}
						{group}
					</button>
				))}
			</div>
		</div>
	);
}
