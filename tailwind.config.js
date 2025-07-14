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
        keyframes: {
        // Keyframe cho hiệu ứng mờ dần vào
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        // Keyframe cho hiệu ứng phóng to và mờ dần vào
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        }
      },
      animation: {
        // Áp dụng keyframes vào các class animation
        'fade-in': 'fadeIn 0.3s ease-out forwards', // 'forwards' giữ trạng thái cuối cùng của animation
        'scale-in': 'scaleIn 0.3s ease-out forwards', // 'forwards' giữ trạng thái cuối cùng của animation
      },
    },
  },
  plugins: [],
}
