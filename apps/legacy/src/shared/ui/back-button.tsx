"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "@/shared/i18n/navigation";
import { cn } from "@/shared/lib/cn";
import { Button, type ButtonProps } from "@/shared/ui/button";

interface BackButtonProps extends Omit<ButtonProps, "children" | "onClick"> {
  label?: string;
  onClick?: (router: ReturnType<typeof useRouter>) => void;
}

export const BackButton = ({ label, className, onClick, ...props }: BackButtonProps) => {
  const router = useRouter();
  const handleBack =
    typeof onClick === "function" ? onClick : (r: ReturnType<typeof useRouter>) => r.back();

  return (
    <Button
      variant="ghost"
      onClick={() => handleBack(router)}
      className={cn("-mx-2 px-2 text-basic-400", className)}
      {...props}
    >
      <ChevronLeft className="size-7" />
      {label}
    </Button>
  );
};
