"use client"

import { Button } from "@daodao/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@daodao/ui/components/card"
import { Badge } from "@daodao/ui/components/badge"
import { Loader2, RefreshCw } from "lucide-react"
import { useSurveyAnalytics } from "@/features/survey/hooks/use-survey-analytics"
import type { PerQuestionStat } from "@/features/survey/types"

function QuestionStatCard({ stat }: { stat: PerQuestionStat }) {
  const { distribution, averageScore, responseCount, skipRate } = stat.stats
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{stat.questionText}</CardTitle>
        <Badge variant="outline-ghost" className="w-fit text-xs">{stat.questionType}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {distribution?.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <span className="w-24 truncate text-xs text-muted-foreground">{item.label}</span>
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: `${item.percentage}%` }} />
            </div>
            <span className="text-xs text-muted-foreground w-10 text-right">{item.percentage.toFixed(0)}%</span>
          </div>
        ))}
        {averageScore != null && (
          <p className="text-sm text-muted-foreground">平均分：<span className="font-medium text-foreground">{averageScore.toFixed(1)}</span></p>
        )}
        {responseCount != null && (
          <p className="text-xs text-muted-foreground">回應數：{responseCount}　略過率：{((skipRate ?? 0) * 100).toFixed(0)}%</p>
        )}
      </CardContent>
    </Card>
  )
}

export function SurveyDashboard({ surveyId }: { surveyId: string }) {
  const { analytics, loading, generating, error, regenerate } = useSurveyAnalytics(surveyId)

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  if (error || !analytics) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <p className="text-muted-foreground">{error ?? "尚無分析資料"}</p>
      <Button onClick={regenerate} disabled={generating}>
        {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
        生成 AI 分析
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "回應總數", value: analytics.responseCount },
          { label: "完成率", value: `${(analytics.completionRate * 100).toFixed(1)}%` },
          { label: "平均時間", value: `${Math.round(analytics.avgDurationSeconds / 60)} 分鐘` },
          { label: "洞察數量", value: analytics.insights.length },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drop-off */}
      {(analytics.trendData as { dropOff?: Array<{ last_position: number; count: number }> })?.dropOff?.length ? (() => {
        const dropOff = (analytics.trendData as { dropOff: Array<{ last_position: number; count: number }> }).dropOff
        const maxCount = Math.max(...dropOff.map((d) => d.count), 1)
        return (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">流失分析</CardTitle>
              <p className="text-xs text-muted-foreground">填答者在哪題停止作答</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {dropOff.sort((a, b) => a.last_position - b.last_position).map((d) => (
                <div key={d.last_position} className="flex items-center gap-2 text-sm">
                  <span className="w-12 text-xs text-muted-foreground text-right shrink-0">第 {d.last_position + 1} 題</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-destructive/70 h-full rounded-full transition-all" style={{ width: `${(d.count / maxCount) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{d.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })() : null}

      {/* AI Summary */}
      {analytics.summary && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">AI 摘要</CardTitle>
            <Button variant="ghost" size="sm" onClick={regenerate} disabled={generating}>
              {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{analytics.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {analytics.insights.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">AI 洞察</h3>
          {analytics.insights.map((insight, i) => (
            <Card key={i}>
              <CardContent className="pt-3 pb-3 flex items-start gap-3">
                <Badge variant={insight.type === "strength" ? "default" : insight.type === "weakness" ? "alert" : "secondary"} className="text-xs shrink-0 mt-0.5">
                  {insight.type === "strength" ? "優勢" : insight.type === "weakness" ? "待改善" : insight.type === "suggestion" ? "建議" : insight.type === "trend" ? "趨勢" : "情感"}
                </Badge>
                <p className="text-sm">{insight.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Per-question stats */}
      {analytics.perQuestionStats.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">各題統計</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {analytics.perQuestionStats.map((stat) => (
              <QuestionStatCard key={stat.questionId} stat={stat} />
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-right">
        分析生成於 {new Date(analytics.generatedAt).toLocaleString("zh-TW")}
      </p>
    </div>
  )
}
