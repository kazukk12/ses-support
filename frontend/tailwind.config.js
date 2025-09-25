/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "rgba(41, 123, 188, 1)",
          50: "rgba(41, 123, 188, 0.05)",
          100: "rgba(41, 123, 188, 0.1)",
          200: "rgba(41, 123, 188, 0.2)",
          300: "rgba(41, 123, 188, 0.3)",
          400: "rgba(41, 123, 188, 0.4)",
          500: "rgba(41, 123, 188, 1)",
          600: "rgba(33, 98, 150, 1)",
          700: "rgba(25, 74, 113, 1)",
          800: "rgba(17, 49, 75, 1)",
          900: "rgba(8, 25, 38, 1)",
          foreground: "white",
        },
        brand: {
          DEFAULT: "rgba(41, 123, 188, 1)",
          50: "rgba(41, 123, 188, 0.05)",
          100: "rgba(41, 123, 188, 0.1)",
          200: "rgba(41, 123, 188, 0.2)",
          300: "rgba(41, 123, 188, 0.3)",
          400: "rgba(41, 123, 188, 0.4)",
          500: "rgba(41, 123, 188, 1)",
          600: "rgba(33, 98, 150, 1)",
          700: "rgba(25, 74, 113, 1)",
          800: "rgba(17, 49, 75, 1)",
          900: "rgba(8, 25, 38, 1)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}