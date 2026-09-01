"use client";

import type { FutureLetterType } from "@daodao/api";
import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { cn } from "@daodao/ui/lib/utils";
import { differenceInCalendarDays, format, isSameDay, parseISO } from "date-fns";
import {
  CalendarCheck,
  ChevronDown,
  Dna,
  Mail,
  MoreHorizontal,
  Plus,
  Sparkles,
} from "lucide-react";
import { type CSSProperties, useLayoutEffect, useRef, useState } from "react";
import type {
  FootprintEventCard,
  FootprintLetterCard,
  FootprintMonthGroup,
} from "./timeline-model";

type DraftLetter = FutureLetterType & { updatedAt?: string };

interface VerticalTimelineProps {
  futureLetters: FootprintLetterCard[];
  pastGroups: FootprintMonthGroup[];
  onWriteLetter: () => void;
  isWriteLetterDisabled?: boolean;
  onLetterClick: (letterId: string, date: string) => void;
  onDeleteLetter: (letterId: string) => void;
  focusLetterId?: string;
  focusDate?: string;
  draft?: DraftLetter | null;
}

const MONO: CSSProperties = {
  fontFamily: "var(--font-anonymous-pro), 'Anonymous Pro', ui-monospace, monospace",
};
const DASHED_LINE = "repeating-linear-gradient(180deg,#D9E3E5 0 4px,transparent 4px 8px)";

const KEYFRAMES = `
@keyframes tealPulse{0%,100%{box-shadow:0 0 0 3px rgba(22,185,179,.25),0 0 0 0 rgba(22,185,179,.5);transform:scale(1)}50%{box-shadow:0 0 0 4px rgba(22,185,179,.18),0 0 0 12px rgba(22,185,179,0);transform:scale(1.12)}}
@keyframes breathe{0%,100%{box-shadow:0 0 0 0 rgba(224,185,11,.6);opacity:.7;transform:scale(1)}50%{box-shadow:0 0 0 8px rgba(224,185,11,0);opacity:1;transform:scale(1.18)}}
`;

/** One timeline row: 56px right-aligned label · 11px node column (dot + optional
 *  vertical line) · flex-1 content — the prototype's three-column grid. */
function Row({
  label,
  labelStyle,
  labelClassName,
  dot,
  line,
  contentClassName,
  children,
}: {
  label?: React.ReactNode;
  labelStyle?: CSSProperties;
  labelClassName?: string;
  dot: React.ReactNode;
  line?: "dashed" | "solid" | "none";
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={cn(
          "w-14 shrink-0 whitespace-nowrap pt-[2px] text-right text-xs text-[#9FB5B8]",
          labelClassName
        )}
        style={labelStyle}
      >
        {label}
      </div>
      <div className="flex w-[11px] shrink-0 flex-col items-center">
        {dot}
        {line !== "none" && (
          <span
            aria-hidden="true"
            className="w-px flex-1"
            style={{ background: line === "dashed" ? DASHED_LINE : "#DCE9EB" }}
          />
        )}
      </div>
      <div className={cn("min-w-0 flex-1 pb-5", contentClassName)}>{children}</div>
    </div>
  );
}

function scheduledDurationDays(letter: FootprintLetterCard): number | null {
  if (!letter.sentAt) return null;
  const days = differenceInCalendarDays(parseISO(letter.date), parseISO(letter.sentAt));
  return days > 0 ? days : null;
}

