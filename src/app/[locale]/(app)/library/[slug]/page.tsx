import Link from 'next/link';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {ChevronLeft, Bookmark, Lock} from 'lucide-react';
import {supabaseServer} from '@/lib/supabase/server';
import {getLocale, getReaderPrefs} from '@/lib/locale';
import {getT} from '@/lib/i18n';
import Gate from '@/components/Gate';
import ShareButton from '@/components/ShareButton';
import ReaderSettings from '@/components/ReaderSettings';
import ArticleReader from '@/components/ArticleReader';
import {toggleSave} from './actions';
export async function generateMetadata({params}: {params: {slug: string}}): Promise<Metadata> {
  const {data: a} = await supabaseServer().from('articles').select('title,excerpt').eq('slug', params.slug).eq('locale', await getLocale()).maybeSingle();
  if (!a) return {};
  return {title: a.title, description: a.excerpt ?? undefined, openGraph: {title: a.title, description: a.excerpt ?? undefined, type: 'article'}, twitter: {card: 'summary_large_image'}};
}
export default async function Article({params}: {params: {slug: string}}) {
  const sb = supabaseServer(); const t = await getT(); const locale = await getLocale(); const prefs = getReaderPrefs();
  const {data: a} = await sb.from('articles').select('id,slug,title,topic_id,excerpt,read_minutes,audio_url').eq('slug', params.slug).eq('locale', locale).eq('published', true).maybeSingle();
  if (!a) notFound();
  const {data: {user}} = await sb.auth.getUser();
  const {data: b} = await sb.from('article_bodies').select('body').eq('article_id', a.id).maybeSingle();
  const {data: saved} = user ? await sb.from('saved_articles').select('article_id').eq('article_id', a.id).maybeSingle() : {data: null};
  const {data: tp} = a.topic_id ? await sb.from('topic_names').select('name,locale').eq('topic_id', a.topic_id) : {data: null};
  const topic = (tp?.find((x: any) => x.locale === locale) ?? tp?.[0])?.name;
  return (<article className="px-6 pt-12">
    <div className="flex items-center justify-between"><Link href="/library" aria-label={t('common.back')} className="flex h-10 w-10 items-center justify-center rounded-full bg-mist"><ChevronLeft size={20} /></Link>
      <div className="flex items-center gap-2"><ReaderSettings f={prefs.f} s={prefs.s} />
        {user && <form action={toggleSave}><input type="hidden" name="article_id" value={a.id} /><input type="hidden" name="slug" value={a.slug} /><input type="hidden" name="saved" value={saved ? '1' : '0'} />
          <button aria-label={saved ? t('art.unsave') : t('art.save')} className="flex h-10 w-10 items-center justify-center rounded-full bg-mist"><Bookmark size={18} fill={saved ? 'currentColor' : 'none'} /></button></form>}
        <ShareButton path={`/library/${a.slug}`} title={a.title} text={`${a.title} · Biblesyn`} /></div></div>
    <p className="label mt-5">{topic ? `${topic} · ` : ''}{t('common.min', {n: a.read_minutes})}</p>
    <h1 className="mb-4 mt-2 font-serif text-[34px] font-bold leading-[1.1]">{a.title}</h1>
    {b ? <ArticleReader body={b.body} audioSrc={a.audio_url ?? `/api/tts?slug=${a.slug}`} f={prefs.f} s={prefs.s} />
      : (<><p className="font-serif text-[19px] leading-[1.7]">{a.excerpt}</p>
        {user ? <section className="my-6 rounded-[28px] bg-ink p-6 text-center text-white"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><Lock size={20} /></span><h2 className="mt-4 font-serif text-[28px] font-bold">{t('art.unlock')}</h2><Link href="/premium" className="btn mt-5 bg-leaf text-white">{t('art.see_premium')}</Link></section>
          : <Gate next={`/library/${a.slug}`} />}</>)}
  </article>);
}
