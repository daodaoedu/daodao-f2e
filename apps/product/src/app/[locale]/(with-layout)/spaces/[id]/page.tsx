"use client";

import { useSpaceDetail, useSpaceHomePage, useSpacePractices } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Spinner } from "@daodao/ui/components/spinner";
import { cn } from "@daodao/ui/lib/utils";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { InProgressTask } from "@/components/dashboard";
import {
  SpaceHomeCreateButton,
  SpaceHomeGuide,
  SpaceHomeTab,
  SpaceMembersDialog,
  SpacePracticeSection,
  SpaceSubpageHeader,
} from "@/components/spaces";
import type { PracticeStatus } from "@/constants/practice-status";
import { mapPracticeStatusToTaskStatus } from "@/constants/task-status";

type SpaceTab = "home" | "practices";

/**
 * 活動課程空間子頁 (FRD 4.1): 標頭與成員名單、空間首頁/實踐分頁、
 * 首頁建立流程。首頁分頁的顯示條件由 server 過濾（成員看不到草稿頁）。
 */
export default function EventSpacePage() {
  const t = useTranslations("space");
  const params = useParams<{ id: string }>();
  const spaceId = params.id;

  const { data: detailData, isLoading: isDetailLoading } = useSpaceDetail(spaceId);
  const { data: homePageData, isLoading: isHomeLoading } = useSpaceHomePage(spaceId);
  const { data: practicesData } = useSpacePractices(spaceId);

  const [membersOpen, setMembersOpen] = useState(false);
  const [guideCollapsed, setGuideCollapsed] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SpaceTab | null>(null);
  const [editingBlockIds, setEditingBlockIds] = useState<Set<number>>(new Set());

  const handleEditingChange = (blockId: number, editing: boolean) => {
    setEditingBlockIds((current) => {
      const next = new Set(current);
      if (editing) {
        next.add(blockId);
      } else {
        next.delete(blockId);
      }
      return next;
    });
  };

  const detail = detailData?.data;
  const homePage = homePageData?.data ?? null;
  const isHost = detail?.viewerRole === "host";
  const homeTabVisible = homePage !== null;
  // FR-2.3: 首頁分頁不顯示時直接落在實踐分頁，不出現缺頁提示
  const currentTab: SpaceTab = activeTab ?? (homeTabVisible ? "home" : "practices");

  const tasks = useMemo<InProgressTask[]>(
    () =>
      (practicesData?.data ?? []).map((practice) => ({
        id: practice.id,
        title: practice.title,
        description: "",
        checkInCount: 0,
        progress: practice.progressPercentage ?? 0,
        messagesCount: 0,
        isUnreadMessages: false,
        theme: practice.themeColor || "#FCDD84",
        status: mapPracticeStatusToTaskStatus(practice.status as PracticeStatus),
        startDate: practice.startDate,
        endDate: practice.endDate,
      })),
    [practicesData]
  );

  if (isDetailLoading || isHomeLoading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-[640px] items-start justify-center px-4 pt-24">
        <Spinner aria-label={t("loading")} />
      </div>
    );
  }

  if (!detail) return null;

  const practiceCount = detail.practiceCount;

  return (
    <div className="mx-auto min-h-screen max-w-[640px] px-4 pb-[72px] pt-6">
      <SpaceSubpageHeader
        title={detail.name}
        subtitle={detail.subtitle}
        actions={
          <button
            type="button"
            onClick={() => setMembersOpen(true)}
            aria-label={t("members_label", { count: detail.memberCount })}
            className="flex shrink-0 items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-[#F0F9F8]"
          >
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-lightest px-[7px] text-xs font-bold text-basic-600">
              {detail.memberCount}
            </span>
            <span className="inline-flex items-center">
              {detail.memberAvatars.map((member, index) => (
                <span
                  key={`${member.nickname}-${index}`}
                  className={cn(
                    "inline-flex size-[26px] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-primary-lightest text-[11px] font-bold text-basic-600",
                    index > 0 && "-ml-2"
                  )}
                >
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
              ))}
            </span>
          </button>
        }
      />

      {/* 分頁列（FR-2.1）：空間首頁 + 實踐（數量） */}
      <div className="mb-4 flex items-center border-b border-[#E5E7EB]">
        {homeTabVisible && (
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all",
              currentTab === "home"
                ? "-mb-px border-b-2 border-logo-cyan text-text-dark"
                : "text-text-dark/40"
            )}
          >
            {t("tab_home")}
            {isHost && homePage?.status === "draft" && (
              <span className="ml-1.5 rounded-full bg-basic-100 px-1.5 py-px text-[11px] text-text-dark/60">
                {t("draft_badge")}
              </span>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            // 切至實踐分頁時結束所有區塊編輯狀態，內容由編輯器 flush 保留（FR-2.5）
            setEditingBlockIds(new Set());
            setActiveTab("practices");
          }}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-all",
            currentTab === "practices"
              ? "-mb-px border-b-2 border-logo-cyan text-text-dark"
              : "text-text-dark/40"
          )}
        >
          {t("tab_practices")}
          <span className="ml-1 text-xs text-text-dark/50">{practiceCount}</span>
        </button>
        <div className="flex-1" />
        {/* 引導卡收起後的永久入口（FR-3.3）；首頁已存在時不得出現（FR-3.8） */}
        {isHost && !homeTabVisible && guideCollapsed && (
          <SpaceHomeCreateButton onClick={() => setStartOpen(true)} />
        )}
      </div>

      {isHost && !homeTabVisible && (
        <div className={cn(guideCollapsed ? "" : "mb-4")}>
          <SpaceHomeGuide
            spaceId={spaceId}
            collapsed={guideCollapsed}
            onCollapse={() => setGuideCollapsed(true)}
            onCreated={() => setActiveTab("home")}
            startOpen={startOpen}
            onStartOpenChange={setStartOpen}
          />
        </div>
      )}

      {currentTab === "home" && homePage ? (
        <SpaceHomeTab
          spaceId={spaceId}
          homePage={homePage}
          isHost={isHost}
          practices={practicesData?.data ?? []}
          editingIds={editingBlockIds}
          onEditingChange={handleEditingChange}
        />
      ) : (
        <SpacePracticeSection tasks={tasks} />
      )}

      <SpaceMembersDialog
        spaceId={spaceId}
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
      />
    </div>
  );
}
