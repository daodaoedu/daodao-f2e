"use client";

import { useSpaceMembers } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@daodao/ui/components/animate-ui/components/radix/dialog";
import { Spinner } from "@daodao/ui/components/spinner";
import { Star } from "lucide-react";

interface SpaceMembersDialogProps {
  spaceId: string;
  open: boolean;
  onClose: () => void;
}

/**
 * 成員彈窗 (FR-1.3/1.4): the full roster with a user-star icon on the host
 * row; the list scrolls inside the dialog capped at 76% of the viewport.
 */
export const SpaceMembersDialog = ({ spaceId, open, onClose }: SpaceMembersDialogProps) => {
  const t = useTranslations("space");
  const { data, isLoading } = useSpaceMembers(open ? spaceId : undefined);
  const members = data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[76vh] max-w-[360px] overflow-hidden rounded-[24px]">
        <DialogHeader>
          <DialogTitle className="text-lg text-text-dark">{t("members_title")}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner aria-label={t("loading")} />
          </div>
        ) : (
          <ul className="m-0 flex max-h-[calc(76vh-96px)] list-none flex-col gap-1 overflow-y-auto p-0">
            {members.map((member) => (
              <li key={member.userId} className="flex items-center gap-3 rounded-xl px-2 py-2">
                <span className="inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-lightest text-xs font-bold text-basic-600">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.nickname ?? ""}
                      className="size-full object-cover"
                    />
                  ) : (
                    (member.nickname ?? "?").slice(0, 1)
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-text-dark">
                  {member.nickname}
                </span>
                {member.isHost && (
                  <Star
                    aria-label={t("member_host")}
                    className="size-4 shrink-0 text-primary-base"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
};
