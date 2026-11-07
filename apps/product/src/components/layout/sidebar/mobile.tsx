"use client";

import { MessagesOutlineSvg, SpacesOutlineSvg } from "@daodao/assets";
import favicon256Png from "@daodao/assets/images/brand/favicon256.png";
import { useAuthContext } from "@daodao/auth";
import { useTranslations } from "@daodao/i18n";
import { usePathname, useRouter } from "@daodao/i18n/navigation";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ChatUnreadBadge } from "./chat-unread-badge";
import { BreathingDot } from "./breathing-dot";
import { MobileBottomSheet } from "./mobile-bottom-sheet";
import type { SidebarProps } from "./type";

gsap.registerPlugin(ScrollTrigger);

export const MobileSidebar = ({ identifier }: SidebarProps) => {
  const pathname = usePathname();
  const t = useTranslations("app_product");
  const tDashboard = useTranslations("dashboard");
  const router = useRouter();
  const { user } = useAuthContext();
  const logoRef = useRef<HTMLDivElement>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);

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

  const isSpacesActive =
    pathname.startsWith("/spaces") ||
    pathname.startsWith("/activities") ||
    pathname.startsWith("/challenges");
  const isMessagesActive = pathname.startsWith("/messages");
  const isNotificationsActive = pathname === "/notifications";
  const isAdmin = user?.roles?.includes("admin") ?? false;

  useEffect(() => {
    if (!isCreateMenuOpen) return;
    const handleClickOutside = (event: PointerEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setIsCreateMenuOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsCreateMenuOpen(false);
    };
    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isCreateMenuOpen]);

  const handleAvatarClick = useCallback(() => {
    setIsSheetOpen(true);
  }, []);

  const handleSheetClose = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

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
          {/* Spaces */}
          <li className="flex flex-1 justify-center">
            <CustomLink
              href="/spaces"
              className={navItemClass}
              aria-label={t("nav_spaces")}
              aria-current={isSpacesActive ? "page" : undefined}
            >
              <span className="relative inline-flex">
                <SpacesOutlineSvg
                  className={cn(
                    iconClass,
                    isSpacesActive ? "text-logo-cyan opacity-100" : "text-light-gray opacity-45"
                  )}
                />
                <BreathingDot />
              </span>
            </CustomLink>
          </li>

          {/* Messages */}
          <li className="flex min-w-0 flex-1 justify-center">
            <CustomLink
              href="/messages"
              className={navItemClass}
              aria-label={t("nav_messages")}
              aria-current={isMessagesActive ? "page" : undefined}
            >
              <span className="relative inline-flex">
                <MessagesOutlineSvg
                  className={cn(
                    iconClass,
                    isMessagesActive ? "text-logo-cyan opacity-100" : "text-light-gray opacity-45"
                  )}
                />
                <ChatUnreadBadge />
              </span>
            </CustomLink>
          </li>

          {/* Create menu */}
          <li className="flex flex-1 justify-center">
            <div ref={createMenuRef} className="relative">
              {isCreateMenuOpen && (
                <div
                  className="absolute bottom-[calc(100%+0.75rem)] left-1/2 w-[min(80vw,18rem)] -translate-x-1/2 rounded-[20px] bg-white p-2 shadow-[0_16px_40px_rgba(15,48,54,0.18)]"
                  role="menu"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-[14px] px-3 py-[11px] text-left transition-colors hover:bg-[#F0F9F8]"
                    role="menuitem"
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      router.push("/practices/create");
                    }}
                  >
                    <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-logo-cyan/10">
                      <svg
                        aria-hidden="true"
                        className="size-[18px] text-logo-cyan"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-text-dark">
                        {tDashboard("fab_create_practice")}
                      </span>
                      <span className="block text-xs text-text-dark/40">
                        {tDashboard("fab_practice_subtitle")}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-[14px] px-3 py-[11px] text-left transition-colors hover:bg-[#F0F9F8]"
                    role="menuitem"
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      router.push("/manage");
                    }}
                  >
                    <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#FFA10B]/10">
                      <svg
                        aria-hidden="true"
                        className="size-[18px] text-[#FFA10B]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-text-dark">
                        {tDashboard("fab_create_activity")}
                      </span>
                      <span className="block text-xs text-text-dark/40">
                        {tDashboard("fab_activity_subtitle")}
                      </span>
                    </span>
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-[14px] px-3 py-[11px] text-left transition-colors hover:bg-[#F0F9F8]"
                      role="menuitem"
                      onClick={() => setIsCreateMenuOpen(false)}
                    >
                      <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-logo-cyan/5 text-logo-cyan/70">
                        <svg
                          aria-hidden="true"
                          className="size-[18px]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                          <line x1="4" y1="22" x2="4" y2="15" />
                        </svg>
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-text-dark">
                          {tDashboard("fab_create_challenge")}
                        </span>
                        <span className="block text-xs text-text-dark/40">
                          {tDashboard("fab_challenge_subtitle")}
                        </span>
                      </span>
                    </button>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsCreateMenuOpen((open) => !open)}
                className={cn(
                  "flex size-11 items-center justify-center rounded-full text-white shadow-[0_2px_8px_rgba(22,185,179,0.35)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-logo-cyan focus-visible:ring-offset-2",
                  isCreateMenuOpen
                    ? "bg-text-dark/80"
                    : "bg-logo-cyan hover:scale-105 active:scale-95"
                )}
                aria-label={tDashboard("fab_add_task")}
                aria-expanded={isCreateMenuOpen}
              >
                {isCreateMenuOpen ? (
                  <X className="size-6" />
                ) : (
                  <Plus className="size-6" strokeWidth={2.5} />
                )}
              </button>
            </div>
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

      <MobileBottomSheet identifier={identifier} isOpen={isSheetOpen} onClose={handleSheetClose} />
    </>
  );
};
