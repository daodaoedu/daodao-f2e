"use client";

import { useAuth } from "@daodao/auth";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";

export function CommunitySection() {
  const { openLoginDialog } = useAuth();

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-lg rounded-2xl border-2 border-[#16B9B3] bg-[#16B9B3]/5 px-6 py-10 text-center">
          {/* 標題 */}
          <h2 className="text-[1.75rem] font-bold leading-tight">
            <span className="text-primary-base">加入社群</span>
            <span className="text-primary-darker">一起討論</span>
          </h2>

          {/* 副標題 */}
          <p className="mt-4 text-sm leading-relaxed text-basic-400">
            分享學習想法和心得
            <br />
            在互動討論中找到志同道合夥伴
            <br />
            實踐路上，你不孤單
          </p>

          {/* 插圖 */}
          <div className="relative mx-auto my-8 aspect-[4/3] w-full max-w-sm">
            <Image
              src="/assets/landing-page/feature-community.png"
              alt="社群討論"
              fill
              className="object-contain"
            />
          </div>

          {/* 統計數字 */}
          <p className="mb-4 text-lg">
            <span className="text-2xl font-bold text-primary-base">56</span>
            <span className="text-primary-darker">人等候加入中</span>
          </p>

          {/* CTA 按鈕 */}
          <Button
            variant="ctaOrange"
            size="huge"
            onClick={() => openLoginDialog({ redirectUrl: "/" })}
          >
            加入等候清單
          </Button>

          {/* 說明文字 */}
          <p className="mt-4 text-[13px] text-basic-300">我們會在功能推出的第一時間聯繫你</p>
        </div>
      </div>
    </section>
  );
}
