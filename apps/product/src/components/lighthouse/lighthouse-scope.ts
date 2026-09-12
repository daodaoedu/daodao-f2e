/**
 * 燈塔區域的元件字級對齊原型：@daodao/ui Button 預設 body-md（16px/400），
 * 原型（prototype/lighthouse-admin-preview）所有按鈕為 14px/600。
 * 用 descendant arbitrary variant 一次覆蓋，套在 lighthouse shell 的 <main> 與各 Dialog（portal 在 main 之外）。
 */
export const LIGHTHOUSE_SCOPE = "[&_button.body-md]:text-sm [&_button.body-md]:font-semibold";
