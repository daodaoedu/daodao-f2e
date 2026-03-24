"use client";

import featureHappyJson from "@daodao/assets/images/quiz/feature-happy.json";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { ConfettiAnimation } from "@daodao/ui/components/confetti-animation";
import Lottie from "lottie-react";
import { MailIcon } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

interface SuccessSectionProps {
  /** 用戶名稱，用於個人化歡迎訊息 */
  userName?: string;
}

/**
 * Onboarding Step 4: 完成頁面
 * 顯示歡迎訊息和後續引導
 */
export const SuccessSection = ({ userName }: SuccessSectionProps) => {
  const t = useTranslations("onboarding");
  const router = useRouter();

  const handleGoToPreferences = () => {
    router.push("/");
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <>
      {/* Confetti 彩帶動畫 */}
      <ConfettiAnimation />

      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        {/* Lottie 動畫 */}
        <motion.div
          className="w-[200px] h-[150px] mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Lottie
            animationData={featureHappyJson}
            className="w-full h-full"
            loop={true}
            autoplay={true}
          />
        </motion.div>

        {/* 歡迎標題 */}
        <motion.h1
          className="heading-xl text-text-dark mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {userName
            ? t("steps.success.titleWithName", { name: userName })
            : t("steps.success.title")}
        </motion.h1>

        {/* Email 提醒 */}
        <motion.div
          className="flex items-center gap-2 text-light-gray mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <MailIcon className="size-4" />
          <span>{t("steps.success.emailReminder")}</span>
        </motion.div>

        {/* CTA 按鈕 */}
        <motion.div
          className="w-full max-w-sm space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button variant="ctaPrimary" className="w-full" onClick={handleGoToPreferences}>
            {t("steps.success.primaryButton")}
          </Button>
          <Button variant="ghost" className="w-full" onClick={handleSkip}>
            {t("steps.success.secondaryButton")}
          </Button>
        </motion.div>
      </div>
    </>
  );
};
