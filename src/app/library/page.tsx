import Link from 'next/link';
import {Search, Play} from 'lucide-react';
import {supabaseServer} from '@/lib/supabase/server';
import {getLocale} from '@/lib/locale';
export const metadata = {title: 'Library'};
export default async function Library({searchParams}: {searchParams: {topic?: string; q?: string}}) {
  const sb = supabaseServer(); const locale = getLocale();
  const q = (searchParams.q ?? '').replace(/[,%()*]/g, ' ').trim();
  let query = sb.from('articles').select('slug,title,topic,read_minutes,is_free').eq('published', true).eq('locale', locale).order('created_at', {ascending: false});
  if (searchParams.topic) query = query.eq('topic', searchParams.topic);
  if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
  const [{data}, {data: all}] = await Promise.all([query, sb.from('articles').select('topic').eq('published', true).eq('locale', locale)]);
  const topics = Array.from(new Set((all ?? []).map((a: any) => a.topic).filter(Boolean))) as string[];
  const chip = (on: boolean) => `shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ${on ? 'bg-ink text-white' : 'bg-mist text-ink'}`;
  return (<div className="px-5 pt-12"><h1 className="font-serif text-[36px] font-bold leading-tight">Spiritual Library</h1>
    <form className="relative mt-4"><Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
      <label htmlFor="q" className="sr-only">Search the library</label><input id="q" name="q" defaultValue={q} placeholder="Search topics, verses, questions" className="field pl-11" />
      {searchParams.topic && <input type="hidden" name="topic" value={searchParams.topic} />}</form>
    <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1"><Link href="/library" className={chip(!searchParams.topic)}>All</Link>
      {topics.map(t => <Link key={t} href={`/library?topic=${encodeURIComponent(t)}`} className={chip(searchParams.topic === t)}>{t}</Link>)}</div>
    <div className="mt-3 space-y-2">{data?.map((a: any) => <Link key={a.slug} href={`/library/${a.slug}`} className="card flex items-center gap-3 p-4">
      <div className="flex-1"><div className="font-serif text-xl font-bold leading-tight">{a.title}</div><div className="mt-1.5 text-xs text-mute">{a.read_minutes} min · {a.topic}{a.is_free ? ' · Free' : ''}</div></div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist"><Play size={14} fill="currentColor" /></span></Link>)}
      {data?.length === 0 && <p className="py-8 text-center text-sm text-mute">Nothing found.</p>}</div></div>);
}
