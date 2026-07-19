/**
 * 資產載入器單元測試（task 3.3 驗收：缺檔以簡單幾何體替代）
 */

import { Group, type Object3D } from "three";
import { describe, expect, it, vi } from "vitest";
import { buildFallbackObject, createAssetLoader } from "../loader";
import { getManifestEntry, ISLAND_ASSET_MANIFEST, ISLAND_ASSETS } from "../manifest";

describe("manifest", () => {
  it("每個資產 key 都有 fallback 定義", () => {
    for (const entry of ISLAND_ASSET_MANIFEST) {
      expect(entry.fallback.shape).toBeTruthy();
      expect(entry.fallback.color).toMatch(/^#/);
      expect(entry.fallback.size).toHaveLength(3);
    }
  });
});

describe("buildFallbackObject", () => {
  it("依 manifest 建立標記過的替代幾何體", () => {
    const entry = getManifestEntry(ISLAND_ASSETS.tent);
    expect(entry).toBeDefined();
    if (!entry) return;
    const object = buildFallbackObject(entry);
    expect(object.userData.isFallback).toBe(true);
    expect(object.name).toBe("tent:fallback");
    expect(object.children.length).toBeGreaterThan(0);
  });
});

describe("createAssetLoader", () => {
  it("載入失敗時回傳 fallback、不 reject（缺檔場景仍完整可玩）", async () => {
    const loader = createAssetLoader({
      loadGltf: () => Promise.reject(new Error("404 not found")),
    });
    const object = await loader.load(ISLAND_ASSETS.cabin);
    expect(object.userData.isFallback).toBe(true);
    expect(object.name).toBe("cabin:fallback");
  });

  it("載入成功時回傳 GLB scene 並套用 manifest scale", async () => {
    const scene: Object3D = new Group();
    const loader = createAssetLoader({
      loadGltf: () => Promise.resolve({ scene }),
    });
    const object = await loader.load(ISLAND_ASSETS.palmTree);
    expect(object).toBe(scene);
    expect(object.userData.isFallback).toBeUndefined();
    expect(object.name).toBe(ISLAND_ASSETS.palmTree);
  });

  it("同 key 共用同一載入 promise（快取）", async () => {
    const loadGltf = vi.fn(() => Promise.resolve({ scene: new Group() as Object3D }));
    const loader = createAssetLoader({ loadGltf });
    await Promise.all([loader.load(ISLAND_ASSETS.rock), loader.load(ISLAND_ASSETS.rock)]);
    expect(loadGltf).toHaveBeenCalledTimes(1);
  });

  it("未知 key 直接 reject（manifest 是唯一資產清單）", async () => {
    const loader = createAssetLoader({ loadGltf: () => Promise.resolve({ scene: new Group() }) });
    await expect(loader.load("nope")).rejects.toThrow(/unknown asset key/);
  });
});
