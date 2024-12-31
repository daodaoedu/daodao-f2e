import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import PromotionBar from "./PromotionBar";

const MobileHeader = dynamic(() => import("./MobileHeader"));
const DesktopHeader = dynamic(() => import("./DesktopHeader"));

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
      {isMobile ? <MobileHeader /> : <DesktopHeader />}
    </div>
  );
};

export default Header;
