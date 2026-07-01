"use client";

import { Button } from "@daodao/ui/components/button";
import { Home } from "lucide-react";
import { motion } from "motion/react";

export type FarewellVariant = "completed" | "draft-saved" | "direction-saved" | "draft-waiting";

interface FarewellScreenProps {
  variant: FarewellVariant;
  onNavigateToList: () => void;
}

const FAREWELL_COPY: Record<FarewellVariant, { title: string; subtitle: string }> = {
  completed: {
    title: "這段實踐已經完成",
    subtitle: "你的學習軌跡會留在島上",
  },
  "draft-saved": {
    title: "已幫你存好了",
    subtitle: "你的草稿正在島上等你",
  },
  "direction-saved": {
    title: "你的方向已經記下",
    subtitle: "你知道下一步要往哪裡走",
  },
  "draft-waiting": {
    title: "你的草稿正在島上等你",
    subtitle: "隨時回來繼續",
  },
};

/**
 * Farewell 過場畫面
 * @description 使用者點擊離開（X 按鈕）後顯示的全螢幕告別畫面，依當次操作結果顯示對應文案（FRD FR-3.10.3）
 */
export function FarewellScreen({ variant, onNavigateToList }: FarewellScreenProps) {
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
        島
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="mt-6 text-2xl font-bold text-text-dark"
      >
        {copy.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
        className="mt-2 text-sm text-logo-gray"
      >
        {copy.subtitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        className="mt-8"
      >
        <Button type="button" variant="outline" className="gap-1.5" onClick={onNavigateToList}>
          <Home className="size-3.5" />
          前往主題實踐列表
        </Button>
      </motion.div>
    </motion.div>
  );
}
