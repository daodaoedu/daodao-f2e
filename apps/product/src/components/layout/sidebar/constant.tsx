import {
  HomeSolidSvg,
  HomeOutlineSvg,
  SearchSolidSvg,
  SearchOutlineSvg,
  MedalSolidSvg,
  MedalOutlineSvg,
  BellSolidSvg,
  BellOutlineSvg,
  UserSolidSvg,
  UserOutlineSvg,
} from "@daodao/assets";

export const menuItems = [
  {
    activeIcon: HomeSolidSvg,
    icon: HomeOutlineSvg,
    label: "我的小島",
    href: "/",
  },
  {
    activeIcon: SearchSolidSvg,
    icon: SearchOutlineSvg,
    label: "探索社群",
    href: "/explore",
    hidden: true,
  },
  {
    activeIcon: MedalSolidSvg,
    icon: MedalOutlineSvg,
    label: "成長地圖",
    href: "/growth-map",
    hidden: true,
  },
  {
    activeIcon: BellSolidSvg,
    icon: BellOutlineSvg,
    label: "最新通知",
    href: "/notifications",
    hidden: true,
  },
  {
    activeIcon: UserSolidSvg,
    icon: UserOutlineSvg,
    label: "個人資料",
    href: "/profile",
  },
];
