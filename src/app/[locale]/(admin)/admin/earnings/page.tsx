import Link from 'next/link';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff, money} from '@/lib/admin';
export default async function Earnings() {
  await requireStaff(true); const {data} = await supabaseAdmin().from('payments').select('*,profiles(email)').order('paid_at', {ascending: false}).limit(5000); const rows = data ?? []; const live = rows.filter((p: any) => !p.refunded);
  const month = (d: string) => d.slice(0, 7); const cur = new Date().toISOString().slice(0, 7); const prev = new Date(Date.now() - 31 * 864e5).toISOString().slice(0, 7);
  const agg = (f: (p: any) => boolean, key: (p: any) => string) => { const o: Record<string, Record<string, number>> = {}; live.filter(f).forEach((p: any) => { const k = key(p); o[k] ??= {}; o[k][p.currency.toUpperCase()] = (o[k][p.currency.toUpperCase()] ?? 0) + p.amount_cents; }); return o; };
  const fmtM = (o?: Record<string, number>) => o ? Object.entries(o).map(([c, v]) => money(v, c)).join(' · ') : '—';
  const byMonth = agg(() => true, p => month(p.paid_at)); const byCountry = agg(() => true, p => p.country ?? '—'); const tot = agg(() => true, () => 'all').all; const thisM = agg(p => month(p.paid_at) === cur, () => 'x').x; const lastM = agg(p => month(p.paid_at) === prev, () => 'x').x;
  return (<div><div className="mb-4 flex items-center justify-between"><h1 className="font-serif text-3xl font-bold">Earnings</h1><a href="/admin/earnings/export" className="ab-line">Export CSV</a></div>
    <div className="grid gap-3 md:grid-cols-3">{[['This month', thisM], ['Last month', lastM], ['All time', tot]].map(([l, v]: any) => <div key={l} className="rounded-2xl border border-line p-4"><div className="label">{l}</div><div className="mt-1 font-serif text-2xl font-bold">{fmtM(v)}</div></div>)}</div>
    <p className="mt-2 text-xs text-mute">Amounts are shown per currency (no conversion). Refunded payments are excluded.</p>
    <div className="mt-6 grid gap-6 md:grid-cols-2"><div><h2 className="mb-2 font-semibold">By month</h2><table className="tbl"><tbody>{Object.entries(byMonth).sort().reverse().slice(0, 12).map(([m, v]) => <tr key={m}><td>{m}</td><td className="text-right">{fmtM(v)}</td></tr>)}</tbody></table></div>
      <div><h2 className="mb-2 font-semibold">By country</h2><table className="tbl"><tbody>{Object.entries(byCountry).map(([c, v]) => <tr key={c}><td>{c}</td><td className="text-right">{fmtM(v)}</td></tr>)}</tbody></table></div></div>
    <h2 className="mb-2 mt-6 font-semibold">Latest payments</h2><div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Date</th><th>User</th><th>Country</th><th>Amount</th><th></th></tr></thead><tbody>{rows.slice(0, 50).map((p: any) => <tr key={p.id}><td>{new Date(p.paid_at).toLocaleDateString()}</td>
      <td>{p.user_id ? <Link href={`/admin/users/${p.user_id}`} className="underline">{p.profiles?.email ?? p.user_id}</Link> : '—'}</td><td>{p.country ?? '—'}</td><td>{money(p.amount_cents, p.currency)}</td><td>{p.refunded ? 'refunded' : ''}</td></tr>)}</tbody></table></div></div>);
}
