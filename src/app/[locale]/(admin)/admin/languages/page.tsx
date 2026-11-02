import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff} from '@/lib/admin';
import {saveLanguage, makeDefaultLanguage} from '../actions';
export default async function Languages({searchParams}: {searchParams: {saved?: string; err?: string}}) {
  await requireStaff(true); const {data} = await supabaseAdmin().from('languages').select('*').order('sort');
  const F = ({l}: {l?: any}) => (<form action={saveLanguage} className="grid items-end gap-2 md:grid-cols-6"><label className="text-xs font-semibold">Code<input name="code" required defaultValue={l?.code} readOnly={!!l} placeholder="pt" className="ai mt-1" /></label><label className="text-xs font-semibold">Name<input name="name" required defaultValue={l?.name} className="ai mt-1" /></label>
    <label className="text-xs font-semibold">Native name<input name="native_name" defaultValue={l?.native_name ?? ''} className="ai mt-1" /></label><label className="text-xs font-semibold">Order<input name="sort" type="number" defaultValue={l?.sort ?? 0} className="ai mt-1" /></label>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={l?.active ?? true} />Active</label><button className="ab">Save</button></form>);
  return (<div><h1 className="mb-1 font-serif text-3xl font-bold">Languages</h1><p className="mb-3 text-sm text-mute">Active languages appear in the language selectors. The default language is used when the visitor&apos;s language is not available.</p>
    {searchParams.saved && <p className="mb-2 text-sm text-leaf">Saved.</p>}{searchParams.err && <p role="alert" className="mb-2 text-sm text-red-600">{searchParams.err}</p>}
    <div className="space-y-3">{data?.map((l: any) => <div key={l.code} className="rounded-2xl border border-line p-4"><F l={l} />{l.is_default ? <p className="mt-2 text-xs font-semibold text-leaf">Default language</p> : <form action={makeDefaultLanguage} className="mt-2"><input type="hidden" name="code" value={l.code} /><button className="ab-line">Make default</button></form>}</div>)}
      <div className="rounded-2xl border border-dashed border-line p-4"><div className="mb-2 text-sm font-semibold">Add language</div><F /></div></div></div>);
}
