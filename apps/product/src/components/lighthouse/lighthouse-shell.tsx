"use client";

import { HomeOutlineSvg } from "@daodao/assets";
import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { Button } from "@daodao/ui/components/button";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { cn } from "@daodao/ui/lib/utils";
import {
  Archive,
  BookOpenText,
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  RadioTower,
} from "lucide-react";
import { useState } from "react";
import { LighthouseIcon } from "@/components/layout/sidebar/constant";
import {
  LighthouseOrganizationContent,
  LighthouseOrganizationProvider,
  useLighthouseOrganization,
} from "./lighthouse-organization-context";

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
  { href: "/lighthouse/archive", labelKey: "nav_archive", icon: Archive, exact: false },
] as const;

export function LighthouseShell({ children }: LighthouseShellProps) {
  const pathname = usePathname();
  if (pathname === "/lighthouse/access-required") return <>{children}</>;
  return (
    <LighthouseOrganizationProvider>
      <LighthouseShellContent>{children}</LighthouseShellContent>
    </LighthouseOrganizationProvider>
  );
}

function LighthouseShellContent({ children }: LighthouseShellProps) {
  const { href } = useLighthouseOrganization();
  const pathname = usePathname();
  const t = useTranslations("lighthouse");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5FFFD] text-[#0D3036]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-[#CDEBE8] bg-white/95 py-7 transition-[width] duration-300 md:flex md:flex-col",
          isSidebarCollapsed ? "w-[76px] px-3" : "w-64 px-5"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-1 px-1",
            isSidebarCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <CustomLink
            href="/"
            aria-label={t("back_home")}
            title={t("back_home")}
            className="-translate-y-2 grid size-8 place-items-center rounded-lg text-[#5A7B79] hover:bg-[#EDF8F6]"
          >
            <HomeOutlineSvg className="size-5" aria-hidden="true" />
          </CustomLink>
          {!isSidebarCollapsed && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 rounded-lg text-[#5A7B79] hover:bg-[#EDF8F6]"
              aria-label={t("sidebar_collapse")}
              aria-expanded="true"
              aria-controls="lighthouse-sidebar-navigation"
              title={t("sidebar_collapse")}
              onClick={() => setIsSidebarCollapsed(true)}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
        {isSidebarCollapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mx-auto mt-1 size-8 shrink-0 rounded-lg text-[#5A7B79] hover:bg-[#EDF8F6]"
            aria-label={t("sidebar_expand")}
            aria-expanded="false"
            aria-controls="lighthouse-sidebar-navigation"
            title={t("sidebar_expand")}
            onClick={() => setIsSidebarCollapsed(false)}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        )}
        <div
          className={cn(
            "mt-4 flex items-center gap-2 px-1",
            isSidebarCollapsed && "justify-center"
          )}
        >
          <LighthouseIcon className="size-6 text-[#0D7773]" aria-hidden="true" />
          <span
            className={cn(
              "truncate text-lg font-semibold tracking-[-0.03em]",
              isSidebarCollapsed && "sr-only"
            )}
          >
            {t("title")}
          </span>
        </div>

        <nav id="lighthouse-sidebar-navigation" className="mt-8" aria-label={t("navigation_label")}>
          <ul className="space-y-1.5">
            {navigationItems.map((item) => {
              const destination = href(item.href);
              const isActive = item.exact
                ? pathname === destination
                : pathname.startsWith(destination) ||
                  (item.href === "/lighthouse/programs" &&
                    pathname.startsWith("/lighthouse/programs/"));
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <CustomLink
                    href={href(item.href)}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={t(item.labelKey)}
                    title={isSidebarCollapsed ? t(item.labelKey) : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-[12px] py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan",
                      isSidebarCollapsed ? "justify-center px-3" : "px-4",
                      isSidebarCollapsed
                        ? "before:absolute before:-left-3 before:h-5 before:w-1 before:rounded-r-full before:bg-transparent before:transition-all"
                        : "before:absolute before:-left-5 before:h-5 before:w-1 before:rounded-r-full before:bg-transparent before:transition-all",
                      isActive
                        ? "bg-[#E7FAF7] text-[#0D5B59] before:h-9 before:bg-[#16B9B3]"
                        : "text-[#5A7B79] hover:bg-[#F5FFFD] hover:text-[#0D3036]"
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                    {!isSidebarCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
                  </CustomLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <header className="sticky top-0 z-40 border-b border-[#CDEBE8] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <CustomLink
            href="/"
            aria-label={t("back_home")}
            title={t("back_home")}
            className="grid size-9 place-items-center"
          >
            <HomeOutlineSvg className="size-5" aria-hidden="true" />
          </CustomLink>
          <LighthouseIcon className="size-5 text-[#0D7773]" aria-hidden="true" />
          <span className="truncate font-semibold tracking-[-0.02em]">{t("title")}</span>
        </div>
        <nav className="mt-3 overflow-x-auto" aria-label={t("navigation_label")}>
          <ul className="flex min-w-max gap-2 pb-1">
            {navigationItems.map((item) => {
              const destination = href(item.href);
              const isActive = item.exact
                ? pathname === destination
                : pathname.startsWith(destination) ||
                  (item.href === "/lighthouse/programs" &&
                    pathname.startsWith("/lighthouse/programs/"));
              return (
                <li key={item.href}>
                  <CustomLink
                    href={href(item.href)}
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
          "min-h-screen transition-[padding-left] duration-300",
          isSidebarCollapsed ? "md:pl-[76px]" : "md:pl-64"
        )}
      >
        <LighthouseOrganizationContent>{children}</LighthouseOrganizationContent>
      </main>
    </div>
  );
}
