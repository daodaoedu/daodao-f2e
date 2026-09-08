"use client";

import type { ChatMemberType } from "@daodao/api";
import { useChatMembers } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { cn } from "@daodao/ui/lib/utils";
import { Shield, X } from "lucide-react";

interface MemberPanelProps {
  roomId: number;
  isOpen: boolean;
  onClose: () => void;
}

function MemberItem({ member }: { member: ChatMemberType }) {
  const t = useTranslations("messages");

  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5">
      <div className="relative shrink-0">
        <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 overflow-hidden">
          {member.avatar ? (
            <img src={member.avatar} alt="" className="size-full object-cover" />
          ) : (
            (member.nickname ?? "?").charAt(0)
          )}
        </div>
        {member.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-green-500 border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-text-dark truncate">
            {member.nickname ?? t("deleted_user")}
          </span>
          {member.isHost && <Shield className="size-3.5 shrink-0 text-amber-500" />}
        </div>
        {member.bio && <p className="text-xs text-text-dark/50 truncate">{member.bio}</p>}
      </div>
    </div>
  );
}

export function MemberPanel({ roomId, isOpen, onClose }: MemberPanelProps) {
  const t = useTranslations("messages");
  const { data: members } = useChatMembers(isOpen ? roomId : null);

  const memberList = Array.isArray(members) ? members : [];
  const sorted = [...memberList].sort((a, b) => {
    if (a.isHost && !b.isHost) return -1;
    if (!a.isHost && b.isHost) return 1;
    return 0;
  });

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="absolute inset-0 bg-black/20 z-10 cursor-default"
          onClick={onClose}
          aria-label="Close"
        />
      )}
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-[240px] bg-white shadow-lg z-20 flex flex-col transition-transform duration-200",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-medium text-text-dark">
            {t("member_panel_count", { count: memberList.length })}
          </h3>
          <Button variant="ghost" size="icon" className="size-7" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {sorted.map((member) => (
            <MemberItem key={member.userId} member={member} />
          ))}
        </div>
      </div>
    </>
  );
}
