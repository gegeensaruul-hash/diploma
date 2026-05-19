import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        indigo: colors.lime,
        slate: colors.stone,
        fuchsia: colors.amber,
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"',
          '"Inter"', 'system-ui', 'sans-serif'
        ],
        heading: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"',
          '"Inter"', 'system-ui', 'sans-serif'
        ],
      },
    },
  },
  plugins: [],
};
