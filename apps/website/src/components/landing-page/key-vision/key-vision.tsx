"use client";

import { useAuth } from "@daodao/auth";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";
import { ChevronRight } from "lucide-react";
import { LottieHero } from "./lottie-hero";

export function KeyVision() {
  const { openLoginDialog } = useAuth();
  return (
    <div className="relative md:pb-32">
      <Image
        src="/assets/landing-page/deco-comma.svg"
        alt="裝飾逗號"
        width={83}
        height={97}
        className="absolute md:top-6"
        data-preload
      />
      <div className="mx-auto max-w-none px-0 md:px-16 xl:px-24">
        <div className="relative grid grid-cols-12 pt-24 md:pt-32">
          <div className="relative col-span-12 mx-auto flex w-fit flex-col items-center justify-center text-center font-semibold md:col-span-4 md:items-start md:pl-4 md:text-left lg:col-span-5 lg:pl-32">
            <Image
              src="/assets/landing-page/deco-flower-orange.svg"
              alt="裝飾橘花"
              width={44}
              height={39}
              className="absolute left-0 top-0 z-0 size-6 md:size-16"
              data-preload
            />
            <Image
              src="/assets/landing-page/deco-arrow.svg"
              alt="裝飾箭頭"
              width={93}
              height={75}
              className="absolute -right-12 -top-5 z-0"
              data-preload
            />
            <Image
              src="/assets/landing-page/logo.svg"
              alt="島島阿學 Logo"
              width={200}
              height={44}
              className="relative z-20 mb-8"
              data-preload
              priority
            />
            <h2 className="relative z-20 space-y-3 text-xl text-primary-darker xl:text-2xl">
              <div>讓學習成為充滿</div>
              <div className="space-y-3 text-2xl text-primary-base xl:text-3xl">
                <div>自我掌握、互助支持</div>
                <div>和看得見進步的美好日常</div>
              </div>
            </h2>

            <Button
              variant="ctaOrange"
              size="huge"
              className="relative z-20 mt-8"
              onClick={() => openLoginDialog({ redirectUrl: "/" })}
            >
              立即加入
              <ChevronRight className="ml-2 size-5" />
            </Button>
          </div>

          <div className="col-span-12 aspect-564/396 w-full md:aspect-498/320 md:col-span-8 md:pr-2 lg:col-span-7 lg:pr-24">
            <div className="aspect-564/396 w-full md:aspect-498/320" aria-hidden="true">
              <LottieHero />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
