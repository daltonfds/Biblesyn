import Link from 'next/link';
import {Flame, Check, NotebookPen, ChevronRight} from 'lucide-react';
import {supabaseServer} from '@/lib/supabase/server';
import {getLocale} from '@/lib/locale';
import {getT} from '@/lib/i18n';
import {getStreak, getContinuePlan} from '@/lib/progress';
export const metadata = {title: 'Plans'};
export default async function Plans() {
  const sb = supabaseServer(); const t = await getT(); const locale = await getLocale();
  const {data: {user}} = await sb.auth.getUser();
  const {data: plans} = await sb.from('study_plans').select('id,slug,title,days').eq('published', true).eq('locale', locale).order('sort');
  let stats: {streak: number; done: number; notes: number} | null = null; let cont: Awaited<ReturnType<typeof getContinuePlan>> = null;
  if (user) {
    const [streak, {data: prog}, {count}] = await Promise.all([getStreak(sb, user.id), sb.from('plan_progress').select('plan_id').eq('user_id', user.id), sb.from('journal_entries').select('*', {count: 'exact', head: true}).eq('user_id', user.id)]);
    const per: Record<string, number> = {}; (prog ?? []).forEach((r: any) => { per[r.plan_id] = (per[r.plan_id] ?? 0) + 1; });
    stats = {streak, done: (plans ?? []).filter((p: any) => (per[p.id] ?? 0) >= p.days).length, notes: count ?? 0}; cont = await getContinuePlan(sb, user.id);
  }
  const S = ({Icon, n, l}: {Icon: any; n: number; l: string}) => <div className="flex-1 rounded-[20px] bg-mist p-3 text-center"><Icon size={16} className="mx-auto text-leaf" /><div className="font-serif text-[26px] font-bold leading-tight">{n}</div><div className="text-[11px] text-mute">{l}</div></div>;
  return (<div className="px-5 pt-[52px]"><h1 className="font-serif text-[36px] font-bold leading-tight">{t('plans.title')}</h1>
    {stats && <div className="mt-4 flex gap-2"><S Icon={Flame} n={stats.streak} l={t('plans.streak')} /><S Icon={Check} n={stats.done} l={t('plans.done')} /><S Icon={NotebookPen} n={stats.notes} l={t('plans.notes')} /></div>}
    {cont && <Link href={`/plans/${cont.slug}`} className="mt-3.5 block rounded-[28px] bg-ink p-5 text-white"><span className="label !text-white/60">{t('plans.in_progress')}</span>
      <div className="mt-1 font-serif text-[26px] font-bold">{cont.title}</div><div className="mt-1 text-sm text-white/70">{t('plans.day', {n: cont.next})}</div>
      <div className="my-3.5 h-1.5 rounded-full bg-white/20"><div className="h-1.5 rounded-full bg-[#22C55E]" style={{width: `${Math.round((cont.done / cont.days) * 100)}%`}} /></div>
      <span className="inline-flex h-[42px] items-center rounded-full bg-white px-[22px] text-sm font-semibold text-ink">{t('plans.continue_day', {n: cont.next})}</span></Link>}
    <h2 className="label mb-2 mt-6 px-1">{t('plans.explore')}</h2>
    <div className="space-y-2">{plans?.map((p: any) => <Link key={p.slug} href={`/plans/${p.slug}`} className="card flex items-center gap-3 px-4 py-3.5"><div className="flex-1"><div className="font-serif text-[19px] font-bold">{p.title}</div><div className="mt-0.5 text-xs text-mute">{t('plans.days', {n: p.days})}</div></div><ChevronRight size={18} className="text-mute" /></Link>)}</div></div>);
}
