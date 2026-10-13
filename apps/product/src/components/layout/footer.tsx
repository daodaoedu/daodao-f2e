"use client";

import { useTranslations } from "@daodao/i18n";
import { usePathname } from "@daodao/i18n/navigation";
import { isFooterHidden } from "@/utils/footer-visibility";

export const Footer = () => {
  const t = useTranslations("common");
  const pathname = usePathname();

  if (isFooterHidden(pathname)) return null;

  return (
    <footer className="pt-3 pb-21 md:pb-6">
      <div className="container mx-auto">
        <p className="text-center text-text-dark">
          {t("footer_copyright", {
            year: new Date().getFullYear(),
          })}
        </p>
      </div>
    </footer>
  );
};
