import React from "react";
import { cn } from "@/utils/cn";

interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

const headingSizes = {
  sm: "text-lg sm:text-xl font-bold",
  md: "text-xl sm:text-2xl font-bold",
  lg: "text-2xl sm:text-3xl font-bold",
  xl: "text-3xl sm:text-4xl lg:text-5xl font-bold",
  "2xl": "text-4xl sm:text-5xl lg:text-6xl font-bold",
  "3xl": "text-5xl sm:text-6xl lg:text-7xl font-bold",
};

export function Heading({
  children,
  level = 2,
  size = "lg",
  className,
  as
}: HeadingProps) {
  const Tag = as || (`h${level}` as keyof React.JSX.IntrinsicElements);

  return React.createElement(Tag, {
    className: cn(headingSizes[size], className)
  }, children);
}

interface TextProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "muted";
  className?: string;
  as?: "p" | "span" | "div";
  style?: React.CSSProperties;
}

const textSizes = {
  sm: "body-sm",
  md: "body-md",
  lg: "body-lg",
};

const textColors = {
  primary: "text-basic-400",
  secondary: "text-basic-300",
  muted: "text-basic-200",
};

export function Text({
  children,
  size = "md",
  color = "primary",
  className,
  as = "p",
  style
}: TextProps) {
  return React.createElement(as, {
    className: cn(textSizes[size], textColors[color], className),
    style
  }, children);
}
