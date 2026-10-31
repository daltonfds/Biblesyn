import Link from 'next/link';
export default function LangTabs({base, langs, cur, has, extra = ''}: {base: string; langs: {code: string; name: string}[]; cur: string; has?: Set<string>; extra?: string}) {
  return (<div className="mb-4 flex flex-wrap gap-2">{langs.map(l => (<Link key={l.code} href={`${base}?lang=${l.code}${extra}`} className={`rounded-full px-4 py-2 text-sm font-semibold ${cur === l.code ? 'bg-ink text-white' : 'bg-mist'}`}>{l.name}{has && <span className={`ml-2 inline-block h-2 w-2 rounded-full ${has.has(l.code) ? 'bg-leaf' : 'bg-line'}`} aria-label={has.has(l.code) ? 'exists' : 'missing'} />}</Link>))}</div>);
}
