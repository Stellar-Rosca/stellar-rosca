/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stellar-blue': '#1a365d',
        'stellar-purple': '#553c9a',
        'stellar-green': '#38a169',
      },
    },
  },
  plugins: [],
}
