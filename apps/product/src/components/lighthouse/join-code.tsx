"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Copy } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

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
}

export function JoinCode({ joinToken, hideCopyButton = false }: JoinCodeProps) {
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
    <div className="mt-3 flex flex-col gap-3 rounded-2xl bg-[#F0FBF9] p-4 sm:flex-row sm:items-center">
      <canvas
        ref={canvasRef}
        className="size-[132px] rounded-lg bg-white"
        aria-label={t("join_qr_code")}
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0D7773]">
          {t("join_link")}
        </p>
        <p className="mt-2 break-all text-xs text-[#456B68]">{joinUrl}</p>
        {!hideCopyButton && (
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={copyLink}
            disabled={!joinUrl}
          >
            <Copy className="size-4" />
            {t("copy_link")}
          </Button>
        )}
      </div>
    </div>
  );
}
