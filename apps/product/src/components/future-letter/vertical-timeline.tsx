"use client";

import { useTranslations } from "@daodao/i18n";
import { Button } from "@daodao/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { cn } from "@daodao/ui/lib/utils";
import { format, parseISO } from "date-fns";
import { CalendarCheck, ChevronDown, Dna, Mail, MoreHorizontal, Sparkles } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import type {
  FootprintEventCard,
  FootprintLetterCard,
  FootprintMonthGroup,
} from "./timeline-model";

interface VerticalTimelineProps {
  futureLetters: FootprintLetterCard[];
  pastGroups: FootprintMonthGroup[];
  onWriteLetter: () => void;
  isWriteLetterDisabled?: boolean;
  onLetterClick: (letterId: string, date: string) => void;
  onDeleteLetter: (letterId: string) => void;
  focusLetterId?: string;
}

const eventIconClass: Record<FootprintEventCard["kind"], string> = {
  "check-in": "border-logo-cyan bg-white text-logo-cyan",
  milestone: "border-[#E4B84D] bg-[#FFF6D9] text-[#9A7419]",
  "learning-dna": "border-[#77A9C4] bg-[#EDF5FA] text-[#4A90B8]",
};

function EventIcon({ kind }: { kind: FootprintEventCard["kind"] }) {
  if (kind === "learning-dna") return <Dna className="size-4" />;
  if (kind === "milestone") return <Sparkles className="size-4" />;
  return <CalendarCheck className="size-4" />;
}

function Row({
  dateLabel,
  dot,
  children,
}: {
  dateLabel?: string;
  dot: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 pb-4">
      <div className="w-12 shrink-0 pt-1.5 text-right text-xs leading-tight text-text-secondary">
        {dateLabel}
      </div>
      <div className="relative flex w-6 shrink-0 justify-center">
        <div className="absolute top-0 bottom-0 w-px bg-[#C9DADA]" aria-hidden="true" />
        <div className="relative z-10 pt-1">{dot}</div>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
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
  return (
    <div
      data-testid="timeline-node"
      data-kind="scheduled"
      data-date={letter.date.slice(0, 10)}
      data-node-id={`letter-${letter.letterId}`}
      className="rounded-2xl border border-dashed border-[#E4B84D] bg-[#FFFDF5] p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onClick} className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#FFF6D9] px-2 py-0.5 text-xs font-bold text-[#9A7419]">
              {t("unopened_label")}
            </span>
            <span className="text-xs text-[#B88B23]">
              {t("days_remaining", { days: letter.daysRemaining ?? 0 })}
            </span>
          </div>
          <p className="mt-2 font-bold text-text-dark">
            {t("scheduled_countdown", { days: letter.daysRemaining ?? 0 })}
          </p>
          <p className="mt-1 text-xs text-text-secondary">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("letter_menu")}
              className="size-7 shrink-0 text-text-secondary"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete} className="text-red">
              {t("delete_scheduled_title")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
      className="w-full rounded-2xl border border-[#F0DFA0] bg-[#FFF9E6] p-4 text-left"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#FCDD84] px-2 py-0.5 text-xs font-bold text-text-dark">
          {t("delivered_badge")}
        </span>
        <span className="text-xs text-[#9A7419]">
          {t("delivered_at", { date: format(parseISO(letter.date), "MM/dd") })}
        </span>
        {!letter.opened && (
          <span className="rounded-full bg-logo-cyan/10 px-2 py-0.5 text-xs font-medium text-logo-cyan">
            {t("unopened_label")}
          </span>
        )}
      </div>
      <p className="mt-2 flex items-center gap-2 font-bold text-text-dark">
        <Mail className="size-4 shrink-0 text-[#9A7419]" />
        {t("detail_title")}
      </p>
      {letter.sentAt && (
        <p className="mt-1 text-xs text-text-secondary">
          {t("sent_at", { date: format(parseISO(letter.sentAt), "yyyy/MM/dd") })}
        </p>
      )}
    </button>
  );
}

