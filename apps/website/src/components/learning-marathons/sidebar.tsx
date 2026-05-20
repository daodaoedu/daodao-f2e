"use client";

import { useTranslations } from "@daodao/i18n";
import { CustomLink } from "@daodao/ui/components/custom-link";
import { cn } from "@daodao/ui/lib/utils";
import { ChevronUp } from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { ApplyButton } from "./apply-button";

export const Sidebar = () => {
  const t = useTranslations("learning_marathon");

  const sidebarItems: Array<{ label: string; href: string }> = useMemo(
    () => [
      { label: t("marathon_section_intro_title"), href: "#marathon-intro" },
      { label: t("marathon_section_how_title"), href: "#marathon-how" },
      { label: t("mentors_section_title"), href: "#marathon-mentor" },
      { label: t("marathon_section_benefit_title"), href: "#marathon-benefit" },
      { label: t("marathon_section_reward_title"), href: "#marathon-reward" },
      { label: t("marathon_section_apply_title"), href: "#marathon-apply" },
      { label: t("sidebar_plan_value_label"), href: "#marathon-price" },
      { label: t("marathon_section_faq_title"), href: "#marathon-faq" },
    ],
    [t]
  );

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isShow, setIsShow] = useState(false);
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(69);

  useEffect(() => {
    const header = document.querySelector("nav");
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("main h2"));
    const filteredHeadings = headings.filter((heading) =>
      sidebarItems.some((item) => item.href.replace("#", "") === heading.id)
    );
    const sections = filteredHeadings
      .map((heading) => heading.parentElement)
      .filter((section): section is HTMLElement => section !== null);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry?.target?.children?.[0]?.id;
          if (sectionId) {
            setActiveSection(sectionId);
          }
        }
      });
    });

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, [sidebarItems]);

  useEffect(() => {
    const bannerElement = document.querySelector("main")?.children?.[0] as HTMLElement;
    const bannerHeight = bannerElement?.offsetHeight || 0;
    const handleScroll = () => {
      if (
        window.scrollY < bannerHeight - headerHeight ||
        window.scrollY + window.innerHeight > document.body.scrollHeight - 250
      ) {
        setIsShow(false);
      } else {
        setIsShow(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headerHeight]);

  return (
    <>
      <aside
        className={cn(
          "bottom-24 right-8 lg:bottom-auto lg:right-auto",
          "fixed max-h-[calc(100vh-var(--sidebar-top)-24px)] overflow-y-auto lg:left-8 lg:top-(--sidebar-top)",
          "z-20 rounded-lg bg-white p-2 shadow-md transition-opacity duration-300",
          isShow ? "lg:pointer-events-auto lg:opacity-100" : "lg:pointer-events-none lg:opacity-0",
          isOpenSidebar ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        style={{ "--sidebar-top": `${headerHeight + 100}px` } as CSSProperties}
      >
        <ul className="mb-2 flex flex-col gap-2">
          {sidebarItems.map((item) => (
            <li key={item.label}>
              <CustomLink
                href={item.href}
                className={cn(
                  "block rounded-lg p-2.5 text-base font-medium text-basic-400 transition-colors duration-300",
                  activeSection === item.href.replace("#", "") &&
                    "bg-primary-lightest text-primary-base"
                )}
              >
                {item.label}
              </CustomLink>
            </li>
          ))}
        </ul>
        <ApplyButton className="mx-auto inline-block h-10 w-full rounded-full bg-primary-base text-base font-normal leading-none text-white hover:bg-primary-base hover:shadow-[0px_4px_10px_0px_rgba(89,182,178,0.50)]">
          {t("marathon_apply_button")}
        </ApplyButton>
      </aside>
      <div
        className={cn(
          "fixed bottom-8 right-8 z-20 transition-opacity duration-300 lg:hidden",
          isShow ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <button
          type="button"
          className="rounded-full bg-primary-base p-3 text-white shadow-md shadow-primary-base"
          onClick={() => setIsOpenSidebar(!isOpenSidebar)}
        >
          <ChevronUp
            className={cn(
              "size-6 text-white transition-transform duration-300",
              isOpenSidebar ? "rotate-0" : "-rotate-180"
            )}
          />
        </button>
      </div>
    </>
  );
};
