import {
  BellOutlineSvg,
  BellSolidSvg,
  HomeOutlineSvg,
  HomeSolidSvg,
  MedalOutlineSvg,
  MedalSolidSvg,
  SearchOutlineSvg,
  SearchSolidSvg,
  UserOutlineSvg,
  UserSolidSvg,
} from "@daodao/assets";

export const menuItems = [
  {
    activeIcon: HomeSolidSvg,
    icon: HomeOutlineSvg,
    label: "我的小島",
    href: "/",
    isMatch: (pathname: string) => pathname === "/",
  },
  {
    activeIcon: SearchSolidSvg,
    icon: SearchOutlineSvg,
    label: "探索社群",
    href: "/explore",
    hidden: true,
    isMatch: (pathname: string) => pathname === "/explore",
  },
  {
    activeIcon: MedalSolidSvg,
    icon: MedalOutlineSvg,
    label: "成長地圖",
    href: "/growth-map",
    hidden: true,
    isMatch: (pathname: string) => pathname === "/growth-map",
  },
  {
    activeIcon: BellSolidSvg,
    icon: BellOutlineSvg,
    label: "最新通知",
    href: "/notifications",
    hidden: true,
    isMatch: (pathname: string) => pathname === "/notifications",
  },
  {
    activeIcon: UserSolidSvg,
    icon: UserOutlineSvg,
    label: "個人資料",
    href: (identifier: string) => `/users/${identifier}`,
    isMatch: (pathname: string, identifier: string) => pathname.startsWith(`/users/${identifier}`),
  },
];
