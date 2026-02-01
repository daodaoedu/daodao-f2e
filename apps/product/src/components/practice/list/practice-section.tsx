"use client";

import type { ElementType } from "react";
import { useUserPractices } from "@daodao/api";
import { useAuth } from "@daodao/auth";
import { ArrowRightOutlineSvg, ExperimentSvg, FlagSvg, NoteSvg } from "@daodao/assets";
import { useIsMobile, useScrollVisibility } from "@daodao/shared";
import { Badge } from "@daodao/ui/components/badge";
import { Button } from "@daodao/ui/components/button";
import { Checkbox } from "@daodao/ui/components/checkbox";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { cn } from "@daodao/ui/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { PracticeStatus } from "@/constants/practice-status";
import {
  mapPracticeStatusToTaskStatus,
  TaskStatus,
  type TaskStatus as TaskStatusType,
} from "@/constants/task-status";
import { RandomPracticesSection } from "../shared/random-practices-section";

type TabType = "practices" | "plans" | "ideas";

interface PracticeItem {
  id: string;
  status: TaskStatusType;
  title: string;
  description: string;
  tags: string[];
}

interface PracticeSectionProps {
  /**
   * 用戶 ID，如果提供則獲取該用戶的實踐，否則獲取當前登入用戶的實踐
   */
  userId: string;
}

interface Tab {
  id: TabType;
  label: string;
  disabled?: boolean;
  Icon: ElementType;
}

/**
 * 「主題實踐」區塊組件
 */
export function PracticeSection({ userId }: PracticeSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>("practices");
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();
  const isScrolled = useScrollVisibility({ threshold: 167 });
  const { user } = useAuth();

  const {
    data: practicesData,
    isLoading,
    error,
  } = useUserPractices(userId, {
    limit: 16, // 取得足夠的實踐列表
  });

  // 判斷是否為自己的資料
  const isOwnData = useMemo(() => {
    return user?.id === userId;
  }, [user?.id, userId]);

  // 將 API 資料轉換為組件需要的格式
  const practices: PracticeItem[] = useMemo(() => {
    if (!practicesData?.data) {
      return [];
    }

    return practicesData.data.map((practice) => ({
      id: practice.id,
      status: mapPracticeStatusToTaskStatus(practice.status as PracticeStatus),
      title: practice.title,
      description: practice.practiceAction || "",
      tags: practice.tags || [],
    }));
  }, [practicesData]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const tabs: Tab[] = [
    { id: "practices", label: "主題實踐", Icon: ExperimentSvg },
    { id: "plans", label: "學習計劃", disabled: true, Icon: FlagSvg },
    { id: "ideas", label: "想法", disabled: true, Icon: NoteSvg },
  ];

  const getStatusBadge = (status: PracticeItem["status"]) => {
    switch (status) {
      case TaskStatus.draft:
        return (
          <Badge variant="gray" size="sm">
            草稿
          </Badge>
        );
      case TaskStatus.notStarted:
        return (
          <Badge variant="gray" size="sm">
            未開始
          </Badge>
        );
      case TaskStatus.inProgress:
        return (
          <Badge variant="outline-logo" size="sm">
            進行中
          </Badge>
        );
      case TaskStatus.completed:
        return (
          <Badge variant="default" size="sm">
            已完成
          </Badge>
        );
      default:
        return (
          <Badge variant="gray" size="sm">
            未知
          </Badge>
        );
    }
  };

  const filteredPractices = includeCompleted
    ? practices
    : practices.filter((p) => p.status !== TaskStatus.completed);

  const renderSubNavigation = () => {
    const content = (
      <>
        {tabs.map(({ Icon, ...tab }) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id)}
            className="flex gap-2 md:flex-col items-center md:gap-0.5 p-0 h-auto"
            aria-label={tab.label}
            animation="none"
            disabled={tab.disabled}
          >
            <div
              className={cn(
                "size-10 flex items-center justify-center rounded-full transition-colors",
                activeTab === tab.id
                  ? "text-logo-cyan md:bg-logo-cyan md:text-white"
                  : "bg-white text-bg-dark"
              )}
            >
              <Icon className="size-6" />
            </div>
            <div
              className={cn(
                "text-sm md:text-xs text-bg-dark whitespace-nowrap leading-normal",
                activeTab !== tab.id && "opacity-50"
              )}
            >
              {tab.label}
            </div>
          </Button>
        ))}
      </>
    );

    if (!isMounted) return null;

    if (isMobile) {
      return createPortal(
        <div
          className={cn(
            "fixed top-0 inset-x-0 z-40 grid grid-cols-3 bg-white border-b border-light-gray px-5 py-2.5 transition-transform",
            isScrolled ? "translate-y-0" : "-translate-y-full"
          )}
        >
          {content}
        </div>,
        document.body
      );
    }

    return (
      <div
        className={cn(
          "hidden md:absolute md:top-0 md:right-full md:flex md:flex-col md:gap-4 md:mt-6 md:mr-3"
        )}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="relative bg-white rounded-2xl p-6">
      {/* 標題和篩選 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-bg-dark">主題實踐</h2>
        <div className="flex items-center gap-2">
          <Checkbox
            id="include-completed"
            checked={includeCompleted}
            onCheckedChange={(checked) => setIncludeCompleted(checked === true)}
          />
          <label
            htmlFor="include-completed"
            className="text-sm text-text-dark cursor-pointer select-none"
          >
            包含已完成
          </label>
        </div>
      </div>

      {/* 子導航 */}
      {renderSubNavigation()}

      {/* 實踐列表 */}
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="text-center py-8 text-basic-400">載入中...</div>
        ) : error ? (
          <div className="text-center py-8 text-basic-400">載入失敗，請稍後再試</div>
        ) : filteredPractices.length === 0 ? (
          isOwnData ? (
            <RandomPracticesSection compact />
          ) : (
            <div className="text-center py-8 text-basic-400">
              {activeTab === "practices" && "尚無主題實踐"}
              {activeTab === "plans" && "尚無學習計劃"}
              {activeTab === "ideas" && "尚無想法"}
            </div>
          )
        ) : (
          filteredPractices.map((practice) => (
            <div
              key={practice.id}
              className="flex items-start gap-4 p-4 rounded-lg border-b border-bg-gray hover:shadow-sm transition-shadow bg-white"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  {getStatusBadge(practice.status)}
                  <div className="flex h-fit flex-wrap gap-2">
                    {practice.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="gray" size="sm">
                        {tag}
                      </Badge>
                    ))}
                    {practice.tags.length > 2 && (
                      <span className="text-xs text-basic-400 py-0.5">
                        +{practice.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-text-dark line-clamp-1 mb-1">
                      {practice.title}
                    </h3>
                    <p className="text-xs text-text-dark line-clamp-1">{practice.description}</p>
                  </div>
                  <div className="shrink-0">
                    <Button variant="ghost" size="icon" asChild>
                      <CustomLink href={`/practices/${practice.id}`}>
                        <ArrowRightOutlineSvg className="size-5 text-light-gray" />
                      </CustomLink>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
