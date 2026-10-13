import type { SpaceListItemType } from "@daodao/api";

/**
 * 主頁動態牆「依空間篩選」（daodao#213 FRD FR-D3）。
 * 值與 ai-backend GET /v1/feed 的 `spaces` 參數一致：personal | challenge | cohort:<cohortId>。
 * 沒有選取 = 全部；多選取聯集。
 */

export type SpaceFilterValue = "personal" | "challenge" | `cohort:${string}`;

export type SpaceFilterOption =
  | { value: "personal"; kind: "personal" }
  | { value: "challenge"; kind: "challenge" }
  | { value: `cohort:${string}`; kind: "event_course"; name: string };

export type SpaceFilterSummary =
  | { type: "all" }
  | { type: "single"; option: SpaceFilterOption }
  | { type: "multiple"; count: number };

export const SPACE_FILTER_PARAM = "spaces";

/** 與 ai-backend GET /v1/feed 的 spaces 上限一致 */
export const MAX_SPACE_FILTERS = 20;

const SPACE_FILTER_PATTERN = /^(personal|challenge|cohort:[1-9][0-9]{0,18})$/;

const FIXED_OPTIONS: SpaceFilterOption[] = [
  { value: "personal", kind: "personal" },
  { value: "challenge", kind: "challenge" },
];

export function parseSpaceFilterParams(values: string[]): SpaceFilterValue[] {
  const result: SpaceFilterValue[] = [];
  for (const value of values) {
    if (SPACE_FILTER_PATTERN.test(value) && !result.includes(value as SpaceFilterValue)) {
      result.push(value as SpaceFilterValue);
    }
  }
  return result.slice(0, MAX_SPACE_FILTERS);
}

export function buildSpaceFilterOptions(
  spaces: Pick<SpaceListItemType, "kind" | "id" | "name">[] | undefined
): SpaceFilterOption[] {
  const courses: SpaceFilterOption[] = (spaces ?? [])
    .filter((space) => space.kind === "event_course" && !!space.id)
    .map((space) => ({
      value: `cohort:${space.id}` as const,
      kind: "event_course" as const,
      name: space.name,
    }));
  return [...FIXED_OPTIONS, ...courses];
}

export function toggleSpaceFilter(
  selected: SpaceFilterValue[],
  value: SpaceFilterValue
): SpaceFilterValue[] {
  if (selected.includes(value)) return selected.filter((v) => v !== value);
  if (selected.length >= MAX_SPACE_FILTERS) return selected;
  return [...selected, value];
}

/** 移除不在選項內的值（例如網址帶著已退出的活動課程）。 */
export function sanitizeSpaceSelection(
  selected: SpaceFilterValue[],
  options: SpaceFilterOption[]
): SpaceFilterValue[] {
  const available = new Set<string>(options.map((o) => o.value));
  return selected.filter((value) => available.has(value));
}

export function getSpaceFilterSummary(
  selected: SpaceFilterValue[],
  options: SpaceFilterOption[]
): SpaceFilterSummary {
  if (selected.length === 0) return { type: "all" };
  if (selected.length === 1) {
    const option = options.find((o) => o.value === selected[0]);
    if (option) return { type: "single", option };
  }
  return { type: "multiple", count: selected.length };
}

/** 主頁網址的 query string（keyword、tags[]、spaces），重新整理後可還原篩選。 */
export function buildHomeFeedQuery({
  keyword,
  tags,
  spaces,
}: {
  keyword: string;
  tags: string[];
  spaces: SpaceFilterValue[];
}): string {
  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);
  for (const tag of tags) params.append("tags[]", tag);
  for (const space of spaces) params.append(SPACE_FILTER_PARAM, space);
  return params.toString();
}
