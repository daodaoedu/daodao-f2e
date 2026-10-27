"use client";

import {
  archiveLighthouseCohort,
  archiveLighthouseProgram,
  createLighthouseCohort,
  createLighthouseProgram,
  duplicateLighthouseCohort,
  duplicateLighthouseProgram,
  type LighthouseCohortType,
  setLighthouseTemplateBinding,
  updateLighthouseCohort,
  updateLighthouseProgram,
  useLighthouseCohorts,
  useLighthouseOrganizations,
  useLighthousePrograms,
  useLighthouseTemplates,
} from "@daodao/api";
import { useLocale, useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { Input } from "@daodao/ui/components/input";
import { Popover, PopoverAnchor, PopoverContent } from "@daodao/ui/components/popover";
import { toast } from "@daodao/ui/components/sonner";
import { Switch } from "@daodao/ui/components/switch";
import { Textarea } from "@daodao/ui/components/textarea";
import { addDays, differenceInCalendarDays, format, getDay, parseISO } from "date-fns";
import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  Minus,
  MoreVertical,
  Pencil,
  Plus,
  RadioTower,
  Search,
  Send,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  type ServerErrorMessageFn,
  useServerErrorMessage,
} from "@/lib/server-error/use-server-error-message";
import { type CohortFieldErrorKey, resolveCohortApiError } from "@/utils/cohort-api-error";
import {
  diffTemplateBindings,
  formatSlashDate,
  isCohortStarted,
  newBindingStartDate,
  resolveTemplateSelection,
  templateBindingEndDate,
  templateStartDateOverride,
} from "@/utils/template-library";
import { DEFAULT_COHORT_TIMEZONE, TIME_ZONE_OPTIONS } from "@/utils/timezones";
import { ConfirmDialog } from "./confirm-dialog";
import { JoinCode } from "./join-code";
import { useLighthouseErrorMessage } from "./use-lighthouse-error-message";

type SessionEntry = { id: string; sessionDate: string; startTime: string; endTime: string };
type SessionDisplayGroup = {
  sessions: SessionEntry[];
  repeatWeekdays: number[];
  repeatWeeks: number;
};
type ExpandedRepeatGroup = { key: string; sessionIds: string[]; label: string };

const RECURRENCE_WEEKDAYS = [
  { day: 1, zh: "週一", en: "Mon" },
  { day: 2, zh: "週二", en: "Tue" },
  { day: 3, zh: "週三", en: "Wed" },
  { day: 4, zh: "週四", en: "Thu" },
  { day: 5, zh: "週五", en: "Fri" },
  { day: 6, zh: "週六", en: "Sat" },
  { day: 7, zh: "週日", en: "Sun" },
] as const;

function groupSessionsForDisplay(
  sessions: SessionEntry[],
  expandedSessionIds: Set<string>
): SessionDisplayGroup[] {
  const weeklyBuckets = new Map<string, SessionEntry[]>();
  const singles: SessionDisplayGroup[] = [];

  for (const session of sessions) {
    if (!session.sessionDate || expandedSessionIds.has(session.id)) {
      singles.push({ sessions: [session], repeatWeekdays: [], repeatWeeks: 0 });
      continue;
    }

    const weekday = getDay(parseISO(session.sessionDate)) || 7;
    const key = `${session.startTime}|${session.endTime}|${weekday}`;
    const bucket = weeklyBuckets.get(key) ?? [];
    bucket.push(session);
    weeklyBuckets.set(key, bucket);
  }

  const weeklySequences: SessionEntry[][] = [];
  for (const bucket of weeklyBuckets.values()) {
    const ordered = bucket.slice().sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
    let sequence: SessionEntry[] = [];

    for (const session of ordered) {
      const previous = sequence.at(-1);
      if (
        previous &&
        differenceInCalendarDays(parseISO(session.sessionDate), parseISO(previous.sessionDate)) !==
          7
      ) {
        if (sequence.length > 1) weeklySequences.push(sequence);
        else singles.push({ sessions: sequence, repeatWeekdays: [], repeatWeeks: 0 });
        sequence = [];
      }
      sequence.push(session);
    }

    if (sequence.length > 1) weeklySequences.push(sequence);
    else if (sequence.length === 1)
      singles.push({ sessions: sequence, repeatWeekdays: [], repeatWeeks: 0 });
  }

  const weeklyGroups: SessionDisplayGroup[][] = [];
  for (const sequence of weeklySequences) {
    const first = sequence[0];
    const last = sequence.at(-1);
    const weekday = getDay(parseISO(first.sessionDate)) || 7;
    const matchingGroup = weeklyGroups.find((group) => {
      const groupedSessions = group.flatMap((item) => item.sessions);
      const groupedFirst = groupedSessions[0];
      const groupedLast = groupedSessions.at(-1);
      return (
        groupedFirst.startTime === first.startTime &&
        groupedFirst.endTime === first.endTime &&
        group.every((item) => item.sessions.length === sequence.length) &&
        Math.abs(
          differenceInCalendarDays(parseISO(first.sessionDate), parseISO(groupedFirst.sessionDate))
        ) <= 6 &&
        Math.abs(
          differenceInCalendarDays(parseISO(last.sessionDate), parseISO(groupedLast.sessionDate))
        ) <= 6
      );
    });
    const item = {
      sessions: sequence,
      repeatWeekdays: [weekday],
      repeatWeeks: sequence.length,
    };
    if (matchingGroup) matchingGroup.push(item);
    else weeklyGroups.push([item]);
  }

  const repeated = weeklyGroups.map((group) => ({
    sessions: group
      .flatMap((item) => item.sessions)
      .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate)),
    repeatWeekdays: group.map((item) => item.repeatWeekdays[0]).sort((a, b) => a - b),
    repeatWeeks: Math.max(...group.map((item) => item.repeatWeeks)),
  }));

  return [...singles, ...repeated].sort((a, b) => {
    const aDate = a.sessions[0].sessionDate;
    const bDate = b.sessions[0].sessionDate;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return aDate.localeCompare(bDate);
  });
}

function recurringSessionLabel(group: SessionDisplayGroup, locale: string): string | null {
  if (group.repeatWeekdays.length === 0) return null;

  const weekdays = group.repeatWeekdays.map((weekday) => {
    const match = RECURRENCE_WEEKDAYS.find((item) => item.day === weekday);
    return locale === "en" ? match?.en : match?.zh.replace("週", "");
  });
  return locale === "en"
    ? `Every ${weekdays.join(", ")} for ${group.repeatWeeks} weeks (${group.sessions.length} sessions)`
    : `每週${weekdays.join("、")}，持續 ${group.repeatWeeks} 週（共 ${group.sessions.length} 場）`;
}

type CohortTemplateSummary = {
  id: number;
  title: string;
  durationDays: number | null;
  boundCohortIds: number[];
  bindings: { cohortId: number; startDate: string | null }[];
};

/** 已封存要一眼看得出來，不能和草稿、已發佈長一樣 */
const COHORT_STATUS_STYLES: Record<LighthouseCohortType["status"], string> = {
  draft: "bg-[#F1F4F4] text-[#5A7B79]",
  published: "bg-[#EDF8F6] text-[#0D7773]",
  archived: "bg-[#FDECEC] text-[#C03A3A]",
};

type SetupTab = "basic" | "templates" | "home" | "privacy" | "signup";
const SETUP_TABS: SetupTab[] = ["basic", "templates", "home", "privacy", "signup"];
/** 與 server createCohortSchema 一致：小寫英數，單一連字號分隔，不可首尾或連續連字號 */
const COHORT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** HTML pattern 屬性版本（Chrome 以 v flag 編譯，字元類別結尾的 `-` 會被判定為無效正則而整個忽略） */
const COHORT_SLUG_HTML_PATTERN = "[a-z0-9]+(-[a-z0-9]+)*";

type CohortErrorTranslator = (
  key: CohortFieldErrorKey | "cohort_create_failed" | "save_failed"
) => string;

/**
 * 把場次 API 錯誤轉成 toast 文字：已知欄位走 i18n；其他在 zh-TW 顯示 server 訊息、
 * 其他語系走共用的 code／status 轉換（daodao#353），最後才退回通用訊息
 */
function cohortErrorMessage(
  t: CohortErrorTranslator,
  serverErrorMessage: ServerErrorMessageFn,
  error: unknown,
  fallbackKey: "cohort_create_failed" | "save_failed",
  status?: number
): string {
  const resolved = resolveCohortApiError(error);
  if (resolved.type === "i18n") return t(resolved.key);
  return serverErrorMessage(error, t(fallbackKey), {
    status,
    detailMessage: resolved.type === "message" ? resolved.message : undefined,
  });
}

