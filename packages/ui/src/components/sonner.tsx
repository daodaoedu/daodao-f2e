"use client";

import { XIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps, toast } from "sonner";
import { cn } from "../lib/utils";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      closeButton
      toastOptions={{
        classNames: {
          closeButton: "absolute right-2 top-2 size-6 rounded-full cursor-pointer",
          success: "success border-logo-cyan",
          error: "error border-red",
          actionButton: cn(
            "px-5 py-2 h-10 mr-4 flex items-center justify-center rounded-full cursor-pointer",
            "[.success_&]:bg-logo-cyan [.success_&]:text-white",
            "[.error_&]:bg-red [.error_&]:text-bg-dark shrink-0"
          ),
          title: "font-medium text-text-dark",
          description: "text-sm !text-text-dark",
          content: "flex flex-col gap-1",
          toast:
            "group relative border-l-8 bg-white rounded-lg shadow-sm p-4 pr-8 flex gap-2.5 justify-between items-center w-[350px]",
        },
        unstyled: true,
      }}
      icons={{
        close: <XIcon className="size-6" />,
        error: null,
        success: null,
        info: null,
        warning: null,
      }}
      duration={5000}
      position="top-center"
      style={
        {
          "--normal-bg": "var(--white)",
          "--normal-bg-hover": "var(--white)",
          "--normal-border": "var(--white)",
          "--normal-border-hover": "var(--white)",
          "--normal-text": "var(--text-dark)",
          "--border-radius": "var(--radius-lg)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster, toast };
