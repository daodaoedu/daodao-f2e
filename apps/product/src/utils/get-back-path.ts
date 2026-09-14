import { HOME_TAB_PATHS } from "@/constants/home-navigation";

export function getBackPath(from: string | null): string {
  if (from && from in HOME_TAB_PATHS) {
    return HOME_TAB_PATHS[from as keyof typeof HOME_TAB_PATHS];
  }
  return HOME_TAB_PATHS.mine;
}
