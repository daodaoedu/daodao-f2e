"use client";

import {
  clearLighthouseAiCredential,
  LIGHTHOUSE_AI_PROVIDERS,
  type LighthouseAiProvider,
  setLighthouseAiCredential,
  testLighthouseAiCredential,
  useLighthouseAiCredential,
} from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { Input } from "@daodao/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@daodao/ui/components/select";
import { toast } from "@daodao/ui/components/sonner";
import { cn } from "@daodao/ui/lib/utils";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "./confirm-dialog";

interface OrganizationAiKeyCardProps {
  organizationId: number;
}

type TestState = "idle" | "testing" | "success" | "failed" | "empty";

/**
 * 組織設定「AI API key」卡片（FR-ORG-03）：
 * key 只進不出——畫面顯示狀態與末四碼，輸入框永遠不會回填明文。
 */
export function OrganizationAiKeyCard({ organizationId }: OrganizationAiKeyCardProps) {
  const t = useTranslations("lighthouse");
  const credentialQuery = useLighthouseAiCredential(organizationId);
  const credential = credentialQuery.data?.data;
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<LighthouseAiProvider | null>(null);
  const [busy, setBusy] = useState(false);
  const [testState, setTestState] = useState<TestState>("idle");
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const configured = Boolean(credential && credential.status !== "unset");
  const activeProvider = provider ?? credential?.provider ?? "openai";

  /** 回傳是否真的保存成功；test() 依此決定要不要接著測（保存失敗就不測舊 key） */
  async function save(): Promise<boolean> {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setTestState("empty");
      setTestMessage(t("organization_ai_key_empty"));
      return false;
    }
    setBusy(true);
    const response = await setLighthouseAiCredential(organizationId, {
      provider: activeProvider,
      apiKey: trimmed,
    });
    setBusy(false);
    if (response.error) {
      toast.error(t("organization_ai_key_save_failed"));
      return false;
    }
    setApiKey("");
    setTestState("idle");
    setTestMessage(null);
    await credentialQuery.mutate();
    toast.success(t("organization_ai_key_saved"));
    return true;
  }

  async function test() {
    // 尚未保存的輸入先存再測，讓「輸入 → 測試連線」一步到位（TP-ORG-04）
    if (apiKey.trim()) {
      if (!(await save())) return;
    } else if (!configured) {
      setTestState("empty");
      setTestMessage(t("organization_ai_key_empty"));
      return;
    } else if (credential?.provider && activeProvider !== credential.provider) {
      // 只改了 AI 服務、沒輸入新 key：既存 key 屬於原 provider，要先輸入該服務的 key 才能測
      setTestState("empty");
      setTestMessage(t("organization_ai_key_provider_changed"));
      return;
    }
    setBusy(true);
    setTestState("testing");
    setTestMessage(t("organization_ai_key_testing"));
    const response = await testLighthouseAiCredential(organizationId);
    setBusy(false);
    if (response.error) {
      setTestState("failed");
      setTestMessage(response.error.error?.message ?? t("organization_ai_key_test_failed"));
      await credentialQuery.mutate();
      return;
    }
    const ok = response.data.data.ok;
    setTestState(ok ? "success" : "failed");
    setTestMessage(response.data.data.message);
    await credentialQuery.mutate();
  }

  async function clear() {
    setBusy(true);
    const response = await clearLighthouseAiCredential(organizationId);
    setBusy(false);
    setConfirmClear(false);
    if (response.error) {
      toast.error(t("organization_ai_key_clear_failed"));
      return;
    }
    setApiKey("");
    setTestState("idle");
    setTestMessage(null);
    await credentialQuery.mutate();
    toast.success(t("organization_ai_key_cleared"));
  }

  const statusLabel = configured
    ? t("organization_ai_key_status_set")
    : t("organization_ai_key_status_unset");
  // 輸入修改後（尚未測試／儲存）清掉上一筆連線結果，只提示需重新測試（TP-ORG-04）
  const hint =
    testMessage ??
    (apiKey.trim()
      ? t("organization_ai_key_untested")
      : credential?.status === "verified"
        ? t("organization_ai_key_verified_at", { time: formatTime(credential.lastTestedAt) })
        : credential?.status === "invalid"
          ? credential.lastTestError
            ? t("organization_ai_key_last_failed", { reason: credential.lastTestError })
            : t("organization_ai_key_test_failed")
          : t("organization_ai_key_untested"));

  return (
    <section className="rounded-3xl border border-[#CDEBE8] bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-[#E7FAF7] text-[#0D7773]">
            <KeyRound className="size-5" aria-hidden="true" />
          </span>
          <h2 className="text-xl font-semibold">{t("organization_ai_key_title")}</h2>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
            configured ? "bg-[#0D5B59] text-white" : "bg-[#F0FBF9] text-[#0D5B59]"
          )}
          data-testid="ai-key-status"
        >
          {statusLabel}
          {configured && credential?.keyLast4 ? ` · …${credential.keyLast4}` : ""}
        </span>
      </div>
      <p className="mt-3 text-sm text-[#5A7B79]">{t("organization_ai_key_description")}</p>

      <div className="mt-5 grid gap-3">
        <div className="grid max-w-xs gap-2">
          <label htmlFor="organization-ai-provider" className="text-sm font-medium">
            {t("organization_ai_provider")}
          </label>
          <Select
            value={activeProvider}
            onValueChange={(value) => setProvider(value as LighthouseAiProvider)}
            disabled={busy}
          >
            <SelectTrigger id="organization-ai-provider" className="rounded-xl border-[#CDEBE8]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIGHTHOUSE_AI_PROVIDERS.map((item) => (
                <SelectItem key={item} value={item}>
                  {t(`organization_ai_provider_${item}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label htmlFor="organization-ai-key" className="grid gap-2 text-sm font-medium">
          {t("organization_ai_key_label")}
          <Input
            id="organization-ai-key"
            name="apiKey"
            type="password"
            autoComplete="off"
            placeholder={configured ? t("organization_ai_key_replace_placeholder") : "sk-..."}
            value={apiKey}
            disabled={busy}
            onChange={(event) => {
              setApiKey(event.target.value);
              // 改值即清掉上一筆連線狀態（TP-ORG-04）
              setTestState("idle");
              setTestMessage(null);
            }}
          />
        </label>
        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-[#0D7773] text-[#0D7773]"
            disabled={busy}
            onClick={() => void test()}
          >
            {testState === "testing"
              ? t("organization_ai_key_testing_button")
              : t("organization_ai_key_test")}
          </Button>
          <Button
            type="button"
            className="rounded-full"
            disabled={busy || !apiKey.trim()}
            onClick={() => void save()}
          >
            {t("save")}
          </Button>
        </div>
      </div>
      <output
        className={cn(
          "mt-3 block text-sm",
          testState === "success" || credential?.status === "verified"
            ? "text-[#0D7773]"
            : testState === "failed" || testState === "empty" || credential?.status === "invalid"
              ? "text-[#C03A3A]"
              : "text-[#78928F]"
        )}
        aria-live="polite"
      >
        {hint}
      </output>
      {configured && (
        <div className="mt-4">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full text-[#C03A3A] hover:bg-[#FCEDED] hover:text-[#A63232]"
            disabled={busy}
            onClick={() => setConfirmClear(true)}
          >
            {t("organization_ai_key_clear")}
          </Button>
        </div>
      )}
      <ConfirmDialog
        open={confirmClear}
        title={t("organization_ai_key_clear_title")}
        description={t("organization_ai_key_clear_message")}
        confirmLabel={t("organization_ai_key_clear")}
        destructive
        busy={busy}
        onConfirm={clear}
        onOpenChange={setConfirmClear}
      />
    </section>
  );
}

function formatTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("zh-TW", { hour12: false });
}
