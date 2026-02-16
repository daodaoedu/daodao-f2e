"use client";

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
				className="flex items-center gap-0"
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
						<div key={step} className="flex flex-1 items-center">
							{/* Dot */}
							<div
								className={`relative flex-shrink-0 rounded-full transition-all duration-300 ${
									isActive
										? "h-4 w-4 bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]"
										: isCompleted
											? "h-2.5 w-2.5 bg-white"
											: "h-2.5 w-2.5 border border-[#7B9FC4] bg-transparent"
								}`}
							/>
							{/* Line between dots */}
							{step < total && (
								<div
									className={`h-px flex-1 ${
										isCompleted ? "bg-white" : "bg-[#7B9FC4]/40"
									}`}
								/>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
