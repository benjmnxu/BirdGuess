const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      primary: "#ff8a00",
      "primary-alt": "#ef6000",
      secondary: "#181c80",
      "secondary-alt": "#0f0e43",
      "background-light": "#06092b",
      background: "#ff8a00",
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
      primary: "#ff8a00",
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
          "0%, 100%": {
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            transform: "translateY(0rem)",
          },
          "50%": {
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            transform: "translateY(-0.5rem)",
          },
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
          background: "#ff8a00",
          transitionDuration: "300ms",
          "&:hover": {
            boxShadow: "inset 0 0 4rem 0 #ffffff20",
          },
        },
        ".btn-small": {
          minWidth: "8rem",
          minHeight: "2.5rem",
          borderRadius: "1.25rem",
          color: "#000000",
          fontWeight: "700",
          fontSize: "0.875rem",
          background: "#ff8a00",
          transitionDuration: "300ms",
          "&:hover": {
            boxShadow: "inset 0 0 4rem 0 #ffffff10",
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
            boxShadow: "inset 0 0 4rem 0 #ff8a0080",
          },
        },
        ".btn-wide-orange": {
          width: "100%",
          minHeight: "3rem",
          borderRadius: "1.5rem",
          color: "#000000",
          fontWeight: "700",
          fontSize: "0.875rem",
          background: "#ff8a00",
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
