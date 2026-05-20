"use client";

import { useTranslations } from "@daodao/i18n";
import blockedIsland from "@daodao/assets/images/island/blocked-island.png";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";
import { useState } from "react";

interface ApplyButtonProps {
  className?: string;
  children: React.ReactNode;
}

export const ApplyButton = ({ className, children }: ApplyButtonProps) => {
  const t = useTranslations("learning_marathon");
  const [isOpen, setIsOpen] = useState(false);

  const handleClickSignupButton = () => {
    setIsOpen(true);
  };

  const handleConfirm = () => {
    window.open("https://daoda.kit.com/marathon", "_blank", "noopener");
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={handleClickSignupButton} className={className}>
        {children}
      </Button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-basic-400 hover:text-basic-500"
            >
              ✕
            </button>
            <div className="body-sm space-y-4">
              <p className="text-gray-600">{t("apply_closed_notice")}</p>
              <p className="text-gray-600">
                {t("apply_closed_detail")}
              </p>
            </div>

            <div className="relative h-64 w-full">
              <Image src={blockedIsland} alt="blocked island" className="object-contain" fill />
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                {t("apply_closed_later_button")}
              </Button>
              <Button onClick={handleConfirm}>{t("apply_closed_join_button")}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
