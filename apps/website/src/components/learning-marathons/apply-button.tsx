"use client";

import blockedIsland from "@daodao/assets/images/island/blocked-island.png";
import { Button } from "@daodao/ui/components/button";
import { Image } from "@daodao/ui/components/image";
import { useState } from "react";

interface ApplyButtonProps {
  className?: string;
  children: React.ReactNode;
}

export const ApplyButton = ({ className, children }: ApplyButtonProps) => {
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
              <p className="text-gray-600">本次活動申請已截止，但您仍可以加入排隊名單</p>
              <p className="text-gray-600">
                預計7月初開放申請，8月底申請截止。加入排隊清單後，我們會在下次開放申請時第一時間通知您。同時也歡迎追蹤社群媒體，接收最新活動訊息。
              </p>
            </div>

            <div className="relative h-64 w-full">
              <Image src={blockedIsland} alt="blocked island" className="object-contain" fill />
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                稍後再說
              </Button>
              <Button onClick={handleConfirm}>加入排隊清單</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
