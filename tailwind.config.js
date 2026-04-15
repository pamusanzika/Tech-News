/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#ff6200",
          600: "#ff6200",
          700: "#cc4e00",
          800: "#993b00",
          900: "#662700",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#374151",
            h1: { fontFamily: "var(--font-poppins)" },
            h2: { fontFamily: "var(--font-poppins)" },
            h3: { fontFamily: "var(--font-poppins)" },
            h4: { fontFamily: "var(--font-poppins)" },
            a: {
              color: "#ff6200",
              "&:hover": { color: "#cc4e00" },
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
