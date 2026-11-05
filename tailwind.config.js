/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 中国风配色
        paper: '#f5f0e6',      // 宣纸色
        ink: '#2a2622',        // 墨黑
        seal: '#b84444',       // 印章红
        clay: '#c4b8a4',      // 淡褐
        tea: '#8b7355',        // 茶褐
        jade: '#5a7d5a',       // 玉绿（备用）
      },
      fontFamily: {
        serif: ['"Songti SC"', '"Noto Serif SC"', 'serif'],
        kai: ['"Kaiti SC"', '"STKaiti"', 'serif'],
      },
    },
  },
  plugins: [],
}
