"use client";

import { useState } from "react";
import { useActionMaker } from "../hooks/use-action-maker";
import { isValidTriggerTiming, limits } from "../utils/validation";
import { NavigationButtons } from "./navigation-buttons";
import { ProgressBar } from "./progress-bar";
import { StarryBackground } from "./starry-background";

const DEFAULT_BADGE = { bg: "bg-[var(--am-badge-beginner)]", label: "初學" } as const;

const BADGE_STYLES: Record<string, { bg: string; label: string }> = {
	beginner: DEFAULT_BADGE,
	intermediate: { bg: "bg-[var(--am-badge-intermediate)]", label: "中級" },
	advanced: { bg: "bg-[var(--am-badge-advanced)]", label: "進階" },
};

export function ActionMakerDetail() {
	const { state, dispatch, navigateTo } = useActionMaker();
	const { userSelection } = state;
	const action = userSelection.action;
	const [timing, setTiming] = useState(userSelection.triggerTiming);

	if (!action) {
		navigateTo("/action-maker/actions", { replace: true });
		return null;
	}

	const badge = BADGE_STYLES[action.level] ?? DEFAULT_BADGE;

	const handleComplete = () => {
		if (!isValidTriggerTiming(timing)) return;
		dispatch({ type: "SET_TRIGGER_TIMING", payload: timing.trim() });
		navigateTo("/action-maker/result");
	};

	const handleReselect = () => {
		navigateTo("/action-maker/actions", { replace: true });
	};

	return (
		<StarryBackground>
			<div className="flex min-h-dvh flex-col">
				<ProgressBar current={3} />

				<div className="flex flex-1 flex-col gap-6 px-6 pt-8">
					{/* Badge + Title */}
					<div className="flex items-center gap-3">
						<span
							className={`rounded-full px-3 py-1 text-xs text-white ${badge.bg}`}
						>
							{badge.label}
						</span>
						<h2 className="text-xl font-bold text-white">{action.title}</h2>
					</div>

					{/* Description */}
					<div>
						<h3 className="mb-2 text-sm font-medium text-[#7B9FC4]">
							具體行動內容
						</h3>
						{action.duration && (
							<p className="mb-2 text-xs text-[#7B9FC4]">{action.duration}</p>
						)}
						<p className="leading-relaxed text-[#BCD5EE]">{action.description}</p>
					</div>

					{/* Trigger timing */}
					<div>
						<h3 className="mb-2 text-sm font-medium text-[#7B9FC4]">啟動時機</h3>
						<input
							type="text"
							value={timing}
							onChange={(e) => setTiming(e.target.value)}
							placeholder="例如：晚餐後、洗澡前、通勤時..."
							maxLength={limits.TRIGGER_TIMING_MAX_LENGTH}
							className="w-full rounded-xl border border-[#BCD5EE]/30 bg-[#18215E]/80 px-5 py-4 text-white placeholder:text-[#7B9FC4] focus:border-[#BCD5EE]/60 focus:outline-none"
						/>
					</div>

					{/* Rationale */}
					{action.rationale && (
						<div className="flex gap-2 rounded-xl bg-white/5 px-4 py-3">
							<span className="flex-shrink-0 text-sm">💡</span>
							<p className="text-sm leading-relaxed text-[#7B9FC4]">
								{action.rationale}
							</p>
						</div>
					)}
				</div>

				<div className="mx-auto w-full max-w-sm">
					<NavigationButtons
						primaryLabel="完成"
						secondaryLabel="重新選擇"
						onPrimary={handleComplete}
						onSecondary={handleReselect}
						primaryDisabled={!isValidTriggerTiming(timing)}
						showRefreshIcon
					/>
				</div>
			</div>
		</StarryBackground>
	);
}
