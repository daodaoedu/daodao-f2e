/**
 * 燈塔對話框內按鈕字級對齊原型：@daodao/ui Button 預設 body-md（16px/400），
 * 原型（prototype/lighthouse-admin-preview）的 modal footer／確認鈕為 14px/600；
 * 頁面層級的主要按鈕（建立模板、儲存）原型本身就是 16px/400，所以只套在 Dialog，不套整個 shell。
 */
export const LIGHTHOUSE_SCOPE = "[&_button.body-md]:text-sm [&_button.body-md]:font-semibold";
