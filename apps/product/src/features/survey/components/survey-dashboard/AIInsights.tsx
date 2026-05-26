"use client"

import { Badge } from '@daodao/ui/components/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@daodao/ui/components/card'
import type { Insight } from '../../types'

interface AIInsightsProps {
  insights: Insight[]
  summary?: string
}

const insightConfig: Record<Insight['type'], { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; className: string }> = {
  strength: { label: '優勢', variant: 'default', className: 'bg-green-500 text-white hover:bg-green-500' },
  weakness: { label: '待改善', variant: 'destructive', className: '' },
  suggestion: { label: '建議', variant: 'secondary', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  trend: { label: '趨勢', variant: 'secondary', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  sentiment: { label: '情感', variant: 'secondary', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
}

export function AIInsights({ insights, summary }: AIInsightsProps) {
  if (!insights.length && !summary) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        尚無 AI 洞察
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">AI 摘要</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}

      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight, i) => {
            const config = insightConfig[insight.type]
            return (
              <Card key={i}>
                <CardContent className="pt-3 pb-3 space-y-2">
                  <div className="flex items-start gap-3">
                    <Badge variant={config.variant} className={`text-xs shrink-0 mt-0.5 ${config.className}`}>
                      {config.label}
                    </Badge>
                    <p className="text-sm flex-1">{insight.text}</p>
                  </div>
                  <div className="pl-0">
                    <p className="text-xs text-muted-foreground">
                      信心度：{((insight.confidence ?? 0) * 100).toFixed(0)}%
                    </p>
                    <div className="mt-1 w-32 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${((insight.confidence ?? 0) * 100).toFixed(0)}%` }}
                      />
                    </div>
                  </div>
                  {insight.suggestions && insight.suggestions.length > 0 && (
                    <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
                      {insight.suggestions.map((s, j) => (
                        <li key={j}>{s}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
