import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
import {getLocale} from '@/lib/locale';
import Icon from '@/components/Icon';
export default async function Library({searchParams}:{searchParams:{topic?:string;q?:string}}){
 const sb=supabaseServer();
 let query=sb.from('articles').select('slug,title,topic,excerpt,read_minutes,is_free').eq('published',true).eq('locale',getLocale()).order('created_at',{ascending:false});
 if(searchParams.topic) query=query.eq('topic',searchParams.topic);
 if(searchParams.q) query=query.ilike('title',`%${searchParams.q}%`);
 const {data}=await query;
 const {data:all}=await sb.from('articles').select('topic').eq('published',true).eq('locale',getLocale());
 const topics=Array.from(new Set((all??[]).map((a:any)=>a.topic).filter(Boolean))) as string[];
 const selected=searchParams.topic??'';
 return <div className="px-5 pt-12">
  <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-green">DISCOVER & UNDERSTAND</p><h1 className="mt-2 font-serif text-[34px] font-semibold leading-tight">Spiritual Library</h1>
  <form action="/library" className="mt-6 flex h-12 items-center gap-3 rounded-2xl border border-line px-4"><Icon name="search" size={18} className="text-muted"/><input name="q" defaultValue={searchParams.q??''} aria-label="Search the library" className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none" /><button className="text-xs font-semibold text-green">Search</button></form>
  <div className="mt-5 flex gap-2 overflow-x-auto pb-2">{['All',...topics].map(topic=><Link key={topic} href={topic==='All'?'/library':`/library?topic=${encodeURIComponent(topic)}`} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${(topic==='All'&&!selected)||(selected===topic)?'border-ink bg-ink text-white':'border-line bg-white text-muted hover:border-ink hover:text-ink'}`}>{topic}</Link>)}</div>
  <div className="mt-5 space-y-3">{data?.length?data.map((a:any,i:number)=><Link key={a.slug} href={`/library/${a.slug}`} className="group block rounded-[22px] border border-line p-5 transition-all hover:border-[#B8CBBE] hover:bg-[#FCFDFC]"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-green">{a.topic}</span><Icon name="arrow-up-right" size={17} className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></div><h2 className="mt-3 font-serif text-[23px] font-semibold leading-tight">{a.title}</h2>{a.excerpt&&<p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{a.excerpt}</p>}<div className="mt-4 text-[11px] text-muted">{a.read_minutes} min read{a.is_free?' · Free':''}</div></Link>):<div className="rounded-[22px] border border-dashed border-[#DADADA] px-5 py-9 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-greenSoft text-green"><Icon name="book-open"/></div><h2 className="mt-4 font-serif text-2xl font-semibold">Your library is growing</h2><p className="mt-2 text-sm leading-6 text-muted">There are no published studies matching this view yet.</p>{selected&&<Link href="/library" className="mt-4 inline-block text-xs font-semibold text-green">Clear filter</Link>}</div>}</div>
 </div>;
}