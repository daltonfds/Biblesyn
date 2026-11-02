import Link from 'next/link';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff} from '@/lib/admin';
import LangTabs from '@/components/LangTabs';
import {savePlan, deletePlan, saveDay, deleteDay} from '../../actions';
export default async function PlanEditor({params, searchParams}: {params: {group: string}; searchParams: {lang?: string; saved?: string; err?: string}}) {
  await requireStaff(); const db = supabaseAdmin();
  const [{data: langs}, {data: vers}] = await Promise.all([db.from('languages').select('code,name').eq('active', true).order('sort'), db.from('study_plans').select('*').eq('group_id', params.group)]);
  const lang = searchParams.lang && langs?.some((l: any) => l.code === searchParams.lang) ? searchParams.lang : langs?.[0]?.code ?? 'en'; const p: any = vers?.find((v: any) => v.locale === lang);
  const {data: days} = p ? await db.from('study_plan_days').select('*').eq('plan_id', p.id).order('day_number') : {data: []}; const nextNo = (days?.length ? Math.max(...days.map((d: any) => d.day_number)) : 0) + 1;
  const DayForm = ({d}: {d?: any}) => (<form action={saveDay} className="grid gap-2 md:grid-cols-2"><input type="hidden" name="group" value={params.group} /><input type="hidden" name="locale" value={lang} /><input type="hidden" name="plan_id" value={p.id} />
    <label className="text-xs font-semibold">Day number<input name="day_number" type="number" min={1} required defaultValue={d?.day_number ?? nextNo} className="ai mt-1" /></label><label className="text-xs font-semibold">Title<input name="title" defaultValue={d?.title} className="ai mt-1" /></label>
    <label className="text-xs font-semibold md:col-span-2">Bible passage<input name="passage" defaultValue={d?.passage ?? ''} className="ai mt-1" /></label><label className="text-xs font-semibold md:col-span-2">Explanation<textarea name="body" rows={5} defaultValue={d?.body ?? ''} className="ai mt-1" /></label>
    <label className="text-xs font-semibold">Reflection<textarea name="reflection" rows={3} defaultValue={d?.reflection ?? ''} className="ai mt-1" /></label><label className="text-xs font-semibold">Prayer<textarea name="prayer" rows={3} defaultValue={d?.prayer ?? ''} className="ai mt-1" /></label><button className="ab md:col-span-2 md:w-fit">Save day</button></form>);
  return (<div><Link href="/admin/plans" className="text-sm text-mute underline">‹ Plans</Link><h1 className="mb-3 mt-2 font-serif text-3xl font-bold">{p?.title ?? 'New plan'}</h1>
    <LangTabs base={`/admin/plans/${params.group}`} langs={langs ?? []} cur={lang} has={new Set((vers ?? []).map((v: any) => v.locale))} />
    {searchParams.saved && <p className="mb-2 text-sm text-leaf">Saved.</p>}{searchParams.err && <p role="alert" className="mb-2 text-sm text-red-600">{searchParams.err}</p>}
    <form action={savePlan} className="grid gap-3 md:grid-cols-2"><input type="hidden" name="group" value={params.group} /><input type="hidden" name="locale" value={lang} />
      <label className="text-sm font-semibold md:col-span-2">Title ({lang})<input name="title" required defaultValue={p?.title} className="ai mt-1" /></label><label className="text-sm font-semibold">Slug<input name="slug" defaultValue={p?.slug} placeholder="auto from title" className="ai mt-1" /></label>
      <label className="text-sm font-semibold">Total days<input name="days" type="number" min={1} defaultValue={p?.days ?? 7} className="ai mt-1" /></label><label className="text-sm font-semibold">Order<input name="sort" type="number" defaultValue={p?.sort ?? 0} className="ai mt-1" /></label>
      <label className="text-sm font-semibold md:col-span-2">Description<textarea name="description" rows={2} defaultValue={p?.description ?? ''} className="ai mt-1" /></label>
      <div className="flex items-center gap-5 md:col-span-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="published" defaultChecked={p?.published ?? true} />Published</label><button className="ab">Save {lang}</button></div></form>
    {p && <><h2 className="mb-2 mt-8 font-semibold">Days ({days?.length ?? 0} of {p.days}). Day 1 is free for members; the rest is Premium.</h2><div className="space-y-2">{days?.map((d: any) => <details key={d.id} className="rounded-2xl border border-line p-4"><summary className="cursor-pointer font-semibold">Day {d.day_number} · {d.title}</summary><div className="mt-3"><DayForm d={d} />
      <form action={deleteDay} className="mt-2"><input type="hidden" name="id" value={d.id} /><input type="hidden" name="group" value={params.group} /><input type="hidden" name="locale" value={lang} /><button className="ab-line !text-red-700">Delete day</button></form></div></details>)}
      <details className="rounded-2xl border border-dashed border-line p-4" open={!days?.length}><summary className="cursor-pointer font-semibold">Add day {nextNo}</summary><div className="mt-3"><DayForm /></div></details></div>
      <form action={deletePlan} className="mt-8"><input type="hidden" name="group" value={params.group} /><input type="hidden" name="locale" value={lang} /><button className="ab-line !text-red-700">Delete {lang} version</button></form></>}</div>);
}
