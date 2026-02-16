"use client";

import { useAuth } from "@daodao/auth";
import { captureElementAsImage, getShareAPI } from "@daodao/shared";
import { useCallback, useEffect, useRef } from "react";
import { useActionMaker } from "../hooks/use-action-maker";
import { categoryMap } from "../utils/category-map";
import { NavigationButtons } from "./navigation-buttons";
import { StarryBackground } from "./starry-background";

const DEFAULT_BADGE = { bg: "bg-[var(--am-badge-beginner)] border border-[var(--am-badge-beginner-border)] text-[var(--am-badge-beginner-border)]", label: "初學" } as const;
const CUSTOM_BADGE = { bg: "bg-[var(--am-gray-blue)]", label: "自訂" } as const;

const BADGE_STYLES: Record<string, { bg: string; label: string }> = {
	beginner: DEFAULT_BADGE,
	intermediate: { bg: "bg-[var(--am-badge-intermediate)] border border-[var(--am-badge-intermediate-border)] text-[var(--am-badge-intermediate-border)]", label: "中級" },
	advanced: { bg: "bg-[var(--am-badge-advanced)] border border-[var(--am-badge-advanced-border)] text-[var(--am-badge-advanced-border)]", label: "進階" },
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

	useEffect(() => {
		if (!result) {
			navigateTo("/action-maker", { replace: true });
		}
	}, [result, navigateTo]);

	if (!result) {
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

	const CategoryIcon = categoryMap.get(result.category)?.icon;

	return (
		<StarryBackground>
			<div className="flex min-h-dvh flex-col items-center px-6 pb-8 pt-36">
				{/* Result Card */}
				<div className="relative w-full max-w-sm">
					{/* Category icon – card top-left */}
					{CategoryIcon && (
						<div className="pointer-events-none absolute -left-10 -top-25 z-20">
							<CategoryIcon width={180} height={180} />
						</div>
					)}
					<div
						ref={cardRef}
						className="relative z-10 w-full rounded-2xl border border-[rgba(188,213,238,0.3)] bg-[rgba(24,33,94,0.7)] p-6"
					>
						<div className="flex flex-col gap-4">
							{/* Header */}
							<div className="text-center">
								<p className="text-lg text-[#BCD5EE]">{result.nickname}</p>
								<h2 className="text-xl font-bold text-white">
									你抓住了{result.categoryLabel}之星！
								</h2>
							</div>

							{/* Badge + Action title */}
							<div className="flex items-center gap-3">
								<span
									className={`rounded-full px-3 py-1 text-xs ${badge.bg}`}
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

					{/* Registration CTA – only for unauthenticated users */}
					{!isAuthenticated && (<div className="px-6 pt-4 text-center">
						<p className="mb-4 text-sm leading-relaxed text-[#BCD5EE]">
							加入島島阿學，記錄你的學習旅程
							<br />
							開啟屬於你的微習慣追蹤
						</p>
						<button
							type="button"
							onClick={handleRegister}
							className="w-full rounded-full py-4 text-base font-medium text-white transition-all hover:brightness-110"
							style={{
								background:
									"radial-gradient(40% 80% at 95% 10%, rgba(107, 173, 224, 0.56) 0%, rgba(107, 173, 224, 0) 100%), radial-gradient(40% 80% at 5% 90%, rgba(211, 90, 255, 0.56) 0%, rgba(211, 90, 255, 0) 100%), #4285F4",
								boxShadow:
									"6px -4px 24px -4px rgba(80, 120, 255, 0.5), -6px 6px 24px -4px rgba(211, 90, 255, 0.5)",
							}}
						>
							註冊
						</button>
					</div>)}
				</div>
			</div>
		</StarryBackground>
	);
}
