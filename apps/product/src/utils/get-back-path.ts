import { HOME_TAB_PATHS } from "@/constants/home-navigation";

export function getBackPath(from: string | null): string {
  return from === "inspire" ? HOME_TAB_PATHS.inspire : HOME_TAB_PATHS.mine;
}
