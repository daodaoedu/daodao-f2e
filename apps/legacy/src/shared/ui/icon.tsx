import { cn } from "@/shared/lib/cn";

interface IconProps {
  name: string;
  className?: string;
  alt?: string;
}

// 直接載入 SVG 內容並保持 currentColor 支援
export function Icon({ name, className, alt }: IconProps) {
  // 根據名稱返回對應的 SVG 內容
  const getSvgContent = (iconName: string) => {
    switch (iconName) {
      case "arrow-right":
        return (
          <>
            <path d="M5 12h14" strokeWidth="2" />
            <path d="M12 5l7 7-7 7" strokeWidth="2" />
          </>
        );
      case "arrow-up":
        return (
          <>
            <path d="M12 19V5" strokeWidth="2" />
            <path d="M5 12l7-7 7 7" strokeWidth="2" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-5 h-5", className)}
      role="img"
      aria-label={alt}
    >
      {getSvgContent(name)}
    </svg>
  );
}
