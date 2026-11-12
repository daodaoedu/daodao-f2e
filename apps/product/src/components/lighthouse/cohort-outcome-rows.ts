/**
 * 參與者進度表一列是「參與者 × 實踐」，但「發佈留言」以人計算。
 * 同一人只在其連續列的第一列顯示，避免被誤讀為各實踐分開計算、或加總時重複計入。
 */
export function isFirstRowOfPerson(
  rows: ReadonlyArray<{ userId: number }>,
  index: number
): boolean {
  return index === 0 || rows[index - 1]?.userId !== rows[index]?.userId;
}
