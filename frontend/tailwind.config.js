/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"], // your dark mode strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
        // Use fallback static colors for utility generation only
        border: "#d1d5db",       // Tailwind slate-300 as fallback
        input: "#e5e7eb",        // Tailwind gray-200 as fallback
        ring: "#3b82f6",         // Tailwind blue-500 as fallback
        background: "#ffffff",   // fallback white
        foreground: "#1f2937",   // fallback gray-800
        primary: {
          DEFAULT: "#2563eb",    // blue-600 fallback
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#6b7280",    // gray-500 fallback
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#dc2626",    // red-600 fallback
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#9ca3af",    // gray-400 fallback
          foreground: "#374151",
        },
        accent: {
          DEFAULT: "#f59e0b",    // amber-500 fallback
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#f9fafb",    // gray-50 fallback
          foreground: "#111827",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#111827",
        },
      },
      borderRadius: {
        lg: "var(--radius)", // keep your CSS var for radius
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
  plugins: [],
};
