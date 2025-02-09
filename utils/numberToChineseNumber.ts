/**
 * 將數字轉換為中文數字
 * @param num 數字
 * @returns 中文數字
 */
export default function numberToChineseNumber(num: number) {
  if (typeof num !== 'number') return '';

  const digits = [
    '零',
    '一',
    '二',
    '三',
    '四',
    '五',
    '六',
    '七',
    '八',
    '九',
    '十',
  ] as const;

  if (num <= 10) {
    return digits[num];
  }

  if (num > 99) {
    throw new Error('Only supports numbers between 0-99');
  }

  const tens = Math.floor(num / 10);
  const ones = num % 10;

  let result = tens === 1 ? digits[10] : `${digits[tens]}${digits[10]}`;

  if (ones > 0) {
    result += digits[ones];
  }

  return result;
}
