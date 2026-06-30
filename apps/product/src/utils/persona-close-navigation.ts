import { HOME_TAB_PATHS } from "@/constants/home-navigation";

export type PersonaCloseTarget = { action: "back" } | { action: "push"; path: string };

export function resolvePersonaCloseTarget(canGoBack: boolean): PersonaCloseTarget {
  if (canGoBack) return { action: "back" };
  return { action: "push", path: HOME_TAB_PATHS.persona };
}
