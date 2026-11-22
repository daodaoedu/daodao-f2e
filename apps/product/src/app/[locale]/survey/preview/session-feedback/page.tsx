"use client";

import { CohortFeedbackForm } from "@/features/survey/components/survey-response/CohortFeedbackForm";
import type { SurveyWithQuestions } from "@/features/survey/types";
import { getMessagesFromPathname, NextIntlClientProvider } from "@daodao/i18n";
import { usePathname, useSearchParams } from "next/navigation";

const previewSurvey: SurveyWithQuestions = {
  id: "session-feedback-preview",
  shareId: "de88204c-7b53-4961-a08f-9decede0ff22",
  title: "活動回饋",
  description: "",
  purpose: "",
  status: "active",
  createdBy: "",
  config: {
    isAnonymous: true,
    isPublished: true,
    maxResponses: null,
    deadlineAt: null,
    submitButtonText: "Submit feedback",
    successMessage: "Thank you for sharing your feedback.",
    showProgressBar: false,
    oneResponsePerUser: true,
  },
  responseCount: 0,
  createdAt: "",
  updatedAt: "",
  tags: ["cohort-feedback"],
  cohortFeedback: {
    state: "ready",
    privacyNotice: "",
    organizationName: "Example Organization",
    cohortName: "Example Cohort",
  },
  questions: [
    {
      id: "1",
      surveyId: "session-feedback-preview",
      questionText: "整體來說，這個場次符合你的期待嗎？",
      questionType: "rating",
      options: [],
      isRequired: true,
      conditions: [],
      aiMetadata: {},
      order: 0,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "2",
      surveyId: "session-feedback-preview",
      questionText: "有哪些環節或互動讓你印象最深？它對你有什麼影響？",
      questionType: "text",
      options: [],
      isRequired: false,
      conditions: [],
      aiMetadata: {},
      order: 1,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "3",
      surveyId: "session-feedback-preview",
      questionText: "有什麼你希望可以調整的地方？",
      questionType: "text",
      options: [],
      isRequired: false,
      conditions: [],
      aiMetadata: {},
      order: 2,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "4",
      surveyId: "session-feedback-preview",
      questionText: "還有其他建議或想法嗎？",
      questionType: "text",
      options: [],
      isRequired: false,
      conditions: [],
      aiMetadata: {},
      order: 3,
      createdAt: "",
      updatedAt: "",
    },
  ],
};

export default function SessionFeedbackPreviewPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (process.env.NODE_ENV !== "development") return null;

  const locale =
    pathname.startsWith("/zh-tw/") || searchParams.get("locale") === "zh-TW" ? "zh-TW" : "en";
  const messages = getMessagesFromPathname(locale === "zh-TW" ? "/zh-TW" : "/en").messages;

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Taipei">
      <CohortFeedbackForm survey={previewSurvey} submitResponse={async () => undefined} />
    </NextIntlClientProvider>
  );
}
