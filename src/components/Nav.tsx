'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
const tabs = [['/', 'Home'], ['/library', 'Library'], ['/plans', 'Plans'], ['/assistant', 'Assistant'], ['/journal', 'You']] as const;
export default function Nav() {
  const p = usePathname();
  return (<nav className="fixed inset-x-0 bottom-0 border-t border-[#D9C6A0] bg-parchment"><div className="mx-auto flex max-w-md">
    {tabs.map(([href, label]) => { const on = href === '/' ? p === '/' : p.startsWith(href);
      return <Link key={href} href={href} className={`flex-1 py-4 text-center text-xs ${on ? 'font-bold text-brown' : 'text-[#6F5A40]'}`}>{label}</Link>; })}
  </div></nav>);
}