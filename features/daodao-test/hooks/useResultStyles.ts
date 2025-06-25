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
        backgroundImage: `url(${ResultNoisePng.src}), linear-gradient(${theme?.backgroundColor})`,
        "--bg-color": theme?.backgroundColor,
        "--color": theme?.color,
        "--secondary-color": theme?.secondaryColor,
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
