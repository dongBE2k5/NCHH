// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sea-blue': '#006994', // Màu xanh nước biển
        'light-blue': '#1E90FF', // Màu xanh nhạt
        'light-gray': '#f3f4f6',
        'dark-blue': '#003f63', // Màu xanh đậm cho các hiệu ứng
      },
    },
  },
  plugins: [],
}
