/**
 * Tailwind CSS configuration for StaffSync.
 * Scans the app/ and components/ directories for class names to generate
 * the final CSS bundle.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          500: "#3b5bdb",
          600: "#3049b0",
          700: "#243a8a",
        },
      },
    },
  },
  plugins: [],
};
