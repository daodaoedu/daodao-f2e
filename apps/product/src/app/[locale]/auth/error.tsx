"use client";

import { Button } from "@daodao/ui/components/button";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { BackgroundAnimation, PageHeader } from "@/components/layout";

interface AuthErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AuthError({ reset }: AuthErrorProps) {
  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto">
      <PageHeader leftAction={null} rightActionTo="/" />

      <BackgroundAnimation />

      <main className="max-w-[448px] mx-auto px-5 pb-[128px] pt-12 md:pt-24">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-text-dark">發生錯誤</h1>

          <p className="text-text-gray">請稍後再試，或透過以下方式聯繫我們：</p>

          <div className="flex gap-4 text-sm text-[--logo-cyan]">
            <Link
              href="https://discord.com/invite/8GnqSZZxp7"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Discord
            </Link>
            <Link
              href="https://www.instagram.com/daodao_learn/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Instagram
            </Link>
            <Link href="mailto:contact@daodao.so" className="underline underline-offset-2">
              Email
            </Link>
          </div>

          <div className="flex flex-col gap-3 w-full mt-8">
            <Button variant="orange" className="w-full" onClick={reset}>
              重試
            </Button>

            <Button variant="ghost" className="w-full" asChild>
              <Link href="/">返回首頁</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
