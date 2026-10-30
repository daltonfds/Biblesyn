import {notFound} from 'next/navigation';
import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
import Gate from '@/components/Gate';
import {completeDay} from './actions';
export default async function Plan({params}: {params: {slug: string}}) {
  const sb = supabaseServer();
  const {data: plan} = await sb.from('study_plans').select('*').eq('slug', params.slug).maybeSingle();
  if (!plan) notFound();
  const {data: {user}} = await sb.auth.getUser();
  if (!user) return (<div className="px-6 pt-14"><h1 className="font-serif text-4xl font-semibold">{plan.title}</h1><p className="mt-2 text-sm">{plan.description}</p><Gate next={`/plans/${plan.slug}`} title="Create a free account to start this plan" /></div>);
  const [{data: days}, {data: done}] = await Promise.all([
    sb.from('study_plan_days').select('*').eq('plan_id', plan.id).order('day_number'),
    sb.from('plan_progress').select('day_number').eq('plan_id', plan.id)]);
  const doneSet = new Set((done ?? []).map((d: any) => d.day_number));
  return (<div className="px-5 pt-14"><h1 className="px-1 font-serif text-4xl font-semibold">{plan.title}</h1>
    <p className="px-1 pt-1 text-sm text-[#6F5A40]">{doneSet.size} of {plan.days} days complete</p>
    <div className="mt-4 space-y-2">{days?.map((d: any) => <details key={d.id} className="rounded-2xl border border-[#E3D5B8] bg-[#FFFDF8] p-4">
      <summary className="cursor-pointer font-serif text-xl font-semibold">Day {d.day_number} · {d.title}{doneSet.has(d.day_number) ? ' ✓' : ''}</summary>
      <div className="mt-3 space-y-3 text-sm leading-relaxed"><p className="text-xs text-[#6F5A40]">{d.passage}</p><p>{d.body}</p><p className="italic">{d.reflection}</p><p>{d.prayer}</p>
        <form action={completeDay}><input type="hidden" name="plan_id" value={plan.id} /><input type="hidden" name="day" value={d.day_number} /><input type="hidden" name="slug" value={plan.slug} />
          <button className="rounded-full bg-brown px-5 py-2 text-sm text-parchment">Mark complete</button></form></div></details>)}
      {days && days.length < plan.days && <div className="rounded-2xl bg-parchment p-4 text-sm">More days unlock with <Link href="/premium" className="font-semibold underline">Premium</Link>.</div>}</div></div>);
}