"use client";

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
import favicon256Png from "@daodao/assets/images/brand/favicon256.png";
import { usePathname } from "@daodao/i18n/navigation";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";

const menuItems = [
  {
    activeIcon: HomeSolidSvg,
    icon: HomeOutlineSvg,
    label: "我的小島",
    href: "/",
    disabled: false,
  },
  {
    activeIcon: SearchSolidSvg,
    icon: SearchOutlineSvg,
    label: "探索社群",
    href: "/explore",
    disabled: true,
  },
  {
    activeIcon: MedalSolidSvg,
    icon: MedalOutlineSvg,
    label: "成長地圖",
    href: "/growth-map",
    disabled: true,
  },
  {
    activeIcon: BellSolidSvg,
    icon: BellOutlineSvg,
    label: "最新通知",
    href: "/notifications",
    disabled: true,
  },
  {
    activeIcon: UserSolidSvg,
    icon: UserOutlineSvg,
    label: "個人資料",
    href: "/profile",
    disabled: true,
  },
];

export const MobileSidebar = () => {
  const pathname = usePathname();

  return (
    <>
      <div className="fixed top-5 left-5 z-30">
        <CustomLink href="/" aria-label="回到官網">
          <Image src={favicon256Png.src} alt="daodao logo" width={40} height={40} />
        </CustomLink>
      </div>
      <nav
        className={cn(
          "fixed left-0 right-0 bottom-0 bg-[#F9FEFF]/70 border-t border-2 border-[#C1ECFF] backdrop-blur-[15px] rounded-t-3xl z-30"
        )}
      >
        {/* Menu Items */}
        <ul className="flex px-10 py-3 justify-between">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive ? item.activeIcon : item.icon;
            return (
              <li key={item.label}>
                <CustomLink
                  href={item.href}
                  className={cn(
                    "flex items-center text-text-dark",
                    item.disabled && "opacity-50 pointer-events-none cursor-not-allowed"
                  )}
                  aria-label={item.label}
                >
                  <Icon
                    className={cn(
                      "shrink-0 size-9 text-light-gray transition-colors",
                      isActive && "text-logo-cyan"
                    )}
                  />
                </CustomLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
