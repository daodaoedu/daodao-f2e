"use client";

import favicon256Png from "@daodao/assets/images/brand/favicon256.png";
import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { LanguageSwitcher } from "@daodao/ui/components/language-switcher";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { menuItems } from "./constant";
import type { SidebarProps } from "./type";

gsap.registerPlugin(ScrollTrigger);

export const MobileSidebar = ({ identifier }: SidebarProps) => {
  const pathname = usePathname();
  const t = useTranslations("app_product");
  const logoRef = useRef<HTMLDivElement>(null);

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
      <div className="fixed top-5 right-5 z-20">
        <LanguageSwitcher variant="light" />
      </div>
      <nav
        className={cn(
          "fixed left-0 right-0 bottom-0 bg-[#F9FEFF]/70 border-t border-2 border-[#C1ECFF] backdrop-blur-[15px] rounded-t-3xl z-30"
        )}
      >
        {/* Menu Items */}
        <ul className="flex px-10 py-3 justify-evenly">
          {menuItems.map((item) => {
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
        </ul>
      </nav>
    </>
  );
};
