import { randomUUID } from "node:crypto";
import type { Locator } from "@playwright/test";
import { addDays, addMinutes } from "date-fns";

export const FOOTPRINTS_PATH = "/zh-TW/me/footprints";
export const HOME_PATH = "/zh-TW";

export function deliveryDate(days = 3): string {
  return addMinutes(addDays(new Date(), days), 2).toISOString();
}

export function privacySentinel(label: string): string {
  return `FRD-E2E-${label}-${randomUUID()}`;
}

export async function nodeX(locator: Locator): Promise<number> {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Expected timeline node to have a bounding box");
  return box.x + box.width / 2;
}
