"use client";

import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import { cn } from "@daodao/ui/lib/utils";
import { GripVertical, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { QuestionOption } from "../../types";

const MIN_OPTIONS = 2;

type OptionItem = QuestionOption & { _id: string };

interface OptionEditorProps {
  options: QuestionOption[];
  onChange: (options: QuestionOption[]) => void;
  maxOptions?: number;
}

export function OptionEditor({ options, onChange, maxOptions = 8 }: OptionEditorProps) {
  const [items, setItems] = useState<OptionItem[]>(() =>
    options.map((o) => ({ ...o, _id: crypto.randomUUID() }))
  );

  useEffect(() => {
    onChange(items.map(({ _id, ...o }) => o));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const handleLabelChange = (id: string, label: string) => {
    setItems((prev) => prev.map((item) => (item._id === id ? { ...item, label } : item)));
  };

  const handleAdd = () => {
    if (items.length >= maxOptions) return;
    setItems((prev) => [...prev, { label: "", order: prev.length, _id: crypto.randomUUID() }]);
  };

  const handleRemove = (id: string) => {
    if (items.length <= MIN_OPTIONS) return;
    setItems((prev) =>
      prev.filter((item) => item._id !== id).map((item, i) => ({ ...item, order: i }))
    );
  };

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground font-medium">選項</p>
      {items.map((item, i) => (
        <div key={item._id} className="flex items-center gap-1.5">
          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
          <Input
            value={item.label}
            onChange={(e) => handleLabelChange(item._id, e.target.value)}
            placeholder={`選項 ${i + 1}`}
            className="h-7 text-xs flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive",
              items.length <= MIN_OPTIONS && "opacity-30 pointer-events-none"
            )}
            onClick={() => handleRemove(item._id)}
            disabled={items.length <= MIN_OPTIONS}
            tabIndex={items.length <= MIN_OPTIONS ? -1 : undefined}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground w-full border border-dashed"
        onClick={handleAdd}
        disabled={items.length >= maxOptions}
      >
        <Plus className="h-3 w-3 mr-1" />
        新增選項
      </Button>
    </div>
  );
}
