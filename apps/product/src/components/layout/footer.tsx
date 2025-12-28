"use client";

import { useTranslations } from "@daodao/i18n";

export const Footer = () => {
  const t = useTranslations("common");

  return (
    <footer className="bg-basic-600 py-1 text-white">
      <div className="container mx-auto">
        <p className="text-center text-white">
          {t("footer_copyright", {
            year: new Date().getFullYear(),
          })}
        </p>
      </div>
    </footer>
  );
};
