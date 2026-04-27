/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card-bg)',
          border: 'var(--card-border)',
        },
        primary: {
          start: 'var(--primary-start)',
          mid: 'var(--primary-mid)',
          end: 'var(--primary-end)',
        },
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, var(--primary-start), var(--primary-mid), var(--primary-end))',
        'glass-gradient': 'linear-gradient(rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))',
      },
      backdropBlur: {
        'glass': '20px',
      },
      borderRadius: {
        'ios': '16px',
        'button': '14px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(99, 102, 241, 0.2)',
        'premium': '0 20px 50px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
