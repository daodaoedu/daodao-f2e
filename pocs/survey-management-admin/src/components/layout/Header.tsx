import { ArrowLeft, Eye, PanelLeftOpen, Search, Settings } from "lucide-react";
import type { ReactNode } from "react";
import type { SurveyStatus } from "@/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SurveyPageHeading {
  title: string;
  description: string;
  actions?: ReactNode;
}

const SURVEY_STATUS_LABELS: Record<SurveyStatus, string> = {
  draft: "草稿",
  active: "進行中",
  closed: "已關閉",
  archived: "已封存",
};

const SURVEY_STATUS_VARIANTS: Record<SurveyStatus, "success" | "warning" | "default"> = {
  draft: "warning",
  active: "success",
  closed: "default",
  archived: "default",
};

export function Header({
  sidebarHidden,
  hideSearch,
  surveyEditorOpen,
  surveyResultsOpen,
  surveyPreviewing,
  surveyAudience,
  surveyStatus,
  surveyCanPublish,
  onReturnToSurveys,
  onOpenSurveySettings,
  onPreviewSurvey,
  onSubmitSurvey,
  onPublishSurvey,
  surveySubmitPending,
  surveyHasChanges,
  surveyPageHeading,
  onShowSidebar,
}: {
  sidebarHidden: boolean;
  hideSearch: boolean;
  surveyEditorOpen: boolean;
  surveyResultsOpen: boolean;
  surveyPreviewing: boolean;
  surveyAudience: "public" | "members";
  surveyStatus: SurveyStatus;
  surveyCanPublish: boolean;
  onReturnToSurveys: () => void;
  onOpenSurveySettings: () => void;
  onPreviewSurvey: () => void;
  onSubmitSurvey: () => void;
  onPublishSurvey: () => void;
  surveySubmitPending: boolean;
  surveyHasChanges: boolean;
  surveyPageHeading: SurveyPageHeading | null;
  onShowSidebar: () => void;
}) {
  if (surveyPreviewing && !sidebarHidden) return null;

  return (
    <header
      className={`sticky top-0 z-40 ${(surveyEditorOpen && !surveyPreviewing) || surveyPageHeading ? "flex" : "hidden md:flex"} flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[var(--admin-panel-border)] bg-background/90 px-4 py-3 backdrop-blur md:min-h-16 lg:px-6`}
    >
      {surveyPageHeading && (
        <div className="min-w-0 flex-1 py-1">
          <h1 className="text-lg font-semibold leading-tight text-foreground md:text-xl">
            {surveyPageHeading.title}
          </h1>
          {surveyPageHeading.description && (
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {surveyPageHeading.description}
            </p>
          )}
        </div>
      )}
      {surveyPageHeading?.actions && (
        <div className="ml-auto flex shrink-0 items-center gap-2">{surveyPageHeading.actions}</div>
      )}
      {sidebarHidden && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onShowSidebar}
          className="hidden lg:inline-flex"
          title="顯示側邊欄"
          aria-label="顯示側邊欄"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </Button>
      )}
      {surveyResultsOpen && !surveyPreviewing && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onReturnToSurveys}
          className="hidden lg:inline-flex"
          title="返回問卷管理"
          aria-label="返回問卷管理"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      {!hideSearch && (
        <div className="flex flex-1 items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜尋..."
              className="rounded-md border border-input bg-card px-3 py-1.5 text-sm text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 h-9 w-full pl-9"
            />
          </div>
        </div>
      )}

      {surveyEditorOpen && !surveyPreviewing && (
        <div className="ml-auto flex w-full min-w-0 items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="返回問卷管理"
            title="返回問卷管理"
            className="hidden lg:inline-flex"
            onClick={onReturnToSurveys}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-1">
            <Badge
              variant={SURVEY_STATUS_VARIANTS[surveyStatus]}
              className="mr-1 whitespace-nowrap"
            >
              {SURVEY_STATUS_LABELS[surveyStatus]}
            </Badge>
            <Badge variant="default" className="mr-1 whitespace-nowrap">
              {surveyAudience === "public" ? "對外問卷" : "參與者限定"}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="問卷設定"
              title="問卷設定"
              onClick={onOpenSurveySettings}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="預覽問卷"
              title="預覽問卷"
              onClick={onPreviewSurvey}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSubmitSurvey}
              disabled={surveySubmitPending || !surveyHasChanges}
            >
              {surveySubmitPending ? "儲存中..." : "儲存"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onPublishSurvey}
              disabled={surveySubmitPending || !surveyCanPublish}
            >
              {surveyStatus === "active" ? "已發布" : "發布"}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
