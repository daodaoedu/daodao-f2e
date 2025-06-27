import { useEffect, useMemo } from "react";
import ResultNoisePng from "@/public/assets/daodao-test/result-noise.png";

interface Theme {
  backgroundColor: string;
  color: string;
  secondaryColor: string;
}

export const useResultStyles = (theme?: Theme | null) => {
  const rootStyle = useMemo(
    () =>
      ({
        "--bg-color": theme?.backgroundColor,
        "--color": theme?.color,
        "--secondary-color": theme?.secondaryColor,
        "--bg-image": `url(${ResultNoisePng.src}) center / 393px 1352px repeat, linear-gradient(${theme?.backgroundColor})`,
        background: "var(--bg-image)",
      } as React.CSSProperties),
    [theme]
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 392) {
        document.documentElement.style.fontSize = "14.5px";
      } else {
        document.documentElement.style.fontSize = "16px";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      document.documentElement.style.fontSize = "16px";
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { rootStyle };
};
