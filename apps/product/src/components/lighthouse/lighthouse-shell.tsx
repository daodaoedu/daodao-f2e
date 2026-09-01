"use client";

import { useLighthouseOrganizations } from "@daodao/api";
import favicon256Png from "@daodao/assets/images/brand/favicon256.png";
import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { getStorage, StorageEnum } from "@daodao/shared";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { cn } from "@daodao/ui/lib/utils";
import {
  BookOpenText,
  Building2,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  RadioTower,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface LighthouseShellProps {
  children: React.ReactNode;
}

const navigationItems = [
  { href: "/lighthouse", labelKey: "nav_overview", icon: LayoutDashboard, exact: true },
  { href: "/lighthouse/programs", labelKey: "nav_programs", icon: RadioTower, exact: false },
  { href: "/lighthouse/templates", labelKey: "nav_templates", icon: BookOpenText, exact: false },
  {
    href: "/lighthouse/organization",
    labelKey: "nav_organization",
    icon: Building2,
    exact: false,
  },
] as const;

/** 側邊欄收合狀態存在瀏覽器（@daodao/shared getStorage）；寬度依 FRD-OV-01：展開 256px、收合 76px */
const collapsedStorage = () => getStorage<boolean>(StorageEnum.LighthouseSidebarCollapsed);

function useSidebarCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    setCollapsed(collapsedStorage().get() === true);
  }, []);
  const toggle = () => {
    setCollapsed((current) => {
      const next = !current;
      collapsedStorage().set(next);
      return next;
    });
  };
  return [collapsed, toggle];
}

export function LighthouseShell({ children }: LighthouseShellProps) {
  const pathname = usePathname();
  const t = useTranslations("lighthouse");
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const { organizations } = useLighthouseOrganizations();
  const organization = organizations?.[0];
  const organizationName = organization?.name ?? t("title");
  const organizationInitial = organizationName.trim().charAt(0) || "燈";

  return (
    <div className="min-h-screen bg-[#F5FFFD] text-[#0D3036]">
      <aside
        data-collapsed={collapsed ? "1" : "0"}
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-[#CDEBE8] bg-white/95 py-5 transition-[width] duration-200 md:flex md:flex-col",
          collapsed ? "w-[76px] px-3" : "w-64 px-5"
        )}
      >
        <div className={cn("flex items-center gap-2", collapsed ? "flex-col" : "justify-between")}>
          <CustomLink
            href="/"
            aria-label={t("back_home")}
            title={t("back_home")}
            className="grid size-10 shrink-0 place-items-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
          >
            <Image src={favicon256Png.src} alt="daodao logo" width={32} height={32} />
          </CustomLink>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            aria-label={collapsed ? t("sidebar_expand") : t("sidebar_collapse")}
            aria-expanded={!collapsed}
            title={collapsed ? t("sidebar_expand") : t("sidebar_collapse")}
            className="size-9 text-[#5A7B79] hover:bg-[#EDF8F6] hover:text-[#0D3036]"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-[18px]" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="size-[18px]" aria-hidden="true" />
            )}
          </Button>
        </div>

        <div
          className={cn("mt-6 flex items-center gap-3", collapsed ? "justify-center" : "px-1")}
          data-lh-org
        >
          <span
            className="relative grid size-11 shrink-0 place-items-center rounded-full bg-[#0D3036] text-base font-semibold text-white"
            aria-hidden="true"
          >
            {organizationInitial}
            <span className="absolute -right-1 top-1 size-2.5 rounded-full bg-[#FFA10B] ring-2 ring-white" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-lg font-semibold tracking-[-0.03em]">
                {organizationName}
              </span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#5A7B79]">
                {t("coach_workspace")}
              </span>
            </span>
          )}
          {collapsed && <span className="sr-only">{organizationName}</span>}
        </div>

        <nav className="mt-8" aria-label={t("navigation_label")}>
          <ul className="space-y-1.5">
            {navigationItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <CustomLink
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={collapsed ? t(item.labelKey) : undefined}
                    title={collapsed ? t(item.labelKey) : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan",
                      "before:absolute before:h-5 before:w-1 before:rounded-r-full before:bg-transparent before:transition-all",
                      collapsed ? "justify-center px-0 before:-left-3" : "px-4 before:-left-5",
                      isActive
                        ? "bg-[#E7FAF7] text-[#0D5B59] before:h-9 before:bg-[#16B9B3]"
                        : "text-[#5A7B79] hover:bg-[#F5FFFD] hover:text-[#0D3036]"
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                    {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
                  </CustomLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {!collapsed && (
          <div className="mt-auto border-t border-[#DDEFED] pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78928F]">
              {t("principle_label")}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#345E5B]">{t("principle_copy")}</p>
          </div>
        )}
      </aside>

      <header className="sticky top-0 z-40 border-b border-[#CDEBE8] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <CustomLink
            href="/"
            aria-label={t("back_home")}
            className="grid size-9 place-items-center"
          >
            <Image src={favicon256Png.src} alt="daodao logo" width={28} height={28} />
          </CustomLink>
          <span className="truncate font-semibold tracking-[-0.02em]">{organizationName}</span>
        </div>
        <nav className="mt-3 overflow-x-auto" aria-label={t("navigation_label")}>
          <ul className="flex min-w-max gap-2 pb-1">
            {navigationItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <CustomLink
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "block rounded-full px-3.5 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-logo-cyan",
                      isActive ? "bg-[#0D3036] text-white" : "bg-[#EDF8F6] text-[#345E5B]"
                    )}
                  >
                    {t(item.labelKey)}
                  </CustomLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main
        className={cn(
          "min-h-screen transition-[padding] duration-200",
          collapsed ? "md:pl-[76px]" : "md:pl-64"
        )}
      >
        {children}
      </main>
    </div>
  );
}
