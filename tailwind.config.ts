import type {Config} from 'tailwindcss';
export default {
  content:['./src/**/*.{ts,tsx}'],
  theme:{extend:{
    colors:{ink:'#111111',paper:'#FFFFFF',muted:'#737373',line:'#EAEAEA',green:'#286548',greenSoft:'#F1F6F2'},
    fontFamily:{serif:['var(--serif)','serif'],sans:['var(--sans)','sans-serif']}
  }},
  plugins:[]
} satisfies Config;