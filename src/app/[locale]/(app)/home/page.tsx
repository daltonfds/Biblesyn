import Link from 'next/link';
import {BookOpen, Headphones, Flame, Play, Globe} from 'lucide-react';
import {supabaseServer} from '@/lib/supabase/server';
import {getLocale} from '@/lib/locale';
import {getT} from '@/lib/i18n';
import {getStreak, getContinuePlan} from '@/lib/progress';
import Greeting from '@/components/Greeting';
import ShareButton from '@/components/ShareButton';
export default async function Home() {
  const sb = supabaseServer(); const t = await getT(); const locale = await getLocale();
  const {data: {user}} = await sb.auth.getUser(); const today = new Date().toISOString().slice(0, 10);
  const [{data: dev}, {data: arts}] = await Promise.all([
    sb.from('devotions').select('*').eq('locale', locale).lte('day', today).order('day', {ascending: false}).limit(1).maybeSingle(),
    sb.from('articles').select('slug,title,read_minutes').eq('published', true).eq('locale', locale).order('created_at', {ascending: false}).limit(2)]);
  const streak = user ? await getStreak(sb, user.id) : 0; const cont = user ? await getContinuePlan(sb, user.id) : null;
  return (<div className="px-5 pt-[52px]">
    <header className="flex items-center justify-between">
      <div><p className="text-sm text-mute"><Greeting /></p><h1 className="font-serif text-[36px] font-bold leading-tight">{t('home.today')}</h1></div>
      <div className="flex items-center gap-2"><Link href="/settings" aria-label={t('settings.title')} className="flex h-10 w-10 items-center justify-center rounded-full bg-mist"><Globe size={18} /></Link>
        {user ? <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-mist px-3.5 py-2.5 text-sm font-semibold"><Flame size={16} className="text-leaf" />{t('home.streak', {n: streak})}</span>
          : <Link href="/login" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">{t('common.login')}</Link>}</div>
    </header>
    {dev && <section className="mt-5 rounded-[28px] bg-ink p-6 text-white">
      <div className="flex items-center justify-between"><span className="label !text-white/60">{t('home.devotion')}</span><ShareButton tone="dark" path="/devotion" title="Biblesyn" text={`"${dev.verse_text}" ${dev.verse_ref}`} /></div>
      <p className="mt-5 font-serif text-[30px] font-semibold leading-[1.15]">{dev.verse_text}</p><p className="mt-2 text-sm text-white/60">{dev.verse_ref}</p>
      <p className="mt-4 text-[15px] leading-relaxed text-white/80">{dev.reflection}</p>
      <div className="mt-5 grid grid-cols-2 gap-3"><Link href="/devotion" className="btn bg-white text-ink"><BookOpen size={18} />{t('common.read')}</Link><Link href="/devotion?listen=1" className="btn border border-white/30 text-white"><Headphones size={18} />{t('common.listen')}</Link></div></section>}
    {cont && <Link href={`/plans/${cont.slug}`} className="mt-4 block rounded-3xl bg-mist p-[18px]">
      <span className="label">{t('home.continue')}</span><div className="mb-3 mt-1 font-serif text-2xl font-bold">{cont.title}</div>
      <div className="h-1.5 rounded-full bg-line"><div className="h-1.5 rounded-full bg-leaf" style={{width: `${Math.round((cont.done / cont.days) * 100)}%`}} /></div>
      <div className="mt-2 text-xs text-mute">{t('home.day_of', {n: cont.next, total: cont.days})}</div></Link>}
    {!dev && !arts?.length && <p className="py-16 text-center text-sm text-mute">{t('home.empty')}</p>}
    {!!arts?.length && <><h2 className="label mb-2 mt-6 px-1">{t('home.from_library')}</h2>
    <div className="space-y-2">{arts.map((a: any) => <Link key={a.slug} href={`/library/${a.slug}`} className="card flex items-center gap-3 p-4">
      <div className="flex-1"><div className="font-serif text-xl font-bold leading-tight">{a.title}</div><div className="mt-1 text-xs text-mute">{t('common.min', {n: a.read_minutes})} · {t('common.read_or_listen')}</div></div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist"><Play size={14} fill="currentColor" /></span></Link>)}</div></>}
  </div>);
}
