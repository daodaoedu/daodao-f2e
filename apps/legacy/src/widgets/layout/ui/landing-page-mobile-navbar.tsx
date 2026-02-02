"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { useScrollVisibility } from "@/shared/lib/use-scroll-visibility";
import { Button } from "@/shared/ui/button";
import { CustomLink } from "@/shared/ui/custom-link";
import { guestLayoutNav } from "../model";

export const LandingPageMobileNavbar = () => {
  const isVisible = useScrollVisibility({ threshold: 250 });
  const [activeSection, setActiveSection] = useState("");
  const t = useTranslations("common");

  useEffect(() => {
    const headings = guestLayoutNav.map((item) =>
      document.getElementById(item.href.replace("/#", ""))
    );

    const sections = headings.filter((heading) => heading !== null);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry?.target?.id);
        }
      });
    });

    for (const section of sections) {
      observer.observe(section);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 block h-[60px] translate-y-full border-t border-gray-200 bg-mascot-aqua transition-[transform,opacity] duration-300 ease-in-out md:hidden",
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      )}
    >
      <ul className="flex h-full items-center justify-around">
        {guestLayoutNav.map((item) => {
          const isActive = activeSection === item.href.replace("/#", "");
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "flex h-full w-full flex-col items-center justify-center space-y-1 rounded-none px-3 py-2 text-base",
                isActive
                  ? "bg-white text-primary-darker hover:bg-white"
                  : "bg-transparent text-primary-darker hover:bg-white hover:text-primary-darker"
              )}
              asChild
            >
              <CustomLink href={item.href}>{t(item.label)}</CustomLink>
            </Button>
          );
        })}
      </ul>
    </nav>
  );
};
