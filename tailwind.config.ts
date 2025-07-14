import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";
import typography from "@tailwindcss/typography";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./components/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./layout/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./shared/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
      },
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        md: "2rem",
        lg: "2.5rem",
        xl: "3rem",
      },
    },
    fontFamily: {
      sans: ["Noto Sans TC", ...defaultTheme.fontFamily.sans],
    },
    keyframes: {
      ...defaultTheme.keyframes,
      "collapsible-down": {
        from: {
          height: "0",
        },
        to: {
          height: "var(--radix-collapsible-content-height)",
        },
      },
      "collapsible-up": {
        from: {
          height: "var(--radix-collapsible-content-height)",
        },
        to: {
          height: "0",
        },
      },
    },
    animation: {
      ...defaultTheme.animation,
      "collapsible-down": "collapsible-down 0.2s ease-out",
      "collapsible-up": "collapsible-up 0.2s ease-out",
    },
    extend: {
      colors: {
        primary: {
          palest: "#F3FCFC",
          lightest: "#DEF5F5",
          lighter: "#89DAD7",
          base: "#16B9B3",
          darker: "#295E5C",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        basic: {
          100: "#F3F3F3",
          200: "#DBDBDB",
          300: "#92989A",
          400: "#536166",
          500: "#293A3D",
          white: "#FFFFFF",
          black: "#011416",
        },
        tips: "#FF9526",
        success: "#86C84A",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        alert: {
          DEFAULT: "hsl(var(--alert))",
          foreground: "hsl(var(--alert-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--alert))",
          foreground: "hsl(var(--alert-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    /** Typography */
    typography,
    plugin(({ addComponents, addUtilities, theme }) => {
      const headingFontSizes = [
        ["xl", "2.25rem"],
        ["lg", "1.75rem"],
        ["md", "1.375rem"],
        ["sm", "1.125rem"],
      ] as const;
      const bodyFontSizes = [
        ["lg", "1.125rem"],
        ["md", "1rem"],
        ["sm", "0.875rem"],
      ] as const;
      headingFontSizes.forEach(([size, fontSize]) => {
        addComponents({
          [`.heading-${size}`]: {
            fontSize,
            lineHeight: "140%",
            fontWeight: "bold",
          },
        });
      });
      bodyFontSizes.forEach(([size, fontSize]) => {
        addComponents({
          [`.body-${size}`]: {
            fontSize,
            lineHeight: "140%",
            fontWeight: "400",
          },
        });
      });

      /** Animation */
      const times = [
        "200",
        "300",
        "500",
        "700",
        "1100",
        "1300",
        "1700",
        "1900",
      ];
      times.forEach((time) => {
        addUtilities({
        ".scrollbar-hide": {
          /* IE and Edge */
          "-ms-overflow-style": "none",
          /* Firefox */
          "scrollbar-width": "none",
          /* Safari and Chrome */
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
      addUtilities({
          [`.animate-delay-${time}`]: {
            "--animation-delay": `${time}ms`,
          },
        });
      });
      times.forEach((time) => {
        addUtilities({
          [`.animate-duration-${time}`]: {
            "--animation-duration": `${time}ms`,
          },
        });
      });
      addComponents({
        ".bg-gradient-primary-palest": {
          background:
            "linear-gradient(270deg, rgba(243, 252, 252, 0) 20%, #F3FCFC 88%), rgba(22, 185, 179, 0.3)",
        },
      });
      addUtilities({
        ".animate-distance-100dvh": {
          "--animation-distance": "100dvh",
        },
        ".-animate-distance-full": {
          "--animation-distance": "-100%",
        },
      });
      addUtilities({
        ".animate-fade-in": {
          animation:
            "fade-in var(--animation-duration, 200ms) var(--animation-delay, 0ms) forwards ease-in-out",
          "@keyframes fade-in": {
            "0%": { opacity: "0" },
            "100%": { opacity: "1" },
          },
        },
        ".animate-fade-out": {
          animation:
            "fade-out var(--animation-duration, 200ms) var(--animation-delay, 0ms) forwards",
          animationTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
          "@keyframes fade-out": {
            "0%": { opacity: "1" },
            "100%": { opacity: "0" },
          },
        },
      });
      addUtilities({
        [`.animate-slide-y-in`]: {
          animation:
            "slide-y-in var(--animation-duration, 200ms) var(--animation-delay, 0ms) forwards",
          animationTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
          "@keyframes slide-y-in": {
            "0%": { transform: "translateY(var(--animation-distance, 100%))" },
            "100%": { transform: "translateY(0)" },
          },
        },
        [`.animate-slide-y-out`]: {
          animation:
            "slide-y-out var(--animation-duration, 200ms) var(--animation-delay, 0ms) forwards ease-in-out",
          "@keyframes slide-y-out": {
            "0%": { transform: "translateY(0)" },
            "100%": {
              transform: "translateY(var(--animation-distance, 100%))",
            },
          },
        },
        ".animate-button-ripple": {
          animation:
            "button-ripple var(--animation-duration, 500ms) var(--animation-delay, 0ms) forwards cubic-bezier(0, 0, 0.2, 1)",
          "@keyframes button-ripple": {
            "0%": {
              transform: "translate(-50%, -50%) scale(0)",
              opacity: "1",
            },
            "85%": {
              transform: "translate(-50%, -50%) scale(4)",
              opacity: "0.1",
            },
            "100%": {
              transform: "translate(-50%, -50%) scale(6)",
              opacity: "0",
            },
          },
        },
      });
      addUtilities({
        ".animate-slide-x-in": {
          animation:
            "slide-x-in var(--animation-duration, 200ms) var(--animation-delay, 0ms) forwards ease-in-out",
          "@keyframes slide-x-in": {
            "0%": { transform: "translateX(var(--animation-distance, 100%))" },
            "100%": { transform: "translateX(0)" },
          },
        },
      });
      addUtilities({
        ".animate-oscillate": {
          animation:
            "oscillate 3000ms var(--animation-delay, 0ms) ease-in-out infinite",
          "@keyframes oscillate": {
            "0%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-10px)" },
            "100%": { transform: "translateY(0)" },
          },
        },
      });
      addUtilities({
        ".vertical-separator-left": {
          position: "relative",
          "&:before": {
            content: '""',
            position: "absolute",
            top: "50%",
            right: "100%",
            width: "1px",
            height: "16px",
            backgroundColor: theme("colors.basic.200"),
            transform: "translateY(-50%)",
          },
        },
      });
    }),
    tailwindcssAnimate,
  ],
} satisfies Config;
