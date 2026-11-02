import {notFound} from 'next/navigation';
import Link from 'next/link';
import {ChevronLeft, Check} from 'lucide-react';
import {supabaseServer} from '@/lib/supabase/server';
import {getLocale, getReaderPrefs} from '@/lib/locale';
import {getT} from '@/lib/i18n';
import Gate from '@/components/Gate';
import ShareButton from '@/components/ShareButton';
import {FONT_CSS} from '@/components/ReaderSettings';
import {completeDay} from './actions';
export default async function Plan({params}: {params: {slug: string}}) {
  const sb = supabaseServer(); const t = await getT(); const prefs = getReaderPrefs();
  const {data: plan} = await sb.from('study_plans').select('*').eq('slug', params.slug).eq('locale', await getLocale()).maybeSingle();
  if (!plan) notFound();
  const {data: {user}} = await sb.auth.getUser();
  const head = (<div className="flex items-center justify-between"><Link href="/plans" aria-label={t('common.back')} className="flex h-10 w-10 items-center justify-center rounded-full bg-mist"><ChevronLeft size={20} /></Link><ShareButton path={`/plans/${plan.slug}`} title={plan.title} text={`${plan.title} · Biblesyn`} /></div>);
  if (!user) return (<div className="px-6 pt-12">{head}<h1 className="mt-6 font-serif text-[36px] font-bold leading-tight">{plan.title}</h1><p className="mt-2 text-[15px] text-mute">{plan.description}</p><Gate next={`/plans/${plan.slug}`} title={t('gate.title_plan')} /></div>);
  const [{data: days}, {data: done}] = await Promise.all([sb.from('study_plan_days').select('*').eq('plan_id', plan.id).order('day_number'), sb.from('plan_progress').select('day_number').eq('plan_id', plan.id)]);
  const doneSet = new Set((done ?? []).map((d: any) => d.day_number)); let nextDay = 1; while (doneSet.has(nextDay)) nextDay++;
  const ff = {fontFamily: FONT_CSS[prefs.f], fontSize: prefs.s, lineHeight: 1.7};
  return (<div className="px-5 pt-12">{head}<h1 className="mt-6 px-1 font-serif text-[36px] font-bold leading-tight">{plan.title}</h1>
    <div className="mx-1 mt-3 h-1.5 rounded-full bg-mist"><div className="h-1.5 rounded-full bg-leaf" style={{width: `${Math.round((doneSet.size / plan.days) * 100)}%`}} /></div>
    <p className="mt-2 px-1 text-sm text-mute">{t('plans.progress', {done: doneSet.size, total: plan.days})}</p>
    <div className="mt-4 space-y-2">{days?.map((d: any) => <details key={d.id} className="card p-4" open={d.day_number === nextDay}>
      <summary className="flex cursor-pointer items-center gap-2 font-serif text-xl font-bold">{doneSet.has(d.day_number) && <Check size={18} className="text-leaf" />}{t('plans.day', {n: d.day_number})} · {d.title}</summary>
      <div className="mt-3 space-y-3" style={ff}><p className="label" style={{fontFamily: 'var(--sans)'}}>{d.passage}</p><p>{d.body}</p><p className="italic">{d.reflection}</p><p className="text-mute">{d.prayer}</p>
        <form action={completeDay}><input type="hidden" name="plan_id" value={plan.id} /><input type="hidden" name="day" value={d.day_number} /><input type="hidden" name="slug" value={plan.slug} />
          <button className="btn-ink">{doneSet.has(d.day_number) ? t('plans.completed') : t('plans.mark')}</button></form></div></details>)}
      {days && days.length < plan.days && <div className="rounded-2xl bg-mist p-4 text-sm">{t('plans.more_premium')} <Link href="/premium" className="font-semibold underline">{t('art.see_premium')}</Link></div>}</div></div>);
}
