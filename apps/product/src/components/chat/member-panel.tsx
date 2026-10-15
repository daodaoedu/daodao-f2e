"use client";

import type { ChatMemberType } from "@daodao/api";
import { selectChatMembers, useChatMembers } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Shield, X } from "lucide-react";
import { ChatAvatar } from "./chat-avatar";

interface MemberPanelProps {
  roomId: number;
  isOpen: boolean;
  onClose: () => void;
}

const CLOSE_BUTTON =
  "size-7 shrink-0 rounded-full text-[oklch(0.445_0.056_192/0.5)] hover:bg-[oklch(0.962_0.032_211.1)] hover:text-[oklch(0.445_0.056_192/0.5)] [&_svg]:size-4";

function MemberItem({ member }: { member: ChatMemberType }) {
  const t = useTranslations("messages");
  const name = member.nickname ?? t("deleted_user");

  return (
    <div data-chat-member className="flex items-center gap-2.5 px-5 py-[9px]">
      <span className="relative inline-flex shrink-0">
        <ChatAvatar src={member.avatar} alt={name} />
        {member.isOnline && (
          <span
            role="img"
            aria-label={t("member_online")}
            className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-[oklch(0.711_0.12_190.6)]"
          />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-semibold text-[oklch(0.287_0.041_210.8)]">
            {name}
          </span>
          {member.isHost && (
            <span
              role="img"
              aria-label={t("host_badge")}
              title={t("host_badge")}
              className="inline-flex shrink-0 text-[oklch(0.711_0.12_190.6)]"
            >
              <Shield className="size-[13px] fill-current stroke-none" />
            </span>
          )}
        </div>
        {member.bio && (
          <p className="mt-px mb-0 truncate text-[11px] text-[oklch(0.445_0.056_192/0.5)]">
            {member.bio}
          </p>
        )}
      </div>
    </div>
  );
}

/** 成員面板（POC 訊息.dc.html：右側 240px、淡遮罩、開啟時才渲染） */
export function MemberPanel({ roomId, isOpen, onClose }: MemberPanelProps) {
  const t = useTranslations("messages");
  const { data: members } = useChatMembers(isOpen ? roomId : null);

  const memberList = selectChatMembers(members);
  const sorted = [...memberList].sort((a, b) => {
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    return 0;
  });

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        className="absolute inset-0 z-[19] cursor-pointer border-0 bg-[rgba(15,48,54,0.25)] p-0"
        onClick={onClose}
        aria-label={t("member_panel_title")}
      />
      <aside
        aria-label={t("member_panel_title")}
        data-chat-member-panel
        className="absolute top-0 right-0 z-20 h-full w-[240px] overflow-y-auto border-l border-[#E4EAE9] bg-white py-5 shadow-[-8px_0_24px_rgba(15,48,54,0.12)]"
      >
        <div className="mx-5 mb-3 flex items-center justify-between gap-2">
          <p className="m-0 text-xs font-semibold text-[oklch(0.445_0.056_192/0.5)]">
            {t("member_panel_count", { count: memberList.length })}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className={CLOSE_BUTTON}
            onClick={onClose}
            aria-label={t("delete_cancel")}
          >
            <X />
          </Button>
        </div>
        {sorted.map((member) => (
          <MemberItem key={member.userId} member={member} />
        ))}
      </aside>
    </>
  );
}
