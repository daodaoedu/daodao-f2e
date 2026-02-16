"use client";

import type { CategoryType, ICategory } from "../types";

interface CategoryStarProps {
	category: ICategory;
	isSelected: boolean;
	onSelect: (id: CategoryType) => void;
}

export function CategoryStar({ category, isSelected, onSelect }: CategoryStarProps) {
	return (
		<button
			type="button"
			onClick={() => onSelect(category.id)}
			className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all ${
				isSelected
					? "bg-white/10 ring-2 ring-white/40"
					: "hover:bg-white/5"
			}`}
		>
			<div className="flex h-16 w-16 items-center justify-center">
				<category.icon className="h-12 w-12" />
			</div>
			<span
				className={`rounded-full px-3 py-1 text-sm ${
					isSelected ? "bg-white/20 text-white" : "text-[#BCD5EE]"
				}`}
			>
				{category.label}
			</span>
		</button>
	);
}
