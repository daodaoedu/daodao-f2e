import { NextRouter, useRouter } from "next/router";
import { ChevronLeft } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface BackButtonProps extends Omit<ButtonProps, "children" | "onClick"> {
  label?: string;
  onClick?: (router: NextRouter) => void;
}

export const BackButton = ({
  label = "返回",
  className,
  onClick,
  ...props
}: BackButtonProps) => {
  const router = useRouter();
  const handleBack =
    typeof onClick === "function" ? onClick : (r: NextRouter) => r.back();

  return (
    <Button
      variant="ghost"
      onClick={() => handleBack(router)}
      className={cn("-mx-2 px-2 text-basic-400", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </Button>
  );
};
