"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { Copy } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

interface JoinCodeProps {
  joinToken: string;
}

export function JoinCode({ joinToken }: JoinCodeProps) {
  const t = useTranslations("lighthouse");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    const url = `${window.location.origin}/cohorts/join/${joinToken}`;
    setJoinUrl(url);
    if (canvasRef.current) {
      void QRCode.toCanvas(canvasRef.current, url, {
        width: 132,
        margin: 1,
        color: { dark: "#0D3036", light: "#FFFFFF" },
      });
    }
  }, [joinToken]);

  async function copyLink() {
    await navigator.clipboard.writeText(joinUrl);
    toast.success(t("join_link_copied"));
  }

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
        <p className="mt-2 truncate text-xs text-[#456B68]">{joinUrl}</p>
        <Button size="sm" variant="outline" className="mt-3" onClick={copyLink} disabled={!joinUrl}>
          <Copy className="size-4" />
          {t("copy_link")}
        </Button>
      </div>
    </div>
  );
}
