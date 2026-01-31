"use client";

import { useAuth } from "@daodao/auth";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";

export function CallToActionSection() {
  const { openLoginDialog } = useAuth();

  return (
    <section className="relative my-20 flex min-h-[366px] flex-col items-center justify-center px-6 overflow-hidden">
      <Image
        src="/assets/landing-page/bg-island.svg"
        alt=""
        fill
        className="z-0 object-cover object-center md:object-contain"
        aria-hidden="true"
      />
      <h2 className="relative z-10 my-4 text-center text-[20px] font-semibold leading-tight text-primary-darker md:text-[24px]">
        準備好重新打造
        <br />
        你喜歡的學習生活了嗎？
      </h2>
      <div className="relative z-10">
        <Button variant="ctaOrange" size="huge" onClick={() => openLoginDialog({ redirectUrl: "/" })}>
          立即加入
        </Button>
      </div>
    </section>
  );
}