function ScheduledLetterCard({
  letter,
  onClick,
  onDelete,
}: {
  letter: FootprintLetterCard;
  onClick: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations("future_letter");
  const days = scheduledDurationDays(letter);
  const title = days
    ? t("scheduled_letter_title", {
        duration: days >= 28 && days <= 31 ? t("duration_one_month") : t("duration_days", { days }),
      })
    : t("scheduled_countdown", { days: letter.daysRemaining ?? 0 });
  return (
    <div
      data-testid="timeline-node"
      data-kind="scheduled"
      data-date={letter.date.slice(0, 10)}
      data-node-id={`letter-${letter.letterId}`}
      className="relative rounded-2xl border-[1.5px] border-dashed border-[#EFD66A] bg-[#FFFDF2] p-4 transition-[transform,box-shadow] duration-[220ms] hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(224,185,11,.18)]"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#F9E41E] px-[10px] py-[2px] text-[11px] font-medium text-[#0D3036]">
          {t("sent_badge")}
        </span>
        <span className="text-xs text-[#8A7A2E]" style={MONO}>
          {t("days_remaining", { days: letter.daysRemaining ?? 0 })}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t("letter_menu")}
              className="-m-1 ml-auto flex size-7 shrink-0 items-center justify-center rounded-full text-[#A79432] transition-colors hover:bg-[rgba(224,185,11,.14)]"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[120px] rounded-[14px] border-[#E4EAE9] p-[6px] shadow-[0_12px_28px_rgba(15,48,54,.16)]"
          >
            <DropdownMenuItem
              onClick={onDelete}
              className="rounded-[10px] px-[14px] py-[10px] text-sm text-[#E0604F] focus:bg-[#FDF1EF] focus:text-[#E0604F]"
            >
              {t("delete_scheduled_title")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <button type="button" onClick={onClick} className="block w-full text-left">
        <p className="mt-2 text-[15px] font-medium text-[#0D3036]">{title}</p>
        <p className="mt-1 text-[13px] text-[#7C7440]">
          {letter.practiceTitle
            ? t("sent_at_with_practice", {
                date: letter.sentAt ? format(parseISO(letter.sentAt), "yyyy/MM/dd") : "",
                practice: letter.practiceTitle,
              })
            : letter.sentAt
              ? t("sent_at", { date: format(parseISO(letter.sentAt), "yyyy/MM/dd") })
              : null}
        </p>
      </button>
    </div>
  );
}

function DeliveredLetterCard({
  letter,
  onClick,
}: {
  letter: FootprintLetterCard;
  onClick: () => void;
}) {
  const t = useTranslations("future_letter");
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid="timeline-node"
      data-kind={letter.opened ? "opened" : "delivered-unopened"}
      data-date={letter.date.slice(0, 10)}
      data-node-id={`letter-${letter.letterId}`}
      className="w-full rounded-2xl border border-[#F0DFA0] bg-[#FFF9E6] p-4 text-left transition-[transform,box-shadow] duration-[220ms] hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(224,185,11,.18)]"
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded-full px-[10px] py-[2px] text-[11px] font-medium text-[#0D3036]",
            letter.opened ? "bg-[#D8F0E8] text-[#1A6B4A]" : "bg-[#FCDD84]"
          )}
        >
          {letter.opened ? t("read_badge") : t("delivered_badge")}
        </span>
        <span className="text-xs text-[#8A7A2E]" style={MONO}>
          {t("delivered_at", { date: format(parseISO(letter.date), "MM/dd") })}
        </span>
      </div>
      <p className="mt-2 flex items-center gap-2 text-[15px] font-medium text-[#0D3036]">
        <Mail className="size-4 shrink-0 text-[#9A7419]" />
        {t("detail_title")}
      </p>
      {letter.sentAt && (
        <p className="mt-1 text-[13px] text-[#7C7440]">
          {t("sent_at", { date: format(parseISO(letter.sentAt), "yyyy/MM/dd") })}
        </p>
      )}
    </button>
  );
}

