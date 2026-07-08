"use client";

import {
  BoredSvg,
  FineSvg,
  FrustratedSvg,
  HappySvg,
  HopelessSvg,
  NeutralSvg,
} from "@daodao/assets";
import { Button } from "@daodao/ui/components/button";
import { Label } from "@daodao/ui/components/label";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { Bug, Lightbulb, MessageSquare, Sparkles } from "lucide-react";
import { type ElementType, useState } from "react";

type FeedbackCategory = "bug" | "feature" | "improvement" | "other";
type SatisfactionLevel = 1 | 2 | 3 | 4 | 5 | null;

const CATEGORIES: Array<{ id: FeedbackCategory; icon: ElementType; label: string }> = [
  { id: "bug", icon: Bug, label: "Bug 回報" },
  { id: "feature", icon: Lightbulb, label: "功能建議" },
  { id: "improvement", icon: Sparkles, label: "體驗改善" },
  { id: "other", icon: MessageSquare, label: "其他" },
];

const SATISFACTION_OPTIONS: Array<{ value: 1 | 2 | 3 | 4 | 5; icon: ElementType; label: string }> =
  [
    { value: 1, icon: HopelessSvg, label: "很不滿意" },
    { value: 2, icon: FrustratedSvg, label: "不太滿意" },
    { value: 3, icon: NeutralSvg, label: "普通" },
    { value: 4, icon: FineSvg, label: "滿意" },
    { value: 5, icon: HappySvg, label: "非常滿意" },
  ];

export function FeedbackForm() {
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [satisfaction, setSatisfaction] = useState<SatisfactionLevel>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = category && message.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    toast.success("感謝你的回饋！我們會認真閱讀每一則建議。");
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 pt-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-[rgba(22,185,179,0.1)]">
          <HappySvg className="size-10" />
        </div>
        <h2 className="text-lg font-semibold text-[#2D3436]">感謝你的回饋！</h2>
        <p className="text-sm leading-relaxed text-[#636E72]">
          你的建議對我們非常重要。
          <br />
          我們會盡快查看並改善。
        </p>
        <Button
          variant="ctaPrimary"
          className="mt-4 rounded-full px-6"
          onClick={() => {
            setCategory(null);
            setSatisfaction(null);
            setMessage("");
            setSubmitted(false);
          }}
        >
          再提一則
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <Label>類型</Label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const selected = category === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors ${
                  selected
                    ? "border-logo-cyan bg-[rgba(22,185,179,0.05)] text-logo-cyan"
                    : "border-[#E0E4E8] bg-white text-[#636E72] hover:border-[#16B9B3]"
                }`}
              >
                <Icon className="size-5 shrink-0" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <Label>整體滿意度</Label>
        <p className="text-xs text-[#8A9BA0]">你對島島目前的體驗感覺如何？</p>
        <div className="flex justify-between">
          {SATISFACTION_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = satisfaction === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => setSatisfaction(opt.value)}
                className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${
                  selected ? "scale-110 bg-[rgba(22,185,179,0.08)]" : "hover:bg-[#F5F7FA]"
                }`}
                title={opt.label}
              >
                <Icon
                  className={`size-8 transition-opacity ${selected ? "opacity-100" : "opacity-50"}`}
                />
                <span className="text-[10px] text-[#8A9BA0]">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <Label>
          詳細描述 <span className="text-[#EF4444]">*</span>
        </Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="告訴我們你的想法..."
          rows={5}
        />
      </section>

      <Button variant="ctaPrimary" className="w-full rounded-full" disabled={!canSubmit} onClick={handleSubmit}>
        送出回饋
      </Button>

      <p className="text-center text-xs text-[#8A9BA0]">功能預覽 — 正式版會將回饋送至團隊信箱</p>
    </div>
  );
}
