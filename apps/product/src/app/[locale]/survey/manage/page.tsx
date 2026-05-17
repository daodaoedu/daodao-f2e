"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@daodao/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@daodao/ui/components/card"
import { Badge } from "@daodao/ui/components/badge"
import { Loader2, Plus, BarChart2, Trash2, PlayCircle, PauseCircle, List } from "lucide-react"
import { listSurveys, deleteSurvey, updateSurveyStatus } from "@/features/survey/services/survey"
import type { Survey, SurveyStatus } from "@/features/survey/types"

const STATUS_LABEL: Record<SurveyStatus, string> = {
  draft: "草稿", active: "進行中", closed: "已關閉", archived: "已封存",
}
const STATUS_VARIANT: Record<SurveyStatus, "default" | "secondary" | "outline"> = {
  draft: "outline", active: "default", closed: "secondary", archived: "secondary",
}

export default function SurveyManagePage() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    listSurveys().then((r) => setSurveys(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此問卷？")) return
    try {
      await deleteSurvey(id)
      setSurveys((prev) => prev.filter((s) => s.id !== id))
    } catch {
      alert("刪除失敗，請再試一次")
    }
  }

  const handleToggleStatus = async (s: Survey) => {
    const nextStatus: SurveyStatus = s.status === "active" ? "closed" : "active"
    setTogglingId(s.id)
    try {
      await updateSurveyStatus(s.id, nextStatus)
      setSurveys((prev) => prev.map((x) => x.id === s.id ? { ...x, status: nextStatus } : x))
    } catch {
      alert("操作失敗，請再試一次")
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">我的問卷</h1>
        <Button onClick={() => router.push("/survey/create")}>
          <Plus className="h-4 w-4 mr-2" />建立問卷
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : surveys.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 text-muted-foreground">
          <p>還沒有問卷，立即建立第一份！</p>
          <Button onClick={() => router.push("/survey/create")}>建立問卷</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {surveys.map((s) => (
            <Card key={s.id}>
              <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                <div className="space-y-1">
                  <CardTitle className="text-base">{s.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[s.status]}>{STATUS_LABEL[s.status]}</Badge>
                    <span className="text-xs text-muted-foreground">{s.responseCount} 份回應</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {/* Publish / Pause toggle */}
                  {(s.status === "active" || s.status === "draft" || s.status === "closed") && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(s)}
                      disabled={togglingId === s.id}
                      title={s.status === "active" ? "暫停收集" : "發布"}
                    >
                      {togglingId === s.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : s.status === "active"
                          ? <PauseCircle className="h-4 w-4 text-amber-500" />
                          : <PlayCircle className="h-4 w-4 text-emerald-500" />
                      }
                    </Button>
                  )}
                  {/* Responses */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/survey/${s.id}/responses`)}
                    title="查看回應"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  {/* Analytics */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/survey/${s.id}/analytics`)}
                    title="分析"
                  >
                    <BarChart2 className="h-4 w-4" />
                  </Button>
                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(s.id)}
                    className="text-destructive hover:text-destructive"
                    title="刪除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              {s.description && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