function EventCardView({ card }: { card: FootprintEventCard }) {
  const shared = {
    "data-testid": "timeline-node",
    "data-kind": card.kind,
    "data-date": card.date.slice(0, 10),
    "data-node-id": card.id,
  } as const;

  if (card.kind === "milestone" || card.kind === "learning-dna") {
    const milestone = card.kind === "milestone";
    return (
      <div
        {...shared}
        className={cn(
          "rounded-2xl border px-4 py-3",
          milestone ? "border-[#FFE3B8] bg-[#FFF6E8]" : "border-[#D8F0FA] bg-[#F0FBFF]"
        )}
      >
        <div className="flex items-center gap-[10px]">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full",
              milestone ? "bg-[#FFA10B] text-white" : "bg-[#99ECFF] text-[#0D3036]"
            )}
          >
            {milestone ? <Sparkles className="size-4" /> : <Dna className="size-4" />}
          </span>
          <span
            className={cn(
              "min-w-0 truncate text-sm font-medium",
              milestone ? "text-[#0D3036]" : "text-[#295E5C]"
            )}
          >
            {card.title}
          </span>
          <span
            className={cn(
              "ml-auto shrink-0 text-xs",
              milestone ? "text-[#A87A22]" : "text-[#9FB5B8]"
            )}
            style={MONO}
          >
            {format(parseISO(card.date), "MM/dd")}
          </span>
        </div>
        {card.description && (
          <p className="mt-2 text-sm leading-[1.7] text-[#536166]">{card.description}</p>
        )}
      </div>
    );
  }

  return (
    <div
      {...shared}
      className="rounded-2xl border border-[#E8F8FF] bg-white p-4 shadow-[0_2px_8px_rgba(15,48,54,.04)]"
    >
      <div className="flex items-center gap-[10px]">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#E7FAF7] text-logo-cyan">
          <CalendarCheck className="size-4" />
        </span>
        <span className="min-w-0 truncate text-sm font-medium text-[#295E5C]">{card.title}</span>
        <span className="ml-auto shrink-0 text-xs text-[#9FB5B8]" style={MONO}>
          {format(parseISO(card.date), "MM/dd")}
        </span>
      </div>
      {card.description && (
        <p className="mt-2 text-sm leading-[1.7] text-[#536166]">{card.description}</p>
      )}
    </div>
  );
}

function CollapsedCheckins({ items }: { items: FootprintEventCard[] }) {
  const t = useTranslations("future_letter");
  const [expanded, setExpanded] = useState(false);
  if (expanded) {
    return (
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <EventCardView key={item.id} card={item} />
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(false)}
          className="w-fit text-[#536166]"
        >
          <ChevronDown className="size-4 rotate-180" />
          {t("collapse_action")}
        </Button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setExpanded(true)}
      className="flex w-fit items-center gap-2 rounded-full bg-[#F4F6F6] px-4 py-[10px] text-[13px] text-[#536166] transition-colors hover:bg-[#E9EFEF]"
    >
      {t("collapsed_count", { count: items.length })}
    </button>
  );
}

