import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff, money} from '@/lib/admin';
const sum = (rows: any[], f?: (r: any) => boolean) => { const o: Record<string, number> = {}; rows.filter(f ?? (() => true)).forEach(r => { if (r.currency) o[r.currency.toUpperCase()] = (o[r.currency.toUpperCase()] ?? 0) + r.amount_cents; }); return o; };
const show = (o: Record<string, number>) => Object.entries(o).map(([c, v]) => money(v, c)).join(' · ') || '—';
export default async function Dashboard() {
  await requireStaff(true); const db = supabaseAdmin(); const now = Date.now(); const d = (n: number) => new Date(now - n * 864e5).toISOString();
  const cnt = (q: any) => q.then((r: any) => r.count ?? 0);
  const [total, n7, n30, premium, {data: subs}, {data: pays}, {data: ctry}, {data: arts}, canceled] = await Promise.all([
    cnt(db.from('profiles').select('*', {count: 'exact', head: true})), cnt(db.from('profiles').select('*', {count: 'exact', head: true}).gte('created_at', d(7))), cnt(db.from('profiles').select('*', {count: 'exact', head: true}).gte('created_at', d(30))),
    cnt(db.from('profiles').select('*', {count: 'exact', head: true}).eq('is_premium', true)), db.from('subscriptions').select('status,currency,amount_cents,cancel_at_period_end'),
    db.from('payments').select('currency,amount_cents,paid_at,refunded').limit(20000), db.from('profiles').select('country').limit(20000), db.from('articles').select('locale,published'),
    cnt(db.from('subscriptions').select('*', {count: 'exact', head: true}).eq('status', 'canceled').gte('updated_at', d(30)))]);
  const active = (subs ?? []).filter((s: any) => ['active', 'trialing'].includes(s.status)); const live = (pays ?? []).filter((p: any) => !p.refunded);
  const byC: Record<string, number> = {}; (ctry ?? []).forEach((r: any) => { const k = r.country || '—'; byC[k] = (byC[k] ?? 0) + 1; });
  const byL: Record<string, number> = {}; (arts ?? []).filter((a: any) => a.published).forEach((a: any) => { byL[a.locale] = (byL[a.locale] ?? 0) + 1; });
  const K = ({l, v, s}: {l: string; v: string | number; s?: string}) => <div className="rounded-2xl border border-line p-4"><div className="label">{l}</div><div className="mt-1 font-serif text-3xl font-bold">{v}</div>{s && <div className="mt-1 text-xs text-mute">{s}</div>}</div>;
  return (<div><h1 className="mb-4 font-serif text-3xl font-bold">Dashboard</h1>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><K l="Users" v={total} s={`+${n7} in 7 days · +${n30} in 30 days`} /><K l="Premium members" v={premium} s={`${active.length} paying via Stripe`} />
      <K l="MRR" v={show(sum(active))} s="Active subscriptions, by currency" /><K l="Revenue, last 30 days" v={show(sum(live, (p: any) => p.paid_at >= d(30)))} s="Net of refunds" />
      <K l="Revenue, all time" v={show(sum(live))} /><K l="Canceled, last 30 days" v={canceled} s={`${active.filter((s: any) => s.cancel_at_period_end).length} set to cancel at period end`} />
      <K l="Conversion" v={total ? `${Math.round((premium / total) * 100)}%` : '—'} s="Premium / all users" /><K l="Refunded payments" v={(pays ?? []).filter((p: any) => p.refunded).length} /></div>
    <div className="mt-6 grid gap-6 md:grid-cols-2"><div><h2 className="mb-2 font-semibold">Users by country</h2><table className="tbl"><tbody>{Object.entries(byC).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([c, n]) => <tr key={c}><td>{c}</td><td className="text-right">{n}</td></tr>)}</tbody></table></div>
      <div><h2 className="mb-2 font-semibold">Published articles by language</h2><table className="tbl"><tbody>{Object.entries(byL).map(([c, n]) => <tr key={c}><td>{c}</td><td className="text-right">{n}</td></tr>)}</tbody></table></div></div></div>);
}