/** 送出模板綁定異動，回傳第一個失敗的 API 錯誤（含網路錯誤）；全部成功回 null */
async function applyTemplateBindings(
  organizationId: number,
  cohortId: number,
  { bind, unbind, update }: ReturnType<typeof diffTemplateBindings>,
  /** 新綁定時一併帶上使用者指定的開始日（#272）；沒指定就明確送 null 沿用場次開始日 */
  startDates: ReadonlyMap<number, string | null>
): Promise<unknown> {
  try {
    const responses = await Promise.all([
      ...bind.map((templateId) =>
        setLighthouseTemplateBinding(
          organizationId,
          templateId,
          cohortId,
          true,
          newBindingStartDate(startDates, templateId)
        )
      ),
      ...update.map(({ templateId, startDate }) =>
        setLighthouseTemplateBinding(organizationId, templateId, cohortId, true, startDate)
      ),
      ...unbind.map((templateId) =>
        setLighthouseTemplateBinding(organizationId, templateId, cohortId, false)
      ),
    ]);
    return responses.find((response) => response.error)?.error ?? null;
  } catch (error) {
    return error;
  }
}

interface CohortSetupPanelProps {
  mode: "create" | "edit";
  cohort?: LighthouseCohortType;
  programId: number;
  organizationId: number;
  templates?: CohortTemplateSummary[];
  onSubmit: (
    formData: FormData,
    extras: {
      interactionModes: string[];
      timezone: string;
      sessions: SessionEntry[];
      feeType: "free" | "paid";
      signupMethod: "island_form" | "external";
      isPrivate: boolean;
      checkinDefaultPrivate: boolean;
      hostCommentDefaultPrivate: boolean;
      visibility: "public" | "private";
      selectedTemplateIds?: number[];
      /** 使用者改過的模板開始日（YYYY-MM-DD；null＝沿用場次開始日） */
      templateStartDates?: ReadonlyMap<number, string | null>;
      publishNow?: boolean;
    }
  ) => Promise<void>;
  onClose: () => void;
  busy: boolean;
}

