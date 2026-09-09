"use client";

import { HomeOutlineSvg, HomeSolidSvg, UserOutlineSvg, UserSolidSvg } from "@daodao/assets";
import favicon256Png from "@daodao/assets/images/brand/favicon256.png";
import { useAuthContext } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { MobileBottomSheet } from "./mobile-bottom-sheet";
import type { SidebarProps } from "./type";

gsap.registerPlugin(ScrollTrigger);

export const MobileSidebar = ({ identifier }: SidebarProps) => {
  const pathname = usePathname();
  const t = useTranslations("app_product");
  const { user } = useAuthContext();
  const logoRef = useRef<HTMLDivElement>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const displayName = user?.name || user?.email?.split("@")[0] || "";
  const initial = displayName.charAt(0).toUpperCase();

  const isHomePage = pathname === "/" || pathname === "/en" || pathname === "/zh-TW";

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

    tl.to(logoElement, { opacity: minOpacity, ease: "none" });
    gsap.set(logoElement, { opacity: 1 });

    return () => {
      tl.kill();
      gsap.set(logoElement, { opacity: 1 });
    };
  }, [isHomePage]);

  const isHomeActive = pathname === "/";
  const isNotificationsActive = pathname === "/notifications";
  const isMyIslandActive = pathname.startsWith(`/users/${identifier}`);

  const handleAvatarClick = useCallback(() => {
    setIsSheetOpen(true);
  }, []);

  const handleSheetClose = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const HomeIcon = isHomeActive ? HomeSolidSvg : HomeOutlineSvg;
  const MyIslandIcon = isMyIslandActive ? UserSolidSvg : UserOutlineSvg;

  const navItemClass =
    "flex size-11 items-center justify-center rounded-xl transition-colors hover:bg-logo-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-logo-cyan";
  const iconClass = "size-7 shrink-0 transition-colors";

  return (
    <>
      <div ref={logoRef} className="fixed top-5 left-5 z-20">
        <CustomLink href="/" aria-label={t("back_to_website")}>
          <Image src={favicon256Png.src} alt="daodao logo" width={40} height={40} />
        </CustomLink>
      </div>
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 rounded-t-3xl border-2 border-b-0 border-[#C1ECFF] bg-[#F9FEFF]/90 backdrop-blur-[15px]"
        aria-label={t("mobile_navigation")}
      >
        <ul className="flex items-center justify-evenly px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {/* Home */}
          <li className="flex flex-1 justify-center">
            <CustomLink
              href="/"
              className={navItemClass}
              aria-label={t("nav_home")}
              aria-current={isHomeActive ? "page" : undefined}
            >
              <HomeIcon
                className={cn(
                  iconClass,
                  isHomeActive ? "text-logo-cyan opacity-100" : "text-light-gray opacity-45"
                )}
              />
            </CustomLink>
          </li>

          {/* Notifications */}
          <li className="flex flex-1 justify-center">
            <CustomLink
              href="/notifications"
              className={navItemClass}
              aria-label={t("nav_notifications")}
              aria-current={isNotificationsActive ? "page" : undefined}
            >
              <NotificationBell isActive={isNotificationsActive} className="[&_svg]:size-7" />
            </CustomLink>
          </li>

          {/* Create Practice (center plus button) */}
          <li className="flex flex-1 justify-center">
            <CustomLink
              href="/practices/create"
              className="flex size-11 items-center justify-center rounded-full bg-logo-cyan text-white shadow-[0_2px_8px_rgba(22,185,179,0.35)] transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-logo-cyan focus-visible:ring-offset-2"
              aria-label={t("nav_create_practice")}
            >
              <Plus className="size-6" strokeWidth={2.5} />
            </CustomLink>
          </li>

          {/* My Island */}
          <li className="flex flex-1 justify-center">
            <CustomLink
              href={`/users/${identifier}`}
              className={navItemClass}
              aria-label={t("nav_my_island")}
              aria-current={isMyIslandActive ? "page" : undefined}
            >
              <MyIslandIcon
                className={cn(
                  iconClass,
                  isMyIslandActive ? "text-logo-cyan opacity-100" : "text-light-gray opacity-45"
                )}
              />
            </CustomLink>
          </li>

          {/* Avatar (opens bottom sheet) */}
          <li className="flex flex-1 justify-center">
            <button
              type="button"
              onClick={handleAvatarClick}
              className={cn(navItemClass, isSheetOpen && "bg-logo-cyan/10")}
              aria-label={t("account_menu")}
              aria-expanded={isSheetOpen}
            >
              {user?.photoUrl ? (
                <Image
                  src={user.photoUrl}
                  alt=""
                  width={28}
                  height={28}
                  className="size-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-7 items-center justify-center rounded-full bg-logo-cyan text-white text-xs font-semibold">
                  {initial}
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>

      <MobileBottomSheet isOpen={isSheetOpen} onClose={handleSheetClose} />
    </>
  );
};
