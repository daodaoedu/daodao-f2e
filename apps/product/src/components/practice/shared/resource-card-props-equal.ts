import type { ResourceCardProps } from "./resource-card";

/**
 * ResourceCard 的 memo 比較：資源內容沒變且 callback 是同一個才跳過重繪。
 * callback 不能忽略——父層每次重繪都帶新的 onRemove（閉包綁著當下的資源清單），
 * 跳過重繪會讓移除鈕拿到舊清單：先新增資源再移除另一筆時，新增的那筆會一起消失（daodao#332）。
 */
export const areResourceCardPropsEqual = (
  prevProps: ResourceCardProps,
  nextProps: ResourceCardProps
): boolean =>
  prevProps.resource.id === nextProps.resource.id &&
  prevProps.resource.name === nextProps.resource.name &&
  prevProps.resource.url === nextProps.resource.url &&
  prevProps.locked === nextProps.locked &&
  prevProps.className === nextProps.className &&
  prevProps.onClick === nextProps.onClick &&
  prevProps.onRemove === nextProps.onRemove;
