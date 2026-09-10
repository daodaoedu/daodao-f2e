"use client";

import { BgRadialSvg, BookSvg, ClockSolidSvg, TagSolidSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { cn } from "@daodao/ui/lib/utils";
import { Link2Icon } from "lucide-react";
import { Fragment, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { formatDateRange } from "@/lib/practice-create";
import {
  type EffectiveSegment,
  getBaseName,
  getEffectiveSegments,
  isTimingPreset,
  resourceAppliesToSegment,
} from "./derive";
import { TIMING_LABEL_KEYS } from "./rhythm-utils";
import type { WizardFormValues, WizardResource } from "./schema";
import {
  WIZARD_LINK_COLOR,
  WIZARD_RESOURCE_CARD,
  WIZARD_RESOURCE_LINK,
  WIZARD_RESOURCE_PLAIN,
  WIZARD_SEPARATOR_COLOR,
  WIZARD_TIMING_BADGE,
} from "./wizard-styles";

export interface StepPreviewProps {
  form: UseFormReturn<WizardFormValues>;
}

type TFunction = ReturnType<typeof useTranslations<"practice">>;

/** 資訊列：只納入有值的項目，不顯示「未設定」佔位 */
const buildInfoItems = (t: TFunction, segment: EffectiveSegment): string[] => {
  const items: string[] = [];
  if (segment.days > 0) items.push(t("wizard_preview_days", { days: segment.days }));
  if (segment.start && segment.end) items.push(formatDateRange(segment.start, segment.end));
  if (segment.frequency)
    items.push(t("wizard_preview_frequency", { frequency: segment.frequency }));
  if (segment.minutes !== null)
    items.push(t("wizard_preview_minutes", { minutes: segment.minutes }));
  return items;
};

const timingLabel = (t: TFunction, timing: string): string =>
  isTimingPreset(timing) ? t(TIMING_LABEL_KEYS[timing]) : timing;

/** 資訊列（POC：14px 深青綠、中點分隔、下方 1px 分隔線） */
const InfoLine = ({ items }: { items: string[] }) => {
  if (items.length === 0) return null;
  return (
    <div
      className={cn(
        "mb-3 flex flex-wrap items-baseline gap-2 border-b border-bg-gray pb-3 text-sm leading-relaxed",
        WIZARD_LINK_COLOR
      )}
    >
      {items.map((item, index) => (
        <span key={item} className="inline-flex items-baseline gap-2 whitespace-nowrap">
          {index > 0 && (
            <span className={WIZARD_SEPARATOR_COLOR} aria-hidden="true">
              ·
            </span>
          )}
          {item}
        </span>
      ))}
    </div>
  );
};

interface PreviewBadgesProps {
  timings: string[];
  tags: string[];
}

/** 時機徽章（琥珀色 pill）＋ 標籤徽章（淡青底方角） */
const PreviewBadges = ({ timings, tags }: PreviewBadgesProps) => {
  if (timings.length === 0 && tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {timings.map((timing) => (
        <span key={`timing-${timing}`} className={WIZARD_TIMING_BADGE}>
          <ClockSolidSvg width={18} height={18} className="shrink-0" aria-hidden="true" />
          {timing}
        </span>
      ))}
      {tags.map((tag) => (
        <Badge
          key={`tag-${tag}`}
          variant="very-light-blue"
          size="sm"
          className="gap-1 rounded py-[3px] text-sm leading-[1.4]"
        >
          <TagSolidSvg width={18} height={18} className="text-light-cyan" aria-hidden="true" />
          {tag}
        </Badge>
      ))}
    </div>
  );
};

/** 資源列（卡片式，與 Step 3 同款、無操作鈕） */
const ResourceRows = ({
  resources,
  compact,
}: {
  resources: WizardResource[];
  compact?: boolean;
}) => {
  if (resources.length === 0) return null;
  return (
    <ul className={cn("flex flex-col", compact ? "gap-1.5" : "gap-2")}>
      {resources.map((resource) => (
        <li
          key={resource.id}
          className={compact ? "flex items-center gap-2" : WIZARD_RESOURCE_CARD}
        >
          <BookSvg
            width={compact ? 18 : 24}
            height={compact ? 17 : 23}
            className="shrink-0 opacity-85"
            aria-hidden="true"
          />
          {resource.url ? (
            <>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                title={resource.url}
                className={WIZARD_RESOURCE_LINK}
              >
                {resource.name}
              </a>
              {!compact && (
                <Link2Icon className="size-4 shrink-0 text-logo-cyan" aria-hidden="true" />
              )}
            </>
          ) : (
            <span className={WIZARD_RESOURCE_PLAIN}>{resource.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
};

/** Step 4｜預覽 */
export const StepPreview = ({ form }: StepPreviewProps) => {
  const t = useTranslations("practice");
  const values = form.watch();
  const nameFallback = t("wizard_name_fallback");

  const segments = useMemo(
    () => getEffectiveSegments(values, nameFallback),
    [values, nameFallback]
  );

  if (!values.isSegmented) {
    const [segment] = segments;
    if (!segment) return null;
    const timings = [
      ...values.timings.map((timing) => timingLabel(t, timing)),
      ...values.customTimings,
    ];
    return (
      <div>
        {/* 大標題＋放射背景裝飾（POC） */}
        <div className="relative py-4 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[150px] w-[360px] max-w-full -translate-x-1/2 translate-y-[calc(-50%+26px)] overflow-hidden"
          >
            <BgRadialSvg className="absolute top-1/2 left-1/2 h-[333px] w-[360px] -translate-x-1/2 -translate-y-1/2 opacity-85" />
          </div>
          <h1 className="relative text-2xl font-medium leading-[1.4] text-text-dark break-words">
            {getBaseName(values, nameFallback)}
          </h1>
        </div>

        <div className="relative py-4">
          <div className="relative rounded-[12px] bg-white p-4">
            <p className="mb-2.5 text-base font-medium leading-normal whitespace-pre-wrap break-words text-text-dark">
              {segment.action}
            </p>
            <InfoLine items={buildInfoItems(t, segment)} />
            <PreviewBadges timings={timings} tags={values.tags} />
          </div>
        </div>

        {values.resources.length > 0 && (
          <section>
            <h2 className="mt-4 mb-3.5 text-center text-sm font-medium text-text-dark">
              {t("wizard_preview_resources")}
            </h2>
            <ResourceRows resources={values.resources} />
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="relative py-4">
      <div className="flex flex-col gap-3">
        {segments.map((segment) => {
          const resources = values.resources.filter((r) =>
            resourceAppliesToSegment(r, segment.index)
          );
          return (
            <Fragment key={segment.index}>
              <div className="relative rounded-[12px] bg-white p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex size-[22px] shrink-0 items-center justify-center rounded-full bg-light-blue text-xs",
                      WIZARD_LINK_COLOR
                    )}
                  >
                    <span aria-hidden="true">{segment.index + 1}</span>
                    <span className="sr-only">
                      {t("wizard_segment_badge", { index: segment.index + 1 })}
                    </span>
                  </span>
                  <h2 className="text-base font-medium leading-[1.4] text-text-dark">
                    {segment.name}
                  </h2>
                </div>
                <p className="mb-2.5 text-[15px] leading-normal whitespace-pre-wrap break-words text-text-dark">
                  {segment.action}
                </p>
                <InfoLine items={buildInfoItems(t, segment)} />
                <PreviewBadges
                  timings={segment.timing ? [timingLabel(t, segment.timing)] : []}
                  tags={values.tags}
                />
                {resources.length > 0 && (
                  <div className="mt-3 border-t border-bg-gray pt-3">
                    <h3 className="sr-only">{t("wizard_preview_resources")}</h3>
                    <ResourceRows resources={resources} compact />
                  </div>
                )}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
