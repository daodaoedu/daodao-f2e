import { cn } from "@/utils/cn";
import dynamic from "next/dynamic";
import Link from "next/link";
import { forwardRef, useEffect, useState } from "react";

const MobileMenu = dynamic(() => import("./MobileMenu"));
const DesktopMenu = dynamic(() => import("./DesktopMenu"));

function Header(
  { children }: React.PropsWithChildren,
  ref: React.Ref<HTMLDivElement>
) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 960);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 960);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed top-0 inset-x-0 z-30 shadow-md shadow-basic-black/25"
    >
      {children}
      <header
        className={cn(
          "relative flex items-center justify-between w-full px-4 body-md bg-primary-base",
          isMobile && "pr-2"
        )}
      >
        <Link href="/" className="block py-6">
          <img src="/new-logo.png" alt="島島阿學" width="152" height="22" />
        </Link>
        {isMobile ? <MobileMenu /> : <DesktopMenu />}
      </header>
    </div>
  );
}

export default forwardRef(Header);
