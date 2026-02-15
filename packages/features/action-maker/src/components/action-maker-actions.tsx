"use client";

import { useMemo, useState } from "react";
import { useActionMaker } from "../hooks/use-action-maker";
import { useGenerateActions } from "../hooks/use-generate-actions";
import type { IAction } from "../types";
import { getCategoryLabel } from "../utils/category-map";
import { isValidCustomDescription, isValidCustomTitle, limits } from "../utils/validation";
import { ActionCard } from "./action-card";
import { ActionLoading } from "./action-loading";
import { NavigationButtons } from "./navigation-buttons";
import { ProgressBar } from "./progress-bar";
import { StarryBackground } from "./starry-background";

export function ActionMakerActions() {
	const { state, dispatch, navigateTo } = useActionMaker();
	const { userInput, generatedActions: existingActions } = state;

	// Only call API if we don't already have actions (e.g. coming back from detail via replace)
	const apiInput = useMemo(
		() =>
			existingActions.length > 0 || !userInput.category
				? null
				: {
						category: userInput.category,
						topic: userInput.topic,
						tags: userInput.selectedTags,
					},
		[existingActions.length, userInput.category, userInput.topic, userInput.selectedTags],
	);

	const { actions: apiActions, isLoading } = useGenerateActions(apiInput);
	const actions = existingActions.length > 0 ? existingActions : (apiActions ?? []);

	const [selectedIndex, setSelectedIndex] = useState(0);
	const [showCustomForm, setShowCustomForm] = useState(false);
	const [customTitle, setCustomTitle] = useState("");
	const [customDescription, setCustomDescription] = useState("");
	const [customDuration, setCustomDuration] = useState("");

	const categoryLabel = userInput.category
		? getCategoryLabel(userInput.category)
		: "";

	// Store API actions in context when they arrive
	if (apiActions && apiActions.length > 0 && existingActions.length === 0) {
		dispatch({ type: "SET_ACTIONS", payload: apiActions });
	}

	const handleSelectAction = () => {
		const action = actions[selectedIndex];
		if (!action || action.locked) return;
		dispatch({ type: "SELECT_ACTION", payload: action });
		navigateTo("/action-maker/detail");
	};

	const handleCustomSubmit = () => {
		if (!isValidCustomTitle(customTitle) || !isValidCustomDescription(customDescription))
			return;
		const customAction: IAction = {
			id: "custom",
			categoryId: userInput.category ?? "interest",
			level: "beginner",
			title: customTitle.trim(),
			description: customDescription.trim(),
			duration: customDuration.trim() || null,
			tip: null,
			rationale: null,
		};
		dispatch({ type: "SELECT_ACTION", payload: customAction });
		navigateTo("/action-maker/detail");
	};

	// Loading state
	if (isLoading) {
		return (
			<StarryBackground>
				<ActionLoading categoryLabel={categoryLabel} />
			</StarryBackground>
		);
	}

	// Custom form
	if (showCustomForm) {
		return (
			<StarryBackground>
				<div className="flex min-h-dvh flex-col">
					<ProgressBar current={2} />
					<div className="flex flex-1 flex-col gap-5 px-6 pt-8">
						<h2 className="text-xl font-bold text-white">自訂你的行動</h2>

						<div>
							<label className="mb-1 block text-sm text-[#7B9FC4]">
								行動標題
							</label>
							<input
								type="text"
								value={customTitle}
								onChange={(e) => setCustomTitle(e.target.value)}
								maxLength={limits.CUSTOM_TITLE_MAX_LENGTH}
								placeholder="例如：練習烏克麗麗和弦"
								className="w-full rounded-xl border border-[#BCD5EE]/30 bg-[#18215E]/80 px-4 py-3 text-white placeholder:text-[#7B9FC4] focus:border-[#BCD5EE]/60 focus:outline-none"
							/>
						</div>

						<div>
							<label className="mb-1 block text-sm text-[#7B9FC4]">
								具體行動內容
							</label>
							<textarea
								value={customDescription}
								onChange={(e) => setCustomDescription(e.target.value)}
								maxLength={limits.CUSTOM_DESCRIPTION_MAX_LENGTH}
								rows={4}
								placeholder="例如：每天花 15 分鐘練習 C、G、Am、F 四個和弦的轉換"
								className="w-full resize-none rounded-xl border border-[#BCD5EE]/30 bg-[#18215E]/80 px-4 py-3 text-white placeholder:text-[#7B9FC4] focus:border-[#BCD5EE]/60 focus:outline-none"
							/>
							<div className="mt-1 text-right text-xs text-[#7B9FC4]">
								{customDescription.length} / {limits.CUSTOM_DESCRIPTION_MAX_LENGTH}
							</div>
						</div>

						<div>
							<label className="mb-1 block text-sm text-[#7B9FC4]">
								預估時間（選填）
							</label>
							<input
								type="text"
								value={customDuration}
								onChange={(e) => setCustomDuration(e.target.value)}
								placeholder="例如：約 15 分鐘"
								className="w-full rounded-xl border border-[#BCD5EE]/30 bg-[#18215E]/80 px-4 py-3 text-white placeholder:text-[#7B9FC4] focus:border-[#BCD5EE]/60 focus:outline-none"
							/>
						</div>
					</div>

					<div className="mx-auto w-full max-w-sm">
						<NavigationButtons
							primaryLabel="確定"
							secondaryLabel="返回建議"
							onPrimary={handleCustomSubmit}
							onSecondary={() => setShowCustomForm(false)}
							primaryDisabled={
								!isValidCustomTitle(customTitle) ||
								!isValidCustomDescription(customDescription)
							}
						/>
					</div>
				</div>
			</StarryBackground>
		);
	}

	// Loaded — action cards carousel
	return (
		<StarryBackground>
			<div className="flex min-h-dvh flex-col">
				<ProgressBar current={2} />

				<div className="flex flex-1 flex-col gap-6 pt-8">
					<div className="px-6 text-center">
						<h2 className="text-xl font-bold text-white">
							這是你的每日具體行動
						</h2>
						<p className="mt-2 text-[#BCD5EE]">
							{categoryLabel}：{userInput.topic}
						</p>
					</div>

					{/* Carousel */}
					<div
						className="flex gap-4 overflow-x-auto px-6 pb-4 snap-x snap-mandatory scrollbar-none"
						style={{ scrollbarWidth: "none" }}
					>
						{actions.map((action, i) => (
							<ActionCard
								key={action.id}
								action={action}
								isSelected={selectedIndex === i}
								onSelect={() => setSelectedIndex(i)}
							/>
						))}
					</div>
				</div>

				<div className="mx-auto w-full max-w-sm">
					<NavigationButtons
						primaryLabel="看起來很棒"
						secondaryLabel="我想自己設定"
						onPrimary={handleSelectAction}
						onSecondary={() => setShowCustomForm(true)}
						primaryDisabled={!actions[selectedIndex] || !!actions[selectedIndex]?.locked}
						showRefreshIcon
					/>
				</div>
			</div>
		</StarryBackground>
	);
}
