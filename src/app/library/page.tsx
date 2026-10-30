import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
import {getLocale} from '@/lib/locale';
export default async function Library({searchParams}: {searchParams: {topic?: string}}) {
  const sb = supabaseServer();
  let q = sb.from('articles').select('slug,title,topic,read_minutes,is_free').eq('published', true).eq('locale', getLocale()).order('created_at', {ascending: false});
  if (searchParams.topic) q = q.eq('topic', searchParams.topic);
  const {data} = await q;
  return (<div className="px-5 pt-14"><h1 className="px-1 font-serif text-4xl font-semibold">Spiritual Library</h1>
    <div className="mt-4 space-y-2">{data?.map((a: any) => <Link key={a.slug} href={`/library/${a.slug}`} className="block rounded-2xl border border-[#E3D5B8] bg-[#FFFDF8] p-4">
      <div className="font-serif text-xl font-semibold leading-tight">{a.title}</div><div className="mt-1 text-xs text-[#6F5A40]">{a.read_minutes} min · {a.topic}{a.is_free ? ' · Free' : ''}</div></Link>)}</div></div>);
}