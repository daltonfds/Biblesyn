import Link from 'next/link';
import {notFound} from 'next/navigation';
import {supabaseServer} from '@/lib/supabase/server';
import Gate from '@/components/Gate';
import Icon from '@/components/Icon';
export default async function Article({params}:{params:{slug:string}}){
 const sb=supabaseServer();
 const {data:a}=await sb.from('articles').select('id,slug,title,topic,excerpt,read_minutes,audio_url').eq('slug',params.slug).eq('published',true).maybeSingle();
 if(!a) notFound();
 const [{data:{user}},{data:b}]=await Promise.all([sb.auth.getUser(),sb.from('article_bodies').select('body').eq('article_id',a.id).maybeSingle()]);
 return <article className="px-5 pt-10">
  <Link href="/library" className="inline-flex items-center gap-1 text-xs font-medium text-muted"><Icon name="chevron-left" size={17}/> Library <span className="text-[#C4C4C4]">/</span> {a.topic}</Link>
  <p className="mt-8 text-[10px] font-semibold uppercase tracking-[.2em] text-green">{a.topic}</p>
  <h1 className="mt-3 font-serif text-[36px] font-semibold leading-[1.12] tracking-tight">{a.title}</h1>
  <div className="mt-4 flex items-center gap-3 text-xs text-muted"><span>{a.read_minutes} min read</span><span className="h-1 w-1 rounded-full bg-[#BDBDBD]"/><span>Spiritual study</span></div>
  {a.audio_url&&<section className="mt-7 rounded-2xl border border-line p-4"><div className="mb-3 flex items-center gap-2 text-xs font-semibold"><Icon name="headphones" size={17}/> Listen to this study</div><audio controls className="w-full" src={a.audio_url}/></section>}
  {b?<div className="mt-8 whitespace-pre-line text-[15px] leading-[1.95] text-[#333]">{b.body}</div>:<><p className="mt-7 text-[15px] leading-7 text-muted">{a.excerpt}</p>{user?<section className="my-8 rounded-[24px] bg-ink p-6 text-white"><Icon name="lock" size={20} className="text-[#9AB9A5]"/><h2 className="mt-4 font-serif text-3xl font-semibold">Continue your study</h2><p className="mt-2 text-sm leading-6 text-white/70">This full study is part of the Biblesyn library.</p><Link href="/premium" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink">Explore Premium</Link></section>:<Gate next={`/library/${a.slug}`}/>}</>}
  <div className="mt-10 border-t border-line pt-5"><Link href="/library" className="inline-flex items-center gap-2 text-sm font-semibold"><Icon name="chevron-left" size={17}/> Back to library</Link></div>
 </article>;
}