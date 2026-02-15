"use client";

import { NavigationButtons } from "./navigation-buttons";
import { StarryBackground } from "./starry-background";

interface ActionMakerIntroProps {
	onStart: () => void;
}

export function ActionMakerIntro({ onStart }: ActionMakerIntroProps) {
	return (
		<StarryBackground>
			<div className="flex min-h-dvh flex-col items-center justify-center px-6">
				<div className="flex flex-col items-center gap-6 text-center">
					{/* Title - TODO: Replace with Lottie animation from title.json */}
					<h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
						建立微習慣
						<br />
						抓住你的星
					</h1>

					<p className="text-lg text-[#BCD5EE]">定好習慣，目標就離你不遠！</p>

					<div className="flex flex-col gap-1 text-sm text-[#7B9FC4]">
						<p>總是覺得規劃新年目標很難嗎</p>
						<p>我們陪你一步一步建立小習慣</p>
						<p>每天都比昨天更進步一些</p>
					</div>
				</div>

				<div className="mt-12 w-full max-w-sm">
					<NavigationButtons primaryLabel="開始追星" onPrimary={onStart} />
				</div>
			</div>
		</StarryBackground>
	);
}
