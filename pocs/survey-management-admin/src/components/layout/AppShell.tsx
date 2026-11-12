import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import type { SurveyStatus } from "@/api/types";
import { Header, type SurveyPageHeading } from "./Header";
import { MobileHeader, Sidebar } from "./Sidebar";

const SIDEBAR_HIDDEN_KEY = "admin-sidebar-hidden";

export function AppShell() {
  const location = useLocation();
  const [sidebarHidden, setSidebarHidden] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_HIDDEN_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [surveyEditorOpen, setSurveyEditorOpen] = useState(false);
  const [surveyResultsOpen, setSurveyResultsOpen] = useState(false);
  const [surveyPreviewing, setSurveyPreviewing] = useState(false);
  const [surveySettingsOpen, setSurveySettingsOpen] = useState(false);
  const [surveyAudience, setSurveyAudience] = useState<"public" | "members">("public");
  const [surveyStatus, setSurveyStatus] = useState<SurveyStatus>("draft");
  const [surveyCanPublish, setSurveyCanPublish] = useState(false);
  const [surveySubmitPending, setSurveySubmitPending] = useState(false);
  const [surveyHasChanges, setSurveyHasChanges] = useState(false);
  const [surveyPageHeading, setSurveyPageHeading] = useState<SurveyPageHeading | null>(null);
  const surveySubmitHandlerRef = useRef<(() => void) | null>(null);
  const surveyPublishHandlerRef = useRef<(() => void) | null>(null);
  const surveyReturnHandlerRef = useRef<(() => void) | null>(null);
  const registerSurveySubmitHandler = useCallback((handler: (() => void) | null) => {
    surveySubmitHandlerRef.current = handler;
  }, []);
  const submitSurvey = useCallback(() => {
    surveySubmitHandlerRef.current?.();
  }, []);
  const registerSurveyPublishHandler = useCallback((handler: (() => void) | null) => {
    surveyPublishHandlerRef.current = handler;
  }, []);
  const publishSurvey = useCallback(() => {
    surveyPublishHandlerRef.current?.();
  }, []);
  const registerSurveyReturnHandler = useCallback((handler: (() => void) | null) => {
    surveyReturnHandlerRef.current = handler;
  }, []);
  const returnToSurveys = useCallback(() => {
    surveyReturnHandlerRef.current?.();
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_HIDDEN_KEY, String(sidebarHidden));
  }, [sidebarHidden]);

  return (
    <div
      className={`h-screen overflow-hidden bg-[var(--admin-shell-bg)] lg:grid ${
        sidebarHidden ? "lg:grid-cols-1" : "lg:grid-cols-[19rem_1fr]"
      }`}
    >
      {!sidebarHidden && <Sidebar onClose={() => setSidebarHidden(true)} />}
      <div className="flex h-full flex-col overflow-hidden">
        <MobileHeader
          showBackButton={surveyResultsOpen || surveyEditorOpen}
          onBack={returnToSurveys}
        />
        <Header
          sidebarHidden={sidebarHidden}
          hideSearch={
            surveyEditorOpen || surveyResultsOpen || location.pathname.startsWith("/surveys")
          }
          surveyEditorOpen={surveyEditorOpen}
          surveyResultsOpen={surveyResultsOpen}
          surveyPreviewing={surveyPreviewing}
          surveyAudience={surveyAudience}
          surveyStatus={surveyStatus}
          surveyCanPublish={surveyCanPublish}
          onReturnToSurveys={returnToSurveys}
          onOpenSurveySettings={() => setSurveySettingsOpen(true)}
          onPreviewSurvey={() => setSurveyPreviewing(true)}
          onSubmitSurvey={submitSurvey}
          onPublishSurvey={publishSurvey}
          surveySubmitPending={surveySubmitPending}
          surveyHasChanges={surveyHasChanges}
          surveyPageHeading={surveyEditorOpen || surveyPreviewing ? null : surveyPageHeading}
          onShowSidebar={() => setSidebarHidden(false)}
        />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            className={`mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8 ${surveyEditorOpen ? "overflow-y-auto py-3" : "overflow-hidden py-6"}`}
          >
            <div
              className={`mx-auto w-full max-w-7xl rounded-2xl border border-[var(--admin-panel-border)] bg-[var(--admin-card)] p-5 shadow-sm backdrop-blur ${surveyEditorOpen ? "h-fit min-h-0 flex-none" : surveyResultsOpen ? "min-h-0 flex-1 overflow-hidden" : "min-h-[calc(100vh-10rem)] flex-1 overflow-y-auto"}`}
            >
              <Outlet
                context={{
                  setSurveyEditorOpen,
                  setSurveyResultsOpen,
                  surveyPreviewing,
                  setSurveyPreviewing,
                  setSurveyAudience,
                  setSurveyStatus,
                  setSurveyCanPublish,
                  surveySettingsOpen,
                  setSurveySettingsOpen,
                  setSurveySubmitPending,
                  setSurveyHasChanges,
                  setSurveyPageHeading,
                  registerSurveySubmitHandler,
                  registerSurveyPublishHandler,
                  registerSurveyReturnHandler,
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
