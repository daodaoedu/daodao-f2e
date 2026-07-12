"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Home } from "lucide-react";
import { motion } from "motion/react";

export type FarewellVariant = "completed" | "draft-saved" | "direction-saved" | "draft-waiting";

interface FarewellScreenProps {
  variant: FarewellVariant;
  onNavigateToList: () => void;
}

const FAREWELL_COPY: Record<FarewellVariant, { titleKey: string; subtitleKey: string }> = {
  completed: {
    titleKey: "summary_farewell_completed_title",
    subtitleKey: "summary_farewell_completed_subtitle",
  },
  "draft-saved": {
    titleKey: "summary_farewell_draft_saved_title",
    subtitleKey: "summary_farewell_draft_saved_subtitle",
  },
  "direction-saved": {
    titleKey: "summary_farewell_direction_saved_title",
    subtitleKey: "summary_farewell_direction_saved_subtitle",
  },
  "draft-waiting": {
    titleKey: "summary_farewell_draft_waiting_title",
    subtitleKey: "summary_farewell_draft_waiting_subtitle",
  },
};

/**
 * Farewell 過場畫面
 * @description 使用者點擊離開（X 按鈕）後顯示的全螢幕告別畫面，依當次操作結果顯示對應文案（FRD FR-3.10.3）
 */
export function FarewellScreen({ variant, onNavigateToList }: FarewellScreenProps) {
  const t = useTranslations("practice");
  const copy = FAREWELL_COPY[variant];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex min-h-screen w-screen flex-col items-center justify-center bg-white px-6 text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        className="flex size-16 items-center justify-center rounded-full bg-primary-lightest text-2xl font-bold text-text-dark"
      >
        {t("summary_mascot_label")}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="mt-6 text-2xl font-bold text-text-dark"
      >
        {t(copy.titleKey as any)}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
        className="mt-2 text-sm text-logo-gray"
      >
        {t(copy.subtitleKey as any)}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        className="mt-8"
      >
        <Button type="button" variant="outline" className="gap-1.5" onClick={onNavigateToList}>
          <Home className="size-3.5" />
          {t("summary_nav_to_practice_list")}
        </Button>
      </motion.div>
    </motion.div>
  );
}
