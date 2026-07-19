/**
 * Deterministic 地形生成（純函式，零 three.js 依賴，可單元測試）
 *
 * 以島主 user_id（external_id 字串）為種子：同種子輸出恆定，
 * 島主與訪客在任何裝置看到完全一致的島（spec「地形恆定」）。
 */

import { fbm2D, hashSeed, valueNoise2D } from "../core/random";
import { getTerrainTheme, type ITerrainTheme } from "./themes";

export interface ITerrainData {
  /** 32-bit 數值種子（由 seed 字串雜湊而來） */
  seed: number;
  /** 每邊網格頂點數（heights 長度 = resolution * resolution） */
  resolution: number;
  /** world 尺寸（寬 = 深 = size；島嶼置中） */
  size: number;
  /** 高度場，row-major（z 外圈、x 內圈）；海面為 y=0，水下為負 */
  heights: Float32Array;
  theme: ITerrainTheme;
}

export interface IGenerateTerrainOptions {
  /** 每邊網格頂點數，預設 96 */
  resolution?: number;
}

const SEA_FLOOR_DEPTH = 1.6;

/**
 * 單點地形高度（純函式）：
 * 島形 = 噪聲扭曲的放射狀 falloff；高度 = falloff × fBm 丘陵
 */
export const terrainHeightAt = (
  x: number,
  z: number,
  seed: number,
  theme: ITerrainTheme
): number => {
  const radius = theme.islandRadius;
  const distance = Math.sqrt(x * x + z * z);

  // 海岸線不規則：依方位角扭曲有效半徑
  const angle = Math.atan2(z, x);
  const coastNoise = valueNoise2D(Math.cos(angle) * 1.7 + 5, Math.sin(angle) * 1.7 + 5, seed);
  const effectiveRadius = radius * (1 - theme.coastRoughness * 0.35 * coastNoise);

  // 放射狀 falloff：中心 1 → 岸邊 0，之後入海為負
  const t = distance / effectiveRadius;
  if (t >= 1.35) return -SEA_FLOOR_DEPTH;
  const falloff = t < 1 ? 1 - t * t * (3 - 2 * t) : 0;

  // fBm 丘陵（頻率依主題）
  const nf = theme.noiseFrequency / radius;
  const hills = fbm2D(x * nf + 11, z * nf + 7, seed);

  const landHeight = falloff * (0.25 + 0.75 * hills) * theme.hillAmplitude;

  if (t < 1) {
    // 岸邊抬升出海面一點，避免沙灘貼齊水面閃爍
    return landHeight + 0.18 * falloff + 0.06;
  }
  // 岸外緩降到海床
  const underwater = (t - 1) / 0.35;
  return 0.06 - underwater * (SEA_FLOOR_DEPTH + 0.06);
};

/**
 * 生成整張高度場。同一 seedInput + personaType + resolution 輸出恆定。
 */
export const generateTerrain = (
  seedInput: string,
  personaType: string | null,
  options: IGenerateTerrainOptions = {}
): ITerrainData => {
  const resolution = options.resolution ?? 96;
  const theme = getTerrainTheme(personaType);
  const seed = hashSeed(`island:${seedInput}`);
  const size = theme.islandRadius * 2 * 1.6;

  const heights = new Float32Array(resolution * resolution);
  const step = size / (resolution - 1);
  const half = size / 2;
  for (let zi = 0; zi < resolution; zi++) {
    for (let xi = 0; xi < resolution; xi++) {
      const x = -half + xi * step;
      const z = -half + zi * step;
      heights[zi * resolution + xi] = terrainHeightAt(x, z, seed, theme);
    }
  }

  return { seed, resolution, size, heights, theme };
};

/**
 * 雙線性取樣任意 world 座標的地形高度（供角色貼地與物件擺放）
 */
export const sampleTerrainHeight = (data: ITerrainData, x: number, z: number): number => {
  const { resolution, size, heights } = data;
  const half = size / 2;
  const step = size / (resolution - 1);
  const gx = (x + half) / step;
  const gz = (z + half) / step;
  const x0 = Math.max(0, Math.min(resolution - 2, Math.floor(gx)));
  const z0 = Math.max(0, Math.min(resolution - 2, Math.floor(gz)));
  const tx = Math.max(0, Math.min(1, gx - x0));
  const tz = Math.max(0, Math.min(1, gz - z0));
  const h00 = heights[z0 * resolution + x0] ?? 0;
  const h10 = heights[z0 * resolution + x0 + 1] ?? 0;
  const h01 = heights[(z0 + 1) * resolution + x0] ?? 0;
  const h11 = heights[(z0 + 1) * resolution + x0 + 1] ?? 0;
  const a = h00 + (h10 - h00) * tx;
  const b = h01 + (h11 - h01) * tx;
  return a + (b - a) * tz;
};
