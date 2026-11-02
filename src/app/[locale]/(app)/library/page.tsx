import Link from 'next/link';
import {Search, Play} from 'lucide-react';
import {supabaseServer} from '@/lib/supabase/server';
import {getLocale} from '@/lib/locale';
import {getT} from '@/lib/i18n';
export const metadata = {title: 'Library'};
export default async function Library({searchParams}: {searchParams: {topic?: string; q?: string}}) {
  const sb = supabaseServer(); const t = await getT(); const locale = await getLocale();
  const q = (searchParams.q ?? '').replace(/[,%()*]/g, ' ').trim();
  const {data: topics} = await sb.from('topics').select('id,slug,topic_names(locale,name)').order('sort');
  const nm = (tp: any) => (tp.topic_names?.find((n: any) => n.locale === locale) ?? tp.topic_names?.[0])?.name ?? tp.slug;
  const cur = topics?.find((x: any) => x.slug === searchParams.topic);
  let query = sb.from('articles').select('slug,title,topic_id,read_minutes,is_free').eq('published', true).eq('locale', locale).order('created_at', {ascending: false});
  if (cur) query = query.eq('topic_id', cur.id);
  if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
  const {data} = await query; const tname = (id: string | null) => { const x = topics?.find((y: any) => y.id === id); return x ? nm(x) : ''; };
  const chip = (on: boolean) => `shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-semibold ${on ? 'bg-ink text-white' : 'bg-mist text-ink'}`;
  return (<div className="px-5 pt-[52px]"><h1 className="font-serif text-[36px] font-bold leading-tight">{t('lib.title')}</h1>
    <form className="relative mt-4"><Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
      <label htmlFor="q" className="sr-only">{t('lib.search')}</label><input id="q" name="q" defaultValue={q} placeholder={t('lib.search')} className="field pl-11" />
      {cur && <input type="hidden" name="topic" value={cur.slug} />}</form>
    <div className="-mx-5 mt-3.5 flex gap-2 overflow-x-auto px-5 pb-1"><Link href="/library" className={chip(!cur)}>{t('lib.all')}</Link>
      {topics?.map((x: any) => <Link key={x.id} href={`/library?topic=${x.slug}`} className={chip(cur?.id === x.id)}>{nm(x)}</Link>)}</div>
    <div className="mt-2 space-y-2">{data?.map((a: any) => <Link key={a.slug} href={`/library/${a.slug}`} className="card flex items-center gap-3 p-4">
      <div className="flex-1"><div className="font-serif text-xl font-bold leading-tight">{a.title}</div><div className="mt-1.5 text-xs text-mute">{t('common.min', {n: a.read_minutes})}{tname(a.topic_id) ? ` · ${tname(a.topic_id)}` : ''}{a.is_free ? ` · ${t('common.free')}` : ''}</div></div>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist"><Play size={14} fill="currentColor" /></span></Link>)}
      {data?.length === 0 && <p className="py-8 text-center text-sm text-mute">{t('lib.empty')}</p>}</div></div>);
}
