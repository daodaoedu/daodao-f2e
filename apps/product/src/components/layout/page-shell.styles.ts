import { cn } from "@daodao/ui/lib/utils";

/**
 * `(with-layout)` 頁面的外層 wrapper。
 *
 * `w-full` 而非 `w-screen`：外層 `(with-layout)/layout.tsx` 有 `md:pl-[132px]`，
 * `100vw` 會疊在 padding 上讓整頁右偏 132px（daodao#233）。
 */
export const PAGE_SHELL_WRAPPER_CLASS =
  "relative w-full min-h-screen z-10 overflow-hidden overflow-y-auto";

/** `main` 預設：單欄 448px 置中，桌機上緣留白較大。 */
export const PAGE_SHELL_MAIN_CLASS = "max-w-[448px] mx-auto px-5 pb-[64px] pt-3 md:pt-12";

export const pageShellWrapperClassName = (className?: string) =>
  cn(PAGE_SHELL_WRAPPER_CLASS, className);

export const pageShellMainClassName = (className?: string) => cn(PAGE_SHELL_MAIN_CLASS, className);
