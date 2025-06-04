/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary': '#0066FF',
        'primary-dark': '#0052CC',
        'primary-light': '#3385FF'
      }
    },
  },
  plugins: [],
};
