"use client";

import { sendBulkEmail, sendCustomEmail, useEmailHealth, useEmailStats } from "@daodao/api";
import { cn } from "@daodao/ui/lib/utils";
import { AlertTriangle, CheckCircle, Send, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "../../../../components/admin/stat-card";

type TabId = "stats" | "health" | "send";

const tabs: { id: TabId; label: string }[] = [
  { id: "stats", label: "郵件統計" },
  { id: "health", label: "服務健康" },
  { id: "send", label: "發送郵件" },
];

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState<TabId>("stats");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-dark">郵件管理</h1>

      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent",
              activeTab === tab.id
                ? "border-b-primary-base text-primary-base"
                : "text-basic-400 hover:text-text-dark"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "stats" && <EmailStatsTab />}
      {activeTab === "health" && <EmailHealthTab />}
      {activeTab === "send" && <EmailSendTab />}
    </div>
  );
}

// ============================================================================
// Tab 1: Email Stats
// ============================================================================

function EmailStatsTab() {
  const { data, isLoading } = useEmailStats();
  const emailStats = data?.data as
    | {
        totalSent?: number;
        totalFailed?: number;
        successRate?: number;
        byTemplate?: Array<{
          template?: string;
          count?: number;
        }>;
      }
    | undefined;

  const chartData = useMemo(
    () =>
      (emailStats?.byTemplate ?? []).map((item) => ({
        name: item.template ?? "Unknown",
        count: item.count ?? 0,
      })),
    [emailStats]
  );

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="總發送數" value={emailStats?.totalSent ?? 0} />
        <StatCard title="總失敗數" value={emailStats?.totalFailed ?? 0} />
        <StatCard
          title="成功率"
          value={emailStats?.successRate !== undefined ? `${emailStats.successRate}%` : "N/A"}
        />
      </div>

      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">按模板分類</h3>
        {chartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-basic-300">暫無資料</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#16B9B3" radius={[4, 4, 0, 0]} name="發送數" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Tab 2: Email Health
// ============================================================================

function EmailHealthTab() {
  const { data, isLoading } = useEmailHealth();
  const health = data?.data as
    | {
        status?: string;
        smtp?: { connected?: boolean; host?: string; port?: number };
        queue?: { size?: number };
        lastError?: string;
        uptime?: number;
      }
    | undefined;

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
      </div>
    );
  }

  const status = health?.status ?? "unknown";
  const StatusIcon =
    status === "healthy" ? CheckCircle : status === "degraded" ? AlertTriangle : XCircle;
  const statusColor =
    status === "healthy"
      ? "text-green-500"
      : status === "degraded"
        ? "text-yellow-500"
        : "text-red-500";
  const statusBg =
    status === "healthy"
      ? "bg-green-50 border-green-200"
      : status === "degraded"
        ? "bg-yellow-50 border-yellow-200"
        : "bg-red-50 border-red-200";

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      <div className={cn("flex items-center gap-3 rounded-xl border p-5", statusBg)}>
        <StatusIcon className={cn("size-8", statusColor)} />
        <div>
          <p className={cn("text-lg font-semibold capitalize", statusColor)}>{status}</p>
          <p className="text-sm text-basic-400">郵件服務狀態</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* SMTP */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold">SMTP 連線</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-basic-400">狀態</span>
              <span
                className={cn(
                  "font-medium",
                  health?.smtp?.connected ? "text-green-600" : "text-red-600"
                )}
              >
                {health?.smtp?.connected ? "已連線" : "未連線"}
              </span>
            </div>
            {health?.smtp?.host && (
              <div className="flex justify-between">
                <span className="text-basic-400">主機</span>
                <span>{health.smtp.host}</span>
              </div>
            )}
            {health?.smtp?.port && (
              <div className="flex justify-between">
                <span className="text-basic-400">埠號</span>
                <span>{health.smtp.port}</span>
              </div>
            )}
          </div>
        </div>

        {/* Queue */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold">佇列狀態</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-basic-400">待發送</span>
              <span className="font-medium">{health?.queue?.size ?? 0} 封</span>
            </div>
          </div>
        </div>

        {/* Error */}
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold">最後錯誤</h3>
          <p className="text-sm text-basic-400">{health?.lastError ?? "無"}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Tab 3: Send Email
// ============================================================================

function EmailSendTab() {
  const [emailType, setEmailType] = useState<"custom" | "bulk">("custom");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [bulkRecipients, setBulkRecipients] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSendCustom = async () => {
    if (!recipient || !subject || !body) return;

    setIsSending(true);
    setResult(null);
    try {
      await sendCustomEmail({
        to: recipient,
        subject,
        htmlContent: body,
        template: "custom",
      });
      setResult({ type: "success", message: "郵件已發送" });
      setRecipient("");
      setSubject("");
      setBody("");
    } catch (_err) {
      setResult({ type: "error", message: "發送失敗，請重試" });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendBulk = async () => {
    const recipientEmails = bulkRecipients
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (recipientEmails.length === 0 || !subject || !body) return;
    if (recipientEmails.length > 100) {
      setResult({ type: "error", message: "最多 100 位收件人" });
      return;
    }

    setIsSending(true);
    setResult(null);
    try {
      await sendBulkEmail({
        template: "custom",
        subject,
        recipients: recipientEmails.map((email) => ({ email, data: {} })),
      });
      setResult({
        type: "success",
        message: `已發送給 ${recipientEmails.length} 位收件人`,
      });
    } catch (_err) {
      setResult({ type: "error", message: "批量發送失敗，請重試" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Email Type Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEmailType("custom")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium",
            emailType === "custom"
              ? "bg-primary-base text-white"
              : "border border-border bg-white hover:bg-basic-50"
          )}
        >
          單封郵件
        </button>
        <button
          type="button"
          onClick={() => setEmailType("bulk")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium",
            emailType === "bulk"
              ? "bg-primary-base text-white"
              : "border border-border bg-white hover:bg-basic-50"
          )}
        >
          批量發送
        </button>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm space-y-4">
        {emailType === "custom" ? (
          <div>
            <label className="block text-sm font-medium mb-1">
              收件人
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-normal"
                placeholder="user@example.com"
              />
            </label>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">
              收件人列表（每行一個，最多 100 位）
              <textarea
                value={bulkRecipients}
                onChange={(e) => setBulkRecipients(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm h-24 resize-y font-normal"
                placeholder={"user1@example.com\nuser2@example.com"}
              />
            </label>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            主旨
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-normal"
              placeholder="郵件主旨"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            內容（HTML）
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm h-40 resize-y font-mono font-normal"
              placeholder="<p>郵件內容...</p>"
            />
          </label>
        </div>

        {result && (
          <div
            className={cn(
              "rounded-lg p-3 text-sm",
              result.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            )}
          >
            {result.message}
          </div>
        )}

        <button
          type="button"
          onClick={emailType === "custom" ? handleSendCustom : handleSendBulk}
          disabled={isSending}
          className="flex items-center gap-2 rounded-lg bg-primary-base px-4 py-2 text-sm font-medium text-white hover:bg-primary-base/90 disabled:opacity-50"
        >
          <Send className="size-4" />
          {isSending ? "發送中..." : "發送"}
        </button>
      </div>
    </div>
  );
}