function EventCardView({ card }: { card: FootprintEventCard }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
              eventIconClass[card.kind]
            )}
          >
            <EventIcon kind={card.kind} />
          </span>
          <p className="font-bold text-text-dark">{card.title}</p>
        </div>
        <span className="shrink-0 text-xs text-text-secondary">
          {format(parseISO(card.date), "MM/dd")}
        </span>
      </div>
      {card.description && (
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{card.description}</p>
      )}
    </div>
  );
}

function CollapsedCheckins({ items }: { items: FootprintEventCard[] }) {
  const t = useTranslations("future_letter");
  const [expanded, setExpanded] = useState(false);
  if (expanded) {
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <EventCardView key={item.id} card={item} />
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(false)}
          className="text-text-secondary"
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
      className="rounded-full bg-[#F3F6F6] px-4 py-2 text-sm text-text-secondary hover:bg-[#E9EFEF]"
    >
      {t("collapsed_count", { count: items.length })}
    </button>
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
}: VerticalTimelineProps) {
  const t = useTranslations("future_letter");
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!focusLetterId) return;
    const target = containerRef.current?.querySelector<HTMLElement>(
      `[data-node-id="letter-${focusLetterId}"]`
    );
    target?.scrollIntoView({ behavior: "instant", block: "center" });
  }, [focusLetterId]);

  return (
    <div ref={containerRef} data-testid="future-letter-timeline">
      {futureLetters.length === 0 ? (
        <Row dateLabel={t("label_future")} dot={<span className="size-3 rounded-full border-2 border-dashed border-[#E4B84D]" />}>
          <div className="rounded-2xl border border-dashed border-[#E4B84D] bg-[#FFFDF5] p-5 text-center">
            <p className="font-bold text-text-dark">{t("cta_title")}</p>
            <p className="mt-1 text-sm text-text-secondary">{t("cta_description")}</p>
            <Button
              disabled={isWriteLetterDisabled}
              onClick={onWriteLetter}
              className="mt-4 rounded-full bg-[#FCDD84] font-bold text-text-dark hover:bg-[#FBCF54]"
            >
              {t("cta_button")}
            </Button>
          </div>
        </Row>
      ) : (
        <>
          <div className="mb-4 pl-[60px]">
            <Button
              type="button"
              variant="outline"
              disabled={isWriteLetterDisabled}
              onClick={onWriteLetter}
              className="rounded-full border-logo-cyan text-logo-cyan hover:bg-[#E7FAF7] hover:text-logo-cyan"
            >
              <Mail className="size-4" />
              {t("write_another")}
            </Button>
          </div>
          {futureLetters.map((letter, index) => (
            <Row
              key={letter.id}
              dateLabel={index === 0 ? t("label_future") : undefined}
              dot={<span className="size-3 rounded-full border-2 border-dashed border-[#E4B84D] bg-white" />}
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

      <Row
        dateLabel={t("label_today")}
        dot={
          <span
            data-testid="timeline-node"
            data-kind="today"
            className="flex size-3 items-center justify-center rounded-full bg-logo-cyan ring-4 ring-logo-cyan/20"
          />
        }
      >
        <div className="h-px bg-[#C9DADA]" />
      </Row>

      {pastGroups.map((group) => (
        <div key={group.key}>
          {group.items.map((item, itemIndex) => (
            <Row
              key={
                item.type === "collapsed-check-ins"
                  ? item.id
                  : item.type === "letter"
                    ? item.card.id
                    : item.card.id
              }
              dateLabel={itemIndex === 0 ? group.label : undefined}
              dot={
                <span
                  className={cn(
                    "size-2.5 rounded-full",
                    item.type === "letter" ? "bg-[#E4B84D]" : "bg-[#AFC8C8]"
                  )}
                />
              }
            >
              {item.type === "letter" && (
                <DeliveredLetterCard
                  letter={item.card}
                  onClick={() => onLetterClick(item.card.letterId, item.card.date)}
                />
              )}
              {item.type === "event" && <EventCardView card={item.card} />}
              {item.type === "collapsed-check-ins" && <CollapsedCheckins items={item.items} />}
            </Row>
          ))}
        </div>
      ))}
    </div>
  );
}
