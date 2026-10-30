'use client';
import type {SVGProps} from 'react';
type Name = 'home'|'book-open'|'calendar-days'|'message-circle'|'user-round'|'search'|'arrow-up-right'|'headphones'|'bookmark'|'lock'|'plus'|'send'|'chevron-left'|'check'|'trash-2'|'sparkles'|'pen-line';
const paths: Record<Name, React.ReactNode> = {
  home:<><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
  'book-open':<><path d="M12 7v14"/><path d="M3 18V5a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v13"/><path d="M3 18a2 2 0 0 0 2 2h3a4 4 0 0 1 4 2 4 4 0 0 1 4-2h3a2 2 0 0 0 2-2"/></>,
  'calendar-days':<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/></>,
  'message-circle':<><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></>,
  'user-round':<><circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/></>,
  search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  'arrow-up-right':<><path d="M7 17 17 7M7 7h10v10"/></>,
  headphones:<><path d="M3 14v-3a9 9 0 0 1 18 0v3"/><path d="M5 14h2v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2ZM17 14h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2z"/></>,
  bookmark:<><path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4z"/></>,
  lock:<><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></>,
  plus:<><path d="M12 5v14M5 12h14"/></>,
  send:<><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
  'chevron-left':<path d="m15 18-6-6 6-6"/>,
  check:<path d="m5 12 4 4L19 6"/>,
  'trash-2':<><path d="M3 6h18M8 6V4h8v2m-11 0 1 15h10l1-15M10 11v6M14 11v6"/></>,
  sparkles:<><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2z"/></>,
  'pen-line':<><path d="m12 20 8-8"/><path d="M16 4a2.8 2.8 0 0 1 4 4L8 20l-5 1 1-5Z"/></>
};
export default function Icon({name,size=20,className='',...props}:{name:Name;size?:number;className?:string}&SVGProps<SVGSVGElement>){
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...props}>{paths[name]}</svg>;
}