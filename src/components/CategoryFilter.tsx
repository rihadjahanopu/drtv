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
			"Drama",
			"Kids",
		];
	}, [channels]);

	return (
		<div className="relative px-4 py-1.5 w-full overflow-hidden">
			{/* Left & Right subtle masks for horizontal scroll indicating scrollability */}
			<div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none z-10 md:hidden" />
			<div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none z-10 md:hidden" />

			<div className="flex flex-row overflow-x-auto whitespace-nowrap gap-2 pb-2 pt-0.5 hide-scroll-bar scroll-smooth md:flex-wrap md:overflow-x-visible md:whitespace-normal md:pb-1">
				{groups.map((group) => (
					<button
						key={group}
						onClick={() => setActiveGroup(group)}
						className={cn(
							"shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 border active:scale-95",
							activeGroup === group ?
								"bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.15)] font-bold scale-[1.03]"
							:	"bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-white"
						)}>
						{group === "Favorites" && (
							<Heart
								className={cn(
									"w-3 h-3",
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
