"use client"

import { Button } from '@daodao/ui/components/button'
import { Download } from 'lucide-react'
import type { SurveyAnalytics } from '../../types'

interface ExportButtonProps {
  surveyId: string
  surveyTitle?: string
  analytics: SurveyAnalytics | null
}

function generateCSV(analytics: SurveyAnalytics, surveyTitle?: string): string {
  const rows: string[][] = []

  rows.push(['問卷標題', surveyTitle ?? analytics.surveyId])
  rows.push(['回應總數', String(analytics.responseCount)])
  rows.push(['完成率', `${(analytics.completionRate * 100).toFixed(1)}%`])
  rows.push(['平均作答時間(秒)', String(analytics.avgDurationSeconds)])
  rows.push([])
  rows.push(['問題', '題型', '回應數', '略過率', '平均分', '分布摘要'])

  for (const stat of analytics.perQuestionStats) {
    const { responseCount, skipRate, averageScore, distribution } = stat.stats
    const distributionSummary = distribution
      ? distribution.map((d) => `${d.label}:${d.count}(${d.percentage.toFixed(0)}%)`).join(' | ')
      : ''

    rows.push([
      stat.questionText,
      stat.questionType,
      responseCount != null ? String(responseCount) : '',
      skipRate != null ? `${(skipRate * 100).toFixed(0)}%` : '',
      averageScore != null ? averageScore.toFixed(1) : '',
      distributionSummary,
    ])
  }

  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
}

export function ExportButton({ surveyId, surveyTitle, analytics }: ExportButtonProps) {
  function handleExport() {
    if (!analytics) return

    const csv = generateCSV(analytics, surveyTitle)
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `survey-${surveyId}-export.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={!analytics}
    >
      <Download className="h-4 w-4 mr-2" />
      匯出 CSV
    </Button>
  )
}
