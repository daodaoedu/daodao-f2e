"use client";

import favicon256Png from "@daodao/assets/images/brand/favicon256.png";
import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Plus } from "lucide-react";
import { Fragment, useEffect, useRef } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { TaskGuideNavAction } from "@/components/task-guide/task-guide-nav-action";
import { menuItems } from "./constant";
import type { SidebarProps } from "./type";

gsap.registerPlugin(ScrollTrigger);

export const MobileSidebar = ({ identifier }: SidebarProps) => {
  const pathname = usePathname();
  const t = useTranslations("app_product");
  const logoRef = useRef<HTMLDivElement>(null);
  const visibleMenuItems = menuItems.filter((item) => !item.hidden);

  // 首頁時 logo 隨滾動漸淡（和 Banner 同步）
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

  return (
    <>
      <div ref={logoRef} className="fixed top-5 left-5 z-20">
        <CustomLink href="/" aria-label={t("back_to_website")}>
          <Image src={favicon256Png.src} alt="daodao logo" width={40} height={40} />
        </CustomLink>
      </div>
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30 rounded-t-3xl border-2 border-b-0 border-[#C1ECFF] bg-[#F9FEFF]/90 backdrop-blur-[15px]"
        )}
        aria-label={t("mobile_navigation")}
      >
        <ul className="flex items-center justify-evenly px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {visibleMenuItems.map((item, index) => {
            const isActive = item.isMatch(pathname, identifier);
            const Icon = isActive ? item.activeIcon : item.icon;
            return (
              <Fragment key={item.labelKey}>
                {index === 2 ? (
                  <>
                    <li className="flex flex-1 justify-center">
                      <CustomLink
                        href="/practices/create"
                        className="flex size-11 items-center justify-center rounded-xl border-2 border-light-gray text-text-dark transition-colors hover:border-logo-cyan hover:text-logo-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-logo-cyan"
                        aria-label={t("nav_create_practice")}
                      >
                        <Plus className="size-7" strokeWidth={1.8} />
                      </CustomLink>
                    </li>
                    <TaskGuideNavAction />
                  </>
                ) : null}
                <li className="flex flex-1 justify-center">
                  <CustomLink
                    href={typeof item.href === "function" ? item.href(identifier) : item.href}
                    className="flex size-11 items-center justify-center rounded-xl text-text-dark transition-colors hover:bg-logo-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-logo-cyan"
                    aria-label={t(item.labelKey)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.href === "/notifications" ? (
                      <NotificationBell isActive={isActive} className="[&_svg]:size-8" />
                    ) : (
                      <Icon
                        className={cn(
                          "size-8 shrink-0 text-light-gray transition-colors",
                          isActive && "text-logo-cyan"
                        )}
                      />
                    )}
                  </CustomLink>
                </li>
              </Fragment>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
