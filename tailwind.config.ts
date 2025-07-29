import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-infra-background)",
        foreground: "var(--color-infra-text-primary)",
        primary: {
          DEFAULT: "var(--color-infra-primary)",
          foreground: "var(--color-white)",
        },
        secondary: {
          DEFAULT: "var(--color-infra-secondary)",
          foreground: "var(--color-white)",
        },
        accent: {
          DEFAULT: "var(--color-infra-accent)",
          foreground: "var(--color-white)",
        },
        muted: {
          DEFAULT: "var(--color-infra-gray-light)",
          foreground: "var(--color-infra-text-secondary)",
        },
        border: "var(--color-infra-border)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
        20: "var(--space-20)",
        24: "var(--space-24)",
      },
    },
  },
  plugins: [],
};

export default config;
