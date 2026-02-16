"use client";

import { RefreshCw } from "lucide-react";

interface NavigationButtonsProps {
	primaryLabel: string;
	secondaryLabel?: string;
	onPrimary: () => void;
	onSecondary?: () => void;
	primaryDisabled?: boolean;
	showRefreshIcon?: boolean;
}

export function NavigationButtons({
	primaryLabel,
	secondaryLabel,
	onPrimary,
	onSecondary,
	primaryDisabled,
	showRefreshIcon,
}: NavigationButtonsProps) {
	return (
		<div className="flex flex-col gap-3 px-6 pb-8 pt-4">
			{/* Primary Button */}
			<button
				type="button"
				onClick={onPrimary}
				disabled={primaryDisabled}
				className={`w-full rounded-full py-4 text-base font-medium transition-all ${
					primaryDisabled
						? "cursor-not-allowed bg-gradient-to-r from-gray-400/40 to-gray-500/40 text-gray-300/60"
						: "bg-gradient-to-r from-[#E1F0FB] via-white to-[#BCD5EE] text-[#18215E] shadow-lg hover:shadow-xl hover:brightness-110"
				}`}
			>
				{primaryLabel}
			</button>

			{/* Secondary Button */}
			{secondaryLabel && onSecondary && (
				<button
					type="button"
					onClick={onSecondary}
					className="flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-transparent py-4 text-base text-white transition-colors hover:bg-white/10"
				>
					{showRefreshIcon && <RefreshCw className="h-4 w-4" />}
					{secondaryLabel}
				</button>
			)}
		</div>
	);
}
