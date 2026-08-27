"use client";

import { ArrowLeftOutlineSvg, ArrowRightOutlineSvg, VerticalFullSvg } from "@daodao/assets";
import favicon256Png from "@daodao/assets/images/brand/favicon256.png";
import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { AccountMenu } from "./account-menu";
import { BreathingDot } from "./breathing-dot";
import { menuItems } from "./constant";
import type { SidebarProps } from "./type";

export const DesktopSidebar = ({ identifier }: SidebarProps) => {
  const pathname = usePathname();
  const t = useTranslations("app_product");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <nav
      className={cn(
        "fixed left-0 top-0 flex flex-col h-screen bg-[#F9FEFF]/70 border-r-2 border-[#C1ECFF] backdrop-blur-[15px] rounded-r-3xl z-30 transition-all duration-300 ease-in-out overflow-hidden",
        isCollapsed ? "w-[68px]" : "w-[132px]"
      )}
      style={{ paddingTop: 44, paddingBottom: 44 }}
    >
      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute z-10 size-[30px] rounded-full bg-white hover:bg-gray-50 transition-all duration-300",
          isCollapsed ? "top-3 left-1/2 -translate-x-1/2" : "top-3 right-[10px]"
        )}
        onClick={handleToggleSidebar}
        aria-label={isCollapsed ? t("sidebar_expand") : t("sidebar_collapse")}
      >
        {isCollapsed ? (
          <ArrowRightOutlineSvg className="size-[18px] text-gray-400" />
        ) : (
          <ArrowLeftOutlineSvg className="size-[18px] text-gray-400" />
        )}
      </Button>

      {/* Logo */}
      <div className="relative mb-2">
        <CustomLink href="/" aria-label={t("back_to_website")}>
          <div
            className={cn(
              "flex justify-center transition-all duration-300",
              isCollapsed && "opacity-0 scale-50 pointer-events-none absolute inset-0"
            )}
          >
            <VerticalFullSvg className="size-16" />
          </div>
          <div
            className={cn(
              "flex justify-center transition-all duration-300",
              !isCollapsed && "opacity-0 scale-150 pointer-events-none absolute inset-0"
            )}
          >
            <Image src={favicon256Png.src} alt="daodao logo" width={40} height={40} />
          </div>
        </CustomLink>
      </div>

      {/* Nav items */}
      <ul className="flex flex-col gap-[10px] flex-1">
        {menuItems.map((item) => {
          const isActive = item.isMatch(pathname, identifier);
          const Icon = isActive ? item.activeIcon : item.icon;
          const label = t(item.labelKey);
          const isNotifications = item.href === "/notifications";

          return (
            <li key={item.labelKey}>
              <CustomLink
                href={typeof item.href === "function" ? item.href(identifier) : item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-[9px] text-text-dark cursor-pointer transition-all duration-200",
                  isCollapsed && "justify-center px-0"
                )}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="relative inline-flex shrink-0">
                  {isNotifications ? (
                    <NotificationBell isActive={isActive} className="[&_svg]:size-6" />
                  ) : (
                    <Icon
                      className={cn(
                        "size-6 transition-colors",
                        isActive ? "text-logo-cyan opacity-100" : "text-text-dark opacity-45"
                      )}
                    />
                  )}
                  {item.badge === "breathing-dot" && <BreathingDot />}
                </span>
                {!isCollapsed && (
                  <span
                    className={cn(
                      "text-sm whitespace-nowrap transition-all duration-300",
                      isActive ? "font-medium" : "font-normal"
                    )}
                  >
                    {label}
                  </span>
                )}
              </CustomLink>
            </li>
          );
        })}
      </ul>

      {/* Account menu at bottom */}
      <AccountMenu isCollapsed={isCollapsed} />
    </nav>
  );
};
