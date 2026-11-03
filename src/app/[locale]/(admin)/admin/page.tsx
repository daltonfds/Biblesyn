import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff, money} from '@/lib/admin';

const sum = (rows: any[]) => {
  const out: Record<string, number> = {};
  rows.filter(row => !row.refunded && row.status === 'paid').forEach(row => {
    if (row.currency) out[row.currency.toUpperCase()] = (out[row.currency.toUpperCase()] ?? 0) + Number(row.amount_cents || 0);
  });
  return out;
};
const show = (values: Record<string, number>) => Object.entries(values).map(([currency, amount]) => money(amount, currency)).join(' · ') || '—';

export default async function Dashboard() {
  await requireStaff(true);
  const db = supabaseAdmin();
  const now = Date.now();
  const since = (days: number) => new Date(now - days * 864e5).toISOString();
  const count = (query: any) => query.then((result: any) => result.count ?? 0);
  const [total, n7, n30, premium, {data: payments}, {data: countries}, {data: articles}, {count: canceled}] = await Promise.all([
    count(db.from('profiles').select('*', {count: 'exact', head: true})),
    count(db.from('profiles').select('*', {count: 'exact', head: true}).gte('created_at', since(7))),
    count(db.from('profiles').select('*', {count: 'exact', head: true}).gte('created_at', since(30))),
    count(db.from('profiles').select('*', {count: 'exact', head: true}).eq('is_premium', true).or('premium_expires_at.is.null,premium_expires_at.gt.' + new Date().toISOString())),
    db.from('payment_transactions').select('currency,amount_cents,paid_at,refunded,status').limit(20000),
    db.from('profiles').select('country').limit(20000),
    db.from('articles').select('locale,published'),
    count(db.from('payment_webhook_events').select('*', {count: 'exact', head: true}).ilike('event_type', '%cancel%').gte('created_at', since(30))),
  ]);
  const paid = (payments ?? []).filter((payment: any) => payment.status === 'paid' && !payment.refunded);
  const byCountry: Record<string, number> = {};
  (countries ?? []).forEach((row: any) => { const key = row.country || '—'; byCountry[key] = (byCountry[key] ?? 0) + 1; });
  const byLocale: Record<string, number> = {};
  (articles ?? []).filter((article: any) => article.published).forEach((article: any) => { byLocale[article.locale] = (byLocale[article.locale] ?? 0) + 1; });
  const K = ({label, value, note}: {label: string; value: string | number; note?: string}) =>
    <div className="rounded-2xl border border-line p-4"><div className="label">{label}</div><div className="mt-1 font-serif text-3xl font-bold">{value}</div>{note && <div className="mt-1 text-xs text-mute">{note}</div>}</div>;
  return (<div><h1 className="mb-4 font-serif text-3xl font-bold">Dashboard</h1>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <K label="Users" value={total} note={'+' + n7 + ' in 7 days · +' + n30 + ' in 30 days'} />
      <K label="Premium members" value={premium} note="Active access, including manual grants" />
      <K label="Collected revenue" value={show(sum(paid))} note="All confirmed payments, by currency" />
      <K label="Revenue, last 30 days" value={show(sum(paid.filter((payment: any) => payment.paid_at >= since(30))))} note="Excludes refunds and chargebacks" />
      <K label="Canceled events, last 30 days" value={canceled ?? 0} />
      <K label="Conversion" value={total ? Math.round((premium / total) * 100) + '%' : '—'} note="Premium / all users" />
      <K label="Refunded payments" value={(payments ?? []).filter((payment: any) => payment.refunded).length} />
    </div>
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <div><h2 className="mb-2 font-semibold">Users by country</h2><table className="tbl"><tbody>{Object.entries(byCountry).sort((a,b) => b[1]-a[1]).slice(0,10).map(([country, number]) => <tr key={country}><td>{country}</td><td className="text-right">{number}</td></tr>)}</tbody></table></div>
      <div><h2 className="mb-2 font-semibold">Published articles by language</h2><table className="tbl"><tbody>{Object.entries(byLocale).map(([locale, number]) => <tr key={locale}><td>{locale}</td><td className="text-right">{number}</td></tr>)}</tbody></table></div>
    </div>
  </div>);
}
