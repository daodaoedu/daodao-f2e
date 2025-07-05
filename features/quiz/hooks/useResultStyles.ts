import { useEffect, useMemo } from "react";
import ResultNoisePng from "@/public/assets/quiz/result-noise.png";

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
        backgroundImage: `url(${ResultNoisePng.src})`,
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        backgroundSize: "393px 1352px",
        backgroundColor: theme?.backgroundColor,
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
