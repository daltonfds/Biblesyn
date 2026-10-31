import Link from 'next/link';
import AdminNav from '@/components/AdminNav';
import {requireStaff} from '@/lib/admin';
export const metadata = {title: 'Admin'};
export const dynamic = 'force-dynamic';
const ITEMS: [string, string, boolean][] = [['/admin', 'Dashboard', true], ['/admin/users', 'Users', true], ['/admin/subscriptions', 'Subscriptions', true], ['/admin/earnings', 'Earnings', true],
  ['/admin/articles', 'Articles', false], ['/admin/plans', 'Plans', false], ['/admin/devotions', 'Devotions', false], ['/admin/topics', 'Topics', false],
  ['/admin/languages', 'Languages', true], ['/admin/pricing', 'Countries & pricing', true], ['/admin/strings', 'Interface text', false]];
export default async function AdminLayout({children}: {children: React.ReactNode}) {
  const me = await requireStaff();
  return (<div className="mx-auto max-w-6xl px-4 py-6"><header className="mb-4 flex items-center justify-between"><div className="font-serif text-2xl font-bold">Biblesyn <span className="text-leaf">Admin</span></div>
    <div className="flex items-center gap-3 text-sm"><span className="text-mute">{me.email} · {me.role}</span><Link href="/" className="ab-line">App</Link></div></header>
    <AdminNav items={ITEMS.filter(i => me.role === 'admin' || !i[2]).map(i => [i[0], i[1]] as [string, string])} /><div className="mt-2">{children}</div></div>);
}
