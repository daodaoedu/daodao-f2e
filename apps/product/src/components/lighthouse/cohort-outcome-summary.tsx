"use client";

import {
  generateLighthouseOutcomeSummary,
  type LighthouseOutcome,
  type LighthouseSummaryMode,
  saveLighthouseOutcomeSummary,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { toast } from "@daodao/ui/components/sonner";
import { Textarea } from "@daodao/ui/components/textarea";
import { cn } from "@daodao/ui/lib/utils";
import { AlertCircle, Sparkles } from "lucide-react";
import { useState } from "react";

interface CohortOutcomeSummaryProps {
  programId: number;
  cohortId: number;
  outcome: LighthouseOutcome;
  refresh: () => Promise<unknown>;
}

/**
 * 場次成果摘要卡（FR-OUT-02~04、FR-OUT-08）：
 * - AI 使用：平台 AI／自己的 AI API；自帶 key 未設定或無效時阻擋並提示到組織設定
 * - 產生／重新產生會新增一個版本（不覆蓋舊草稿）；人工編輯也是新版本，空白不可儲存
 */
export function CohortOutcomeSummary({
  programId,
  cohortId,
  outcome,
  refresh,
}: CohortOutcomeSummaryProps) {
  const t = useTranslations("lighthouse");
  const [mode, setMode] = useState<LighthouseSummaryMode>("platform");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState<"generate" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const current = outcome.summary.current;
  const ownKey = outcome.ai.ownKey;
  const ownKeyUsable = ownKey.status === "set" || ownKey.status === "verified";
  const ownNeedsSetup = mode === "own" && !ownKeyUsable;
  const platformExhausted =
    mode === "platform" && outcome.ai.platformUsedToday >= outcome.ai.platformDailyLimit;
  const platformUnavailable = mode === "platform" && !outcome.ai.platformAvailable;
  const canGenerate =
    !busy && !editing && !ownNeedsSetup && !platformExhausted && !platformUnavailable;

  async function generate() {
    setBusy("generate");
    setError(null);
    const response = await generateLighthouseOutcomeSummary(programId, cohortId, mode);
    setBusy(null);
    if (response.error) {
      const message = response.error.error?.message ?? t("outcome_summary_generate_failed");
      setError(message);
      toast.error(message);
      return;
    }
    await refresh();
    toast.success(t("outcome_summary_generated"));
  }

  function startEdit() {
    setDraft(current?.content ?? "");
    setEditing(true);
    setError(null);
  }

  async function save() {
    const content = draft.trim();
    if (!content) {
      setError(t("outcome_summary_empty_error"));
      return;
    }
    setBusy("save");
    const response = await saveLighthouseOutcomeSummary(programId, cohortId, content);
    setBusy(null);
    if (response.error) {
      const message = response.error.error?.message ?? t("save_failed");
      setError(message);
      toast.error(message);
      return;
    }
    setEditing(false);
    await refresh();
    toast.success(t("outcome_summary_saved"));
  }

  const statusLine = current
    ? current.source === "manual"
      ? t("outcome_summary_status_manual", {
          version: current.version,
          name: current.createdBy?.nickname ?? t("coach"),
          time: formatDateTime(current.createdAt),
        })
      : t("outcome_summary_status_generated", {
          version: current.version,
          source:
            current.source === "own_ai" ? t("outcome_ai_mode_own") : t("outcome_ai_mode_platform"),
          time: formatDateTime(current.generatedAt ?? current.createdAt),
        })
    : t("outcome_summary_status_none");

  return (
    <section
      className="rounded-3xl border border-[#CDEBE8] bg-white p-6"
      aria-labelledby="outcome-summary-title"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 id="outcome-summary-title" className="text-lg font-semibold tracking-[-0.02em]">
            {t("outcome_summary_title")}
          </h2>
          <p className="mt-1 text-[13px] text-[#78928F]">
            {t("outcome_summary_description")}{" "}
            {mode === "own" ? t("outcome_ai_mode_own_text") : t("outcome_ai_mode_platform_text")}
          </p>
        </div>
        <label className="grid shrink-0 gap-1.5 text-xs text-[#456B68]">
          {t("outcome_ai_mode_label")}
          <select
            value={mode}
            onChange={(event) => {
              setMode(event.target.value as LighthouseSummaryMode);
              setError(null);
            }}
            disabled={busy !== null}
            className="h-[34px] min-w-[170px] rounded-full border border-[#CDEBE8] bg-white px-3 text-sm text-[#0D3036]"
            data-testid="outcome-ai-mode"
          >
            <option value="platform">{t("outcome_ai_mode_platform")}</option>
            <option value="own">{t("outcome_ai_mode_own")}</option>
          </select>
        </label>
      </div>

      {ownNeedsSetup && (
        <div
          className="mt-4 flex items-start gap-2 rounded-2xl border border-[#F0D9B7] bg-[#FFFCF7] px-4 py-3 text-xs text-[#8A5A12]"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            {ownKey.status === "invalid"
              ? t("outcome_own_key_invalid")
              : t("outcome_own_key_missing")}{" "}
            <CustomLink
              href="/lighthouse/organization"
              className="font-semibold underline underline-offset-2"
            >
              {t("nav_organization")}
            </CustomLink>
          </p>
        </div>
      )}
      {platformExhausted && (
        <div
          className="mt-4 flex items-start gap-2 rounded-2xl border border-[#F0D9B7] bg-[#FFFCF7] px-4 py-3 text-xs text-[#8A5A12]"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{t("outcome_platform_limit_reached", { limit: outcome.ai.platformDailyLimit })}</p>
        </div>
      )}

      <div className="mt-4 rounded-[18px] border border-[#DDEFED] bg-[#F7FCFB] p-4">
        <p className="text-xs font-semibold text-[#0D7773]" data-testid="outcome-summary-status">
          {statusLine}
        </p>
        {editing ? (
          <Textarea
            rows={6}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(null);
            }}
            aria-label={t("outcome_summary_title")}
            className="mt-3 rounded-[14px] border-[#B9DCD8] bg-white"
          />
        ) : (
          <p
            className={cn(
              "mt-3 whitespace-pre-wrap text-sm leading-[1.8] text-[#0D3036]",
              !current && "text-[#78928F]"
            )}
            data-testid="outcome-summary-content"
          >
            {current?.content ?? t("outcome_summary_placeholder")}
          </p>
        )}
        {error && <p className="mt-2 text-xs text-[#C03A3A]">{error}</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        {editing ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="h-[37px] rounded-full border-[#CDEBE8] text-[13px] font-semibold"
              disabled={busy !== null}
              onClick={() => setEditing(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              className="h-[37px] rounded-full bg-[#16B9B3] text-[13px] font-semibold hover:bg-[#0FA5A0]"
              disabled={busy !== null || !draft.trim()}
              onClick={() => void save()}
            >
              {busy === "save" ? t("saving") : t("outcome_summary_save")}
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="h-[37px] rounded-full border-[#CDEBE8] text-[13px] font-semibold"
              disabled={!canGenerate}
              title={platformUnavailable ? t("outcome_platform_unavailable") : undefined}
              onClick={() => void generate()}
            >
              <Sparkles className="size-4" aria-hidden="true" />
              {busy === "generate"
                ? t("outcome_summary_generating")
                : current
                  ? t("outcome_summary_regenerate")
                  : t("outcome_summary_generate")}
            </Button>
            <Button
              type="button"
              className="h-[37px] rounded-full bg-[#16B9B3] text-[13px] font-semibold hover:bg-[#0FA5A0]"
              disabled={busy !== null}
              onClick={startEdit}
            >
              {t("outcome_summary_edit")}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("zh-TW", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
