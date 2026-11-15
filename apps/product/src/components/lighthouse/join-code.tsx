"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Copy, Lock } from "lucide-react";
import QRCode from "qrcode";
import { type ReactNode, useEffect, useRef, useState } from "react";

/** 加入連結：以目前站台 origin 組出參與者加入頁網址（僅 client 端可得） */
export function useJoinUrl(joinToken: string | null | undefined): string {
  const [joinUrl, setJoinUrl] = useState("");
  useEffect(() => {
    setJoinUrl(joinToken ? `${window.location.origin}/cohorts/join/${joinToken}` : "");
  }, [joinToken]);
  return joinUrl;
}

export function useCopyJoinLink(joinUrl: string) {
  const t = useTranslations("lighthouse");
  return async () => {
    if (!joinUrl) return;
    await navigator.clipboard.writeText(joinUrl);
    toast.success(t("join_link_copied"));
  };
}

interface JoinCodeProps {
  joinToken: string;
  /** 複製鈕已放在外層標題列時隱藏（FR-RS-02） */
  hideCopyButton?: boolean;
  actions?: ReactNode;
  inactive?: boolean;
  inactiveMessage?: ReactNode;
  inactiveMessageTitle?: string;
}

export function JoinCode({
  joinToken,
  hideCopyButton = false,
  actions,
  inactive = false,
  inactiveMessage,
  inactiveMessageTitle,
}: JoinCodeProps) {
  const t = useTranslations("lighthouse");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const joinUrl = useJoinUrl(joinToken);
  const copyLink = useCopyJoinLink(joinUrl);

  useEffect(() => {
    if (joinUrl && canvasRef.current) {
      void QRCode.toCanvas(canvasRef.current, joinUrl, {
        width: 132,
        margin: 1,
        color: { dark: "#0D3036", light: "#FFFFFF" },
      });
    }
  }, [joinUrl]);

  return (
    <div className="mt-3 rounded-2xl bg-[#F0FBF9] p-4">
      {inactive && inactiveMessage && (
        <p className="mb-3 rounded-xl bg-[#FFF6E8] px-3 py-2 text-xs font-medium text-[#8A5700]">
          {inactiveMessage}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative size-[132px] shrink-0">
          <canvas
            ref={canvasRef}
            className={`size-[132px] rounded-lg bg-white ${inactive ? "blur-[3px] opacity-60" : ""}`}
            aria-label={t("join_qr_code")}
          />
          {inactive && (
            <div
              className="absolute inset-0 grid place-items-center rounded-lg bg-white/35"
              aria-hidden="true"
            >
              <Lock className="size-6 text-[#5A7B79]" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0D7773]">
            {t("join_link")}
          </p>
          <p
            className={`mt-2 break-all text-xs ${
              inactive ? "select-none blur-[2px] text-[#78928F]" : "text-[#456B68]"
            }`}
          >
            {joinUrl}
          </p>
          {!hideCopyButton && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-full px-3 py-0 text-xs font-medium"
                onClick={copyLink}
                disabled={!joinUrl || inactive}
                title={inactive ? inactiveMessageTitle : undefined}
              >
                <Copy className="size-4" />
                {t("copy_link")}
              </Button>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
