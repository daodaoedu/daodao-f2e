"use client";

import titleAnimationData from "@daodao/assets/images/action-maker/title.json";
import Lottie from "lottie-react";
import { useMemo } from "react";
import { useActionMaker } from "../hooks/use-action-maker";
import { NavigationButtons } from "./navigation-buttons";
import { StarryBackground } from "./starry-background";

export function ActionMakerIntro() {
	const { navigateTo } = useActionMaker();
	const prefersReduced = useMemo(
		() =>
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches,
		[],
	);

	const slideIn = prefersReduced
		? {}
		: {
				opacity: 0,
				animation: "am-slide-in 0.6s ease-out forwards",
			};

	return (
		<StarryBackground>
			{!prefersReduced && (
				<style>{`
					@keyframes am-slide-in {
						from { opacity: 0; transform: translateY(30px); }
						to { opacity: 1; transform: translateY(0); }
					}
				`}</style>
			)}
			<div className="flex min-h-dvh flex-col items-center justify-center px-6">
				<div className="flex flex-col items-center gap-6 text-center">
					{/* Lottie title animation */}
					<div
						className="w-full max-w-xs"
						style={{ aspectRatio: "526 / 211", ...slideIn }}
						role="img"
						aria-label="建立微習慣，抓住你的星"
					>
						<Lottie
							animationData={titleAnimationData}
							loop={false}
							autoplay={!prefersReduced}
							style={{ width: "100%", height: "100%" }}
							initialSegment={prefersReduced ? [0, 0] : undefined}
						/>
					</div>

					<div style={{ ...slideIn, animationDelay: "500ms" }}>
						<p className="text-lg text-[#BCD5EE]">定好習慣，目標就離你不遠！</p>

						<div className="mt-1 flex flex-col gap-1 text-sm text-[#7B9FC4]">
							<p>總是覺得規劃新年目標很難嗎</p>
							<p>我們陪你一步一步建立小習慣</p>
							<p>每天都比昨天更進步一些</p>
						</div>
					</div>
				</div>

				<div
					className="mt-12 w-full max-w-sm"
					style={{ ...slideIn, animationDelay: "1000ms" }}
				>
					<NavigationButtons
						primaryLabel="開始追星"
						onPrimary={() => navigateTo("/action-maker/category")}
					/>
				</div>
			</div>
		</StarryBackground>
	);
}
