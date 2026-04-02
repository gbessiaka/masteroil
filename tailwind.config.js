/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-black': '#0A0A0A',
        'brand-gold': '#C8952A',
        'brand-gold-light': '#E0A93A',
        'brand-gold-dark': '#A67820',
        'brand-cream': '#F4F2EE',
        'brand-cream-dark': '#E8E4DC',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-lg': ['3.5rem', { lineHeight: '1.15', fontWeight: '700' }],
        'display-md': ['2.5rem', { lineHeight: '1.2', fontWeight: '600' }],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 50%, #0A0A0A 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C8952A 0%, #E0A93A 100%)',
      },
      boxShadow: {
        'gold': '0 4px 24px rgba(200, 149, 42, 0.3)',
        'gold-lg': '0 8px 40px rgba(200, 149, 42, 0.4)',
        'dark': '0 4px 24px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