function DraftRow({ draft, onClick }: { draft: DraftLetter; onClick: () => void }) {
  const t = useTranslations("future_letter");
  const updatedAt = draft.updatedAt ? parseISO(draft.updatedAt) : null;
  const timeLabel = updatedAt
    ? isSameDay(updatedAt, new Date())
      ? `${t("label_today")} ${format(updatedAt, "HH:mm")}`
      : format(updatedAt, "yyyy/MM/dd")
    : null;
  const preview = (draft.message || draft.currentSelf || t("draft_untitled")).slice(0, 28);
  return (
    <Row
      label={t("draft_badge")}
      dot={
        <span className="size-[15px] shrink-0 rounded-full border-2 border-dashed border-[#B7C6C9] bg-white" />
      }
      line="dashed"
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-2xl border-[1.5px] border-dashed border-[#DCE9EB] bg-white p-4 text-left transition-[border-color,transform] duration-[220ms] hover:-translate-y-[2px] hover:border-[#16B9B3]"
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#F4F6F6] px-[10px] py-[2px] text-[11px] text-[#536166]">
            {t("draft_unsealed_chip")}
          </span>
          {timeLabel && (
            <span className="text-xs text-[#9FB5B8]" style={MONO}>
              {timeLabel}
            </span>
          )}
        </div>
        <p className="mt-2 text-[15px] font-medium text-[#0D3036]">{preview}</p>
        <p className="mt-1 text-[13px] text-[#536166]">{t("draft_continue_hint")}</p>
      </button>
    </Row>
  );
}

export function VerticalTimeline({
  futureLetters,
  pastGroups,
  onWriteLetter,
  isWriteLetterDisabled,
  onLetterClick,
  onDeleteLetter,
  focusLetterId,
  focusDate,
  draft,
}: VerticalTimelineProps) {
  const t = useTranslations("future_letter");
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!focusLetterId && !focusDate) return;
    const selector = focusLetterId
      ? `[data-node-id="letter-${focusLetterId}"]`
      : `[data-date="${focusDate}"]`;
    const target = containerRef.current?.querySelector<HTMLElement>(selector);
    target?.scrollIntoView({ behavior: "instant", block: "center" });
  }, [focusLetterId, focusDate]);

  return (
    <div
      ref={containerRef}
      data-testid="future-letter-timeline"
      className="mx-auto flex w-full max-w-md flex-col"
    >
      <style>{KEYFRAMES}</style>

      {draft && <DraftRow draft={draft} onClick={onWriteLetter} />}

      {futureLetters.length === 0 ? (
        <Row
          label={t("label_future")}
          dot={
            <span
              className="size-[15px] shrink-0 rounded-full border-2 border-dashed border-[#E0B90B]"
              style={{ animation: "breathe 2.4s ease-in-out infinite" }}
            />
          }
          line="dashed"
        >
          <button
            type="button"
            disabled={isWriteLetterDisabled}
            onClick={onWriteLetter}
            className="w-full rounded-2xl border-[1.5px] border-dashed border-[#DCE9EB] bg-white p-5 text-center transition-[border-color,transform] duration-[220ms] hover:-translate-y-[2px] hover:border-[#E0B90B]"
          >
            <p className="text-[13px] leading-[1.75] text-[#536166]">
              {t("cta_title")}
              <br />
              {t("cta_description")}
            </p>
            <span className="mt-[14px] inline-flex items-center gap-2 rounded-full bg-[#F9E41E] px-5 py-[10px] text-sm font-medium text-[#0D3036]">
              {t("cta_button")}
            </span>
          </button>
        </Row>
      ) : (
        <>
          <Row
            dot={
              <span className="size-[14px] shrink-0 rounded-full border-[1.5px] border-dashed border-[#C9D6D8]" />
            }
            line="dashed"
          >
            <button
              type="button"
              disabled={isWriteLetterDisabled}
              onClick={onWriteLetter}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-dashed border-[#DCE9EB] bg-white text-sm text-[#536166] transition-colors hover:border-[#16B9B3] hover:text-[#16B9B3]"
            >
              <Plus className="size-4" />
              {t("write_another")}
            </button>
          </Row>
          {futureLetters.map((letter) => (
            <Row
              key={letter.id}
              label={format(parseISO(letter.date), "yyyy / MM")}
              labelStyle={MONO}
              dot={
                <span className="size-[15px] shrink-0 rounded-full border-2 border-dashed border-[#E0B90B] bg-[#FFFDF0]" />
              }
              line="dashed"
            >
              <ScheduledLetterCard
                letter={letter}
                onClick={() => onLetterClick(letter.letterId, letter.date)}
                onDelete={() => onDeleteLetter(letter.letterId)}
              />
            </Row>
          ))}
        </>
      )}

      <div className="flex items-center gap-4 pb-5">
        <div className="w-14 shrink-0 text-right text-xs font-medium text-[#16B9B3]">
          {t("label_today")}
        </div>
        <div className="flex w-[11px] shrink-0 justify-center">
          <span
            data-testid="timeline-node"
            data-kind="today"
            data-date={new Date().toISOString().slice(0, 10)}
            data-node-id="today"
            className="size-[11px] rounded-full bg-[#16B9B3]"
            style={{ animation: "tealPulse 2.4s ease-in-out infinite" }}
          />
        </div>
        <div
          className="h-px flex-1"
          style={{ background: "linear-gradient(90deg,#16B9B3,rgba(22,185,179,0))" }}
        />
      </div>

      {pastGroups.map((group, groupIndex) => (
        <Row
          key={group.key}
          label={group.label}
          labelStyle={MONO}
          dot={
            <span
              className="size-[11px] shrink-0 rounded-full"
              style={{ background: groupIndex === 0 ? "#89DAD7" : "#B9E6E4" }}
            />
          }
          line="solid"
          contentClassName="flex flex-col gap-3 pb-4"
        >
          {group.items.map((item) => {
            if (item.type === "letter") {
              return (
                <DeliveredLetterCard
                  key={item.card.id}
                  letter={item.card}
                  onClick={() => onLetterClick(item.card.letterId, item.card.date)}
                />
              );
            }
            if (item.type === "event") {
              return <EventCardView key={item.card.id} card={item.card} />;
            }
            return <CollapsedCheckins key={item.id} items={item.items} />;
          })}
        </Row>
      ))}
    </div>
  );
}
