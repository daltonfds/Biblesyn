'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
export default function AdminNav({items}: {items: [string, string][]}) {
  const p = usePathname();
  return (<nav aria-label="Admin" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-3">{items.map(([href, label]) => { const on = href === '/admin' ? p === '/admin' : p.startsWith(href);
    return <Link key={href} href={href} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${on ? 'bg-ink text-white' : 'bg-mist text-ink'}`}>{label}</Link>; })}</nav>);
}
