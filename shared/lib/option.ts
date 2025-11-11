import { OptionProps } from '@/shared/ui/option';

/**
 * 建立 value 到 label 的映射物件，提升查找效能
 * @param options - 選項陣列
 * @returns value 到 label 的映射物件
 */
export const createOptionMap = (
  options: OptionProps[]
): Map<string, string> => {
  const map = new Map<string, string>();
  options.forEach((option) => {
    map.set(option.value, option.label);
  });
  return map;
};

/**
 * 根據 value 從選項陣列中找到對應的 label
 * @param options - 選項陣列
 * @param value - 要查找的值
 * @param defaultLabel - 當找不到時的預設標籤，預設為空字串
 * @returns 對應的 label 或預設值
 */
export const getOptionLabel = (
  options: OptionProps[],
  value: string,
  defaultLabel: string = ''
): string => {
  if (!Array.isArray(options)) {
    return defaultLabel;
  }
  const map = createOptionMap(options);
  return map.get(value) ?? defaultLabel;
};

/**
 * 根據多個 value 從選項陣列中找到對應的 labels
 * @param options - 選項陣列
 * @param values - 要查找的值陣列
 * @param defaultLabels - 當找不到時的預設標籤，預設為空字串
 * @returns 對應的 labels 陣列
 */
export const getOptionLabels = (
  options: OptionProps[],
  values: string[],
  defaultLabels: string[] = []
): string[] => {
  if (!Array.isArray(options) || !Array.isArray(values)) {
    return defaultLabels ?? [];
  }
  const map = createOptionMap(options);
  return values.map((value) => map.get(value) ?? '').filter(Boolean);
};

export const optionListToEnum = <T extends OptionProps[]>(options: T) => {
  return options.reduce(
    (result, option) => ({
      ...result,
      [option.value]: option.value,
    }),
    {} as Record<T[number]['value'], T[number]['value']>
  );
};
