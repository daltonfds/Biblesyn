import Link from 'next/link';
import {notFound} from 'next/navigation';
import {supabaseServer} from '@/lib/supabase/server';
import Gate from '@/components/Gate';
export default async function Article({params}: {params: {slug: string}}) {
  const sb = supabaseServer();
  const {data: a} = await sb.from('articles').select('id,slug,title,topic,excerpt,read_minutes,audio_url').eq('slug', params.slug).eq('published', true).maybeSingle();
  if (!a) notFound();
  const {data: {user}} = await sb.auth.getUser();
  const {data: b} = await sb.from('article_bodies').select('body').eq('article_id', a.id).maybeSingle();
  return (<article className="px-6 pt-14"><Link href="/library" className="text-xs text-[#6F5A40]">‹ Library · {a.topic}</Link>
    <h1 className="mb-4 mt-3 font-serif text-4xl font-semibold leading-tight">{a.title}</h1>
    {b ? (<><audio controls className="mb-5 w-full" src={a.audio_url ?? `/api/tts?slug=${a.slug}`} /><div className="whitespace-pre-line text-[15px] leading-relaxed">{b.body}</div></>)
      : (<><p className="text-[15px] leading-relaxed">{a.excerpt}</p>
        {user ? <section className="my-6 rounded-3xl border border-gold bg-brown p-6 text-center text-ivory"><h2 className="font-serif text-3xl font-semibold">Unlock the full library</h2><Link href="/premium" className="mt-4 block rounded-full bg-gold py-3 font-semibold text-umber">See Premium</Link></section>
          : <Gate next={`/library/${a.slug}`} />}</>)}
  </article>);
}