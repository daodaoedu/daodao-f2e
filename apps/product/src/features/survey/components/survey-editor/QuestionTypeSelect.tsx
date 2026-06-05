"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@daodao/ui/components/select";
import type { QuestionType } from "../../types";

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "多選題",
  single_choice: "單選題",
  rating: "評分題",
  text: "開放文字",
  yesno: "是/否",
  scale: "量表",
  ranking: "排序",
};

const QUESTION_TYPES: QuestionType[] = [
  "multiple_choice",
  "single_choice",
  "rating",
  "text",
  "yesno",
  "scale",
  "ranking",
];

interface QuestionTypeSelectProps {
  value: QuestionType;
  onChange: (type: QuestionType) => void;
  disabled?: boolean;
}

export function QuestionTypeSelect({ value, onChange, disabled }: QuestionTypeSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as QuestionType)} disabled={disabled}>
      <SelectTrigger className="h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {QUESTION_TYPES.map((type) => (
          <SelectItem key={type} value={type} className="text-xs">
            {TYPE_LABELS[type]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
