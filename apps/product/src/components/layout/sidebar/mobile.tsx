"use client";

import { usePathname } from "@daodao/i18n/navigation";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { cn } from "@daodao/ui/lib/utils";
import { menuItems } from "./constant";
import type { SidebarProps } from "./type";

export const MobileSidebar = ({ identifier }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <>
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
              <li key={item.label} className={cn(item.hidden && "hidden")}>
                <CustomLink
                  href={typeof item.href === "function" ? item.href(identifier) : item.href}
                  className="flex items-center text-text-dark"
                  aria-label={item.label}
                >
                  <span className="relative">
                    <Icon
                      className={cn(
                        "shrink-0 size-9 text-light-gray transition-colors",
                        isActive && "text-logo-cyan"
                      )}
                    />
                    {"badge" in item && item.badge && (
                      <span className="absolute top-0 right-0 size-2 rounded-full bg-red-500" />
                    )}
                  </span>
                </CustomLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
