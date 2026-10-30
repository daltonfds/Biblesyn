import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0B',
        mist: '#F4F4F2',
        line: '#E6E6E3',
        mute: '#6C6C6C',
        leaf: '#15803D',
        leafsoft: '#E8F5EE',
      },
      fontFamily: {
        sans: ['var(--poppins)', 'Arial', 'sans-serif'],
        serif: ['var(--poppins)', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
