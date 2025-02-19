import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BASE_URL } from "@/constants/common";
import Image from "@/shared/components/Image";
import Modal from "@/shared/components/Modal";
import openWindowPopup from "@/utils/openWindowPopup";
import { cn } from "@/utils/cn";

interface LoginModalProps {
  isOpen: boolean;
  keepMounted: boolean;
  onClose: () => void;
}

export default function LoginModal({
  isOpen,
  keepMounted,
  onClose,
}: LoginModalProps) {
  const [isOpenWindow, setIsOpenWindow] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const handleOpenLoginWindow = () => {
    const popup = openWindowPopup({
      url: `${BASE_URL}/auth/google`,
      title: "login",
      width: 400,
      height: 632,
    });
    setIsOpenWindow(!!popup?.parent);

    if (timer.current !== null) {
      clearInterval(timer.current);
    }
    
    if (popup?.parent) {
      timer.current = setInterval(() => {
        setIsOpenWindow(!!popup.parent);
      }, 300);
    }
  };

  useEffect(() => {
    if (!isOpenWindow && timer.current !== null) {
      clearInterval(timer.current);
    }
  }, [isOpenWindow, timer.current]);

  return (
    <Modal
      title="歡迎回來島島阿學！"
      isOpen={isOpen}
      keepMounted={keepMounted}
      onClose={onClose}
    >
      <div className="my-6">
        <div className="mx-auto w-max">
          <Image
            src="https://imgur.com/EADd1UD.png"
            alt="login"
            background="rgba(240, 240, 240, .8)"
            height="233px"
            width="300px"
          />
        </div>
      </div>
      <button
        type="button"
        className="w-full rounded-full bg-primary-base py-2 text-white hover:bg-primary-darker"
        onClick={handleOpenLoginWindow}
      >
        {isOpenWindow ? (
          <span className="flex gap-2 items-center justify-center">
            <span
              className={cn(
                "w-4 h-4 rounded-full inline-block animate-spin",
                "border-solid border-2 border-white/50 border-t-transparent"
              )}
            />
            登入中...
          </span>
        ) : (
          <span>Google 登入 / 註冊</span>
        )}
      </button>
      <div className="mt-6 text-center text-sm text-basic-400 text-balance">
        註冊即代表您同意島島阿學的
        <Link
          href="/terms/privacypolicy"
          target="_blank"
          className="px-1 underline text-primary-base"
        >
          服務條款
        </Link>
        與
        <Link
          href="/terms/privacypolicy"
          target="_blank"
          className="px-1 underline text-primary-base"
        >
          隱私權政策
        </Link>
      </div>
    </Modal>
  );
}
