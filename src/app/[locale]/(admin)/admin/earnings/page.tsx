import {Link} from '@/i18n/navigation';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff, money} from '@/lib/admin';

export default async function Earnings() {
  await requireStaff(true);
  const {data} = await supabaseAdmin().from('payment_transactions').select('*,profiles(email)').order('paid_at', {ascending: false}).limit(5000);
  const rows = data ?? [];
  const live = rows.filter((payment: any) => !payment.refunded && payment.status === 'paid');
  const month = (value: string) => value.slice(0, 7);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const previousMonth = new Date(Date.now() - 31 * 864e5).toISOString().slice(0, 7);
  const aggregate = (filter: (payment: any) => boolean, key: (payment: any) => string) => {
    const result: Record<string, Record<string, number>> = {};
    live.filter(filter).forEach((payment: any) => {
      const group = key(payment); result[group] ??= {};
      const currency = payment.currency?.toUpperCase() || '—';
      result[group][currency] = (result[group][currency] ?? 0) + Number(payment.amount_cents || 0);
    });
    return result;
  };
  const format = (values?: Record<string, number>) => values ? Object.entries(values).map(([currency, amount]) => money(amount, currency)).join(' · ') : '—';
  const byMonth = aggregate(() => true, payment => month(payment.paid_at));
  const byCountry = aggregate(() => true, payment => payment.country ?? '—');
  const total = aggregate(() => true, () => 'all').all;
  const thisMonth = aggregate(payment => month(payment.paid_at) === currentMonth, () => 'x').x;
  const lastMonth = aggregate(payment => month(payment.paid_at) === previousMonth, () => 'x').x;
  return (<div><div className="mb-4 flex items-center justify-between"><h1 className="font-serif text-3xl font-bold">Earnings</h1><a href="/admin/earnings/export" className="ab-line">Export CSV</a></div>
    <div className="grid gap-3 md:grid-cols-3">{[['This month', thisMonth], ['Last month', lastMonth], ['All time', total]].map(([label, values]: any) => <div key={label} className="rounded-2xl border border-line p-4"><div className="label">{label}</div><div className="mt-1 font-serif text-2xl font-bold">{format(values)}</div></div>)}</div>
    <p className="mt-2 text-xs text-mute">Amounts are shown per currency (no conversion). Refunded and charged-back payments are excluded.</p>
    <div className="mt-6 grid gap-6 md:grid-cols-2"><div><h2 className="mb-2 font-semibold">By month</h2><table className="tbl"><tbody>{Object.entries(byMonth).sort().reverse().slice(0,12).map(([value, amounts]) => <tr key={value}><td>{value}</td><td className="text-right">{format(amounts)}</td></tr>)}</tbody></table></div>
      <div><h2 className="mb-2 font-semibold">By country</h2><table className="tbl"><tbody>{Object.entries(byCountry).map(([country, amounts]) => <tr key={country}><td>{country}</td><td className="text-right">{format(amounts)}</td></tr>)}</tbody></table></div></div>
    <h2 className="mb-2 mt-6 font-semibold">Latest payments</h2><div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Date</th><th>User</th><th>Provider</th><th>Country</th><th>Amount</th><th>Status</th></tr></thead><tbody>{rows.slice(0,50).map((payment: any) => <tr key={payment.id}>
      <td>{new Date(payment.paid_at).toLocaleDateString()}</td><td>{payment.user_id ? <Link href={'/admin/users/' + payment.user_id} className="underline">{payment.profiles?.email ?? payment.user_id}</Link> : '—'}</td>
      <td>{payment.provider}</td><td>{payment.country ?? '—'}</td><td>{payment.currency ? money(payment.amount_cents, payment.currency) : '—'}</td><td>{payment.refunded ? 'refunded' : payment.status}</td>
    </tr>)}</tbody></table></div></div>);
}
