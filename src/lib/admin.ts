import {redirect} from 'next/navigation';
import {supabaseServer} from '@/lib/supabase/server';
export type Role = 'user' | 'editor' | 'admin';
export async function requireStaff(adminOnly = false): Promise<{id: string; email: string; role: Role}> {
  const sb = supabaseServer();
  const {data: {user}} = await sb.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  const {data: p} = await sb.from('profiles').select('role,suspended').eq('id', user.id).maybeSingle();
  const role = (p?.role ?? 'user') as Role;
  if (p?.suspended || role === 'user' || (adminOnly && role !== 'admin')) redirect('/');
  return {id: user.id, email: user.email ?? '', role};
}
export const money = (cents: number, currency: string) => { try { return new Intl.NumberFormat('en', {style: 'currency', currency}).format(cents / 100); } catch { return `${(cents / 100).toFixed(2)} ${currency}`; } };
