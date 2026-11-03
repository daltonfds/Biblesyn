import {notFound} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff} from '@/lib/admin';
import {userAction} from '../../actions';

export default async function UserPage({params, searchParams}: {params: {id: string}; searchParams: {saved?: string}}) {
  const me = await requireStaff(true);
  const db = supabaseAdmin();
  const {data: u} = await db.from('profiles').select('*').eq('id', params.id).maybeSingle();
  if (!u) notFound();
  const {data: events} = await db.from('payment_webhook_events').select('provider,event_type,order_id,processing_status,created_at')
    .eq('user_id', u.id).order('created_at', {ascending: false}).limit(20);
  const [{count: notes}, {count: done}] = await Promise.all([
    db.from('journal_entries').select('*', {count: 'exact', head: true}).eq('user_id', u.id),
    db.from('plan_progress').select('*', {count: 'exact', head: true}).eq('user_id', u.id),
  ]);
  const Btn = ({op, label, danger}: {op: string; label: string; danger?: boolean}) =>
    <form action={userAction}><input type="hidden" name="id" value={u.id} /><input type="hidden" name="op" value={op} />
      <button className={danger ? 'ab-line !text-red-700' : 'ab'}>{label}</button></form>;
  return (<div><Link href="/admin/users" className="text-sm text-mute underline">‹ Users</Link><h1 className="mb-1 mt-2 font-serif text-3xl font-bold">{u.email}</h1>
    {searchParams.saved && <p className="mb-2 text-sm text-leaf">Saved.</p>}
    <p className="text-sm text-mute">Joined {new Date(u.created_at).toLocaleDateString()} · Country {u.country ?? '—'} · Language {u.locale} · Role {u.role} · {u.is_premium ? `Premium (${u.premium_source ?? '—'})` : 'Free'}{u.suspended ? ' · SUSPENDED' : ''} · {done ?? 0} plan days · {notes ?? 0} journal entries</p>
    <div className="my-4 flex flex-wrap items-center gap-2">{u.is_premium ? <Btn op="revoke" label="Revoke premium" danger /> : <Btn op="grant" label="Grant premium (manual)" />}
      {u.suspended ? <Btn op="unsuspend" label="Unsuspend" /> : u.id !== me.id && <Btn op="suspend" label="Suspend" danger />}
      {u.id !== me.id && <form action={userAction} className="flex gap-2"><input type="hidden" name="id" value={u.id} /><input type="hidden" name="op" value="role" /><select name="role" defaultValue={u.role} aria-label="Role" className="ai"><option value="user">User</option><option value="editor">Editor</option><option value="admin">Admin</option></select><button className="ab-line">Set role</button></form>}</div>
    <h2 className="mb-2 mt-6 font-semibold">Premium access</h2>
    <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-line p-4 text-sm">
      <div><dt className="text-mute">Status</dt><dd>{u.premium_status ?? (u.is_premium ? 'active' : 'free')}</dd></div>
      <div><dt className="text-mute">Expires</dt><dd>{u.premium_expires_at ? new Date(u.premium_expires_at).toLocaleString() : u.is_premium ? 'No expiry (manual grant)' : '—'}</dd></div>
      <div><dt className="text-mute">Provider</dt><dd>{u.premium_provider ?? '—'}</dd></div>
      <div><dt className="text-mute">Country</dt><dd>{u.premium_country ?? u.country ?? '—'}</dd></div>
      <div><dt className="text-mute">Currency</dt><dd>{u.premium_currency ?? '—'}</dd></div>
      <div className="col-span-2"><dt className="text-mute">Order reference</dt><dd className="break-all">{u.premium_order_id ?? '—'}</dd></div>
    </dl>
    <h2 className="mb-2 mt-6 font-semibold">Payment webhook history</h2>
    <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Date</th><th>Provider</th><th>Event</th><th>Order</th><th>Processing</th></tr></thead>
      <tbody>{events?.map((e: any) => <tr key={e.created_at + e.provider + e.event_type}><td>{new Date(e.created_at).toLocaleString()}</td><td>{e.provider}</td><td>{e.event_type}</td><td>{e.order_id ?? '—'}</td><td>{e.processing_status}</td></tr>)}</tbody></table></div>
  </div>);
}
