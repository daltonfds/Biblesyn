'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {House, BookOpen, CalendarCheck, Sparkles, User} from 'lucide-react';
import {useT} from './I18nProvider';
const tabs = [{href: '/', k: 'home', Icon: House}, {href: '/library', k: 'library', Icon: BookOpen}, {href: '/plans', k: 'plans', Icon: CalendarCheck}, {href: '/assistant', k: 'assistant', Icon: Sparkles}, {href: '/journal', k: 'you', Icon: User}];
export default function Nav() {
  const p = usePathname(); const t = useT();
  if (/^\/(login|signup)/.test(p)) return null;
  return (<nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
    <ul className="mx-auto flex max-w-md">{tabs.map(({href, k, Icon}) => {
      const on = href === '/' ? p === '/' : p.startsWith(href);
      return (<li key={href} className="flex-1"><Link href={href} aria-current={on ? 'page' : undefined} className="flex flex-col items-center gap-1 py-2.5">
        <span className={`flex h-8 w-14 items-center justify-center rounded-full transition ${on ? 'bg-ink text-white' : 'text-mute'}`}><Icon size={22} strokeWidth={on ? 2.4 : 1.8} /></span>
        <span className={`text-[11px] ${on ? 'font-semibold text-ink' : 'text-mute'}`}>{t(`nav.${k}`)}</span></Link></li>);
    })}</ul></nav>);
}
