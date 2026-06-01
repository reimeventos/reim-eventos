import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        reimDark: '#0B0B0F',
        reimBlack: '#17120E',
        reimGold: '#D4A24C',
        reimGoldLight: '#F0C46B',
        reimBg: '#F7F2EA',
        reimBorder: '#E5D7BB'
      },
      fontFamily: {
        serif: ['Georgia', 'serif']
      }
    }
  },
  plugins: []
};
export default config;
