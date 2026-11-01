import { HOME_TAB_PATHS } from "@/constants/home-navigation";

interface HomeGuestLoginOptions {
  isLoading: boolean;
  isAuthenticated: boolean;
  isMobile: boolean;
  hasPrompted: boolean;
  searchParams: Pick<URLSearchParams, "get" | "toString">;
}

export function getHomeGuestLoginRedirect(options: HomeGuestLoginOptions): string | null {
  if (
    options.isLoading ||
    options.isAuthenticated ||
    !options.isMobile ||
    options.hasPrompted ||
    options.searchParams.get("tab") === "mine"
  ) {
    return null;
  }

  const query = options.searchParams.toString();
  return query ? `${HOME_TAB_PATHS.inspire}?${query}` : HOME_TAB_PATHS.inspire;
}
