import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import PromotionBar from "./PromotionBar";

const MobileMenu = dynamic(() => import("./MobileMenu"));
const DesktopMenu = dynamic(() => import("./DesktopMenu"));

function Header() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 960);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 960);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 z-30 shadow-md shadow-basic-black/25">
      <PromotionBar />
      <header className="relative flex items-center justify-between w-full pl-4 pr-2 body-md bg-primary-base">
        <Link href="/" className="block py-6">
          <img src="/new-logo.png" alt="logo" width="152" height="31" />
        </Link>
        {isMobile ? <MobileMenu /> : <DesktopMenu />}
      </header>
    </div>
  );
}

export default Header;
