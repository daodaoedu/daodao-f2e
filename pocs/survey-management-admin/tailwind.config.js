import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'oklch(var(--border) / <alpha-value>)',
        input: 'oklch(var(--input) / <alpha-value>)',
        ring: 'oklch(var(--ring) / <alpha-value>)',
        background: 'oklch(var(--background) / <alpha-value>)',
        foreground: 'oklch(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground) / <alpha-value>)',
          palest: 'var(--primary-palest)',
          pale: 'var(--primary-pale)',
          lightest: 'var(--primary-lightest)',
          lighter: 'var(--primary-lighter)',
          base: 'var(--primary-base)',
          darker: 'var(--primary-darker)',
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
          foreground: 'oklch(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
          foreground: 'oklch(var(--destructive-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'oklch(var(--card) / <alpha-value>)',
          foreground: 'oklch(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'oklch(var(--popover) / <alpha-value>)',
          foreground: 'oklch(var(--popover-foreground) / <alpha-value>)',
        },
        sidebar: {
          DEFAULT: 'oklch(var(--sidebar) / <alpha-value>)',
          foreground: 'oklch(var(--sidebar-foreground) / <alpha-value>)',
          primary: 'oklch(var(--sidebar-primary) / <alpha-value>)',
          'primary-foreground': 'oklch(var(--sidebar-primary-foreground) / <alpha-value>)',
          accent: 'oklch(var(--sidebar-accent) / <alpha-value>)',
          'accent-foreground': 'oklch(var(--sidebar-accent-foreground) / <alpha-value>)',
          border: 'oklch(var(--sidebar-border) / <alpha-value>)',
          ring: 'oklch(var(--sidebar-ring) / <alpha-value>)',
        },
        // Brand colors
        'logo-cyan': 'var(--logo-cyan)',
        'logo-orange': 'var(--logo-orange)',
        'logo-yellow': 'var(--logo-yellow)',
        'logo-gray': 'var(--logo-gray)',
        // Mascot colors
        'mascot-aqua': 'var(--mascot-aqua)',
        'mascot-bright-blue': 'var(--mascot-bright-blue)',
        // Basic / grayscale
        'basic-100': 'var(--basic-100)',
        'basic-200': 'var(--basic-200)',
        'basic-300': 'var(--basic-300)',
        'basic-400': 'var(--basic-400)',
        'basic-500': 'var(--basic-500)',
        'basic-600': 'var(--basic-600)',
        'basic-white': 'var(--basic-white)',
        'basic-black': 'var(--basic-black)',
        // Semantic
        tips: 'var(--tips)',
        success: 'oklch(var(--success) / <alpha-value>)',
        alert: 'oklch(var(--alert) / <alpha-value>)',
        warning: 'oklch(var(--warning) / <alpha-value>)',
        info: 'oklch(var(--info) / <alpha-value>)',
        // Background variants
        'bg-dark': 'var(--bg-dark)',
        'bg-gray': 'var(--bg-gray)',
        'very-light-gray': 'var(--very-light-gray)',
        'light-gray': 'var(--light-gray)',
        'light-cyan': 'var(--light-cyan)',
        'light-blue': 'var(--light-blue)',
        'very-light-blue': 'var(--very-light-blue)',
        blue: 'var(--blue)',
        red: 'var(--red)',
        // Chart
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, addUtilities }) {
      addComponents({
        '.heading-xl': { fontSize: '2.25rem', fontWeight: '700', lineHeight: '140%' },
        '.heading-lg': { fontSize: '1.75rem', fontWeight: '700', lineHeight: '140%' },
        '.heading-md': { fontSize: '1.375rem', fontWeight: '700', lineHeight: '140%' },
        '.heading-sm': { fontSize: '1.125rem', fontWeight: '700', lineHeight: '140%' },
        '.body-lg': { fontSize: '1.125rem', fontWeight: '400', lineHeight: '140%' },
        '.body-md': { fontSize: '1rem', fontWeight: '400', lineHeight: '140%' },
        '.body-sm': { fontSize: '0.875rem', fontWeight: '400', lineHeight: '140%' },
      })
      addUtilities({
        '.scrollbar-hide': {
          scrollbarWidth: 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      })
    }),
  ],
}
