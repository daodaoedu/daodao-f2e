"use client";

import { Fragment } from "react";
import StepDotSvg from "@daodao/assets/images/action-maker/step-dot.svg";

interface ProgressBarProps {
	current: number;
	total?: number;
}

export function ProgressBar({ current, total = 4 }: ProgressBarProps) {
	return (
		<div className="flex flex-col gap-2 px-4 pt-4">
			<span className="text-sm text-[#7B9FC4]">
				{current} / {total}
			</span>
			<div
				className="flex items-center"
				role="progressbar"
				aria-valuenow={current}
				aria-valuemin={1}
				aria-valuemax={total}
			>
				{Array.from({ length: total }, (_, i) => {
					const step = i + 1;
					const isActive = step === current;
					const isCompleted = step < current;

					return (
						<Fragment key={step}>
							{/* Line before dot (except first) */}
							{step > 1 && (
								<div
									className={`h-px flex-1 ${
										isCompleted || isActive
											? "bg-white"
											: "bg-[#7B9FC4]/40"
									}`}
								/>
							)}
							{/* Dot */}
							{isActive ? (
								<StepDotSvg className="size-7 shrink-0" />
							) : (
								<div
									className={`shrink-0 rounded-full transition-all duration-300 ${
										isCompleted
											? "h-2.5 w-2.5 bg-white"
											: "h-2.5 w-2.5 border border-[#7B9FC4] bg-transparent"
									}`}
								/>
							)}
						</Fragment>
					);
				})}
			</div>
		</div>
	);
}
