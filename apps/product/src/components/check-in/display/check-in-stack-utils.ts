/**
 * 計算打卡形狀在容器內的水平顯示位置（CSS left）。
 *
 * 物理引擎的牆面置中在容器邊緣（x=0 與 x=containerWidth），加上寬形狀
 * 可能微幅穿透薄牆，body 中心有時會落在容器邊界之外。這裡以旋轉後的
 * 水平半寬把中心夾在容器內，確保形狀左右都不會被切到。
 */
export function computeBodyDisplayLeft(
  bodyX: number,
  bodyWidth: number,
  bodyHeight: number,
  angleRad: number,
  containerWidth: number
): number {
  // 形狀旋轉後實際佔據的水平半寬
  const rotatedHalfWidth =
    (Math.abs(Math.cos(angleRad)) * bodyWidth + Math.abs(Math.sin(angleRad)) * bodyHeight) / 2;
  const minCenterX = rotatedHalfWidth;
  const maxCenterX = containerWidth - rotatedHalfWidth;
  // 形狀比容器還寬時無法兩邊都塞進去，置中讓兩邊切量相等
  const clampedCenterX =
    maxCenterX > minCenterX
      ? Math.min(Math.max(bodyX, minCenterX), maxCenterX)
      : containerWidth / 2;
  return clampedCenterX - bodyWidth / 2;
}
