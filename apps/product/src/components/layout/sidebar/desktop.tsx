"use client";

import { ArrowLeftOutlineSvg, ArrowRightOutlineSvg, VerticalFullSvg } from "@daodao/assets";
import favicon256Png from "@daodao/assets/images/brand/favicon256.png";
import { useLocale, useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { languageOptions } from "@daodao/i18n/routing";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { LanguageSwitcher } from "@daodao/ui/components/language-switcher";
import { cn } from "@daodao/ui/lib/utils";
import { useState } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { menuItems } from "./constant";
import type { SidebarProps } from "./type";

const CollapsedLocaleBadge = ({ pathname }: { pathname: string }) => {
  const locale = useLocale();
  const nextLocale = languageOptions.find((l) => l.value !== locale) ?? languageOptions[0];

  return (
    <CustomLink
      locale={nextLocale.value}
      href={{ pathname }}
      scroll={false}
      className="text-xs font-medium text-text-dark/60 hover:text-primary-base transition-colors"
      aria-label={`Switch to ${nextLocale.label}`}
    >
      {locale === "zh-TW" ? "中" : "EN"}
    </CustomLink>
  );
};

export const DesktopSidebar = ({ identifier }: SidebarProps) => {
  const pathname = usePathname();
  const t = useTranslations("app_product");
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

      {/* Language Switcher */}
      <div
        className={cn(
          "flex items-center pb-4 pt-2 transition-all duration-300",
          isCollapsed ? "justify-center" : "px-6"
        )}
      >
        {isCollapsed ? <CollapsedLocaleBadge pathname={pathname} /> : <LanguageSwitcher variant="light" />}
      </div>
    </nav>
  );
};
