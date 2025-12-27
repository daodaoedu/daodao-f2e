"use client";

import {
  ArrowLeftOutlineSvg,
  ArrowRightOutlineSvg,
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
  VerticalFullSvg,
} from "@daodao/assets";
import favicon256Png from "@daodao/assets/images/brand/favicon256.png";
import { usePathname } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";

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

export const Sidebar = () => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <nav
      className={cn(
        "fixed left-0 top-0 py-[60px] flex flex-col h-screen bg-[#F9FEFF]/70 border-r border-2 border-[#C1ECFF] backdrop-blur-[15px] rounded-r-3xl z-30 transition-all duration-300 ease-in-out overflow-hidden",
        isCollapsed ? "w-[92px]" : "w-44"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute bg-white hover:bg-gray-50 transition-all duration-300",
          isCollapsed ? "top-4 left-1/2 -translate-x-1/2" : "top-4 right-3"
        )}
        onClick={handleToggleSidebar}
        aria-label={isCollapsed ? "展開側邊欄" : "收合側邊欄"}
      >
        {isCollapsed ? (
          <ArrowRightOutlineSvg className="size-6 text-gray-500" />
        ) : (
          <ArrowLeftOutlineSvg className="size-6 text-gray-500" />
        )}
      </Button>

      <div className="flex-1 relative">
        <div
          className={cn(
            "ml-10 mr-12 transition-all duration-300 relative z-10",
            isCollapsed && "opacity-0 scale-[45%] translate-y-2 -translate-x-4"
          )}
        >
          <VerticalFullSvg className="w-[90px] h-[90px]" />
        </div>
        <div
          className={cn(
            "absolute top-5 left-1/2 -translate-x-1/2 w-fit transition-all duration-300",
            isCollapsed ||
              "opacity-0 scale-150 -translate-y-[28px] pointer-events-none"
          )}
        >
          <Image
            src={favicon256Png.src}
            alt="daodao logo"
            width={60}
            height={60}
          />
        </div>
      </div>

      {/* Menu Items */}
      <ul
        className={cn(
          "flex flex-col",
          isCollapsed ? "gap-6 items-center" : "gap-6"
        )}
      >
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;
          return (
            <li
              key={item.label}
              className={isCollapsed ? "w-full flex justify-center" : ""}
            >
              <CustomLink
                href={item.href}
                className={cn(
                  "flex items-center px-6 py-3 text-text-dark cursor-pointer transition-all duration-300",
                  isCollapsed ? "justify-center" : "gap-2",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
                aria-label={item.label}
              >
                <Icon
                  className={cn(
                    "shrink-0 size-9 text-light-gray transition-colors",
                    isActive && "text-logo-cyan"
                  )}
                />
                <span
                  className={cn(
                    "flex-1 text-base font-normal transition-all duration-300 whitespace-nowrap",
                    isActive && "font-medium",
                    isCollapsed && "flex-0 overflow-hidden"
                  )}
                >
                  {item.label}
                </span>
              </CustomLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
