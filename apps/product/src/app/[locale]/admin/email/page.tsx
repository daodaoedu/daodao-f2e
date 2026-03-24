"use client";

import {
  sendBulkEmail,
  sendCustomEmail,
  useEmailHealth,
  useEmailHistory,
  useEmailStats,
} from "@daodao/api";
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
// Tab 1: Email Stats (merged with Open Tracking)
// ============================================================================

const EMAIL_TYPE_OPTIONS = [
  { value: "", label: "全部類型" },
  { value: "auth_register", label: "註冊確認" },
  { value: "auth_password_reset", label: "密碼重設" },
  { value: "auth_email_verify", label: "信箱驗證" },
  { value: "practice_created", label: "實踐建立" },
  { value: "practice_first_checkin", label: "首次打卡" },
  { value: "practice_weekly_summary", label: "每週回顧" },
  { value: "practice_final_summary", label: "實踐完成" },
  { value: "notification", label: "一般通知" },
];

function EmailStatsTab() {
  const { data: statsData, isLoading: statsLoading } = useEmailStats();
  const emailStats = statsData?.data as
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
        name:
          EMAIL_TYPE_OPTIONS.find((o) => o.value === item.template)?.label ??
          item.template ??
          "Unknown",
        count: item.count ?? 0,
      })),
    [emailStats]
  );

  // Tracking state
  const [openedFilter, setOpenedFilter] = useState<"true" | "false" | "">("");
  const [emailTypeFilter, setEmailTypeFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: historyRaw, isLoading: historyLoading } = useEmailHistory({
    opened: openedFilter || undefined,
    emailType: emailTypeFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit,
    sortBy: "sentAt",
    sortOrder: "desc",
  });

  const historyData = historyRaw?.data;
  const records = historyData?.records ?? [];
  const pagination = historyData?.pagination;
  const trackingStats = historyData?.stats;

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEmailTypeLabel = (type: string) => {
    const found = EMAIL_TYPE_OPTIONS.find((o) => o.value === type);
    return found?.label ?? type;
  };

  if (statsLoading || historyLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="size-6 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard title="總發送數" value={emailStats?.totalSent ?? 0} />
        <StatCard title="總失敗數" value={emailStats?.totalFailed ?? 0} />
        <StatCard
          title="成功率"
          value={emailStats?.successRate !== undefined ? `${emailStats.successRate}%` : "N/A"}
        />
        <StatCard title="總開啟數" value={trackingStats?.openedCount ?? 0} />
        <StatCard
          title="開啟率"
          value={(trackingStats?.sentCount ?? 0) > 0 ? `${trackingStats?.openRate ?? 0}%` : "N/A"}
        />
      </div>

      {/* Chart */}
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

      {/* Tracking Section */}
      <h3 className="text-lg font-semibold text-text-dark">開啟追蹤</h3>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-white p-4 shadow-sm">
        <div>
          <label
            htmlFor="tracking-opened"
            className="block text-xs font-medium text-basic-400 mb-1"
          >
            開啟狀態
          </label>
          <select
            id="tracking-opened"
            value={openedFilter}
            onChange={(e) => {
              setOpenedFilter(e.target.value as "true" | "false" | "");
              setPage(1);
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
          >
            <option value="">全部</option>
            <option value="true">已開啟</option>
            <option value="false">未開啟</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="tracking-email-type"
            className="block text-xs font-medium text-basic-400 mb-1"
          >
            郵件類型
          </label>
          <select
            id="tracking-email-type"
            value={emailTypeFilter}
            onChange={(e) => {
              setEmailTypeFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
          >
            {EMAIL_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="tracking-start-date"
            className="block text-xs font-medium text-basic-400 mb-1"
          >
            開始日期
          </label>
          <input
            id="tracking-start-date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="tracking-end-date"
            className="block text-xs font-medium text-basic-400 mb-1"
          >
            結束日期
          </label>
          <input
            id="tracking-end-date"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-basic-50">
              <th className="px-4 py-3 font-medium text-basic-400">收件人</th>
              <th className="px-4 py-3 font-medium text-basic-400">郵件類型</th>
              <th className="px-4 py-3 font-medium text-basic-400">主旨</th>
              <th className="px-4 py-3 font-medium text-basic-400">發送時間</th>
              <th className="px-4 py-3 font-medium text-basic-400">狀態</th>
              <th className="px-4 py-3 font-medium text-basic-400">首次開啟</th>
              <th className="px-4 py-3 font-medium text-basic-400 text-right">開啟次數</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-basic-300">
                  暫無資料
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-border last:border-0 hover:bg-basic-50/50"
                >
                  <td className="px-4 py-3 text-text-dark">{record.recipientEmail ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-primary-base/10 px-2 py-0.5 text-xs font-medium text-primary-base">
                      {getEmailTypeLabel(record.emailType ?? "")}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate" title={record.subject ?? ""}>
                    {record.subject ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-basic-400 whitespace-nowrap">
                    {formatDate(record.sentAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                        record.status === "sent"
                          ? "bg-green-50 text-green-700"
                          : record.status === "failed"
                            ? "bg-red-50 text-red-700"
                            : "bg-yellow-50 text-yellow-700"
                      )}
                    >
                      {record.status === "sent"
                        ? "已發送"
                        : record.status === "failed"
                          ? "失敗"
                          : "待發送"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-basic-400 whitespace-nowrap">
                    {formatDate(record.openedAt)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {(record.openCount ?? 0) > 0 ? (
                      <span className="text-primary-base">{record.openCount}</span>
                    ) : (
                      <span className="text-basic-300">0</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (pagination.totalPages ?? 0) > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-basic-400">
            共 {pagination.totalCount ?? 0} 筆，第 {pagination.currentPage ?? 1} /{" "}
            {pagination.totalPages ?? 1} 頁
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              上一頁
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext}
              className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        </div>
      )}
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
            <label htmlFor="email-recipient" className="block text-sm font-medium mb-1">
              收件人
            </label>
            <input
              id="email-recipient"
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-normal"
              placeholder="user@example.com"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="email-bulk-recipients" className="block text-sm font-medium mb-1">
              收件人列表（每行一個，最多 100 位）
            </label>
            <textarea
              id="email-bulk-recipients"
              value={bulkRecipients}
              onChange={(e) => setBulkRecipients(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm h-24 resize-y font-normal"
              placeholder={"user1@example.com\nuser2@example.com"}
            />
          </div>
        )}

        <div>
          <label htmlFor="email-subject" className="block text-sm font-medium mb-1">
            主旨
          </label>
          <input
            id="email-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm font-normal"
            placeholder="郵件主旨"
          />
        </div>

        <div>
          <label htmlFor="email-body" className="block text-sm font-medium mb-1">
            內容（HTML）
          </label>
          <textarea
            id="email-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm h-40 resize-y font-mono font-normal"
            placeholder="<p>郵件內容...</p>"
          />
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
