import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
import {getLocale} from '@/lib/locale';
import Icon from '@/components/Icon';
export default async function Home(){
 const sb=supabaseServer();
 const [{data:{user}},{data:devotion},{data:articles}]=await Promise.all([
  sb.auth.getUser(),
  sb.from('devotions').select('*').order('day',{ascending:false}).limit(1).maybeSingle(),
  sb.from('articles').select('slug,title,topic,read_minutes').eq('published',true).eq('locale',getLocale()).order('created_at',{ascending:false}).limit(3)
 ]);
 return <div className="px-5 pt-12">
  <header className="flex items-center justify-between pb-7">
   <div><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-green">BIBLESYN</p><h1 className="mt-2 font-serif text-[34px] font-semibold leading-none tracking-tight">Today</h1></div>
   {user?<Link href="/journal" aria-label="Your journal" className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink"><Icon name="user-round"/></Link>:<Link href="/login" className="rounded-full border border-ink px-5 py-2.5 text-xs font-semibold">Log in</Link>}
  </header>
  {devotion?<section className="rounded-[26px] bg-ink p-6 text-white">
   <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[.2em] text-[#A9C7B4]"><span className="h-1.5 w-1.5 rounded-full bg-[#6C9B7B]"/> DAILY DEVOTION</div>
   <p className="mt-5 font-serif text-[30px] leading-[1.18]">{devotion.verse_text}</p>
   <p className="mt-3 text-xs font-medium text-[#B8C9BE]">{devotion.verse_ref}</p>
   {devotion.reflection&&<p className="mt-5 border-t border-white/15 pt-4 text-sm leading-7 text-white/75">{devotion.reflection}</p>}
   {devotion.audio_url&&<audio controls className="mt-5 w-full" src={devotion.audio_url}/>}
  </section>:<section className="rounded-[26px] border border-dashed border-[#DADADA] px-6 py-8 text-center">
   <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-greenSoft text-green"><Icon name="book-open" size={22}/></div>
   <h2 className="mt-4 font-serif text-2xl font-semibold">A moment in the Word</h2>
   <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-muted">The next daily devotion will appear here once it has been published.</p>
  </section>}
  <section className="pt-9">
   <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-semibold tracking-[.2em] text-green">GROW IN UNDERSTANDING</p><h2 className="mt-1 font-serif text-[27px] font-semibold">From the library</h2></div><Link href="/library" className="flex items-center gap-1 text-xs font-semibold">Explore <Icon name="arrow-up-right" size={15}/></Link></div>
   {articles?.length?<div className="divide-y divide-line rounded-2xl border border-line">{articles.map((a:any,i:number)=><Link key={a.slug} href={`/library/${a.slug}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-[#FAFAFA]"><span className="font-serif text-2xl text-[#B0B0B0]">0{i+1}</span><span className="min-w-0 flex-1"><span className="block font-serif text-xl font-semibold leading-tight">{a.title}</span><span className="mt-1 block text-[11px] text-muted">{a.read_minutes} min · {a.topic}</span></span><Icon name="arrow-up-right" size={17} className="text-muted"/></Link>)}</div>:<div className="rounded-2xl border border-line p-5"><p className="text-sm text-muted">No studies have been published in your language yet.</p></div>}
  </section>
 </div>;
}