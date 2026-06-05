"use client";

import { createContext, useContext } from "react";
import { useSurveyWizard } from "../hooks/use-survey-wizard";

type SurveyWizardContext = ReturnType<typeof useSurveyWizard>;

const SurveyContext = createContext<SurveyWizardContext | null>(null);

export function SurveyProvider({
  children,
  draftKey,
}: {
  children: React.ReactNode;
  draftKey?: string;
}) {
  const wizard = useSurveyWizard(draftKey);
  return <SurveyContext.Provider value={wizard}>{children}</SurveyContext.Provider>;
}

export function useSurveyContext(): SurveyWizardContext {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error("useSurveyContext must be used within SurveyProvider");
  return ctx;
}
