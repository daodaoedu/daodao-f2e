"use client"

import { Button } from "@daodao/ui/components/button"
import { Input } from "@daodao/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@daodao/ui/components/select"
import { Plus, X } from "lucide-react"
import type { Condition } from "../../types"

const OPERATOR_LABELS: Record<Condition["operator"], string> = {
  equals: "等於",
  not_equals: "不等於",
  contains: "包含",
}

interface ConditionEditorProps {
  conditions: Condition[]
  onChange: (conditions: Condition[]) => void
  questions: Array<{ id: string; questionText: string }>
  currentQuestionId: string
}

export function ConditionEditor({
  conditions,
  onChange,
  questions,
  currentQuestionId,
}: ConditionEditorProps) {
  const availableQuestions = questions.filter((q) => q.id !== currentQuestionId)
  const condition = conditions[0] ?? null

  const handleAdd = () => {
    if (availableQuestions.length === 0) return
    const newCondition: Condition = {
      dependsOn: availableQuestions[0]!.id,
      operator: "equals",
      value: "",
      showQuestionId: currentQuestionId,
    }
    onChange([newCondition])
  }

  const handleRemove = () => {
    onChange([])
  }

  const handleUpdate = (patch: Partial<Condition>) => {
    if (!condition) return
    onChange([{ ...condition, ...patch }])
  }

  if (!condition) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground w-full border border-dashed"
        onClick={handleAdd}
        disabled={availableQuestions.length === 0}
      >
        <Plus className="h-3 w-3 mr-1" />
        新增顯示條件
      </Button>
    )
  }

  return (
    <div className="space-y-2 rounded-md border p-2.5 text-xs">
      <div className="flex items-center justify-between">
        <p className="font-medium text-xs text-muted-foreground">顯示條件</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-destructive"
          onClick={handleRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">依據問題</p>
        <Select
          value={condition.dependsOn}
          onValueChange={(v) => handleUpdate({ dependsOn: v })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableQuestions.map((q) => (
              <SelectItem key={q.id} value={q.id} className="text-xs">
                {q.questionText || q.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">條件</p>
        <Select
          value={condition.operator}
          onValueChange={(v) => handleUpdate({ operator: v as Condition["operator"] })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(OPERATOR_LABELS) as Condition["operator"][]).map((op) => (
              <SelectItem key={op} value={op} className="text-xs">
                {OPERATOR_LABELS[op]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">值</p>
        <Input
          value={Array.isArray(condition.value) ? condition.value.join(',') : condition.value}
          onChange={(e) => handleUpdate({ value: e.target.value })}
          placeholder="輸入條件值"
          className="h-7 text-xs"
        />
      </div>
    </div>
  )
}
