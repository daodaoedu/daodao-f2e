"use client";

import favicon256Png from "@daodao/assets/images/brand/favicon256.png";
import { usePathname } from "@daodao/i18n/navigation";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { Image } from "@daodao/ui/components/image";
import { cn } from "@daodao/ui/lib/utils";
import { menuItems } from "./constant";

export const MobileSidebar = () => {
  const pathname = usePathname();

  return (
    <>
      <div className="fixed top-5 left-5 z-30">
        <CustomLink href="/" aria-label="回到官網">
          <Image
            src={favicon256Png.src}
            alt="daodao logo"
            width={40}
            height={40}
          />
        </CustomLink>
      </div>
      <nav
        className={cn(
          "fixed left-0 right-0 bottom-0 bg-[#F9FEFF]/70 border-t border-2 border-[#C1ECFF] backdrop-blur-[15px] rounded-t-3xl z-30"
        )}
      >
        {/* Menu Items */}
        <ul className="flex px-10 py-3 justify-evenly">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = isActive ? item.activeIcon : item.icon;
            return (
              <li key={item.label} className={cn(item.hidden && "hidden")}>
                <CustomLink
                  href={item.href}
                  className="flex items-center text-text-dark"
                  aria-label={item.label}
                >
                  <Icon
                    className={cn(
                      "shrink-0 size-9 text-light-gray transition-colors",
                      isActive && "text-logo-cyan"
                    )}
                  />
                </CustomLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
