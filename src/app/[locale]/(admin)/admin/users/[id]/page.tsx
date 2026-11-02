import {notFound} from 'next/navigation';
import Link from 'next/link';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff, money} from '@/lib/admin';
import {userAction} from '../../actions';
export default async function UserPage({params, searchParams}: {params: {id: string}; searchParams: {saved?: string}}) {
  const me = await requireStaff(true); const db = supabaseAdmin();
  const {data: u} = await db.from('profiles').select('*').eq('id', params.id).maybeSingle(); if (!u) notFound();
  const [{data: subs}, {data: pays}, {count: notes}, {count: done}] = await Promise.all([db.from('subscriptions').select('*').eq('user_id', u.id).order('created_at', {ascending: false}), db.from('payments').select('*').eq('user_id', u.id).order('paid_at', {ascending: false}),
    db.from('journal_entries').select('*', {count: 'exact', head: true}).eq('user_id', u.id), db.from('plan_progress').select('*', {count: 'exact', head: true}).eq('user_id', u.id)]);
  const Btn = ({op, label, danger}: {op: string; label: string; danger?: boolean}) => <form action={userAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="op" value={op} /><button className={danger ? 'ab-line !text-red-700' : 'ab'}>{label}</button></form>;
  return (<div><Link href="/admin/users" className="text-sm text-mute underline">‹ Users</Link><h1 className="mb-1 mt-2 font-serif text-3xl font-bold">{u.email}</h1>
    {searchParams.saved && <p className="mb-2 text-sm text-leaf">Saved.</p>}
    <p className="text-sm text-mute">Joined {new Date(u.created_at).toLocaleDateString()} · Country {u.country ?? '—'} · Language {u.locale} · Role {u.role} · {u.is_premium ? `Premium (${u.premium_source})` : 'Free'}{u.suspended ? ' · SUSPENDED' : ''} · {done ?? 0} plan days · {notes ?? 0} journal entries</p>
    <div className="my-4 flex flex-wrap items-center gap-2">{u.is_premium ? <Btn op="revoke" label="Revoke premium" danger /> : <Btn op="grant" label="Grant premium" />}{u.suspended ? <Btn op="unsuspend" label="Unsuspend" /> : u.id !== me.id && <Btn op="suspend" label="Suspend" danger />}
      {u.id !== me.id && <form action={userAction} className="flex gap-2"><input type="hidden" name="id" value={u.id} /><input type="hidden" name="op" value="role" /><select name="role" defaultValue={u.role} aria-label="Role" className="ai"><option value="user">User</option><option value="editor">Editor</option><option value="admin">Admin</option></select><button className="ab-line">Set role</button></form>}</div>
    <h2 className="mb-2 mt-6 font-semibold">Subscriptions</h2><table className="tbl"><thead><tr><th>Status</th><th>Amount</th><th>Country</th><th>Period end</th></tr></thead><tbody>{subs?.map((s: any) => <tr key={s.id}><td>{s.status}{s.cancel_at_period_end ? ' (cancels)' : ''}</td><td>{s.currency ? money(s.amount_cents, s.currency) : '—'}</td><td>{s.country ?? '—'}</td><td>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}</td></tr>)}</tbody></table>
    <h2 className="mb-2 mt-6 font-semibold">Payments</h2><table className="tbl"><thead><tr><th>Date</th><th>Amount</th><th>Refunded</th></tr></thead><tbody>{pays?.map((p: any) => <tr key={p.id}><td>{new Date(p.paid_at).toLocaleDateString()}</td><td>{money(p.amount_cents, p.currency)}</td><td>{p.refunded ? 'Yes' : 'No'}</td></tr>)}</tbody></table></div>);
}
