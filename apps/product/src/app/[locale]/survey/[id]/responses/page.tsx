"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@daodao/ui/components/button"
import { Card, CardContent } from "@daodao/ui/components/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { listResponses, deleteResponse, type ResponseListItem } from "@/features/survey/services/survey"
import { Trash2 } from "lucide-react"

export default function SurveyResponsesPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params?.id as string

  const [responses, setResponses] = useState<ResponseListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    listResponses(surveyId)
      .then((r) => setResponses(r.data))
      .catch(() => setError("載入失敗"))
      .finally(() => setLoading(false))
  }, [surveyId])

  const handleDelete = async (e: React.MouseEvent, responseId: number) => {
    e.stopPropagation()
    if (!confirm("確定要刪除這筆回應嗎？")) return
    setDeletingId(responseId)
    try {
      await deleteResponse(surveyId, String(responseId))
      setResponses((prev) => prev.filter((r) => r.id !== responseId))
    } catch {
      alert("刪除失敗，請再試一次")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">回應列表</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p className="text-center text-destructive py-20">{error}</p>
      ) : responses.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-2 text-muted-foreground">
          <p>尚無回應</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-4">共 {responses.length} 筆回應</p>
          {responses.map((r, i) => (
            <Card
              key={r.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => router.push(`/survey/${surveyId}/responses/${r.id}`)}
            >
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-muted-foreground w-6 text-right">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium">
                      {r.user_id ? `用戶 #${r.user_id}` : "匿名"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.completed_at).toLocaleString("zh-TW")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{r.answer_count} 題作答 →</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => handleDelete(e, r.id)}
                    disabled={deletingId === r.id}
                  >
                    {deletingId === r.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
