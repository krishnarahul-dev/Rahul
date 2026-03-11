/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        cflow: {
          50:  "#eef5ff",
          100: "#d9e8ff",
          200: "#bcdbff",
          300: "#8ec5ff",
          400: "#58a4ff",
          500: "#3182fc",
          600: "#1b63f1",
          700: "#144dde",
          800: "#173fb4",
          900: "#19388e",
          950: "#142356",
        },
      },
    },
  },
  plugins: [],
};
