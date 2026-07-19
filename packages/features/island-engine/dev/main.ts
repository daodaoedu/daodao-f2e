/**
 * IslandEngine 本機測試頁（task 3.1 驗收：空場景可在測試頁渲染）
 * 啟動：pnpm --filter @daodao/features-island-engine dev:page
 */

import { IslandEngine } from "../src";
import type { IIslandData } from "../src/types";

const app = document.getElementById("app");
const stats = document.getElementById("stats");
const seedInput = document.getElementById("seed") as HTMLInputElement | null;

if (!app) throw new Error("missing #app");

const checkinIds = (start: number, count: number): number[] =>
  Array.from({ length: count }, (_, i) => start + i);

const buildMockData = (personaType: string | null): IIslandData => ({
  profile: {
    id: seedInput?.value || "demo-user-1",
    customId: "demo",
    name: "測試島主",
    photoURL: null,
  },
  personaType,
  practices: [
    {
      id: "practice-writing",
      title: "每天寫 500 字",
      status: "active",
      themeColor: "#FF6E0B",
      checkinCount: 12,
      checkinIds: checkinIds(100, 12),
    },
    {
      id: "practice-korean",
      title: "韓文自學",
      status: "active",
      themeColor: "#16B9B3",
      checkinCount: 30,
      checkinIds: checkinIds(300, 30),
    },
    {
      id: "practice-run",
      title: "晨跑習慣",
      status: "completed",
      themeColor: "#F9E41E",
      checkinCount: 60,
      checkinIds: checkinIds(600, 60),
    },
  ],
  recentCheckinCount: 23,
  viewerRelation: "self",
});

let engine: IslandEngine | null = null;

const boot = (personaType: string | null): void => {
  engine?.dispose();
  engine = new IslandEngine({
    container: app,
    islandData: buildMockData(personaType),
    events: {
      onReady: () => console.info("[dev] first frame rendered"),
      onWalkable: () =>
        console.info(`[dev] walkable in ${engine?.getTimeToWalkable()?.toFixed(0)}ms`),
      onObjectClick: (payload) => console.info("[dev] object click", payload),
    },
  });
};

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-persona]")) {
  button.addEventListener("click", () => boot(button.dataset.persona || null));
}
seedInput?.addEventListener("change", () => boot(null));

setInterval(() => {
  if (!stats || !engine) return;
  const fps = engine.getAverageFps();
  stats.textContent = `quality=${engine.getQuality()} fps=${fps ? fps.toFixed(0) : "…"}`;
}, 500);

boot("D");
