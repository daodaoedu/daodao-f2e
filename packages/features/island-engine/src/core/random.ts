/**
 * Deterministic 亂數工具（純函式）
 *
 * 島嶼生成的一切隨機性都必須來自這裡：
 * 同一種子在任何裝置、任何時間輸出恆定（spec「地形恆定」）。
 */

/**
 * xmur3 字串雜湊：把任意字串（user external_id、checkin id 等）折成 32-bit 種子
 */
export const hashSeed = (input: string): number => {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
};

/**
 * mulberry32 PRNG：回傳 [0, 1) 均勻分布的序列產生器
 */
export const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * 2D 整數格點雜湊：不依賴呼叫順序的 deterministic 值（value noise 的格點值）
 * 回傳 [0, 1)
 */
export const latticeValue = (ix: number, iz: number, seed: number): number => {
  let h = seed >>> 0;
  h = Math.imul(h ^ Math.imul(ix | 0, 374761393), 668265263);
  h = Math.imul(h ^ Math.imul(iz | 0, 2246822519), 3266489917);
  h ^= h >>> 15;
  h = Math.imul(h, 2654435761);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
};

const smootherstep = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);

/**
 * 2D value noise：格點值 + smootherstep 雙線性內插，回傳 [0, 1)
 */
export const valueNoise2D = (x: number, z: number, seed: number): number => {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const v00 = latticeValue(ix, iz, seed);
  const v10 = latticeValue(ix + 1, iz, seed);
  const v01 = latticeValue(ix, iz + 1, seed);
  const v11 = latticeValue(ix + 1, iz + 1, seed);
  const tx = smootherstep(fx);
  const tz = smootherstep(fz);
  const a = v00 + (v10 - v00) * tx;
  const b = v01 + (v11 - v01) * tx;
  return a + (b - a) * tz;
};

/**
 * fBm（fractal Brownian motion）：多八度 value noise 疊加，回傳約 [0, 1)
 */
export const fbm2D = (x: number, z: number, seed: number, octaves = 4): number => {
  let total = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let max = 0;
  for (let i = 0; i < octaves; i++) {
    total += valueNoise2D(x * frequency, z * frequency, seed + i * 1013) * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return total / max;
};
