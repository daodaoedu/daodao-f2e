"use client";

import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { cn } from "@daodao/ui/lib/utils";
import { BookOpenText, Building2, LayoutDashboard, RadioTower } from "lucide-react";

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

export function LighthouseShell({ children }: LighthouseShellProps) {
  const pathname = usePathname();
  const t = useTranslations("lighthouse");

  return (
    <div className="min-h-screen bg-[#F5FFFD] text-[#0D3036]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#CDEBE8] bg-white/95 px-5 py-7 md:flex md:flex-col">
        <CustomLink
          href="/lighthouse"
          className="group flex items-center gap-3 rounded-xl px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan"
        >
          <span className="relative grid size-11 place-items-center rounded-full bg-[#0D3036] text-white">
            <RadioTower className="size-5" aria-hidden="true" />
            <span className="absolute -right-1 top-1 size-2.5 rounded-full bg-[#FFA10B] ring-2 ring-white" />
          </span>
          <span>
            <span className="block text-lg font-semibold tracking-[-0.03em]">{t("title")}</span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#5A7B79]">
              {t("coach_workspace")}
            </span>
          </span>
        </CustomLink>

        <nav className="mt-10" aria-label={t("navigation_label")}>
          <ul className="space-y-1.5">
            {navigationItems.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <CustomLink
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-logo-cyan",
                      "before:absolute before:-left-5 before:h-5 before:w-1 before:rounded-r-full before:bg-transparent before:transition-all",
                      isActive
                        ? "bg-[#E7FAF7] text-[#0D5B59] before:h-9 before:bg-[#16B9B3]"
                        : "text-[#5A7B79] hover:bg-[#F5FFFD] hover:text-[#0D3036]"
                    )}
                  >
                    <Icon className="size-[18px]" aria-hidden="true" />
                    {t(item.labelKey)}
                  </CustomLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto border-t border-[#DDEFED] pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#78928F]">
            {t("principle_label")}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#345E5B]">{t("principle_copy")}</p>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-[#CDEBE8] bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-[#0D3036] text-white">
            <RadioTower className="size-4" aria-hidden="true" />
          </span>
          <span className="font-semibold tracking-[-0.02em]">{t("title")}</span>
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

      <main className="min-h-screen md:pl-64">{children}</main>
    </div>
  );
}
