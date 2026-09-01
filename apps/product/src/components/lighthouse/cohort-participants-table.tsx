"use client";

import { type LighthouseParticipantsSort, useLighthouseParticipants } from "@daodao/api";
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
import { cn } from "@daodao/ui/lib/utils";
import { useEffect, useState } from "react";

interface CohortParticipantsTableProps {
  programId: number;
  cohortId: number;
  practices: string[];
  defaultRange: { from: string; to: string };
  /** 儀表板頂部套用的日期範圍（使用者改了範圍時，表格未另設就跟著用） */
  appliedRange?: { from?: string; to?: string };
  /** 儀表板頂部的實踐 chip 同步套用（FR-DB-01） */
  practiceTitle?: string;
}

type ColumnKey =
  | "nickname"
  | "email"
  | "practice"
  | "startDate"
  | "checkinCount"
  | "commentCount"
  | "viewCount"
  | "reactionCount";
type Column = { key: ColumnKey; labelKey: string; sort?: LighthouseParticipantsSort };

/** FR-DB-09：欄位與預設欄寬 120 / 210 / 210 / 110 / 90 / 70 / 70 / 70，最小 60px */
const COLUMNS: Column[] = [
  { key: "nickname", labelKey: "col_participant", sort: "nickname" },
  { key: "email", labelKey: "col_email" },
  { key: "practice", labelKey: "col_practice" },
  { key: "startDate", labelKey: "col_start_date", sort: "startDate" },
  { key: "checkinCount", labelKey: "col_checkins", sort: "checkinCount" },
  { key: "commentCount", labelKey: "col_comments", sort: "commentCount" },
  { key: "viewCount", labelKey: "col_views", sort: "viewCount" },
  { key: "reactionCount", labelKey: "col_reactions", sort: "reactionCount" },
];
const DEFAULT_WIDTHS: Record<ColumnKey, number> = {
  nickname: 120,
  email: 210,
  practice: 210,
  startDate: 110,
  checkinCount: 90,
  commentCount: 70,
  viewCount: 70,
  reactionCount: 70,
};
const MIN_WIDTH = 60;
const ALL = "__all__";

