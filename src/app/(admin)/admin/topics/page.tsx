import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff} from '@/lib/admin';
import {saveTopic, deleteTopic} from '../actions';
export default async function Topics({searchParams}: {searchParams: {saved?: string; err?: string}}) {
  await requireStaff(); const db = supabaseAdmin(); const [{data: langs}, {data: topics}] = await Promise.all([db.from('languages').select('code,name').eq('active', true).order('sort'), db.from('topics').select('id,slug,sort,topic_names(locale,name)').order('sort')]);
  const F = ({t}: {t?: any}) => (<form action={saveTopic} className="grid gap-2 md:grid-cols-6"><label className="text-xs font-semibold">Slug<input name="slug" required defaultValue={t?.slug} readOnly={!!t} className="ai mt-1" /></label><label className="text-xs font-semibold">Order<input name="sort" type="number" defaultValue={t?.sort ?? 0} className="ai mt-1" /></label>
    {langs?.map((l: any) => <label key={l.code} className="text-xs font-semibold">Name ({l.code})<input name={`name_${l.code}`} defaultValue={t?.topic_names?.find((n: any) => n.locale === l.code)?.name ?? ''} className="ai mt-1" /></label>)}<button className="ab self-end">Save</button></form>);
  return (<div><h1 className="mb-3 font-serif text-3xl font-bold">Topics</h1>{searchParams.saved && <p className="mb-2 text-sm text-leaf">Saved.</p>}{searchParams.err && <p role="alert" className="mb-2 text-sm text-red-600">{searchParams.err}</p>}
    <div className="space-y-3">{topics?.map((t: any) => <div key={t.id} className="rounded-2xl border border-line p-4"><F t={t} /><form action={deleteTopic} className="mt-2"><input type="hidden" name="id" value={t.id} /><button className="ab-line !text-red-700">Delete</button></form></div>)}
      <div className="rounded-2xl border border-dashed border-line p-4"><div className="mb-2 text-sm font-semibold">New topic</div><F /></div></div></div>);
}
