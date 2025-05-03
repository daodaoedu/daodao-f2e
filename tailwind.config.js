const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");
const typography = require("@tailwindcss/typography");

/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './components/**/*.{js,jsx,ts,tsx}',
    './contexts/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
    './layout/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
    './shared/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: ["Noto Sans TC", ...defaultTheme.fontFamily.sans],
    },
    extend: {
      colors: {
        primary: {
          palest: "#F3FCFC",
          lightest: "#DEF5F5",
          lighter: "#89DAD7",
          base: "#16B9B3",
          darker: "#295E5C",
        },
        basic: {
          white: "#FFFFFF",
          100: "#F3F3F3",
          200: "#DBDBDB",
          300: "#92989A",
          400: "#536166",
          500: "#293A3D",
          black: "#011416",
        },
        alert: "#EF5364",
        tips: "#FF9526",
        success: "#86C84A",
      },
    },
  },
  plugins: [
    /** Typography */
    typography,
    plugin(({ addComponents, addUtilities, theme }) => {
      const sizes = ["lg", "md", "sm"];
      const headingFontSizes = [
        [36, 28],
        [22, 22],
        [18, 20],
      ];
      const bodyFontSizes = [
        [18, 20],
        [16, 18],
        [14, 16],
      ];
      sizes.forEach((size, index) => {
        addComponents({
          [`.heading-${size}`]: {
            fontSize: headingFontSizes[index][1],
            lineHeight: "140%",
            fontWeight: "bold",
            [`@media (min-width: ${theme("screens.md")})`]: {
              fontSize: headingFontSizes[index][0],
            },
          },
        });
        addComponents({
          [`.body-${size}`]: {
            fontSize: bodyFontSizes[index][1],
            lineHeight: "140%",
            fontWeight: "400",
            [`@media (min-width: ${theme("screens.md")})`]: {
              fontSize: bodyFontSizes[index][0],
            },
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
      addUtilities({
        ['.animate-distance-100dvh']: {
          '--animation-distance': '100dvh',
        },
        ['.-animate-distance-full']: {
          '--animation-distance': '-100%',
        },
      });
      addUtilities({
        [`.animate-fade-in`]: {
          animation:
            "fade-in var(--animation-duration, 200ms) var(--animation-delay, 0ms) forwards ease-in-out",
          "@keyframes fade-in": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        },
        [`.animate-fade-out`]: {
          animation:
            "fade-out var(--animation-duration, 200ms) var(--animation-delay, 0ms) forwards",
          animationTimingFunction: "cubic-bezier(0.32,0.72,0,1)",
          "@keyframes fade-out": {
            "0%": { opacity: 1 },
            "100%": { opacity: 0 },
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
        [`.animate-button-ripple`]: {
          animation:
            'button-ripple var(--animation-duration, 500ms) var(--animation-delay, 0ms) forwards cubic-bezier(0, 0, 0.2, 1)',
          '@keyframes button-ripple': {
            '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
            '75%': {
              transform: 'translate(-50%, -50%) scale(4)',
              opacity: 0.2,
            },
            '100%': {
              transform: 'translate(-50%, -50%) scale(6)',
              opacity: 0,
            },
          },
        },
      });
      addUtilities({
        [`.animate-slide-x-in`]: {
          animation:
            "slide-x-in var(--animation-duration, 200ms) var(--animation-delay, 0ms) forwards ease-in-out",
          "@keyframes slide-x-in": {
            "0%": { transform: "translateX(var(--animation-distance, 100%))" },
            "100%": { transform: "translateX(0)" },
          },
        },
      });
      addUtilities({
        [`.animate-oscillate`]: {
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
        ['.min-h-screen-with-padding-top']: {
          paddingTop: 'var(--padding-top, 0px)',
          minHeight: '100vh',
        },
        ['.min-h-screen-without-padding-top']: {
          minHeight: 'calc(100vh - var(--padding-top, 0px))',
        },
      });
      addUtilities({
        ['.vertical-separator-left']: {
          position: 'relative',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            right: '100%',
            width: '1px',
            height: '16px',
            backgroundColor: theme('colors.basic.200'),
            transform: 'translateY(-50%)',
          }
        },
      });
    }),
  ],
};
