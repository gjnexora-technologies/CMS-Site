/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #2563eb)',
          foreground: 'var(--color-primary-foreground, #ffffff)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary, #4f46e5)',
          foreground: 'var(--color-secondary-foreground, #ffffff)',
        },
        accent: {
          DEFAULT: 'var(--color-accent, #06b6d4)',
          foreground: 'var(--color-accent-foreground, #ffffff)',
        },
      },
      fontFamily: {
        custom: ['var(--font-custom, "Plus Jakarta Sans")', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
