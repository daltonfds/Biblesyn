'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import Icon from '@/components/Icon';
const tabs = [
  {href:'/',label:'Home',icon:'home' as const},
  {href:'/library',label:'Library',icon:'book-open' as const},
  {href:'/plans',label:'Plans',icon:'calendar-days' as const},
  {href:'/assistant',label:'Assistant',icon:'message-circle' as const},
  {href:'/journal',label:'You',icon:'user-round' as const}
];
export default function Nav(){
 const path=usePathname();
 return <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur">
  <div className="mx-auto flex max-w-[520px] items-center justify-around px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
   {tabs.map(({href,label,icon})=>{const active=href==='/'?path==='/':path.startsWith(href);
    return <Link key={href} href={href} aria-current={active?'page':undefined} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium transition-colors ${active?'text-green':'text-[#858585] hover:text-ink'}`}>
     <span className={`flex h-8 w-11 items-center justify-center rounded-xl ${active?'bg-greenSoft':'bg-transparent'}`}><Icon name={icon} size={20}/></span><span>{label}</span>
    </Link>;
   })}
  </div>
 </nav>;
}