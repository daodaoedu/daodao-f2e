"use client";

import { useTranslations } from "@daodao/i18n";
import { Badge } from "@daodao/ui/components/badge";
import { Card, CardContent } from "@daodao/ui/components/card";
import { Clock, Link2Icon, Tag } from "lucide-react";
import { useMemo } from "react";
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

export interface StepPreviewProps {
  form: UseFormReturn<WizardFormValues>;
}

type TFunction = ReturnType<typeof useTranslations<"practice">>;

const INFO_SEPARATOR = " · ";

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

interface PreviewBadgesProps {
  timings: string[];
  tags: string[];
}

const PreviewBadges = ({ timings, tags }: PreviewBadgesProps) => {
  if (timings.length === 0 && tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {timings.map((timing) => (
        <Badge key={`timing-${timing}`} variant="outline-logo" size="sm" className="gap-1">
          <Clock className="size-3 shrink-0" aria-hidden="true" />
          {timing}
        </Badge>
      ))}
      {tags.map((tag) => (
        <Badge key={`tag-${tag}`} variant="very-light-blue" size="sm" className="gap-1">
          <Tag className="size-3 shrink-0" aria-hidden="true" />
          {tag}
        </Badge>
      ))}
    </div>
  );
};

interface ResourceListProps {
  resources: WizardResource[];
}

const ResourceList = ({ resources }: ResourceListProps) => {
  if (resources.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2">
      {resources.map((resource) => (
        <li key={resource.id} className="flex items-start gap-2 text-sm text-text-dark">
          {resource.url ? (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-2 py-2 text-logo-cyan underline-offset-4 hover:underline"
            >
              <Link2Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="break-all">{resource.name}</span>
            </a>
          ) : (
            <span className="inline-flex min-h-10 items-center py-2 break-all">
              {resource.name}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

interface SegmentCardProps {
  t: TFunction;
  segment: EffectiveSegment;
  timings: string[];
  tags: string[];
  resources: WizardResource[];
  showHeader: boolean;
}

const PreviewCard = ({ t, segment, timings, tags, resources, showHeader }: SegmentCardProps) => {
  const info = buildInfoItems(t, segment);
  return (
    <Card className="border-light-gray bg-white/80 shadow-none">
      <CardContent className="flex flex-col gap-3 p-5">
        {showHeader && (
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-logo-cyan text-xs font-semibold text-white"
            >
              {segment.index + 1}
            </span>
            <h2 className="text-base font-semibold text-text-dark">{segment.name}</h2>
          </div>
        )}

        <p className="text-sm leading-6 text-text-dark whitespace-pre-wrap break-words">
          {segment.action}
        </p>

        {info.length > 0 && (
          <p className="text-xs text-text-dark/70">{info.join(INFO_SEPARATOR)}</p>
        )}

        <PreviewBadges timings={timings} tags={tags} />

        {showHeader && resources.length > 0 && (
          <div className="border-t border-light-gray pt-3">
            <h3 className="mb-1 text-xs font-medium text-text-dark/70">
              {t("wizard_preview_resources")}
            </h3>
            <ResourceList resources={resources} />
          </div>
        )}
      </CardContent>
    </Card>
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
      <div className="flex flex-col gap-4">
        <h1 className="text-center text-2xl font-medium text-text-dark break-words">
          {getBaseName(values, nameFallback)}
        </h1>
        <PreviewCard
          t={t}
          segment={segment}
          timings={timings}
          tags={values.tags}
          resources={[]}
          showHeader={false}
        />
        {values.resources.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-medium text-text-dark">
              {t("wizard_preview_resources")}
            </h2>
            <ResourceList resources={values.resources} />
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {segments.map((segment) => (
        <PreviewCard
          key={segment.index}
          t={t}
          segment={segment}
          timings={segment.timing ? [timingLabel(t, segment.timing)] : []}
          tags={values.tags}
          resources={values.resources.filter((r) => resourceAppliesToSegment(r, segment.index))}
          showHeader
        />
      ))}
    </div>
  );
};
