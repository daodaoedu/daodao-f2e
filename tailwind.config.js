const plugin = require("tailwindcss/plugin");
const typography = require('@tailwindcss/typography');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{jsx,tsx}",
    "./contexts/**/*.{jsx,tsx}",
    "./layout/**/*.{jsx,tsx}",
    "./pages/**/*.{jsx,tsx}",
    "./shared/**/*.{jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
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
            [`@media (min-width: ${theme("screens.md")})`]: {
              fontSize: bodyFontSizes[index][0],
            },
          },
        });
        addUtilities({
          [`.animate-fade-in`]: {
            animation: 'fade-in 200ms ease-in-out',
            '@keyframes fade-in': {
              '0%': { opacity: 0 },
              '100%': { opacity: 1 },
            },
          },
        });
        addUtilities({
          [`.animate-slide-in`]: {
            animation: 'slide-in 200ms ease-in-out',
            '@keyframes slide-in': {
              '0%': { transform: 'translateY(100%)' },
              '100%': { transform: 'translateY(0)' },
            },
          },
        });
      });
    }),
  ],
};
