/** 依建立時間新到舊排序；同時間或時間無法解析時以 id 大者在前（#521 AC-04） */
export function newestFirst(
  a: { id: number; createdAt: string },
  b: { id: number; createdAt: string }
): number {
  return Date.parse(b.createdAt) - Date.parse(a.createdAt) || b.id - a.id;
}
