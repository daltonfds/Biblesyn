import Link from 'next/link';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff, money} from '@/lib/admin';
export default async function Subs({searchParams}: {searchParams: {status?: string}}) {
  await requireStaff(true); let q = supabaseAdmin().from('subscriptions').select('*,profiles(email)').order('updated_at', {ascending: false}).limit(200); if (searchParams.status) q = q.eq('status', searchParams.status);
  const {data} = await q; const tab = (s: string, l: string) => <Link key={s} href={s ? `/admin/subscriptions?status=${s}` : '/admin/subscriptions'} className={`rounded-full px-4 py-2 text-sm font-semibold ${(searchParams.status ?? '') === s ? 'bg-ink text-white' : 'bg-mist'}`}>{l}</Link>;
  return (<div><h1 className="mb-4 font-serif text-3xl font-bold">Subscriptions</h1><div className="mb-4 flex flex-wrap gap-2">{tab('', 'All')}{tab('active', 'Active')}{tab('past_due', 'Past due')}{tab('canceled', 'Canceled')}</div>
    <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>User</th><th>Status</th><th>Price</th><th>Country</th><th>Renews / ends</th><th>Started</th></tr></thead><tbody>{data?.map((s: any) => <tr key={s.id}>
      <td><Link href={`/admin/users/${s.user_id}`} className="underline">{s.profiles?.email ?? s.user_id}</Link></td><td>{s.status}{s.cancel_at_period_end ? ' (cancels)' : ''}</td><td>{s.currency ? `${money(s.amount_cents, s.currency)}/mo` : '—'}</td><td>{s.country ?? '—'}</td>
      <td>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}</td><td>{new Date(s.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></div>);
}
