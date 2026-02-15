"use client";

import { useAuth } from "@daodao/auth";
import { captureElementAsImage, getShareAPI } from "@daodao/shared";
import { useCallback, useRef } from "react";
import { useActionMaker } from "../hooks/use-action-maker";
import { NavigationButtons } from "./navigation-buttons";
import { StarryBackground } from "./starry-background";

const DEFAULT_BADGE = { bg: "bg-[var(--am-badge-beginner)]", label: "初學" } as const;
const CUSTOM_BADGE = { bg: "bg-[var(--am-gray-blue)]", label: "自訂" } as const;

const BADGE_STYLES: Record<string, { bg: string; label: string }> = {
	beginner: DEFAULT_BADGE,
	intermediate: { bg: "bg-[var(--am-badge-intermediate)]", label: "中級" },
	advanced: { bg: "bg-[var(--am-badge-advanced)]", label: "進階" },
	custom: CUSTOM_BADGE,
};

export function ActionMakerResult() {
	const { result, reset, navigateTo } = useActionMaker();
	const { isAuthenticated, openLoginDialog } = useAuth();
	const cardRef = useRef<HTMLDivElement>(null);

	const handleShare = useCallback(async () => {
		if (!result) return;

		// Try capturing the result card as image first
		let imageFile: File | undefined;
		if (cardRef.current) {
			const imageData = await captureElementAsImage(cardRef.current);
			if (imageData) {
				const blob = await fetch(imageData.src).then((r) => r.blob());
				imageFile = new File([blob], "action-maker-result.jpg", {
					type: "image/jpeg",
				});
			}
		}

		const shareText = `${result.nickname}抓住了${result.categoryLabel}之星！每天${result.triggerTiming}，${result.action.title}`;

		// Try native share with image
		if (navigator.share) {
			try {
				const shareData: ShareData = {
					title: `${result.nickname}的微習慣`,
					text: shareText,
				};
				if (imageFile && navigator.canShare?.({ files: [imageFile] })) {
					shareData.files = [imageFile];
				}
				await navigator.share(shareData);
				return;
			} catch {
				// User cancelled or not supported, fall through to social share
			}
		}

		// Fallback: use social share buttons via getShareAPI
		const shareAPI = getShareAPI({
			url: "/action-maker",
			title: `${result.nickname}的微習慣`,
			text: shareText,
		});
		shareAPI.facebookShare?.();
	}, [result]);

	if (!result) {
		navigateTo("/action-maker", { replace: true });
		return null;
	}

	const badge =
		BADGE_STYLES[result.action.level] ??
		(result.isCustomAction ? CUSTOM_BADGE : DEFAULT_BADGE);

	const handlePlayAgain = () => {
		reset();
		navigateTo("/action-maker");
	};

	const handleRegister = () => {
		openLoginDialog({
			redirectUrl: "/action-maker/result",
			source: "website",
		});
	};

	return (
		<StarryBackground>
			<div className="flex min-h-dvh flex-col items-center px-6 pb-8 pt-12">
				{/* Result Card */}
				<div
					ref={cardRef}
					className="w-full max-w-sm rounded-2xl border border-[rgba(188,213,238,0.3)] bg-[rgba(24,33,94,0.7)] p-6"
				>
					<div className="flex flex-col gap-4">
						{/* Header */}
						<div>
							<p className="text-lg text-[#BCD5EE]">{result.nickname}</p>
							<h2 className="text-xl font-bold text-white">
								你抓住了{result.categoryLabel}之星！
							</h2>
						</div>

						{/* Badge + Action title */}
						<div className="flex items-center gap-3">
							<span
								className={`rounded-full px-3 py-1 text-xs text-white ${badge.bg}`}
							>
								{badge.label}
							</span>
							<span className="font-bold text-white">{result.action.title}</span>
						</div>

						{/* Action details */}
						<div>
							<h3 className="mb-1 text-sm font-medium text-[#7B9FC4]">
								具體行動內容
							</h3>
							{result.action.duration && (
								<p className="mb-1 text-xs text-[#7B9FC4]">
									{result.action.duration}
								</p>
							)}
							<p className="text-sm leading-relaxed text-[#BCD5EE]">
								{result.action.description}
							</p>
						</div>

						{/* Trigger timing */}
						<div>
							<h3 className="mb-1 text-sm font-medium text-[#7B9FC4]">
								啟動時機
							</h3>
							<p className="text-white">{result.triggerTiming}</p>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="mt-8 w-full max-w-sm">
					<NavigationButtons
						primaryLabel="分享"
						secondaryLabel="再玩一次"
						onPrimary={handleShare}
						onSecondary={handlePlayAgain}
						showRefreshIcon
					/>

					{/* Registration CTA - only show when not authenticated */}
					{!isAuthenticated && (
						<div className="mt-4 text-center">
							<p className="mb-3 text-sm text-[#7B9FC4]">
								加入島島阿學，記錄你的學習旅程
							</p>
							<button
								type="button"
								onClick={handleRegister}
								className="w-full rounded-full bg-gradient-to-r from-[#5B8DB8] to-[#7B9FC4] py-3 text-base font-medium text-white transition-all hover:brightness-110"
							>
								註冊
							</button>
						</div>
					)}
				</div>
			</div>
		</StarryBackground>
	);
}
