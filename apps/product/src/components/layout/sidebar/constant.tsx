import {
  BellOutlineSvg,
  BellSolidSvg,
  HomeOutlineSvg,
  HomeSolidSvg,
  ManageOutlineSvg,
  MessagesOutlineSvg,
  SpacesOutlineSvg,
  UserOutlineSvg,
  UserSolidSvg,
} from "@daodao/assets";

export type MenuItem = {
  activeIcon: typeof HomeSolidSvg;
  icon: typeof HomeOutlineSvg;
  labelKey: string;
  href: string | ((identifier: string) => string);
  hidden?: boolean;
  isMatch: (pathname: string, identifier: string) => boolean;
  badge?: "breathing-dot" | "unread-count";
};

export const menuItems: MenuItem[] = [
  {
    activeIcon: HomeSolidSvg,
    icon: HomeOutlineSvg,
    labelKey: "nav_home",
    href: "/",
    isMatch: (pathname: string) => pathname === "/",
  },
  {
    activeIcon: SpacesOutlineSvg,
    icon: SpacesOutlineSvg,
    labelKey: "nav_spaces",
    href: "/spaces",
    badge: "breathing-dot",
    isMatch: (pathname: string) => pathname.startsWith("/spaces"),
  },
  {
    activeIcon: MessagesOutlineSvg,
    icon: MessagesOutlineSvg,
    labelKey: "nav_messages",
    href: "/messages",
    badge: "unread-count",
    isMatch: (pathname: string) => pathname.startsWith("/messages"),
  },
  {
    activeIcon: ManageOutlineSvg,
    icon: ManageOutlineSvg,
    labelKey: "nav_manage",
    href: "/lighthouse",
    isMatch: (pathname: string) =>
      pathname.startsWith("/lighthouse") || pathname.startsWith("/manage"),
  },
  {
    activeIcon: BellSolidSvg,
    icon: BellOutlineSvg,
    labelKey: "nav_notifications",
    href: "/notifications",
    isMatch: (pathname: string) => pathname === "/notifications",
  },
  {
    activeIcon: UserSolidSvg,
    icon: UserOutlineSvg,
    labelKey: "nav_my_island",
    href: (identifier: string) => `/users/${identifier}`,
    isMatch: (pathname: string, identifier: string) => pathname.startsWith(`/users/${identifier}`),
  },
];
