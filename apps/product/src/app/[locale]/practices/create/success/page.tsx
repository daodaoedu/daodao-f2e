"use client";

import { ArrowRightOutlineSvg } from "@daodao/assets";
import featureHappyJson from "@daodao/assets/images/quiz/feature-happy.json";
import { useTranslations } from "@daodao/i18n";
import { useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { ConfettiAnimation } from "@daodao/ui/components/confetti-animation";
import Lottie from "lottie-react";
import { motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BackgroundAnimation } from "@/components/layout";

export default function PracticeSuccessPage() {
  const t = useTranslations("practice");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(11);

  // 從 URL query 參數取得 practiceId
  const practiceId = searchParams.get("practiceId");

  const handleBackToIsland = useCallback(() => {
    router.push("/");
  }, [router]);

  // 倒數計時自動跳轉
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      handleBackToIsland();
    }
  }, [countdown, handleBackToIsland]);

  const handleStartPractice = useCallback(() => {
    if (practiceId) {
      router.push(`/practices/${practiceId}`);
    } else {
      // 如果沒有 practiceId，導航回首頁
      handleBackToIsland();
    }
  }, [practiceId, router, handleBackToIsland]);

  return (
    <div className="relative w-screen min-h-screen z-10 overflow-hidden overflow-y-auto bg-white">
      {/* 背景漸層動畫 */}
      <BackgroundAnimation />

      {/* Confetti 動畫 */}
      <ConfettiAnimation />

      <main className="relative max-w-[600px] mx-auto min-h-screen flex flex-col items-center justify-center px-5 py-12">
        {/* 標題區域 */}
        <div className="text-center py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-medium text-text-dark leading-normal">{t("create_success_title")}</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-sm text-text-dark">{t("create_success_subtitle")}</p>
          </motion.div>
        </div>

        {/* 角色區域 */}
        <div className="flex items-center justify-center w-[375px] h-[275px]">
          <Lottie
            animationData={featureHappyJson}
            className="*:w-full *:h-full"
            loop={true}
            autoplay={true}
          />
        </div>

        {/* 鼓勵文字 */}
        <motion.div
          className="text-center py-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <p className="text-sm text-logo-cyan">{t("create_success_motivation1")}</p>
          <p className="text-sm text-logo-cyan">{t("create_success_motivation2")}</p>
        </motion.div>

        {/* 按鈕區域 */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Button onClick={handleStartPractice} variant="ctaOrange" className="inline-flex mb-6">
            {t("create_success_start_btn")}
            <ArrowRightOutlineSvg className="size-4.5" />
          </Button>

          <Button
            onClick={handleBackToIsland}
            variant="ghost"
            className="inline-flex mb-px"
            animation="none"
          >
            {t("create_success_back_home")}
            <ArrowRightOutlineSvg className="size-4.5" />
          </Button>
          {/* 倒數計時提示 */}
          <motion.p
            className="text-sm text-light-gray"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            {t("create_success_countdown", { countdown })}
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}
