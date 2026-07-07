"use client";

import { UserOutlineSvg, UserSolidSvg } from "@daodao/assets";
import favicon256Png from "@daodao/assets/images/brand/favicon256.png";
import { useAuth } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { CustomLink } from "@daodao/ui/components/custom-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@daodao/ui/components/dropdown-menu";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { menuItems } from "./constant";
import type { SidebarProps } from "./type";

gsap.registerPlugin(ScrollTrigger);

const USER_MENU_ITEMS = [
  { labelKey: "nav_settings", href: "/settings" },
  { labelKey: "nav_language", href: "/settings/preferences" },
  { labelKey: "nav_feedback", href: "/feedback" },
] as const;

export const MobileSidebar = ({ identifier, userName, photoURL }: SidebarProps) => {
  const pathname = usePathname();
  const t = useTranslations("app_product");
  const { logout } = useAuth();
  const logoRef = useRef<HTMLDivElement>(null);

  const isHomePage = pathname === "/" || pathname === "/en" || pathname === "/zh-TW";
  const isOnIsland = pathname.startsWith(`/users/${identifier}`);

  useEffect(() => {
    const logoElement = logoRef.current;
    if (!logoElement || !isHomePage) return;

    const threshold = 167;
    const minOpacity = 0.3;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: `${threshold}px top`,
        scrub: 0.3,
        invalidateOnRefresh: true,
      },
    });

    tl.to(logoElement, {
      opacity: minOpacity,
      ease: "none",
    });

    gsap.set(logoElement, { opacity: 1 });

    return () => {
      tl.kill();
      gsap.set(logoElement, { opacity: 1 });
    };
  }, [isHomePage]);

  const navItems = menuItems;

  return (
    <>
      <div ref={logoRef} className="fixed top-5 left-5 z-20">
        <CustomLink href="/" aria-label={t("back_to_website")}>
          <Image src={favicon256Png.src} alt="daodao logo" width={40} height={40} />
        </CustomLink>
      </div>
      <nav
        className={cn(
          "fixed left-0 right-0 bottom-0 bg-[#F9FEFF]/70 border-t border-2 border-[#C1ECFF] backdrop-blur-[15px] rounded-t-3xl z-30"
        )}
      >
        <ul className="flex px-10 py-3 justify-evenly">
          {navItems.map((item) => {
            const isActive = item.isMatch(pathname, identifier);
            const Icon = isActive ? item.activeIcon : item.icon;
            return (
              <li key={item.labelKey} className={cn(item.hidden && "hidden")}>
                <CustomLink
                  href={typeof item.href === "function" ? item.href(identifier) : item.href}
                  className="flex items-center text-text-dark"
                  aria-label={t(item.labelKey)}
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
                </CustomLink>
              </li>
            );
          })}
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex items-center" aria-label={t("nav_my_island")}>
                  {photoURL ? (
                    <Image
                      src={photoURL}
                      alt={userName ?? ""}
                      width={36}
                      height={36}
                      className={cn(
                        "size-9 rounded-full object-cover ring-2 ring-transparent transition-all",
                        isOnIsland && "ring-logo-cyan"
                      )}
                    />
                  ) : isOnIsland ? (
                    <UserSolidSvg className="size-9 text-logo-cyan" />
                  ) : (
                    <UserOutlineSvg className="size-9 text-light-gray" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" sideOffset={12} className="w-44">
                {USER_MENU_ITEMS.map((menuItem) => (
                  <DropdownMenuItem key={menuItem.labelKey} asChild>
                    <CustomLink
                      href={menuItem.href}
                      className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-text-dark"
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
          </li>
        </ul>
      </nav>
    </>
  );
};