function CohortSetupPanel({
  mode,
  cohort,
  programId,
  organizationId: _organizationId,
  templates,
  onSubmit,
  onClose,
  busy,
}: CohortSetupPanelProps) {
  const t = useTranslations("lighthouse");
  const locale = useLocale();
  const recurrenceCopy =
    locale === "en"
      ? {
          title: "Add recurring sessions",
          startDate: "Start date",
          weeks: "Number of weeks",
          weekdays: "Repeat on",
          weekdaysOnly: "Weekdays (Monday–Friday)",
          startTime: "Start time for each session",
          endTime: "End time for each session",
          add: "Add recurring sessions",
          regularOption: "Recurring sessions",
          irregularOption: "One-off session",
          irregularTitle: "One-off sessions",
          editIndividual: "Edit individual sessions",
          editingIndividual: "Editing individual sessions from",
          collapseRepeat: "Collapse series",
        }
      : {
          title: "規律新增聚會時段",
          startDate: "從哪一天開始",
          weeks: "持續週數",
          weekdays: "重複星期",
          weekdaysOnly: "平日（週一至週五）",
          startTime: "每場開始時間",
          endTime: "每場結束時間",
          add: "新增規律時段",
          regularOption: "規律時段",
          irregularOption: "非規律時段",
          irregularTitle: "非規律時段",
          editIndividual: "逐場編輯",
          editingIndividual: "正在逐場編輯",
          collapseRepeat: "收合規律時段",
        };
  const [activeTab, setActiveTab] = useState<SetupTab>("basic");
  const panelRef = useRef<HTMLFormElement>(null);
  // 已開始的場次 server 會拒絕變更綁定（FR-TPL-05），直接鎖住勾選
  const templatesLocked = mode === "edit" && !!cohort && isCohortStarted(cohort.startDate);
  // 只記使用者動過的模板，其餘跟著最新的既有綁定走：templates 可能比面板晚載入，
  // 也不會把別人剛綁上的模板當成「取消勾選」解綁掉。
  // 新增場次預設不綁任何模板：建立時模板分頁是 disabled，不能讓使用者看不到就被綁上全部（#273）
  const [templateOverrides, setTemplateOverrides] = useState<Map<number, boolean>>(() => new Map());
  const selectedTemplateIds = resolveTemplateSelection(
    cohort
      ? (templates ?? [])
          .filter((tpl) => tpl.boundCohortIds.includes(cohort.id))
          .map((tpl) => tpl.id)
      : [],
    templatesLocked ? new Map() : templateOverrides
  );

  function toggleTemplate(templateId: number, checked: boolean) {
    setTemplateOverrides((prev) => new Map(prev).set(templateId, checked));
  }
  // 開始日同樣只記使用者動過的，存檔時只送有變的（#272）
  const [startDateOverrides, setStartDateOverrides] = useState<Map<number, string | null>>(
    () => new Map()
  );
  const [templateDropOpen, setTemplateDropOpen] = useState(false);
  // 跟著基本資訊分頁正在編輯的場次開始日走，沒指定開始日的模板列才不會顯示舊日期
  const [cohortStartDate, setCohortStartDate] = useState(cohort?.startDate?.slice(0, 10) ?? "");
  const [cohortEndDate, setCohortEndDate] = useState(cohort?.endDate?.slice(0, 10) ?? "");
  function savedTemplateStartDate(tpl: CohortTemplateSummary): string | null {
    const binding = cohort ? tpl.bindings.find((b) => b.cohortId === cohort.id) : undefined;
    return binding?.startDate?.slice(0, 10) ?? null;
  }
  function templateStartDate(tpl: CohortTemplateSummary): string {
    if (startDateOverrides.has(tpl.id)) return startDateOverrides.get(tpl.id) ?? cohortStartDate;
    return savedTemplateStartDate(tpl) ?? cohortStartDate;
  }
  function setTemplateStartDate(tpl: CohortTemplateSummary, value: string) {
    const next = templateStartDateOverride(value, cohortStartDate, savedTemplateStartDate(tpl));
    setStartDateOverrides((prev) => new Map(prev).set(tpl.id, next));
  }

  const [sessions, setSessions] = useState<SessionEntry[]>(() =>
    (cohort?.sessions ?? []).map((s, i) => ({
      id: String(s.id ?? i),
      sessionDate: s.sessionDate?.slice(0, 10) ?? "",
      startTime: s.startTime ?? "",
      endTime: s.endTime ?? "",
    }))
  );
  const [timezone, setTimezone] = useState(cohort?.timezone ?? DEFAULT_COHORT_TIMEZONE);
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [timezoneDropOpen, setTimezoneDropOpen] = useState(false);
  const [recurrenceStartDateOverride, setRecurrenceStartDateOverride] = useState<string | null>(
    null
  );
  const [recurrenceWeeks, setRecurrenceWeeks] = useState(4);
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState<number[]>([]);
  const [sessionAddMode, setSessionAddMode] = useState<"regular" | "irregular" | null>(null);
  const [expandedRepeatGroups, setExpandedRepeatGroups] = useState<ExpandedRepeatGroup[]>([]);
  const [recurrenceStartTime, setRecurrenceStartTime] = useState(
    cohort?.sessions?.[0]?.startTime ?? ""
  );
  const [recurrenceEndTime, setRecurrenceEndTime] = useState(cohort?.sessions?.[0]?.endTime ?? "");
  const [interactionModes, setInteractionModes] = useState<string[]>(
    cohort?.interactionModes ?? []
  );
  const [feeType, setFeeType] = useState<"free" | "paid">(cohort?.feeType ?? "free");
  const [signupMethod, setSignupMethod] = useState<"island_form" | "external">(
    cohort?.signupMethod ?? "island_form"
  );
  const [isPrivate, setIsPrivate] = useState(cohort?.isPrivate ?? true);
  const [checkinPrivate, setCheckinPrivate] = useState(cohort?.checkinDefaultPrivate ?? false);
  const [hostCommentPrivate, setHostCommentPrivate] = useState(
    cohort?.hostCommentDefaultPrivate ?? false
  );
  const [publishNow, setPublishNow] = useState(false);
  const [taglineValue, setTaglineValue] = useState(cohort?.tagline ?? "");
  const [capacityUnlimited, setCapacityUnlimited] = useState(!cohort?.capacity);
  const [interactionDropdownOpen, setInteractionDropdownOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">(
    cohort?.visibility ?? "private"
  );
  const [showInviteOnSignup, setShowInviteOnSignup] = useState(
    cohort?.showInviteMessageOnSignup ?? false
  );
  const recurrenceStartDate =
    recurrenceStartDateOverride ??
    cohort?.sessions?.find((session) => session.sessionDate)?.sessionDate?.slice(0, 10) ??
    cohortStartDate;
  const expandedSessionIds = new Set(expandedRepeatGroups.flatMap((group) => group.sessionIds));
  const displayedSessions = groupSessionsForDisplay(sessions, expandedSessionIds);

  useEffect(() => {
    panelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: mode === "edit" ? "start" : "nearest",
    });
  }, [mode]);

  const addSession = useCallback(() => {
    setSessions((prev) => {
      const last = prev[prev.length - 1];
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          sessionDate: "",
          startTime: last?.startTime ?? "",
          endTime: last?.endTime ?? "",
        },
      ];
    });
  }, []);
  const removeSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
    setExpandedRepeatGroups((prev) =>
      prev
        .map((group) => ({
          ...group,
          sessionIds: group.sessionIds.filter((sessionId) => sessionId !== id),
        }))
        .filter((group) => group.sessionIds.length > 1)
    );
  }, []);
  const addRecurringSessions = useCallback(() => {
    if (!recurrenceStartDate || recurrenceWeekdays.length === 0) return;

    const [year, month, day] = recurrenceStartDate.split("-").map(Number);
    const firstDate = Date.UTC(year, month - 1, day);
    if (!Number.isFinite(firstDate)) return;

    const existingKeys = new Set(
      sessions.map((session) => `${session.sessionDate}|${session.startTime}|${session.endTime}`)
    );
    const generated: SessionEntry[] = [];
    const dayInMs = 24 * 60 * 60 * 1000;

    for (let offset = 0; offset < recurrenceWeeks * 7; offset += 1) {
      const date = new Date(firstDate + offset * dayInMs);
      const weekday = date.getUTCDay() || 7;
      if (!recurrenceWeekdays.includes(weekday)) continue;

      const sessionDate = date.toISOString().slice(0, 10);
      if (cohortEndDate && sessionDate > cohortEndDate) continue;

      const session = {
        id: crypto.randomUUID(),
        sessionDate,
        startTime: recurrenceStartTime,
        endTime: recurrenceEndTime,
      };
      const key = `${session.sessionDate}|${session.startTime}|${session.endTime}`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);
      generated.push(session);
    }

    if (generated.length > 0) {
      setSessions((prev) => [...prev, ...generated]);
      setSessionAddMode(null);
    }
  }, [
    cohortEndDate,
    recurrenceEndTime,
    recurrenceStartDate,
    recurrenceStartTime,
    recurrenceWeekdays,
    recurrenceWeeks,
    sessions,
  ]);

  const toggleRecurrenceWeekday = useCallback((weekday: number) => {
    setRecurrenceWeekdays((prev) =>
      prev.includes(weekday) ? prev.filter((day) => day !== weekday) : [...prev, weekday].sort()
    );
  }, []);
  const updateSessionGroup = useCallback(
    (group: SessionDisplayGroup, field: "sessionDate" | "startTime" | "endTime", value: string) => {
      const sessionIds = new Set(group.sessions.map((session) => session.id));
      const firstSession = group.sessions[0];
      const dayOffset =
        field === "sessionDate" && value && firstSession.sessionDate
          ? differenceInCalendarDays(parseISO(value), parseISO(firstSession.sessionDate))
          : 0;

      setSessions((prev) =>
        prev.map((session) => {
          if (!sessionIds.has(session.id)) return session;
          if (field === "sessionDate" && value && dayOffset !== 0) {
            return {
              ...session,
              sessionDate: format(addDays(parseISO(session.sessionDate), dayOffset), "yyyy-MM-dd"),
            };
          }
          return { ...session, [field]: value };
        })
      );
    },
    []
  );
  const toggleInteractionMode = useCallback((m: string) => {
    setInteractionModes((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }, []);

  function handleIsPrivateChange(checked: boolean) {
    setIsPrivate(checked);
    if (!checked) {
      setCheckinPrivate(false);
      setHostCommentPrivate(false);
    }
  }

  const filteredTemplates =
    templates?.filter((tpl) => tpl.title.toLowerCase().includes(templateSearch.toLowerCase())) ??
    [];
  const filteredTimezones = TIME_ZONE_OPTIONS.filter((timeZone) =>
    timeZone.toLowerCase().includes(timezoneSearch.trim().toLowerCase())
  );

  // 用 onSubmit 而不是 form action：React 19 的 action 完成後會 reset 表單，
  // 送出失敗（400/409）時使用者填的內容會全部消失，只能從頭再填一次（#188）
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(new FormData(event.currentTarget), {
      interactionModes,
      timezone,
      sessions,
      feeType,
      signupMethod,
      isPrivate,
      checkinDefaultPrivate: checkinPrivate,
      hostCommentDefaultPrivate: hostCommentPrivate,
      visibility,
      selectedTemplateIds: Array.from(selectedTemplateIds),
      templateStartDates: templatesLocked ? new Map() : startDateOverrides,
      publishNow,
    });
  }

  const tabDisabled = mode === "create";
  const prefix = cohort ? `edit-${cohort.id}` : `create-${programId}`;

  return (
    <form
      ref={panelRef}
      onSubmit={handleSubmit}
      className="scroll-mt-24 rounded-[20px] border border-[#B9DCD8] bg-[#F7FCFB] p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <h4 className="text-[15px] font-semibold">
          {mode === "create" ? t("cohort_create_title") : t("cohort_setup_title")}
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-[30px] rounded-full border border-[#CDEBE8] bg-white text-[#5A7B79] hover:bg-[#EDF8F6]"
          onClick={onClose}
          aria-label={t("close")}
        >
          <X className="size-[15px]" />
        </Button>
      </div>

      {/* Pill tabs */}
      <div className="mb-[18px] flex flex-wrap gap-1.5" role="tablist">
        {SETUP_TABS.map((tab) => {
          const disabled = tabDisabled && tab !== "basic";
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              aria-disabled={disabled}
              title={disabled ? t("cohort_tab_disabled_tooltip") : undefined}
              onClick={() => !disabled && setActiveTab(tab)}
              className={`h-8 shrink-0 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-semibold transition-colors ${
                activeTab === tab
                  ? "border-[#16B9B3] bg-[#16B9B3] text-white"
                  : disabled
                    ? "cursor-not-allowed border-[#CDEBE8] bg-white text-[#5A7B79] opacity-50"
                    : "border-[#CDEBE8] bg-white text-[#5A7B79] hover:bg-[#F0FBF9]"
              }`}
            >
              {t(`cohort_tab_${tab}`)}
            </button>
          );
        })}
      </div>

      {/* Tab: basic */}
      <div className={activeTab !== "basic" ? "hidden" : ""} role="tabpanel">
        <div className="grid gap-4 md:grid-cols-2">
          <label htmlFor={`${prefix}-name`} className="grid gap-1.5 text-sm font-medium">
            {t("cohort_display_name")}
            <Input
              id={`${prefix}-name`}
              name="displayName"
              required
              maxLength={100}
              defaultValue={cohort?.displayName ?? ""}
            />
          </label>
          {mode === "create" && (
            <label htmlFor={`${prefix}-slug`} className="grid gap-1.5 text-sm font-medium">
              {t("cohort_slug")}
              <Input
                id={`${prefix}-slug`}
                name="slug"
                required
                maxLength={50}
                pattern={COHORT_SLUG_HTML_PATTERN}
                title={t("cohort_slug_error")}
                placeholder="2026-summer"
              />
            </label>
          )}
          <div className="grid gap-1.5 text-sm font-medium md:col-span-2">
            <label htmlFor={`${prefix}-tagline`}>{t("cohort_tagline")}</label>
            <Textarea
              id={`${prefix}-tagline`}
              name="tagline"
              rows={3}
              placeholder={t("cohort_tagline_placeholder")}
              value={taglineValue}
              onChange={(e) => setTaglineValue(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#78928F]">{t("cohort_tagline_description")}</p>
              <p
                className={`text-xs ${taglineValue.length > 80 ? "text-[#C03A3A] font-medium" : "text-[#78928F]"}`}
              >
                {taglineValue.length} / 80
              </p>
            </div>
          </div>
          <label htmlFor={`${prefix}-start`} className="grid gap-1.5 text-sm font-medium">
            {t("start_date")}
            <Input
              id={`${prefix}-start`}
              name="startDate"
              type="date"
              required
              defaultValue={cohort?.startDate?.slice(0, 10) ?? ""}
              onChange={(e) => setCohortStartDate(e.target.value)}
            />
          </label>
          <label htmlFor={`${prefix}-end`} className="grid gap-1.5 text-sm font-medium">
            {t("end_date")}
            <Input
              id={`${prefix}-end`}
              name="endDate"
              type="date"
              required
              defaultValue={cohort?.endDate?.slice(0, 10) ?? ""}
              onChange={(e) => setCohortEndDate(e.target.value)}
            />
          </label>
          <label htmlFor={`${prefix}-deadline`} className="grid gap-1.5 text-sm font-medium">
            {t("join_deadline")}
            <Input
              id={`${prefix}-deadline`}
              name="joinDeadline"
              type="date"
              defaultValue={cohort?.joinDeadline?.slice(0, 10) ?? ""}
            />
          </label>
          <div className="grid gap-1.5 text-sm font-medium">
            <label htmlFor={`${prefix}-capacity`}>{t("capacity")}</label>
            <div className="flex items-center gap-2">
              <Input
                id={`${prefix}-capacity`}
                name="capacity"
                type="number"
                min={1}
                disabled={capacityUnlimited}
                placeholder={capacityUnlimited ? t("cohort_capacity_unlimited") : ""}
                defaultValue={capacityUnlimited ? "" : (cohort?.capacity ?? "")}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => setCapacityUnlimited(!capacityUnlimited)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  capacityUnlimited
                    ? "bg-[#16B9B3] text-white"
                    : "bg-[#F1F4F4] text-[#5A7B79] hover:bg-[#E7FAF7]"
                }`}
              >
                {t("cohort_capacity_unlimited")}
              </button>
            </div>
          </div>

          {/* 互動方式 */}
          <div className="relative md:col-span-2">
            <p className="mb-1.5 text-sm font-medium">{t("cohort_interaction_modes")}</p>
            <button
              type="button"
              onClick={() => setInteractionDropdownOpen(!interactionDropdownOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-[#CDEBE8] bg-white px-3 py-2.5 text-sm text-left"
            >
              <span className={interactionModes.length ? "text-[#0D3036]" : "text-[#78928F]"}>
                {interactionModes.length
                  ? interactionModes.map((m) => t(`cohort_interaction_mode_${m}`)).join("、")
                  : t("cohort_interaction_modes_placeholder")}
              </span>
              <ChevronDown
                className={`size-4 text-[#78928F] transition-transform ${interactionDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {interactionDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-[#CDEBE8] bg-white shadow-lg">
                {(["sync", "async", "physical"] as const).map((mode) => (
                  <label
                    key={mode}
                    className={`flex cursor-pointer items-start gap-3 px-4 py-3 ${
                      interactionModes.includes(mode) ? "bg-[#F0FBF9]" : "hover:bg-[#FAFCFC]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-[#16B9B3]"
                      checked={interactionModes.includes(mode)}
                      onChange={() => toggleInteractionMode(mode)}
                    />
                    <div>
                      <p className="text-sm font-medium">{t(`cohort_interaction_mode_${mode}`)}</p>
                      <p className="text-xs text-[#78928F]">
                        {t(`cohort_interaction_mode_${mode}_desc`)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {interactionModes.includes("sync") && (
            <label htmlFor={`${prefix}-meeting`} className="grid gap-1.5 text-sm font-medium">
              {t("cohort_meeting_url")}
              <Input
                id={`${prefix}-meeting`}
                name="meetingUrl"
                type="url"
                placeholder={t("cohort_meeting_url_placeholder")}
                defaultValue={cohort?.meetingUrl ?? ""}
              />
            </label>
          )}
          {interactionModes.includes("physical") && (
            <label htmlFor={`${prefix}-location`} className="grid gap-1.5 text-sm font-medium">
              {t("cohort_location")}
              <Input
                id={`${prefix}-location`}
                name="location"
                maxLength={200}
                placeholder={t("cohort_location_placeholder")}
                defaultValue={cohort?.location ?? ""}
              />
            </label>
          )}

          {/* 聚會時段 */}
          {(interactionModes.includes("sync") || interactionModes.includes("physical")) && (
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-medium">{t("cohort_sessions_title")}</legend>
              <label
                htmlFor={`${prefix}-timezone`}
                className="mt-2 grid max-w-sm gap-1.5 text-sm font-medium"
              >
                {t("cohort_timezone")}
                <Popover
                  open={timezoneDropOpen}
                  onOpenChange={(open) => {
                    setTimezoneDropOpen(open);
                    if (!open) setTimezoneSearch("");
                  }}
                >
                  <PopoverAnchor asChild>
                    <div className="relative" data-timezone-search>
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#78928F]" />
                      <Input
                        id={`${prefix}-timezone`}
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={timezoneDropOpen}
                        aria-controls={`${prefix}-timezone-options`}
                        autoComplete="off"
                        placeholder={timezone}
                        value={timezoneDropOpen ? timezoneSearch : timezone}
                        onChange={(event) => {
                          setTimezoneSearch(event.target.value);
                          setTimezoneDropOpen(true);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          const query = timezoneSearch.trim().toLowerCase();
                          const exactMatch = filteredTimezones.find(
                            (timeZone) => timeZone.toLowerCase() === query
                          );
                          const match =
                            exactMatch ??
                            (filteredTimezones.length === 1 ? filteredTimezones[0] : undefined);
                          if (match) {
                            setTimezone(match);
                            setTimezoneSearch("");
                            setTimezoneDropOpen(false);
                          }
                        }}
                        onFocus={() => setTimezoneDropOpen(true)}
                        className="h-10 rounded-lg border-[#CDEBE8] bg-white pl-9 focus-visible:pl-[35px]"
                      />
                    </div>
                  </PopoverAnchor>
                  <PopoverContent
                    align="start"
                    sideOffset={6}
                    onOpenAutoFocus={(event) => event.preventDefault()}
                    onInteractOutside={(event) => {
                      if ((event.target as HTMLElement).closest?.("[data-timezone-search]")) {
                        event.preventDefault();
                      }
                    }}
                    className="grid max-h-[236px] w-[var(--radix-popover-trigger-width)] gap-0.5 overflow-auto rounded-[12px] border-[#DDEFED] p-1.5 shadow-[0_12px_28px_rgba(15,48,54,0.14)]"
                  >
                    {filteredTimezones.length > 0 ? (
                      <div id={`${prefix}-timezone-options`} role="listbox">
                        {filteredTimezones.map((timeZone) => (
                          <button
                            key={timeZone}
                            type="button"
                            role="option"
                            aria-selected={timezone === timeZone}
                            onClick={() => {
                              setTimezone(timeZone);
                              setTimezoneSearch("");
                              setTimezoneDropOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-[8px] px-2.5 py-[9px] text-left text-sm text-[#0D3036] hover:bg-[#F1F8F7] ${
                              timezone === timeZone ? "bg-[#F7FCFB]" : "bg-white"
                            }`}
                          >
                            <span>{timeZone}</span>
                            <Check
                              className={`size-4 text-[#16A8A3] ${timezone === timeZone ? "opacity-100" : "opacity-0"}`}
                              aria-hidden="true"
                            />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="p-2.5 text-[13px] text-[#78928F]">
                        找不到符合的時區 / No matching time zones
                      </p>
                    )}
                  </PopoverContent>
                </Popover>
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 w-fit gap-2 border-[#CDEBE8]"
                  >
                    <Plus className="size-4" />
                    {t("cohort_session_add")}
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40 rounded-xl border-[#CDEBE8]">
                  <DropdownMenuItem onClick={() => setSessionAddMode("regular")}>
                    {recurrenceCopy.regularOption}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSessionAddMode("irregular");
                      addSession();
                    }}
                  >
                    {recurrenceCopy.irregularOption}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {sessionAddMode === "regular" && (
                <div className="mt-3 grid gap-3 rounded-xl border border-[#DDEFED] bg-white p-3">
                  <p className="text-sm font-medium text-[#0D3036]">{recurrenceCopy.title}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                    <label className="grid gap-1.5 text-xs font-medium">
                      {recurrenceCopy.startDate}
                      <Input
                        type="date"
                        className="h-9 text-sm"
                        value={recurrenceStartDate}
                        onChange={(event) => setRecurrenceStartDateOverride(event.target.value)}
                      />
                    </label>
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                    <label className="grid gap-1.5 text-xs font-medium">
                      {recurrenceCopy.weeks}
                      <Input
                        type="number"
                        min={1}
                        max={52}
                        className="h-9 text-sm"
                        value={recurrenceWeeks}
                        onChange={(event) =>
                          setRecurrenceWeeks(
                            Math.min(52, Math.max(1, Number(event.target.value) || 1))
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium">{recurrenceCopy.weekdays}</p>
                      <button
                        type="button"
                        onClick={() => setRecurrenceWeekdays([1, 2, 3, 4, 5])}
                        className="text-xs font-medium text-[#0D7773] hover:underline"
                      >
                        {recurrenceCopy.weekdaysOnly}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {RECURRENCE_WEEKDAYS.map(({ day, zh, en }) => {
                        const selected = recurrenceWeekdays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggleRecurrenceWeekday(day)}
                            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                              selected
                                ? "border-[#16B9B3] bg-[#E7FAF7] text-[#0D7773]"
                                : "border-[#CDEBE8] bg-white text-[#5A7B79] hover:bg-[#F1F8F7]"
                            }`}
                          >
                            {locale === "en" ? en : zh}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                    <label className="grid gap-1.5 text-xs font-medium">
                      {recurrenceCopy.startTime}
                      <Input
                        type="time"
                        className="h-9 text-sm"
                        value={recurrenceStartTime}
                        onChange={(event) => setRecurrenceStartTime(event.target.value)}
                      />
                    </label>
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                    <label className="grid gap-1.5 text-xs font-medium">
                      {recurrenceCopy.endTime}
                      <Input
                        type="time"
                        className="h-9 text-sm"
                        value={recurrenceEndTime}
                        onChange={(event) => setRecurrenceEndTime(event.target.value)}
                      />
                    </label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit border-[#CDEBE8]"
                    disabled={!recurrenceStartDate || recurrenceWeekdays.length === 0}
                    onClick={addRecurringSessions}
                  >
                    <Plus className="size-4" />
                    {recurrenceCopy.add}
                  </Button>
                </div>
              )}
              {sessions.length > 0 && (
                <div
                  className={`mt-3 grid gap-2 ${
                    sessionAddMode === "irregular"
                      ? "rounded-xl border border-[#DDEFED] bg-white p-3"
                      : ""
                  }`}
                >
                  {sessionAddMode === "irregular" && (
                    <p className="text-sm font-medium text-[#0D3036]">
                      {recurrenceCopy.irregularTitle}
                    </p>
                  )}
                  {expandedRepeatGroups.map((group) => (
                    <div
                      key={group.key}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#F1F8F7] px-3 py-2"
                    >
                      <p className="text-xs font-medium text-[#0D3036]">
                        {recurrenceCopy.editingIndividual} · {group.label}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-[#0D7773]"
                        onClick={() =>
                          setExpandedRepeatGroups((prev) =>
                            prev.filter((item) => item.key !== group.key)
                          )
                        }
                      >
                        {recurrenceCopy.collapseRepeat}
                      </Button>
                    </div>
                  ))}
                  {displayedSessions.map((group, index) => {
                    const session = group.sessions[0];
                    const isFirstSession = index === 0;
                    const repeatLabel = recurringSessionLabel(group, locale);
                    return (
                      <div key={session.id} className="grid gap-1">
                        <div className="flex flex-wrap items-end gap-2">
                          {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                          <label className="grid gap-1 text-xs">
                            {isFirstSession ? (
                              t("cohort_session_date")
                            ) : (
                              <span aria-hidden="true" className="invisible">
                                {t("cohort_session_date")}
                              </span>
                            )}
                            <Input
                              type="date"
                              className="h-9 w-[140px] text-xs"
                              aria-label={
                                isFirstSession
                                  ? undefined
                                  : `${t("cohort_session_date")} ${index + 1}`
                              }
                              value={session.sessionDate}
                              onChange={(e) =>
                                updateSessionGroup(group, "sessionDate", e.target.value)
                              }
                            />
                          </label>
                          {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                          <label className="grid gap-1 text-xs">
                            {isFirstSession ? (
                              t("cohort_session_start_time")
                            ) : (
                              <span aria-hidden="true" className="invisible">
                                {t("cohort_session_start_time")}
                              </span>
                            )}
                            <Input
                              type="time"
                              className="h-9 w-[110px] text-xs"
                              aria-label={
                                isFirstSession
                                  ? undefined
                                  : `${t("cohort_session_start_time")} ${index + 1}`
                              }
                              value={session.startTime}
                              onChange={(e) =>
                                updateSessionGroup(group, "startTime", e.target.value)
                              }
                            />
                          </label>
                          {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                          <label className="grid gap-1 text-xs">
                            {isFirstSession ? (
                              t("cohort_session_end_time")
                            ) : (
                              <span aria-hidden="true" className="invisible">
                                {t("cohort_session_end_time")}
                              </span>
                            )}
                            <Input
                              type="time"
                              className="h-9 w-[110px] text-xs"
                              aria-label={
                                isFirstSession
                                  ? undefined
                                  : `${t("cohort_session_end_time")} ${index + 1}`
                              }
                              value={session.endTime}
                              onChange={(e) => updateSessionGroup(group, "endTime", e.target.value)}
                            />
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 text-[#C03A3A]"
                            onClick={() => {
                              group.sessions.forEach((item) => {
                                removeSession(item.id);
                              });
                            }}
                            aria-label={
                              repeatLabel
                                ? `${t("cohort_session_remove")} ${repeatLabel}`
                                : t("cohort_session_remove")
                            }
                          >
                            <Minus className="size-4" />
                          </Button>
                        </div>
                        {repeatLabel && (
                          <div className="flex items-center gap-1">
                            <p className="text-xs font-medium text-[#5A7B79]">{repeatLabel}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-6 shrink-0 text-[#0D7773]"
                              title={recurrenceCopy.editIndividual}
                              aria-label={recurrenceCopy.editIndividual}
                              onClick={() => {
                                const sessionIds = group.sessions.map((item) => item.id);
                                const key = sessionIds.slice().sort().join("|");
                                setExpandedRepeatGroups((prev) =>
                                  prev.some((item) => item.key === key)
                                    ? prev
                                    : [...prev, { key, sessionIds, label: repeatLabel }]
                                );
                              }}
                            >
                              <Pencil className="size-3.5" aria-hidden="true" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </fieldset>
          )}

          {/* 費用設定 */}
          <fieldset className="md:col-span-2">
            <legend className="text-sm font-medium">{t("cohort_fee_title")}</legend>
            <div className="mt-2">
              <select
                value={feeType}
                onChange={(e) => setFeeType(e.target.value as "free" | "paid")}
                className="rounded-lg border border-[#CDEBE8] bg-white px-3 py-2 text-sm"
              >
                <option value="free">{t("cohort_fee_type_free")}</option>
                <option value="paid">{t("cohort_fee_type_paid")}</option>
              </select>
              {feeType === "paid" && (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                  <label className="grid gap-1.5 text-sm font-medium">
                    {t("cohort_fee_amount")} (NT$/人)
                    <Input
                      name="feeAmount"
                      type="number"
                      min={1}
                      required
                      defaultValue={cohort?.feeAmount ?? ""}
                    />
                  </label>
                  {/* biome-ignore lint/a11y/noLabelWithoutControl: Input wraps native input */}
                  <label className="grid gap-1.5 text-sm font-medium">
                    {t("cohort_external_signup_url_label")}
                    <Input
                      name="externalSignupUrl"
                      type="url"
                      required
                      placeholder="https://"
                      defaultValue={cohort?.externalSignupUrl ?? ""}
                    />
                  </label>
                </div>
              )}
              {feeType === "free" && (
                <div className="mt-3 grid gap-2">
                  <select
                    value={signupMethod}
                    onChange={(e) => setSignupMethod(e.target.value as "island_form" | "external")}
                    className="rounded-lg border border-[#CDEBE8] bg-white px-3 py-2 text-sm"
                  >
                    <option value="island_form">{t("cohort_signup_method_island_form")}</option>
                    <option value="external">{t("cohort_signup_method_external")}</option>
                  </select>
                  {signupMethod === "external" && (
                    <Input
                      name="externalSignupUrl"
                      type="url"
                      required
                      placeholder="https://"
                      defaultValue={cohort?.externalSignupUrl ?? ""}
                    />
                  )}
                </div>
              )}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Tab: templates */}
      <div className={activeTab !== "templates" ? "hidden" : ""} role="tabpanel">
        <p className="text-[13px] font-semibold text-[#0D3036]">{t("cohort_select_templates")}</p>
        <p className="mt-1 text-xs text-[#78928F]">
          {t("cohort_select_templates_hint", { count: selectedTemplateIds.size })}
        </p>
        {templatesLocked && (
          <p className="mt-2 text-xs text-[#7A6120]">{t("cohort_templates_locked")}</p>
        )}
        {templates && templates.length > 0 ? (
          <>
            <Popover open={templateDropOpen && !templatesLocked} onOpenChange={setTemplateDropOpen}>
              <PopoverAnchor asChild>
                <div className="relative mt-3" data-template-search>
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#78928F]" />
                  <Input
                    placeholder={t("cohort_template_search_placeholder")}
                    value={templateSearch}
                    disabled={templatesLocked}
                    onChange={(e) => {
                      setTemplateSearch(e.target.value);
                      setTemplateDropOpen(true);
                    }}
                    onFocus={() => setTemplateDropOpen(true)}
                    className="h-10 rounded-[10px] border-[#CDEBE8] bg-white pl-9 pr-10 focus-visible:pl-[35px] focus-visible:pr-[39px]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={templatesLocked}
                    onClick={() => setTemplateDropOpen((open) => !open)}
                    aria-label={t("cohort_templates_expand")}
                    title={t("cohort_templates_expand")}
                    className="absolute right-1.5 top-1.5 size-7 rounded-full text-[#5A7B79] hover:bg-[#EDF8F6]"
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                </div>
              </PopoverAnchor>
              <PopoverContent
                align="start"
                sideOffset={6}
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => {
                  // 點搜尋框本身不要關掉下拉
                  if ((e.target as HTMLElement).closest?.("[data-template-search]"))
                    e.preventDefault();
                }}
                className="grid max-h-[236px] w-[var(--radix-popover-trigger-width)] gap-0.5 overflow-auto rounded-[12px] border-[#DDEFED] p-1.5 shadow-[0_12px_28px_rgba(15,48,54,0.14)]"
              >
                {filteredTemplates.length > 0 ? (
                  filteredTemplates.map((tpl) => {
                    const picked = selectedTemplateIds.has(tpl.id);
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        aria-pressed={picked}
                        onClick={() => toggleTemplate(tpl.id, !picked)}
                        className={`flex items-center gap-2.5 rounded-[8px] px-2.5 py-[9px] text-left hover:bg-[#F1F8F7] ${
                          picked ? "bg-[#F7FCFB]" : "bg-white"
                        }`}
                      >
                        <span
                          className={`grid size-[18px] shrink-0 place-items-center rounded-[5px] border ${
                            picked ? "border-[#16B9B3] bg-[#16B9B3]" : "border-[#CDEBE8] bg-white"
                          }`}
                        >
                          <Check
                            className={`size-3 text-white ${picked ? "opacity-100" : "opacity-0"}`}
                            strokeWidth={3}
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm text-[#0D3036]">{tpl.title}</span>
                          {tpl.durationDays ? (
                            <span className="mt-0.5 block text-xs text-[#78928F]">
                              {t("template_preview_days", { days: tpl.durationDays })}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="p-2.5 text-[13px] text-[#78928F]">
                    {t("cohort_templates_search_empty")}
                  </p>
                )}
              </PopoverContent>
            </Popover>
            <div className="mt-3 grid gap-2">
              {selectedTemplateIds.size > 0 ? (
                templates
                  .filter((tpl) => selectedTemplateIds.has(tpl.id))
                  .map((tpl) => {
                    const start = templateStartDate(tpl);
                    const end = templateBindingEndDate(start, tpl.durationDays);
                    return (
                      <div
                        key={tpl.id}
                        className="flex flex-wrap items-center gap-2.5 rounded-[14px] border border-[#B9DCD8] bg-[#F7FCFB] px-3 py-2.5"
                      >
                        <span className="min-w-0 flex-[1_1_160px] truncate text-sm text-[#0D3036]">
                          {tpl.title}
                        </span>
                        <label className="inline-flex shrink-0 items-center gap-1.5 text-xs text-[#5A7B79]">
                          {t("cohort_templates_start_label")}
                          <input
                            type="date"
                            value={start}
                            disabled={templatesLocked}
                            onChange={(e) => setTemplateStartDate(tpl, e.target.value)}
                            className="h-[30px] rounded-[8px] border border-[#CDEBE8] bg-white px-2 py-1 font-mono text-xs text-[#0D3036] disabled:cursor-not-allowed disabled:bg-[#F6F9F9] disabled:text-[#78928F]"
                          />
                        </label>
                        {end && (
                          <span className="shrink-0 font-mono text-xs text-[#0D7773]">
                            {t("cohort_templates_end_label", { date: formatSlashDate(end) })}
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={templatesLocked}
                          onClick={() => toggleTemplate(tpl.id, false)}
                          aria-label={t("cohort_templates_remove", { title: tpl.title })}
                          className="size-6 shrink-0 rounded-full text-[#5A7B79] hover:bg-[#DCEEEB]"
                        >
                          <X className="size-[13px]" strokeWidth={2.5} />
                        </Button>
                      </div>
                    );
                  })
              ) : (
                <span className="text-xs text-[#78928F]">{t("cohort_templates_none_linked")}</span>
              )}
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-[#5A7B79]">
            {t("cohort_no_templates_available")}
          </p>
        )}
      </div>

      {/* Tab: home (placeholder) */}
      <div className={activeTab !== "home" ? "hidden" : ""} role="tabpanel">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-[#5A7B79]">{t("cohort_home_page_coming_soon")}</p>
        </div>
      </div>

      {/* Tab: privacy */}
      <div className={activeTab !== "privacy" ? "hidden" : ""} role="tabpanel">
        <p className="mb-1 text-sm font-medium">{t("cohort_privacy_title")}</p>
        <p className="mb-3 text-xs text-[#78928F]">{t("cohort_privacy_description")}</p>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
        >
          {[
            {
              label: t("cohort_is_private"),
              hint: t("cohort_is_private_hint"),
              checked: isPrivate,
              onChange: handleIsPrivateChange,
              disabled: false,
              dimmed: false,
            },
            {
              label: t("cohort_checkin_default_private"),
              hint: isPrivate
                ? t("cohort_checkin_default_private_hint")
                : t("cohort_privacy_disabled_hint"),
              checked: checkinPrivate,
              onChange: setCheckinPrivate,
              disabled: !isPrivate,
              dimmed: !isPrivate,
            },
            {
              label: t("cohort_host_comment_default_private"),
              hint: isPrivate
                ? t("cohort_host_comment_default_private_hint")
                : t("cohort_privacy_disabled_hint"),
              checked: hostCommentPrivate,
              onChange: setHostCommentPrivate,
              disabled: !isPrivate,
              dimmed: !isPrivate,
            },
            {
              label: t("cohort_visibility_public"),
              hint: t("cohort_visibility_hint"),
              checked: visibility === "public",
              onChange: (v: boolean) => setVisibility(v ? "public" : "private"),
              disabled: false,
              dimmed: false,
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border border-[#DDEFED] p-4 transition-opacity ${item.dimmed ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.label}</p>
                <Switch
                  checked={item.checked}
                  onCheckedChange={item.onChange}
                  disabled={item.disabled}
                />
              </div>
              <p className="mt-1 text-xs text-[#78928F]">{item.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab: signup */}
      <div className={activeTab !== "signup" ? "hidden" : ""} role="tabpanel">
        <label className="mb-2 flex items-center gap-3 text-sm">
          <input
            name="showInviteMessageOnSignup"
            type="checkbox"
            className="size-4 accent-[#0D7773]"
            checked={showInviteOnSignup}
            onChange={(e) => setShowInviteOnSignup(e.target.checked)}
          />
          {t("cohort_show_invite_message_on_signup")}
        </label>
        <label htmlFor={`${prefix}-message`} className="grid gap-1.5 text-sm font-medium">
          {t("invite_message")}
          <Textarea
            id={`${prefix}-message`}
            name="inviteMessage"
            rows={3}
            disabled={!showInviteOnSignup}
            placeholder={
              showInviteOnSignup
                ? t("cohort_invite_message_placeholder")
                : t("cohort_invite_message_disabled_placeholder")
            }
            defaultValue={cohort?.inviteMessage ?? ""}
          />
        </label>
        <div className="mt-6 rounded-xl border border-dashed border-[#B9DCD8] p-5 text-center">
          <p className="text-sm text-[#5A7B79]">{t("cohort_signup_questions_coming_soon")}</p>
        </div>
        <div className="mt-4 rounded-xl border border-dashed border-[#B9DCD8] p-5 text-center">
          <p className="text-sm text-[#5A7B79]">{t("cohort_signup_preview_coming_soon")}</p>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="mt-5 flex items-center justify-end gap-2">
        {mode === "create" && (
          <span className="mr-1 flex items-center gap-2 text-sm">
            <Switch checked={publishNow} onCheckedChange={setPublishNow} />
            {t("publish_now")}
          </span>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={busy}
          className="h-auto rounded-full border-[#CDEBE8] bg-white px-[18px] py-[9px] text-sm font-normal text-[#5A7B79] hover:bg-[#F0FBF9] hover:text-[#5A7B79]"
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          disabled={busy}
          className="h-auto rounded-full bg-[#16B9B3] px-5 py-[9px] text-sm font-semibold text-white hover:brightness-[1.04]"
        >
          {mode === "create" ? t("cohort_create") : t("save")}
        </Button>
      </div>
    </form>
  );
}

interface CohortCardProps {
  programId: number;
  organizationId: number;
  cohort: LighthouseCohortType;
  templates?: CohortTemplateSummary[];
  refresh: () => Promise<unknown>;
  refreshTemplates: () => Promise<unknown>;
}

function CohortCard({
  programId,
  organizationId,
  cohort,
  templates,
  refresh,
  refreshTemplates,
}: CohortCardProps) {
  const t = useTranslations("lighthouse");
  const apiErrorMessage = useLighthouseErrorMessage();
  const { errorMessage: serverErrorMessage } = useServerErrorMessage();
  const searchParams = useSearchParams();
  const [editing, setEditing] = useState(searchParams.get("edit") === String(cohort.id));
  const [busy, setBusy] = useState(false);

  async function handlePublish() {
    if (!window.confirm(t("cohort_publish_confirm"))) {
      return;
    }
    setBusy(true);
    const response = await updateLighthouseCohort(programId, cohort.id, { status: "published" });
    setBusy(false);
    if (response.error) {
      toast.error(apiErrorMessage(response, t("cohort_publish_failed")));
      return;
    }
    await refresh();
    toast.success(t("cohort_published"));
  }

  const [confirmArchive, setConfirmArchive] = useState(false);
  async function handleArchive() {
    setBusy(true);
    const response = await archiveLighthouseCohort(programId, cohort.id);
    setBusy(false);
    setConfirmArchive(false);
    if (response.error) {
      toast.error(apiErrorMessage(response, t("cohort_archive_failed")));
      await refresh();
      return;
    }
    await refresh();
    toast.success(t("cohort_archived_to_archive"));
  }

  async function handleDuplicate() {
    setBusy(true);
    const response = await duplicateLighthouseCohort(programId, cohort.id);
    setBusy(false);
    if (response.error) {
      toast.error(apiErrorMessage(response, t("cohort_duplicate_failed")));
      return;
    }
    toast.success(t("cohort_duplicated", { name: response.data.data.displayName }));
    await refresh();
  }

  const handleEditSubmit = useCallback(
    async (formData: FormData, extras: Parameters<CohortSetupPanelProps["onSubmit"]>[1]) => {
      const startDate = String(formData.get("startDate") ?? "");
      const endDate = String(formData.get("endDate") ?? "");
      if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
        toast.error(t("cohort_date_error"));
        return;
      }
      if (extras.interactionModes.length === 0) {
        toast.error(t("cohort_interaction_modes_error"));
        return;
      }
      const capacityValue = String(formData.get("capacity") ?? "");
      const feeAmountValue = String(formData.get("feeAmount") ?? "");
      if (extras.feeType === "paid" && !feeAmountValue) {
        toast.error(t("cohort_fee_amount_error"));
        return;
      }
      const externalUrl = String(formData.get("externalSignupUrl") ?? "").trim();
      if (extras.signupMethod === "external" && !externalUrl) {
        toast.error(t("cohort_external_signup_url_error"));
        return;
      }
      const bindingChanges = diffTemplateBindings(
        templates ?? [],
        cohort.id,
        extras.selectedTemplateIds ?? [],
        extras.templateStartDates
      );
      // 解除未開始場次的模板綁定前要確認（FR-TPL-05）
      if (
        bindingChanges.unbind.length > 0 &&
        !window.confirm(
          t("cohort_template_unbind_confirm", { count: bindingChanges.unbind.length })
        )
      ) {
        return;
      }
      setBusy(true);
      // 模板分頁的勾選不在 cohort payload 裡，要另外對綁定 API 送差異（#273）。
      // 先送綁定再存場次：開始日改到今天以前，server 就會鎖住綁定（FR-TPL-05）
      const bindingError = await applyTemplateBindings(
        organizationId,
        cohort.id,
        bindingChanges,
        extras.templateStartDates ?? new Map()
      );
      if (bindingError) {
        setBusy(false);
        // 409 多半是場次已開始：一併刷新場次，面板才會鎖住，不會讓使用者一直重試
        await Promise.all([refresh(), refreshTemplates()]);
        toast.error(
          t("cohort_template_binding_failed", {
            reason: apiErrorMessage(bindingError, t("save_failed")),
          })
        );
        return;
      }
      const response = await updateLighthouseCohort(programId, cohort.id, {
        displayName: String(formData.get("displayName") ?? "").trim(),
        tagline: String(formData.get("tagline") ?? "").trim() || null,
        startDate,
        endDate,
        timezone: extras.timezone,
        joinDeadline: String(formData.get("joinDeadline") ?? "") || null,
        capacity: capacityValue ? Number(capacityValue) : null,
        inviteMessage: String(formData.get("inviteMessage") ?? "").trim() || null,
        visibility: extras.visibility,
        interactionModes: extras.interactionModes as ("sync" | "async" | "physical")[],
        meetingUrl: String(formData.get("meetingUrl") ?? "").trim() || null,
        location: String(formData.get("location") ?? "").trim() || null,
        sessions: extras.sessions
          .filter((s) => s.sessionDate)
          .map((s) => ({
            sessionDate: s.sessionDate,
            startTime: s.startTime || null,
            endTime: s.endTime || null,
          })),
        feeType: extras.feeType,
        feeAmount: extras.feeType === "paid" && feeAmountValue ? Number(feeAmountValue) : null,
        signupMethod: extras.signupMethod,
        externalSignupUrl:
          extras.signupMethod === "external" || extras.feeType === "paid"
            ? externalUrl || null
            : null,
        showInviteMessageOnSignup: formData.get("showInviteMessageOnSignup") === "on",
        isPrivate: extras.isPrivate,
        checkinDefaultPrivate: extras.checkinDefaultPrivate,
        hostCommentDefaultPrivate: extras.hostCommentDefaultPrivate,
      } as Parameters<typeof updateLighthouseCohort>[2]);
      if (response.error) {
        setBusy(false);
        await refreshTemplates();
        const reason = cohortErrorMessage(
          t,
          serverErrorMessage,
          response.error,
          "save_failed",
          response.response.status
        );
        // 綁定已先送出成功，要講清楚只有場次設定沒存，不然使用者會以為模板也沒連上
        const bindingsChanged =
          bindingChanges.bind.length + bindingChanges.unbind.length + bindingChanges.update.length >
          0;
        toast.error(bindingsChanged ? t("cohort_saved_templates_only", { reason }) : reason);
        return;
      }
      setBusy(false);
      await Promise.all([refresh(), refreshTemplates()]);
      setEditing(false);
      toast.success(t("cohort_saved"));
    },
    [
      programId,
      organizationId,
      cohort.id,
      templates,
      refresh,
      refreshTemplates,
      t,
      apiErrorMessage,
      serverErrorMessage,
    ]
  );

  const missingTemplates =
    templates && !templates.some((tpl) => tpl.boundCohortIds.includes(cohort.id));

  const setupPanel = editing ? (
    <CohortSetupPanel
      mode="edit"
      cohort={cohort}
      programId={programId}
      organizationId={organizationId}
      templates={templates}
      onSubmit={handleEditSubmit}
      onClose={() => setEditing(false)}
      busy={busy}
    />
  ) : null;

  // 編輯時保留場次卡，設定面板在卡片下方展開（POC：卡片不被取代）
  return (
    <div className="grid gap-3">
      <div
        id={`cohort-${cohort.id}`}
        className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border border-[#DDEFED] px-5 py-4 lg:flex-row lg:items-start"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E7FAF7] text-[#0D7773]">
          <CalendarDays className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold">{cohort.displayName}</h4>
            <span
              className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${COHORT_STATUS_STYLES[cohort.status]}`}
            >
              {t(`cohort_status_${cohort.status}`)}
            </span>
            {missingTemplates && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF6E8] px-2.5 py-1 text-[10px] font-semibold text-[#A95D00]">
                <AlertTriangle className="size-3" />
                {t("cohort_no_templates_warning")}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#78928F]">
            {cohort.startDate.slice(0, 10)} — {cohort.endDate.slice(0, 10)} · /{cohort.slug} ·{" "}
            {cohort.isPrivate ? t("cohort_info_private") : t("cohort_info_public_activity")} ·{" "}
            {cohort.feeType === "paid"
              ? t("cohort_info_fee_paid", { amount: cohort.feeAmount ?? 0 })
              : t("cohort_info_fee_free")}
          </p>
          {cohort.joinToken && (
            <div className="mt-2">
              <JoinCode joinToken={cohort.joinToken} />
              {cohort.status === "published" && (
                <CustomLink
                  href={`/lighthouse/programs/${programId}/cohorts/${cohort.id}/roster`}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#CDEBE8] px-3 py-1.5 text-xs font-medium text-[#0D5B59] hover:bg-[#EDF8F6]"
                >
                  <Send className="size-3.5" aria-hidden="true" />
                  {t("cohort_invite_by_email")}
                </CustomLink>
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {cohort.status === "draft" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={handlePublish}
              disabled={busy}
              aria-label={t("cohort_publish")}
              title={t("cohort_publish")}
            >
              <Send className="size-4" aria-hidden="true" />
            </Button>
          )}
          {cohort.status !== "archived" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setEditing(true)}
              disabled={busy}
              aria-label={t("edit")}
              title={t("edit")}
            >
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
          )}
          <CustomLink
            href={`/lighthouse/programs/${programId}/cohorts/${cohort.id}/dashboard`}
            className="grid size-8 place-items-center rounded-full text-[#0D7773] hover:bg-[#EDF8F6]"
            aria-label={t("manage_cohort")}
            title={t("manage_cohort")}
          >
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </CustomLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={t("cohort_actions")}
                title={t("cohort_actions")}
                disabled={busy}
              >
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36 rounded-xl border-[#CDEBE8]">
              <DropdownMenuItem onClick={handleDuplicate} disabled={busy} className="gap-2">
                <Copy className="size-4" aria-hidden="true" />
                {t("cohort_duplicate")}
              </DropdownMenuItem>
              {cohort.status !== "archived" && (
                <DropdownMenuItem
                  onClick={() => setConfirmArchive(true)}
                  disabled={busy}
                  className="gap-2 text-[#C03A3A]"
                >
                  <Archive className="size-4" aria-hidden="true" />
                  {t("archive")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ConfirmDialog
          open={confirmArchive}
          title={t("cohort_archive_title")}
          description={t("cohort_archive_confirm")}
          confirmLabel={t("archive")}
          destructive
          busy={busy}
          onConfirm={handleArchive}
          onOpenChange={setConfirmArchive}
        />
      </div>
      {setupPanel}
    </div>
  );
}

interface ProgramPanelProps {
  program: {
    id: number;
    organizationId: number;
    name: string;
    description: string | null;
  };
  refreshPrograms: () => Promise<unknown>;
}

function ProgramPanel({ program, refreshPrograms }: ProgramPanelProps) {
  const t = useTranslations("lighthouse");
  const apiErrorMessage = useLighthouseErrorMessage();
  const { errorMessage: serverErrorMessage } = useServerErrorMessage();
  const { cohorts, isLoading, mutate } = useLighthouseCohorts(program.id);
  // 封存中的場次改由「封存」頁列出（FR-ARC-04）
  const visibleCohorts = cohorts?.filter((cohort) => cohort.status !== "archived");
  const templatesQuery = useLighthouseTemplates(program.organizationId);
  const templates = templatesQuery.data?.data;
  const [editing, setEditing] = useState(false);
  const [creatingCohort, setCreatingCohort] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleProgramUpdate(formData: FormData) {
    setBusy(true);
    const response = await updateLighthouseProgram(program.id, {
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
    });
    setBusy(false);
    if (response.error) {
      toast.error(t("save_failed"));
      return;
    }
    await refreshPrograms();
    setEditing(false);
    toast.success(t("program_saved"));
  }

  const [confirmArchive, setConfirmArchive] = useState(false);
  // 後端會把系列底下的場次一起封存（FR-ARC-04），恢復系列時只復活這些被級聯封存的場次
  const activeCohortCount = cohorts?.filter((cohort) => cohort.status !== "archived").length ?? 0;
  async function handleArchive() {
    setBusy(true);
    const response = await archiveLighthouseProgram(program.id);
    setBusy(false);
    setConfirmArchive(false);
    if (response.error) {
      toast.error(apiErrorMessage(response, t("program_archive_failed")));
      await refreshPrograms();
      return;
    }
    await refreshPrograms();
    toast.success(t("program_archived_to_archive"));
  }

  async function handleProgramDuplicate() {
    setBusy(true);
    const response = await duplicateLighthouseProgram(program.id);
    setBusy(false);
    if (response.error) {
      toast.error(t("program_duplicate_failed"));
      return;
    }
    toast.success(t("program_duplicated"));
    await refreshPrograms();
  }

  const handleCohortCreate = useCallback(
    async (formData: FormData, extras: Parameters<CohortSetupPanelProps["onSubmit"]>[1]) => {
      const startDate = String(formData.get("startDate") ?? "");
      const endDate = String(formData.get("endDate") ?? "");
      if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
        toast.error(t("cohort_date_error"));
        return;
      }
      if (extras.interactionModes.length === 0) {
        toast.error(t("cohort_interaction_modes_error"));
        return;
      }
      const capacityValue = String(formData.get("capacity") ?? "");
      const feeAmountValue = String(formData.get("feeAmount") ?? "");
      if (extras.feeType === "paid" && !feeAmountValue) {
        toast.error(t("cohort_fee_amount_error"));
        return;
      }
      const externalUrl = String(formData.get("externalSignupUrl") ?? "").trim();
      if (extras.signupMethod === "external" && !externalUrl) {
        toast.error(t("cohort_external_signup_url_error"));
        return;
      }
      const slug = String(formData.get("slug") ?? "").trim();
      if (!COHORT_SLUG_PATTERN.test(slug)) {
        toast.error(t("cohort_slug_error"));
        return;
      }
      setBusy(true);
      const response = await createLighthouseCohort(program.id, {
        slug,
        displayName: String(formData.get("displayName") ?? "").trim(),
        tagline: String(formData.get("tagline") ?? "").trim() || undefined,
        startDate,
        endDate,
        timezone: extras.timezone,
        joinDeadline: String(formData.get("joinDeadline") ?? "") || null,
        capacity: capacityValue ? Number(capacityValue) : null,
        inviteMessage: String(formData.get("inviteMessage") ?? "").trim() || null,
        status: extras.publishNow ? "published" : "draft",
        visibility: extras.visibility,
        interactionModes: extras.interactionModes as ("sync" | "async" | "physical")[],
        meetingUrl: String(formData.get("meetingUrl") ?? "").trim() || undefined,
        location: String(formData.get("location") ?? "").trim() || undefined,
        sessions: extras.sessions
          .filter((s) => s.sessionDate)
          .map((s) => ({
            sessionDate: s.sessionDate,
            startTime: s.startTime || null,
            endTime: s.endTime || null,
          })),
        feeType: extras.feeType,
        feeAmount: extras.feeType === "paid" && feeAmountValue ? Number(feeAmountValue) : undefined,
        signupMethod: extras.signupMethod,
        externalSignupUrl:
          extras.signupMethod === "external" || extras.feeType === "paid"
            ? externalUrl || undefined
            : undefined,
        showInviteMessageOnSignup: formData.get("showInviteMessageOnSignup") === "on",
        isPrivate: extras.isPrivate,
        checkinDefaultPrivate: extras.checkinDefaultPrivate,
        hostCommentDefaultPrivate: extras.hostCommentDefaultPrivate,
      } as Parameters<typeof createLighthouseCohort>[1]);
      if (response.error || !response.data) {
        setBusy(false);
        toast.error(
          cohortErrorMessage(
            t,
            serverErrorMessage,
            response.error,
            "cohort_create_failed",
            response.response.status
          )
        );
        return;
      }
      // 新增場次不綁模板（#273 決策）：模板分頁在建立時是 disabled，建好後從編輯或模板庫綁定
      setBusy(false);
      await mutate();
      setCreatingCohort(false);
      toast.success(t("cohort_created"));
    },
    [program.id, mutate, t, serverErrorMessage]
  );

  return (
    <article className="overflow-hidden rounded-3xl border border-[#CDEBE8] bg-white">
      <div className="flex flex-col gap-5 border-b border-[#DDEFED] px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
        {editing ? (
          <form action={handleProgramUpdate} className="grid w-full max-w-xl gap-3">
            <Input
              name="name"
              required
              defaultValue={program.name}
              aria-label={t("program_name")}
            />
            <Textarea
              name="description"
              defaultValue={program.description ?? ""}
              aria-label={t("program_description")}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>
                {t("save")}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                {t("cancel")}
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#0D7773]">
              {t("program_label")}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">{program.name}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5A7B79]">
              {program.description || t("program_no_description")}
            </p>
          </div>
        )}
        {!editing && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              {t("edit")}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={t("cohort_actions")}
                  title={t("cohort_actions")}
                  disabled={busy}
                >
                  <MoreVertical className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-36 rounded-xl border-[#CDEBE8]">
                <DropdownMenuItem
                  onClick={handleProgramDuplicate}
                  disabled={busy}
                  className="gap-2"
                >
                  <Copy className="size-4" aria-hidden="true" />
                  {t("program_duplicate")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setConfirmArchive(true)}
                  disabled={busy}
                  className="gap-2 text-[#C03A3A]"
                >
                  <Archive className="size-4" aria-hidden="true" />
                  {t("archive")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmArchive}
        title={t("program_archive_title")}
        description={
          activeCohortCount > 0
            ? t("program_archive_cascade_message", { count: activeCohortCount })
            : t("program_archive_confirm")
        }
        confirmLabel={t("archive")}
        destructive
        busy={busy}
        onConfirm={handleArchive}
        onOpenChange={setConfirmArchive}
      />

      <div className="px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-semibold">{t("cohorts_title")}</h3>
          <Button size="sm" onClick={() => setCreatingCohort((value) => !value)}>
            {creatingCohort ? <X className="size-4" /> : <Plus className="size-4" />}
            {creatingCohort ? t("close") : t("cohort_create")}
          </Button>
        </div>

        {creatingCohort && (
          <div className="mt-5">
            <CohortSetupPanel
              mode="create"
              programId={program.id}
              organizationId={program.organizationId}
              templates={templates}
              onSubmit={handleCohortCreate}
              onClose={() => setCreatingCohort(false)}
              busy={busy}
            />
          </div>
        )}

        <div className="mt-5 grid gap-3">
          {isLoading && <p className="text-sm text-[#5A7B79]">{t("loading")}</p>}
          {!isLoading && !visibleCohorts?.length && (
            <p className="rounded-2xl border border-dashed border-[#B9DCD8] px-5 py-8 text-center text-sm text-[#5A7B79]">
              {t("cohorts_empty")}
            </p>
          )}
          {visibleCohorts?.map((cohort) => (
            <CohortCard
              key={cohort.id}
              programId={program.id}
              organizationId={program.organizationId}
              cohort={cohort}
              templates={templates}
              refresh={mutate}
              refreshTemplates={templatesQuery.mutate}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

export function ProgramsManager() {
  const t = useTranslations("lighthouse");
  const { organizations } = useLighthouseOrganizations();
  const organization = organizations?.[0];
  const { programs, isLoading, mutate } = useLighthousePrograms(organization?.id);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleCreate(formData: FormData) {
    if (!organization) return;
    setBusy(true);
    const response = await createLighthouseProgram({
      organizationId: organization.id,
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
    });
    setBusy(false);
    if (response.error) {
      toast.error(t("program_create_failed"));
      return;
    }
    await mutate();
    setCreating(false);
    toast.success(t("program_created"));
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 md:px-10 md:py-14">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#0D7773]">
            {t("programs_eyebrow")}
          </p>
          <h1 className="mt-3 text-2xl font-semibold leading-[1.45] tracking-[-0.04em] md:text-3xl">
            {t("programs_title")}
          </h1>
          <p className="mt-3 max-w-2xl text-[#5A7B79]">{t("programs_description")}</p>
        </div>
        <Button onClick={() => setCreating((value) => !value)}>
          {creating ? <X className="size-4" /> : <Plus className="size-4" />}
          {creating ? t("close") : t("program_create")}
        </Button>
      </header>

      {creating && (
        <form
          action={handleCreate}
          className="mt-8 grid gap-4 rounded-3xl border border-[#CDEBE8] bg-white p-6"
        >
          <div className="flex items-center gap-3">
            <RadioTower className="size-5 text-[#0D7773]" />
            <h2 className="text-lg font-semibold">{t("program_create")}</h2>
          </div>
          <Input name="name" required placeholder={t("program_name")} />
          <Textarea name="description" placeholder={t("program_description")} />
          <div>
            <Button type="submit" disabled={busy || !organization}>
              {t("create")}
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8 grid gap-5">
        {isLoading && <p className="text-sm text-[#5A7B79]">{t("loading")}</p>}
        {!isLoading && !programs?.length && (
          <div className="rounded-3xl border border-dashed border-[#B9DCD8] px-6 py-16 text-center">
            <RadioTower className="mx-auto size-8 text-[#0D7773]" />
            <h2 className="mt-4 text-xl font-semibold">{t("programs_empty_title")}</h2>
            <p className="mt-2 text-sm text-[#5A7B79]">{t("programs_empty_copy")}</p>
          </div>
        )}
        {programs?.map((program) => (
          <ProgramPanel key={program.id} program={program} refreshPrograms={() => mutate()} />
        ))}
      </div>
    </div>
  );
}
