import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ACTIVITY_UNAVAILABLE_REASON_KEY } from "@/constants/activity-detail-cta";

// Regression: daodao#152 dev smoke — the activity detail page called
// t("cta_joined") under explore_activities, but the key did not exist,
// so joined users would see the raw "explore_activities.cta_joined" string.

const here = dirname(fileURLToPath(import.meta.url));
const productSrc = resolve(here, "../../..");
const localesDir = resolve(productSrc, "../../../packages/i18n/src/locales");

const SOURCES = [
  "app/[locale]/activities/page.tsx",
  "app/[locale]/activities/layout.tsx",
  "app/[locale]/activities/[cohortId]/page.tsx",
  "components/activity/activity-card.tsx",
  "components/activity/explore-filters.tsx",
  "components/activity/explore-guest-header.tsx",
  "components/activity/explore-search.tsx",
  "components/activity/host-preview-dialog.tsx",
];

// Literal t("key") / t('key') calls; dynamic keys are listed explicitly below.
const LITERAL_CALL = /\bt\(\s*["']([a-z0-9_]+)["']/g;

const usedKeys = (): Set<string> => {
  const keys = new Set<string>();
  for (const rel of SOURCES) {
    const src = readFileSync(join(productSrc, rel), "utf8");
    for (const [, key] of src.matchAll(LITERAL_CALL)) if (key) keys.add(key);
  }
  for (const k of Object.values(ACTIVITY_UNAVAILABLE_REASON_KEY)) keys.add(k);
  for (const s of ["upcoming", "ongoing", "ended"]) keys.add(`status_${s}`);
  for (const s of ["all", "open", "ongoing", "ended"]) keys.add(`section_title_${s}`);
  for (const m of ["sync", "async", "physical"]) keys.add(`detail_mode_${m}`);
  return keys;
};

const locales = readdirSync(localesDir).filter((f) => f.endsWith(".json"));

describe("explore_activities i18n coverage", () => {
  const keys = usedKeys();

  it("finds the keys used by the explore pages", () => {
    expect(keys.has("cta_joined")).toBe(true);
    expect(keys.size).toBeGreaterThan(20);
  });

  it.each(locales)("%s defines every explore_activities key in use", (file) => {
    const ns = JSON.parse(readFileSync(join(localesDir, file), "utf8")).explore_activities ?? {};
    const missing = [...keys].filter((k) => typeof ns[k] !== "string");
    expect(missing).toEqual([]);
  });

  it.each(locales)("%s uses ICU single-brace placeholders", (file) => {
    const ns = JSON.parse(readFileSync(join(localesDir, file), "utf8")).explore_activities ?? {};
    const doubleBraced = Object.entries(ns).filter(([, v]) => String(v).includes("{{"));
    expect(doubleBraced).toEqual([]);
  });
});