export function CohortParticipantsTable({
  programId,
  cohortId,
  practices,
  defaultRange,
  appliedRange,
  practiceTitle,
}: CohortParticipantsTableProps) {
  const t = useTranslations("lighthouse");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [practice, setPractice] = useState<string>(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<LighthouseParticipantsSort>("nickname");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [widths, setWidths] = useState(DEFAULT_WIDTHS);

  // 頂部 chip 切換時同步 dropdown
  useEffect(() => {
    setPractice(practiceTitle ?? ALL);
  }, [practiceTitle]);
  // 搜尋輸入 300ms 後才打 API
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const query = useLighthouseParticipants(programId, cohortId, {
    search: search || undefined,
    practiceTitle: practice === ALL ? undefined : practice,
    from: from || appliedRange?.from || undefined,
    to: to || appliedRange?.to || undefined,
    sort,
    order,
  });
  const data = query.data?.data;

  function toggleSort(column: LighthouseParticipantsSort) {
    if (sort === column) setOrder((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setSort(column);
      setOrder("asc");
    }
  }
  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setPractice(practiceTitle ?? ALL);
    setFrom("");
    setTo("");
  }
  /** 欄寬拖曳（TP-DB-07）：從標頭右緣拖曳，最小 60px */
  function startResize(key: ColumnKey, event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = widths[key];
    const move = (moveEvent: MouseEvent) =>
      setWidths((current) => ({
        ...current,
        [key]: Math.max(MIN_WIDTH, startWidth + moveEvent.clientX - startX),
      }));
    const stop = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", stop);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
  }
  function resizeByKeyboard(key: ColumnKey, delta: number) {
    setWidths((current) => ({ ...current, [key]: Math.max(MIN_WIDTH, current[key] + delta) }));
  }

  return (
    <section
      className="mt-5 rounded-3xl border border-[#CDEBE8] bg-white p-6"
      aria-labelledby="dashboard-participants-title"
    >
      <h2 id="dashboard-participants-title" className="text-lg font-semibold">
        {t("dashboard_participants")}
      </h2>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Input
          type="search"
          aria-label={t("participants_search")}
          placeholder={t("participants_search")}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="h-9 w-[240px] text-sm"
        />
        <Select value={practice} onValueChange={setPractice}>
          <SelectTrigger className="h-9 w-[160px] text-sm" aria-label={t("col_practice")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("dashboard_all_practices")}</SelectItem>
            {practices.map((title) => (
              <SelectItem key={title} value={title}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          aria-label={t("dashboard_range_from")}
          value={from || appliedRange?.from || defaultRange.from}
          onChange={(event) => setFrom(event.target.value)}
          className="h-9 w-[150px] text-xs"
        />
        <span aria-hidden="true" className="text-xs">
          –
        </span>
        <Input
          type="date"
          aria-label={t("dashboard_range_to")}
          value={to || appliedRange?.to || defaultRange.to}
          onChange={(event) => setTo(event.target.value)}
          className="h-9 w-[150px] text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-[#CDEBE8]"
          onClick={clearFilters}
        >
          {t("participants_clear")}
        </Button>
        <span className="ml-auto text-xs text-[#78928F]" aria-live="polite">
          {t("participants_count", { count: data?.total ?? 0 })}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-max min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="text-left text-xs text-[#78928F]">
              {COLUMNS.map((column) => {
                const isSorted = column.sort !== undefined && sort === column.sort;
                const label = t(column.labelKey as Parameters<typeof t>[0]);
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className="relative px-3 py-1 font-medium"
                    style={{ width: widths[column.key], minWidth: widths[column.key] }}
                    aria-sort={
                      isSorted ? (order === "asc" ? "ascending" : "descending") : undefined
                    }
                  >
                    {column.sort ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn("h-7 px-1 text-xs font-medium", isSorted && "text-[#0D7773]")}
                        aria-label={t("sort_by", { column: label })}
                        aria-current={isSorted ? "true" : undefined}
                        onClick={() => column.sort && toggleSort(column.sort)}
                      >
                        {label}
                        <span aria-hidden="true" className="ml-1 text-[10px]">
                          {isSorted ? (order === "asc" ? "▲" : "▼") : "△▽"}
                        </span>
                      </Button>
                    ) : (
                      <span className="px-1">{label}</span>
                    )}
                    <button
                      type="button"
                      aria-label={t("resize_column", { column: label })}
                      className="absolute right-0 top-0 h-full w-2 cursor-col-resize border-r border-[#DDEFED] hover:border-[#16B9B3] focus-visible:outline-2 focus-visible:outline-logo-cyan"
                      onMouseDown={(event) => startResize(column.key, event)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowLeft") resizeByKeyboard(column.key, -10);
                        if (event.key === "ArrowRight") resizeByKeyboard(column.key, 10);
                      }}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data?.items.map((row) => (
              <tr
                key={`${row.userId}-${row.practiceId}`}
                className="rounded-2xl bg-white text-[#0D3036] shadow-[0_0_0_1px_#DDEFED]"
              >
                <td className="truncate rounded-l-2xl px-3 py-3 font-semibold">
                  {row.nickname ?? "—"}
                </td>
                <td className="truncate px-3 py-3 text-[#456B68]">{row.email ?? "—"}</td>
                <td className="truncate px-3 py-3">{row.practiceTitle}</td>
                <td className="px-3 py-3 text-[#456B68]">
                  {row.startDate ? row.startDate.slice(0, 10).replaceAll("-", "/") : "—"}
                </td>
                <td className="px-3 py-3">{row.checkinCount}</td>
                <td className="px-3 py-3">{row.commentCount}</td>
                <td className="px-3 py-3">{row.viewCount}</td>
                <td className="rounded-r-2xl px-3 py-3">{row.reactionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {query.isLoading && !data && (
          <p className="py-6 text-center text-sm text-[#78928F]">{t("loading")}</p>
        )}
        {data && data.items.length === 0 && (
          <p className="py-6 text-center text-sm text-[#78928F]">{t("participants_empty")}</p>
        )}
      </div>
    </section>
  );
}
