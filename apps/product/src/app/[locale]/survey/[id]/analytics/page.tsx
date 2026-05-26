"use client"

import { useRouter } from "next/navigation"
import { Button } from "@daodao/ui/components/button"
import { ArrowLeft } from "lucide-react"
import { SurveyDashboard } from "@/features/survey/components/survey-dashboard/SurveyDashboard"
import { ExportButton } from "@/features/survey/components/survey-dashboard/ExportButton"
import { useSurveyAnalytics } from "@/features/survey/hooks/use-survey-analytics"
import { useParams } from "next/navigation"

function AnalyticsPageInner({ surveyId }: { surveyId: string }) {
  const router = useRouter()
  const { analytics } = useSurveyAnalytics(surveyId)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">問卷分析</h1>
        </div>
        <ExportButton surveyId={surveyId} analytics={analytics} />
      </div>
      <SurveyDashboard surveyId={surveyId} />
    </div>
  )
}

export default function SurveyAnalyticsPage() {
  const params = useParams()
  const surveyId = params?.id as string
  return <AnalyticsPageInner surveyId={surveyId} />
}
