"use client";

import {
  followTarget,
  unfollowTarget,
  useArchivePractice,
  useCopyPractice,
  useDeletePractice,
} from "@daodao/api";
import { ChartColumnIncreasingSvg, FlagOutlineSvg, TelescopeSvg } from "@daodao/assets";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { usePathname, useRouter } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { Archive, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { refreshOnboardingStatus } from "@/components/task-guide/onboarding-progress-context";
import {
  ArchivePracticeResult,
  useArchivePracticeDialog,
} from "@/hooks/use-archive-practice-dialog";
import {
  DeletePracticeResult,
  useDeletePracticeDialog,
} from "@/hooks/use-delete-practice-dialog";

interface PracticeActionMenuProps {
  practiceId: string;
  isOwner: boolean;
  onBrowseActivity: () => void;
}

export function PracticeActionMenu({
  practiceId,
  isOwner,
  onBrowseActivity,
}: PracticeActionMenuProps) {
  const t = useTranslations("app_product");
  const practiceT = useTranslations("practice");
  const commonT = useTranslations("common");
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { copyPractice } = useCopyPractice();
  const { archivePractice, restorePractice } = useArchivePractice(practiceId);
  const { deletePractice } = useDeletePractice(practiceId);
  const { openArchiveDialog } = useArchivePracticeDialog();
  const { openDeleteDialog } = useDeletePracticeDialog();

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      const search = typeof window !== "undefined" ? window.location.search : "";
      const redirectUrl = search ? `${pathname}${search}` : pathname;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    try {
      if (wasFollowing) {
        await unfollowTarget("practice", practiceId);
        toast.success(t("following_unfollowed"));
      } else {
        await followTarget({ targetType: "practice", targetId: practiceId });
        toast.success(t("following_followed_practice"));
      }
    } catch {
      setIsFollowing(wasFollowing);
      toast.error(t("operation_failed_retry"));
    }
  };

  const handleBrowseActivity = () => {
    setMenuOpen(false);
    onBrowseActivity();
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: stop card click
    // biome-ignore lint/a11y/noStaticElementInteractions: stop card click
    <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => setMenuOpen((v) => !v)}
        className={cn("h-8 w-8", menuOpen ? "bg-[#E4EAE9]" : "hover:bg-[#E4EAE9]")}
      >
        <MoreHorizontal className="size-4" />
      </Button>

      {menuOpen && isOwner && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-lg border border-[#E4EAE9] py-2 z-20 min-w-[140px]">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setMenuOpen(false);
              router.push(`/practices/${practiceId}/edit`);
            }}
            className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
          >
            <Pencil className="size-[18px] shrink-0" />
            <span>{practiceT("action_edit")}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isCopying}
            onClick={async () => {
              setMenuOpen(false);
              try {
                setIsCopying(true);
                const { id: newId } = await copyPractice(practiceId);
                refreshOnboardingStatus();
                router.push(`/practices/copy-success?practiceId=${newId}`);
              } catch {
                toast.error(practiceT("copy_failed"));
              } finally {
                setIsCopying(false);
              }
            }}
            className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
          >
            <Copy className="size-[18px] shrink-0" />
            <span>{practiceT("action_copy")}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              setMenuOpen(false);
              const result = await openArchiveDialog({
                onRestore: async () => {
                  try {
                    await restorePractice();
                    toast.success(practiceT("restore_success"));
                  } catch {
                    toast.error(practiceT("restore_failed"));
                  }
                },
              });
              if (result === ArchivePracticeResult.Archived) {
                try {
                  await archivePractice();
                  router.refresh();
                } catch {
                  toast.error(practiceT("archive_failed"));
                }
              }
            }}
            className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
          >
            <Archive className="size-[18px] shrink-0" />
            <span>{practiceT("action_archive")}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleBrowseActivity}
            className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
          >
            <ChartColumnIncreasingSvg className="size-[18px] shrink-0" />
            <span>{practiceT("action_browse_activity")}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              setMenuOpen(false);
              const result = await openDeleteDialog();
              if (result === DeletePracticeResult.Deleted) {
                try {
                  await deletePractice();
                  router.refresh();
                } catch {
                  toast.error(practiceT("delete_failed"));
                }
              }
            }}
            className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="size-[18px] shrink-0" />
            <span>{practiceT("action_delete")}</span>
          </Button>
        </div>
      )}
      {menuOpen && !isOwner && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-lg border border-[#E4EAE9] py-2 z-20 min-w-[140px]">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setMenuOpen(false);
              window.open("https://tally.so/r/BzGQy4", "_blank");
            }}
            className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
          >
            <FlagOutlineSvg className="size-5 shrink-0" />
            <span>{commonT("report")}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setMenuOpen(false);
              void handleToggleFollow();
            }}
            className={cn(
              "w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm transition-colors cursor-pointer",
              isFollowing
                ? "text-logo-cyan hover:bg-[#E8FAF9]"
                : "text-[#295E5C] hover:bg-[#F0F9F8]"
            )}
          >
            <TelescopeSvg className="size-5 shrink-0" />
            <span>{isFollowing ? t("following_unfollow") : t("following_follow")}</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleBrowseActivity}
            className="w-full h-auto justify-start rounded-none gap-3 px-4 py-3 text-sm text-[#295E5C] hover:bg-[#F0F9F8] transition-colors cursor-pointer"
          >
            <ChartColumnIncreasingSvg className="size-5 shrink-0" />
            <span>{t("showcase_browse_activity")}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
