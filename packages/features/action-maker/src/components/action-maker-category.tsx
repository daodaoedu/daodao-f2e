"use client";

import { useState } from "react";
import type { CategoryType } from "../types";
import { categoryMap } from "../utils/category-map";
import { useActionMaker } from "../hooks/use-action-maker";
import { CategoryStar } from "./category-star";
import { NavigationButtons } from "./navigation-buttons";
import { ProgressBar } from "./progress-bar";
import { StarryBackground } from "./starry-background";

export function ActionMakerCategory() {
	const { state, dispatch, navigateTo } = useActionMaker();
	const [selected, setSelected] = useState<CategoryType | null>(
		state.userInput.category,
	);
	const [selectedTags, setSelectedTags] = useState<string[]>(
		state.userInput.selectedTags,
	);

	const categories = Array.from(categoryMap.values());
	const currentCategory = selected ? categoryMap.get(selected) : null;

	const handleTagToggle = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	};

	const handleNext = () => {
		if (!selected) return;
		dispatch({ type: "SELECT_CATEGORY", payload: selected });
		dispatch({ type: "SET_SELECTED_TAGS", payload: selectedTags });
		navigateTo("/action-maker/actions");
	};

	const handleCustom = () => {
		if (selected) {
			dispatch({ type: "SELECT_CATEGORY", payload: selected });
			dispatch({ type: "SET_SELECTED_TAGS", payload: selectedTags });
		}
		navigateTo("/action-maker/topic");
	};

	return (
		<StarryBackground>
			<div className="flex min-h-dvh flex-col">
				<ProgressBar current={1} />

				<div className="flex flex-1 flex-col items-center gap-6 px-6 pt-8">
					<h2 className="text-2xl font-bold text-white">
						新的一年，你想抓住哪顆星？
					</h2>

					{/* Category grid */}
					<div className="grid grid-cols-3 gap-4">
						{categories.map((cat) => (
							<CategoryStar
								key={cat.id}
								category={cat}
								isSelected={selected === cat.id}
								onSelect={setSelected}
							/>
						))}
					</div>

					{/* Tag suggestions */}
					{currentCategory && (
						<div className="flex flex-wrap justify-center gap-2">
							{currentCategory.tags.map((tag) => (
								<button
									key={tag}
									type="button"
									onClick={() => handleTagToggle(tag)}
									className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
										selectedTags.includes(tag)
											? "bg-white/20 text-white"
											: "text-[#7B9FC4] hover:text-white"
									}`}
								>
									{tag}
								</button>
							))}
						</div>
					)}
				</div>

				<div className="mx-auto w-full max-w-sm">
					<NavigationButtons
						primaryLabel="下一步"
						secondaryLabel="我想自己設定"
						onPrimary={handleNext}
						onSecondary={handleCustom}
						primaryDisabled={!selected}
						showRefreshIcon
					/>
				</div>
			</div>
		</StarryBackground>
	);
}
