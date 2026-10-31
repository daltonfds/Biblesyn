import Link from 'next/link';
import {BookOpen, Headphones, Flame, Play} from 'lucide-react';
import {supabaseServer} from '@/lib/supabase/server';
import {getLocale} from '@/lib/locale';
import {getStreak, getContinuePlan} from '@/lib/progress';
import Greeting from '@/components/Greeting';
import ShareButton from '@/components/ShareButton';
export default async function Home() {
  const sb = supabaseServer();
  const {data: {user}} = await sb.auth.getUser();
  const [{data: dev}, {data: arts}] = await Promise.all([
    sb.from('devotions').select('*').order('day', {ascending: false}).limit(1).maybeSingle(),
    sb.from('articles').select('slug,title,read_minutes,topic').eq('published', true).eq('locale', getLocale()).order('created_at', {ascending: false}).limit(2)]);
  const streak = user ? await getStreak(sb, user.id) : 0;
  const cont = user ? await getContinuePlan(sb, user.id) : null;
  return (<div className="px-5 pt-12">
    <header className="flex items-center justify-between">
      <div><p className="text-sm text-mute"><Greeting /></p><h1 className="font-serif text-[36px] font-bold leading-tight">Today</h1></div>
      {user ? <span className="flex items-center gap-1.5 rounded-full bg-mist px-3.5 py-2 text-sm font-semibold"><Flame size={16} className="text-leaf" />{streak}-day streak</span>
        : <Link href="/login" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">Log in</Link>}
    </header>
    {dev && <section className="mt-5 rounded-[28px] bg-ink p-6 text-white">
      <div className="flex items-start justify-between"><span className="label !text-white/60">Daily devotion</span>
        <ShareButton tone="dark" path="/devotion" title="Biblesyn daily devotion" text={`"${dev.verse_text}" ${dev.verse_ref}`} /></div>
      <p className="mt-5 font-serif text-[30px] font-semibold leading-[1.15]">{dev.verse_text}</p>
      <p className="mt-2 text-sm text-white/60">{dev.verse_ref}</p>
      <p className="mt-4 text-[15px] leading-relaxed text-white/80">{dev.reflection}</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link href="/devotion" className="btn bg-white text-ink"><BookOpen size={18} />Read</Link>
        <Link href="/devotion?listen=1" className="btn border border-white/30 text-white"><Headphones size={18} />Listen</Link></div></section>}
    {cont && <Link href={`/plans/${cont.slug}`} className="mt-4 block rounded-3xl bg-mist p-5">
      <span className="label">Continue your plan</span><div className="mt-1 font-serif text-2xl font-bold">{cont.title}</div>
      <div className="mt-3 h-1.5 rounded-full bg-line"><div className="h-1.5 rounded-full bg-leaf" style={{width: `${Math.round((cont.done / cont.days) * 100)}%`}} /></div>
      <div className="mt-2 text-xs text-mute">Day {cont.next} of {cont.days}</div></Link>}
    <h2 className="label mb-2 mt-7 px-1">From the library</h2>
    <div className="space-y-2">{arts?.map((a: any) => <Link key={a.slug} href={`/library/${a.slug}`} className="card flex items-center gap-3 p-4">
      <div className="flex-1"><div className="font-serif text-xl font-bold leading-tight">{a.title}</div><div className="mt-1 text-xs text-mute">{a.read_minutes} min · Read or listen</div></div>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mist"><Play size={14} fill="currentColor" /></span></Link>)}</div>
  </div>);
}
