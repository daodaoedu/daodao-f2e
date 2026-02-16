"use client";

import { RefreshCw } from "lucide-react";

interface NavigationButtonsProps {
	primaryLabel: string;
	secondaryLabel?: string;
	onPrimary: () => void;
	onSecondary?: () => void;
	primaryDisabled?: boolean;
	secondaryDisabled?: boolean;
	showRefreshIcon?: boolean;
}

export function NavigationButtons({
	primaryLabel,
	secondaryLabel,
	onPrimary,
	onSecondary,
	primaryDisabled,
	secondaryDisabled,
	showRefreshIcon,
}: NavigationButtonsProps) {
	return (
		<div className="flex flex-col gap-3 px-6 pb-8 pt-4">
			{/* Primary Button with glow */}
			<div className="relative">
				{/* 光暈層：右上藍 + 左下粉 */}
				{!primaryDisabled && (
					<div
						className="pointer-events-none absolute inset-0 rounded-full"
						style={{
							boxShadow:
								"6px -4px 24px -4px rgba(80, 120, 255, 0.5), -6px 6px 24px -4px rgba(211, 90, 255, 0.5)",
						}}
					/>
				)}
				<button
					type="button"
					onClick={onPrimary}
					disabled={primaryDisabled}
					className={`relative w-full rounded-full border border-[#7B8DB8] py-4 text-base font-medium transition-all duration-300 ${
						primaryDisabled
							? "cursor-not-allowed text-white/30"
							: "text-[#18215E] hover:text-white"
					}`}
					style={{
						background: primaryDisabled
							? "linear-gradient(to right, rgba(74,85,120,0.5), rgba(107,120,152,0.4) 50%, rgba(74,85,120,0.5))"
							: "radial-gradient(60% 100% at 90% 30%, rgba(107, 173, 224, 0.45) 0%, rgba(107, 173, 224, 0) 100%), radial-gradient(50% 100% at 10% 100%, rgba(211, 160, 255, 0.45) 0%, rgba(211, 160, 255, 0) 100%), white",
					}}
				>
					{primaryLabel}
				</button>
			</div>

			{/* Secondary Button */}
			{secondaryLabel && onSecondary && (
				<button
					type="button"
					onClick={onSecondary}
					disabled={secondaryDisabled}
					className={`flex w-full items-center justify-center gap-2 rounded-full border py-4 text-base transition-all duration-300 ${
						secondaryDisabled
							? "cursor-not-allowed border-white/20 text-white/30"
							: "border-white/50 text-white hover:border-white/70 hover:bg-white/10"
					}`}
				>
					{showRefreshIcon && <RefreshCw className="h-4 w-4" />}
					{secondaryLabel}
				</button>
			)}
		</div>
	);
}
