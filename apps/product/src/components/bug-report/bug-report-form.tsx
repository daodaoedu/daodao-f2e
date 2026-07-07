"use client";

import { FrustratedSvg } from "@daodao/assets";
import { toast } from "@daodao/ui/components/sonner";
import {
  AlertTriangle,
  ChevronDown,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { type ElementType, useState } from "react";

type Severity = "critical" | "major" | "minor" | "cosmetic";
type Device = "desktop" | "mobile" | "tablet";

const SEVERITY_OPTIONS: Array<{ id: Severity; label: string; color: string }> = [
  { id: "critical", label: "嚴重（無法使用）", color: "#EF4444" },
  { id: "major", label: "重要（功能異常）", color: "#F59E0B" },
  { id: "minor", label: "輕微（不影響使用）", color: "#3B82F6" },
  { id: "cosmetic", label: "外觀（排版/樣式）", color: "#8B5CF6" },
];

const DEVICE_OPTIONS: Array<{ id: Device; icon: ElementType; label: string }> = [
  { id: "desktop", icon: Monitor, label: "電腦" },
  { id: "mobile", icon: Smartphone, label: "手機" },
  { id: "tablet", icon: Tablet, label: "平板" },
];

const PAGE_OPTIONS = [
  "首頁",
  "我的小島",
  "學習生活",
  "設定",
  "打卡",
  "實踐",
  "工作台",
  "其他",
];

export function BugReportForm() {
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [page, setPage] = useState("");
  const [title, setTitle] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = severity && title.trim().length > 0 && actual.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    toast.success("已收到錯誤回報，感謝你幫助我們改善！");
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 pt-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-[rgba(22,185,179,0.1)]">
          <AlertTriangle className="size-8 text-logo-cyan" />
        </div>
        <h2 className="text-lg font-semibold text-[#2D3436]">已收到回報！</h2>
        <p className="text-sm leading-relaxed text-[#636E72]">
          感謝你花時間回報這個問題。
          <br />
          我們會儘快排查並修復。
        </p>
        <button
          type="button"
          onClick={() => {
            setSeverity(null);
            setDevice(null);
            setPage("");
            setTitle("");
            setSteps("");
            setExpected("");
            setActual("");
            setSubmitted(false);
          }}
          className="mt-4 rounded-full bg-logo-cyan px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0E8E89]"
        >
          再回報一個
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 rounded-2xl bg-[rgba(239,68,68,0.05)] p-4">
        <FrustratedSvg className="size-10 shrink-0" />
        <p className="text-sm leading-relaxed text-[#636E72]">
          遇到問題了嗎？填寫以下資訊幫助我們快速定位和修復。
        </p>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-[#2D3436]">
          問題標題 <span className="text-[#EF4444]">*</span>
        </h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="簡短描述你遇到的問題"
          className="mt-2 w-full rounded-xl border border-[#E0E4E8] bg-white px-4 py-3 text-sm text-[#2D3436] placeholder:text-[#C0C8CC] focus:border-logo-cyan focus:outline-none"
        />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#2D3436]">
          嚴重程度 <span className="text-[#EF4444]">*</span>
        </h3>
        <div className="mt-2 flex flex-col gap-2">
          {SEVERITY_OPTIONS.map((opt) => {
            const selected = severity === opt.id;
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => setSeverity(opt.id)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${
                  selected
                    ? "border-current bg-[rgba(0,0,0,0.02)]"
                    : "border-[#E0E4E8] bg-white hover:border-[#C0C8CC]"
                }`}
                style={selected ? { color: opt.color } : undefined}
              >
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
                <span className={selected ? "font-medium" : "text-[#636E72]"}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#2D3436]">使用裝置</h3>
        <div className="mt-2 flex gap-2">
          {DEVICE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = device === opt.id;
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() => setDevice(opt.id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${
                  selected
                    ? "border-logo-cyan bg-[rgba(22,185,179,0.05)] text-logo-cyan"
                    : "border-[#E0E4E8] bg-white text-[#636E72] hover:border-[#C0C8CC]"
                }`}
              >
                <Icon className="size-5" />
                <span className="text-xs">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#2D3436]">發生在哪個頁面</h3>
        <div className="relative mt-2">
          <select
            value={page}
            onChange={(e) => setPage(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#E0E4E8] bg-white px-4 py-3 pr-10 text-sm text-[#2D3436] focus:border-logo-cyan focus:outline-none"
          >
            <option value="">選擇頁面</option>
            {PAGE_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8A9BA0]" />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#2D3436]">重現步驟</h3>
        <textarea
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder={"1. 進入某頁面\n2. 點擊某按鈕\n3. 就會看到..."}
          rows={4}
          className="mt-2 w-full resize-none rounded-xl border border-[#E0E4E8] bg-white p-4 text-sm text-[#2D3436] placeholder:text-[#C0C8CC] focus:border-logo-cyan focus:outline-none"
        />
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section>
          <h3 className="text-sm font-semibold text-[#2D3436]">預期行為</h3>
          <textarea
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
            placeholder="應該要發生什麼"
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-[#E0E4E8] bg-white p-4 text-sm text-[#2D3436] placeholder:text-[#C0C8CC] focus:border-logo-cyan focus:outline-none"
          />
        </section>
        <section>
          <h3 className="text-sm font-semibold text-[#2D3436]">
            實際行為 <span className="text-[#EF4444]">*</span>
          </h3>
          <textarea
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            placeholder="實際發生了什麼"
            rows={3}
            className="mt-2 w-full resize-none rounded-xl border border-[#E0E4E8] bg-white p-4 text-sm text-[#2D3436] placeholder:text-[#C0C8CC] focus:border-logo-cyan focus:outline-none"
          />
        </section>
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className={`w-full rounded-full py-3 text-sm font-medium text-white transition-colors ${
          canSubmit ? "bg-logo-cyan hover:bg-[#0E8E89]" : "cursor-not-allowed bg-[#C0C8CC]"
        }`}
      >
        送出回報
      </button>

      <p className="text-center text-xs text-[#8A9BA0]">功能預覽 — 正式版會將回報送至開發團隊</p>
    </div>
  );
}
