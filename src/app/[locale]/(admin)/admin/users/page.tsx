import Link from 'next/link';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff} from '@/lib/admin';
const PAGE = 25;
export default async function Users({searchParams}: {searchParams: {q?: string; premium?: string; country?: string; role?: string; page?: string}}) {
  await requireStaff(true); const db = supabaseAdmin(); const page = Math.max(1, Number(searchParams.page) || 1); const q = (searchParams.q ?? '').replace(/[,%()*]/g, ' ').trim();
  let query = db.from('profiles').select('id,email,country,locale,role,is_premium,premium_source,suspended,created_at', {count: 'exact'}).order('created_at', {ascending: false}).range((page - 1) * PAGE, page * PAGE - 1);
  if (q) query = query.ilike('email', `%${q}%`); if (searchParams.premium === '1') query = query.eq('is_premium', true); if (searchParams.country) query = query.eq('country', searchParams.country.toUpperCase()); if (searchParams.role) query = query.eq('role', searchParams.role);
  const {data, count} = await query; const keep = (p: number) => { const u = new URLSearchParams(searchParams as any); u.set('page', String(p)); return `/admin/users?${u}`; };
  return (<div><h1 className="mb-4 font-serif text-3xl font-bold">Users <span className="text-base font-normal text-mute">{count ?? 0}</span></h1>
    <form className="mb-4 flex flex-wrap gap-2"><input name="q" defaultValue={q} placeholder="Search email" aria-label="Search email" className="ai max-w-xs" /><input name="country" defaultValue={searchParams.country} placeholder="Country (PT)" aria-label="Country" className="ai max-w-[120px]" />
      <select name="premium" defaultValue={searchParams.premium ?? ''} aria-label="Premium" className="ai max-w-[140px]"><option value="">All plans</option><option value="1">Premium</option></select>
      <select name="role" defaultValue={searchParams.role ?? ''} aria-label="Role" className="ai max-w-[140px]"><option value="">All roles</option><option value="user">User</option><option value="editor">Editor</option><option value="admin">Admin</option></select><button className="ab">Filter</button></form>
    <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Email</th><th>Country</th><th>Lang</th><th>Role</th><th>Premium</th><th>Joined</th></tr></thead><tbody>{data?.map((u: any) => <tr key={u.id}>
      <td><Link href={`/admin/users/${u.id}`} className="font-semibold underline">{u.email ?? u.id}</Link>{u.suspended && <span className="ml-2 rounded bg-red-100 px-1.5 text-xs text-red-700">suspended</span>}</td><td>{u.country ?? '—'}</td><td>{u.locale}</td><td>{u.role}</td>
      <td>{u.is_premium ? `Yes (${u.premium_source ?? '?'})` : 'No'}</td><td className="whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>
    <div className="mt-4 flex gap-2">{page > 1 && <Link className="ab-line" href={keep(page - 1)}>Previous</Link>}{(count ?? 0) > page * PAGE && <Link className="ab-line" href={keep(page + 1)}>Next</Link>}</div></div>);
}
