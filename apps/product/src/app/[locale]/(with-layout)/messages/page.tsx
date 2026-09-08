"use client";

import { useTranslations } from "@daodao/i18n";
import { ChatLayout } from "@/components/chat/chat-layout";

export default function MessagesPage() {
  const t = useTranslations("messages");
  return (
    <ChatLayout>
      <div className="flex flex-1 items-center justify-center text-text-dark/40">
        <p className="text-sm">{t("empty_conversation")}</p>
      </div>
    </ChatLayout>
  );
}
