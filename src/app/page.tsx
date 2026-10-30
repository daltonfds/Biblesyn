import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
import {getLocale} from '@/lib/locale';
export default async function Home() {
  const sb = supabaseServer();
  const [{data: {user}}, {data: devotion}, {data: articles}] = await Promise.all([
    sb.auth.getUser(),
    sb.from('devotions').select('*').order('day', {ascending: false}).limit(1).maybeSingle(),
    sb.from('articles').select('slug,title,read_minutes').eq('published', true).eq('locale', getLocale()).order('created_at', {ascending: false}).limit(3)
  ]);
  return (<div>
    <header className="flex items-center justify-between px-6 pb-2 pt-14"><h1 className="font-serif text-3xl font-semibold">Today</h1>{!user && <Link href="/login" className="rounded-full bg-brown px-4 py-2 text-sm text-parchment">Log in</Link>}</header>
    {devotion && <section className="mx-5 mt-3 rounded-3xl border border-gold bg-brown p-6 text-ivory"><div className="text-[11px] tracking-[.14em] text-[#D9B879]">DAILY DEVOTION</div><p className="mt-3 font-serif text-3xl leading-tight">{devotion.verse_text}</p><div className="mt-1 text-sm text-[#D9B879]">{devotion.verse_ref}</div>{devotion.reflection && <p className="mt-3 text-sm leading-relaxed text-[#E8DCC3]">{devotion.reflection}</p>}</section>}
    <h2 className="px-6 pb-2 pt-6 text-[11px] tracking-[.14em] text-[#6F5A40]">FROM THE LIBRARY</h2>
    {articles?.length ? <div className="space-y-2 px-5">{articles.map((article: any) => <Link key={article.slug} href={`/library/${article.slug}`} className="block rounded-2xl border border-[#E3D5B8] bg-[#FFFDF8] p-4"><div className="font-serif text-xl font-semibold">{article.title}</div><div className="mt-1 text-xs text-[#6F5A40]">{article.read_minutes} min</div></Link>)}</div> : <p className="mx-5 rounded-2xl bg-parchment p-4 text-sm text-[#6F5A40]">There are no published studies yet.</p>}
  </div>);
}