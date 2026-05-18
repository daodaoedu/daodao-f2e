export function computeBodyDisplayLeft(
  bodyX: number,
  bodyWidth: number,
  wallThickness: number
): number {
  return bodyX - bodyWidth / 2 - wallThickness;
}
