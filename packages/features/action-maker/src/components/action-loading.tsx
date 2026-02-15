"use client";

interface ActionLoadingProps {
	categoryLabel: string;
}

export function ActionLoading({ categoryLabel }: ActionLoadingProps) {
	return (
		<div className="flex min-h-[60dvh] flex-col items-center justify-center gap-8 px-6">
			<div className="text-center">
				<h2 className="text-xl font-bold text-white">
					你抓住了{categoryLabel}之星！
				</h2>
				<p className="mt-2 text-lg text-[#BCD5EE]">正在轉化成每日微習慣</p>
			</div>

			{/* Progress bar animation */}
			<div className="w-64">
				<div className="h-1 overflow-hidden rounded-full bg-[#7B9FC4]/30">
					<div
						className="h-full rounded-full bg-white animate-[loading_1.5s_ease-in-out_infinite]"
						style={{
							width: "40%",
							animation: "loading 1.5s ease-in-out infinite",
						}}
					/>
				</div>
				<style>{`
					@keyframes loading {
						0% { transform: translateX(-100%); }
						100% { transform: translateX(350%); }
					}
				`}</style>
			</div>

			<p className="text-sm text-[#7B9FC4]">尋找適合的行動...</p>
		</div>
	);
}
