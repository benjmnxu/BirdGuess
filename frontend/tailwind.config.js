const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      primary: "#8aff00",
      "primary-alt": "#60ef00",
      secondary: "#181c80",
      "secondary-alt": "#0f0e43",
      "background-light": "#06092b",
      background: "#8aff00",
      "text-primary": "#ffffff",
      "text-secondary": "#000000",
      blur: "#b99ee7",
      transparent: "transparent",
      "border-color": "#ffffff10",
    },
    fontFamily: {
      sans: ["var(--font-inter)"],
    },
    borderColor: {
      DEFAULT: "#ffffff10",
      primary: "#8aff00",
    },
    borderRadius: {
      DEFAULT: "0.75rem",
      full: "50%",
    },
    extend: {
      maxWidth: {
        chat: "45rem",
      },
      boxShadow: {
        DEFAULT: "0 0.75rem 3rem 0 #b99ee70e",
        glass: "inset 0 1rem 2rem 0 #ffffff10",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        wiggle: "wiggle 0.2s ease-in-out infinite",
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        ".btn": {
          minWidth: "12rem",
          minHeight: "3rem",
          borderRadius: "1.5rem",
          color: "#000000",
          fontWeight: "700",
          fontSize: "0.875rem",
          background: "#8aff00",
          transitionDuration: "300ms",
          "&:hover": {
            boxShadow: "inset 0 0 4rem 0 #ffffff20",
          },
        },
        ".btn-wide-white": {
          width: "100%",
          minHeight: "3rem",
          borderRadius: "1.5rem",
          color: "#000000",
          fontWeight: "700",
          fontSize: "0.875rem",
          background: "#ffffff",
          transitionDuration: "300ms",
          "&:hover": {
            boxShadow: "inset 0 0 4rem 0 #8aff0080",
          },
        },
        ".btn-wide-green": {
          width: "100%",
          minHeight: "3rem",
          borderRadius: "1.5rem",
          color: "#000000",
          fontWeight: "700",
          fontSize: "0.875rem",
          background: "#8aff00",
          transitionDuration: "300ms",
          "&:hover": {
            boxShadow: "inset 0 1rem 2rem 0 #ffffff20",
          },
        },
        ".btn-wide-red": {
          width: "100%",
          minHeight: "3rem",
          borderRadius: "1.5rem",
          color: "#000000",
          fontWeight: "700",
          fontSize: "0.875rem",
          background: "#ff3a20",
          transitionDuration: "300ms",
          "&:hover": {
            boxShadow: "inset 0 1rem 2rem 0 #ffffff20",
          },
        },
      });
    }),
  ],
};
