import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff} from '@/lib/admin';
import {saveCountry, deleteCountry} from '../actions';
export default async function Pricing({searchParams}: {searchParams: {saved?: string; err?: string}}) {
  await requireStaff(true); const db = supabaseAdmin();
  const [{data: countries}, {data: prices}, {data: langs}] = await Promise.all([db.from('countries').select('*').order('name'), db.from('prices').select('*'), db.from('languages').select('code,name').order('sort')]);
  const pr = (c: string) => prices?.find((p: any) => p.country === c); const star = pr('*');
  const F = ({c, code, name}: {c?: any; code?: string; name?: string}) => { const p = c ? pr(c.code) : star; return (<form action={saveCountry} className="grid items-end gap-2 md:grid-cols-8">
    <label className="text-xs font-semibold">Code<input name="code" required defaultValue={code ?? c?.code} readOnly={!!(c || code)} placeholder="PT" className="ai mt-1" /></label>
    {code !== '*' ? <><label className="text-xs font-semibold md:col-span-2">Country<input name="name" required defaultValue={name ?? c?.name} className="ai mt-1" /></label>
      <label className="text-xs font-semibold">Default language<select name="default_locale" defaultValue={c?.default_locale ?? ''} className="ai mt-1"><option value="">—</option>{langs?.map((l: any) => <option key={l.code} value={l.code}>{l.name}</option>)}</select></label></> : <div className="md:col-span-3 text-sm text-mute">Price used for countries without their own price.</div>}
    <label className="text-xs font-semibold">Currency<input name="currency" maxLength={3} defaultValue={p?.currency ?? ''} placeholder="EUR" className="ai mt-1 uppercase" /></label><label className="text-xs font-semibold">Monthly price<input name="amount" inputMode="decimal" defaultValue={p ? (p.amount_cents / 100).toFixed(2) : ''} placeholder="1.00" className="ai mt-1" /></label>
    <div className="flex flex-col gap-1 text-xs">{code !== '*' && <><label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={c?.active ?? true} />Country active</label><label className="flex items-center gap-2"><input type="checkbox" name="price_active" defaultChecked={p?.active ?? true} />Price active</label></>}<button className="ab mt-1">Save</button></div></form>); };
  return (<div><h1 className="mb-1 font-serif text-3xl font-bold">Countries &amp; pricing</h1><p className="mb-3 text-sm text-mute">Users pick their country at signup. It sets their currency, the monthly price and the suggested language. Use currencies Stripe supports; countries without a price use the default price.</p>
    {searchParams.saved && <p className="mb-2 text-sm text-leaf">Saved.</p>}{searchParams.err && <p role="alert" className="mb-2 text-sm text-red-600">{searchParams.err}</p>}
    <div className="mb-3 rounded-2xl border-2 border-ink p-4"><div className="mb-2 text-sm font-semibold">Default price</div><F code="*" /></div>
    <div className="space-y-3">{countries?.map((c: any) => <div key={c.code} className="rounded-2xl border border-line p-4"><F c={c} /><form action={deleteCountry} className="mt-2"><input type="hidden" name="code" value={c.code} /><button className="ab-line !text-red-700">Delete</button></form></div>)}
      <div className="rounded-2xl border border-dashed border-line p-4"><div className="mb-2 text-sm font-semibold">Add country</div><F name="" /></div></div></div>);
}
