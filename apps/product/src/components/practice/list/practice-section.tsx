"use client";

import { useUserPractices } from "@daodao/api";
import { ArrowRightOutlineSvg } from "@daodao/assets";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Checkbox } from "@daodao/ui/components/checkbox";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { useMemo, useState } from "react";
import { PersonaProfileMe } from "@/components/persona/persona-profile-me";
import { PersonaProfileUser } from "@/components/persona/persona-profile-user";
import type { PracticeStatus } from "@/constants/practice-status";
import {
  mapPracticeStatusToTaskStatus,
  TaskStatus,
  type TaskStatus as TaskStatusType,
} from "@/constants/task-status";
import { RandomPracticesSection } from "../shared/random-practices-section";

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

/**
 * 「主題實踐」區塊組件
 */
export function PracticeSection({ userId }: PracticeSectionProps) {
  const t = useTranslations("app_product");
  const dashboardT = useTranslations("dashboard");
  const personaT = useTranslations("persona");
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const { user } = useAuth();

  const {
    data: practicesData,
    isLoading,
    error,
  } = useUserPractices(userId, {
    status: "all", // 獲取所有狀態的實踐（未開始、進行中、已完成等）
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

  const getStatusBadge = (status: PracticeItem["status"]) => {
    switch (status) {
      case TaskStatus.draft:
        return (
          <Badge variant="gray" size="sm">
            {dashboardT("filter_draft")}
          </Badge>
        );
      case TaskStatus.notStarted:
        return (
          <Badge variant="gray" size="sm">
            {dashboardT("filter_not_started")}
          </Badge>
        );
      case TaskStatus.inProgress:
        return (
          <Badge variant="outline-logo" size="sm">
            {dashboardT("filter_in_progress")}
          </Badge>
        );
      case TaskStatus.completed:
        return (
          <Badge variant="default" size="sm">
            {dashboardT("filter_completed")}
          </Badge>
        );
      default:
        return (
          <Badge variant="gray" size="sm">
            {t("practice_status_unknown")}
          </Badge>
        );
    }
  };

  const filteredPractices = includeCompleted
    ? practices
    : practices.filter((p) => p.status !== TaskStatus.completed);

  return (
    <div className="flex flex-col gap-4">
      {/* 主題實踐 section */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-bg-dark">{t("practice_section_title")}</h2>
          {practices.length > 0 && (
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
                {t("practice_include_completed")}
              </label>
            </div>
          )}
        </div>
        <div className="space-y-2.5">
          {isLoading ? (
            <div className="text-center py-8 text-basic-400">{t("loading")}</div>
          ) : error ? (
            <div className="text-center py-8 text-basic-400">{t("load_failed_retry")}</div>
          ) : filteredPractices.length === 0 ? (
            isOwnData ? (
              <RandomPracticesSection compact />
            ) : (
              <div className="text-center py-8 text-basic-400">
                {t("practice_empty_practices")}
              </div>
            )
          ) : (
            filteredPractices.map((practice) => (
              <CustomLink
                key={practice.id}
                href={`/practices/${practice.id}`}
                className="block p-4 rounded-lg border-b border-bg-gray hover:shadow-sm transition-shadow bg-white"
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
                      <ArrowRightOutlineSvg className="size-5 text-light-gray" />
                    </div>
                  </div>
                </div>
              </CustomLink>
            ))
          )}
        </div>
      </div>

      {/* 學習人物誌 section */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-lg font-medium text-bg-dark mb-2">{personaT("tabLabel")}</h2>
        {isOwnData ? <PersonaProfileMe /> : <PersonaProfileUser targetUserId={userId} />}
      </div>
    </div>
  );
}
