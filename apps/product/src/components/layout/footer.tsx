"use client";

import { useTranslations } from "@daodao/i18n";

export const Footer = () => {
  const t = useTranslations("common");

  return (
    <footer className="pt-3 pb-21 md:pb-6 bg-gray-100">
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
