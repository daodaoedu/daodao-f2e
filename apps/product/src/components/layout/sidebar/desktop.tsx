"use client";

import { ArrowLeftOutlineSvg, ArrowRightOutlineSvg, VerticalFullSvg } from "@daodao/assets";
import favicon256Png from "@daodao/assets/images/brand/favicon256.png";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { menuItems } from "./constant";
import type { SidebarProps } from "./type";

const USER_MENU_ITEMS = [
  { labelKey: "nav_settings", href: "/settings", emoji: "gear" },
  { labelKey: "nav_language", href: "/settings/preferences", emoji: "globe" },
  { labelKey: "nav_feedback", href: "/feedback", emoji: "speech" },
] as const;

export const DesktopSidebar = ({ identifier, userName, photoURL }: SidebarProps) => {
  const pathname = usePathname();
  const t = useTranslations("app_product");
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const initials = userName ? userName.charAt(0).toUpperCase() : "U";

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
        aria-label={isCollapsed ? t("sidebar_expand") : t("sidebar_collapse")}
      >
        {isCollapsed ? (
          <ArrowRightOutlineSvg className="size-6 text-gray-500" />
        ) : (
          <ArrowLeftOutlineSvg className="size-6 text-gray-500" />
        )}
      </Button>

      <div className="flex-1 relative">
        <CustomLink href="/" aria-label={t("back_to_website")}>
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
              isCollapsed || "opacity-0 scale-150 -translate-y-[28px] pointer-events-none"
            )}
          >
            <Image src={favicon256Png.src} alt="daodao logo" width={60} height={60} />
          </div>
        </CustomLink>
      </div>

      {/* Menu Items */}
      <ul className={cn("flex flex-col", isCollapsed ? "gap-6 items-center" : "gap-6")}>
        {menuItems.map((item) => {
          const isActive = item.isMatch(pathname, identifier);
          const Icon = isActive ? item.activeIcon : item.icon;
          const label = t(item.labelKey);
          return (
            <li
              key={item.labelKey}
              className={cn(
                isCollapsed ? "w-full flex justify-center" : "",
                item.hidden && "hidden"
              )}
            >
              <CustomLink
                href={typeof item.href === "function" ? item.href(identifier) : item.href}
                className={cn(
                  "flex items-center px-6 py-3 text-text-dark cursor-pointer transition-all duration-300",
                  isCollapsed ? "justify-center" : "gap-2"
                )}
                aria-label={label}
              >
                {item.href === "/notifications" ? (
                  <NotificationBell isActive={isActive} />
                ) : (
                  <Icon
                    className={cn(
                      "shrink-0 size-9 text-light-gray transition-colors",
                      isActive && "text-logo-cyan"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "flex-1 text-base font-normal transition-all duration-300 whitespace-nowrap",
                    isActive && "font-medium",
                    isCollapsed && "flex-0 overflow-hidden"
                  )}
                >
                  {label}
                </span>
              </CustomLink>
            </li>
          );
        })}
      </ul>

      {/* User Menu */}
      <div className={cn("mt-6 px-4 pb-4", isCollapsed && "px-2")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded-xl p-2 transition-colors hover:bg-white/60",
                isCollapsed && "justify-center"
              )}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#16B9B3] text-sm font-medium text-white">
                {photoURL ? (
                  <Image
                    src={photoURL}
                    alt={userName ?? ""}
                    width={36}
                    height={36}
                    className="size-9 rounded-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              {!isCollapsed && (
                <span className="flex-1 truncate text-left text-sm text-text-dark">
                  {userName || t("nav_my_island")}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {USER_MENU_ITEMS.map((menuItem) => (
              <DropdownMenuItem key={menuItem.labelKey} asChild>
                <CustomLink
                  href={menuItem.href}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-text-dark hover:bg-accent"
                >
                  {t(menuItem.labelKey)}
                </CustomLink>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => logout()} className="text-[#EF4444]">
              {t("nav_logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
