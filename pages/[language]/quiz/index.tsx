import { useEffect } from "react";
import Link from "next/link";
import SEOConfig from "@/components/SEOConfig";
import HorizontalLogoSvg from "@/public/assets/brand/horizontal-primary-logo.svg";
import question1Jpg from "@/public/assets/quiz/q1.webp";
import ResultNoisePng from "@/public/assets/quiz/result-noise.png";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { getQuizLayout, useQuiz } from "@/features/quiz";

export default function QuizPage() {
  const { reset } = useQuiz();

  useEffect(reset, []);

  return (
    <>
      <SEOConfig
        title="【我有一個島，它叫＿島】學習風格測驗｜島島阿學"
        description="島島阿學是為「相信學習可以不一樣的人」所打造的學習平台。以科技與社群，匯集學習經驗、資源、人脈，並提供個人化學習管理與技能展現的工具，賦予每個人掌握學習旅程的能力。"
      />
      <div
        className="fixed inset-0 -z-10"
        style={{ backgroundImage: `url(${ResultNoisePng.src})` }}
      />
      <main className="relative max-w-[392px] mx-auto h-dvh text-basic-400">
        <Image
          src={question1Jpg}
          alt="島島阿學"
          className="-z-10 object-contain object-bottom"
          fill
          priority
          style={{ mask: "linear-gradient(transparent 22%, #000 60%)" }}
        />
        <header className="pt-10 mb-6">
          <HorizontalLogoSvg className="w-40 mx-auto" />
        </header>
        <h1 className="mb-6 flex flex-col items-center gap-2">
          <div className="text-[28px] font-bold">我有一個島</div>
          <div className="text-4xl font-bold flex items-center gap-3">
            它叫
            <svg
              width="123"
              height="34"
              viewBox="0 0 123 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="什麼"
            >
              <path
                d="M12 14.9C12.2 15.6 12.8 18.6 13.2 19.4C13.9 20.9 15.5 21 17 21.2C20.4 21.6 22.7 20.8 25.7 19.5C29.7 17.9 33.5 16 37.5 14.4C39.1 13.9 42.1 12.4 44 12.9C45.5 13.3 46.7 14.9 47.7 16C49.3 17.8 50.8 19.4 53.1 20.6C57.9 23 63.4 21.3 68.1 19.6C71.1 18.6 74.1 17.5 77.2 16.8C78.3 16.5 79.4 16.3 80.5 16.7C82.2 17.4 83.3 18.7 85.1 19.3C86.9 20 89 20.2 90.1 20.2C93.4 20.2 95.3 19.6 97.5 18.8C100.1 17.9 102.6 17.2 105.3 16.5C106.4 16.2 107.5 15.6 108.6 15.4C109.6 15.3 110.1 15.3 111 14.9"
                stroke="#16B9B3"
                strokeWidth="24"
                strokeLinecap="round"
              />
            </svg>
            島？
          </div>
        </h1>
        <p className="text-lg text-center">2 分鐘揭曉你是哪種學習類型，</p>
        <p className="text-lg text-center">
          找到你適合的
          <strong className="font-bold">學習策略與夥伴</strong>！
        </p>
        <Button
          className="absolute bottom-28 left-1/2 -translate-x-1/2"
          size="lg"
          asChild
        >
          <Link href="/quiz/questions/q1">開始測驗</Link>
        </Button>
      </main>
    </>
  );
}

QuizPage.getLayout = getQuizLayout;
