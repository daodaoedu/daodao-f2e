/**
 * 品質分級：初始依裝置偵測，執行期由 fps 採樣降級（task 4.4 接自動降級 UI 流程）
 */

export const QualityTier = {
  high: "high",
  medium: "medium",
  low: "low",
} as const;
export type QualityTierType = (typeof QualityTier)[keyof typeof QualityTier];

export interface IQualityProfile {
  /** devicePixelRatio 上限 */
  pixelRatioCap: number;
  shadows: boolean;
  antialias: boolean;
}

export const QUALITY_PROFILES: Record<QualityTierType, IQualityProfile> = {
  high: { pixelRatioCap: 2, shadows: true, antialias: true },
  medium: { pixelRatioCap: 1.5, shadows: true, antialias: true },
  low: { pixelRatioCap: 1, shadows: false, antialias: false },
};

/** 降一級；已是 low 則維持 */
export const degradeTier = (tier: QualityTierType): QualityTierType => {
  if (tier === QualityTier.high) return QualityTier.medium;
  return QualityTier.low;
};

/**
 * 初始品質偵測：行動裝置或低核心數從 medium 起跳，其餘 high。
 * 保守起步——之後靠 fps 採樣動態降級，比錯估高檔後卡頓好。
 */
export const detectInitialQuality = (): QualityTierType => {
  if (typeof navigator === "undefined") return QualityTier.medium;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency ?? 4;
  if (isMobile) return QualityTier.medium;
  if (cores <= 4) return QualityTier.medium;
  return QualityTier.high;
};

/**
 * fps 採樣器：滾動視窗平均，供引擎判斷是否降級
 */
export const createFpsSampler = (windowSize = 60) => {
  const samples: number[] = [];
  return {
    /** 餵入單幀 delta 秒數 */
    push(deltaSeconds: number): void {
      if (deltaSeconds <= 0) return;
      samples.push(1 / deltaSeconds);
      if (samples.length > windowSize) samples.shift();
    },
    /** 視窗內平均 fps；樣本不足回傳 null */
    average(): number | null {
      if (samples.length < windowSize / 2) return null;
      return samples.reduce((sum, fps) => sum + fps, 0) / samples.length;
    },
    reset(): void {
      samples.length = 0;
    },
  };
};
