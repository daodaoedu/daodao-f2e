/**
 * 模版 API 回應 → 精靈表單初始值（純函式）
 * 不對天數做「最接近選項」snap，保留模版原始數字。
 */
import type { PracticeTemplateType } from "@daodao/api";
import {
  type ExecutionTiming,
  PracticeTimePeriodToExecutionTimingMap,
} from "@/constants/practice-form";
import type { WizardFormValues, WizardResource } from "./schema";

/** frequencyMin/Max → 正規化頻率字串（"3-5"；相等時 "7"）；缺值回 "" */
export const frequencyFromRange = (min: number | null, max: number | null): string => {
  if (min === null && max === null) return "";
  const lo = min ?? max ?? 0;
  const hi = max ?? min ?? lo;
  return lo === hi ? String(lo) : `${lo}-${hi}`;
};

export const timingsFromPeriods = (periods: string[]): ExecutionTiming[] => {
  const seen = new Set<ExecutionTiming>();
  for (const period of periods) {
    const timing = PracticeTimePeriodToExecutionTimingMap[period];
    if (timing) seen.add(timing);
  }
  return Array.from(seen);
};

export const resourcesFromTemplate = (
  resources: PracticeTemplateType["resources"]
): WizardResource[] => {
  const seen = new Set<string>();
  const result: WizardResource[] = [];
  for (const resource of resources ?? []) {
    const id = String(resource.id);
    if (seen.has(id)) continue;
    seen.add(id);
    result.push({ id, name: resource.name, url: resource.url ?? "", segmentIndexes: [] });
  }
  return result;
};

export const templateToWizardValues = (
  template: PracticeTemplateType
): Partial<WizardFormValues> => ({
  action: template.practiceAction || template.title,
  name: template.title,
  durationDays: template.durationDays ?? null,
  frequency: frequencyFromRange(template.frequencyMinDays, template.frequencyMaxDays),
  sessionMinutes: template.sessionDurationMinutes ?? null,
  timings: timingsFromPeriods(template.practiceTimePeriods ?? []),
  tags: template.suggestedTags ?? [],
  resources: resourcesFromTemplate(template.resources),
});
