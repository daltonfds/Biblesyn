import Link from 'next/link';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff} from '@/lib/admin';
export default async function Plans() {
  await requireStaff(); const db = supabaseAdmin(); const [{data: plans}, {data: langs}] = await Promise.all([db.from('study_plans').select('id,group_id,locale,title,published,days,sort').order('sort'), db.from('languages').select('code').order('sort')]);
  const groups = new Map<string, any[]>(); (plans ?? []).forEach((p: any) => groups.set(p.group_id, [...(groups.get(p.group_id) ?? []), p]));
  return (<div><div className="mb-4 flex items-center justify-between"><h1 className="font-serif text-3xl font-bold">Study plans</h1><Link href={`/admin/plans/${crypto.randomUUID()}`} className="ab">New plan</Link></div>
    <table className="tbl"><thead><tr><th>Plan</th><th>Days</th>{langs?.map((l: any) => <th key={l.code}>{l.code}</th>)}</tr></thead><tbody>{[...groups.entries()].map(([g, vs]) => { const first = vs[0];
      return (<tr key={g}><td><Link className="font-semibold underline" href={`/admin/plans/${g}?lang=${first.locale}`}>{first.title}</Link></td><td>{first.days}</td>{langs?.map((l: any) => { const v = vs.find(x => x.locale === l.code); return <td key={l.code}>{v ? <span className={`rounded px-1.5 text-xs ${v.published ? 'bg-leafsoft text-leaf' : 'bg-mist text-mute'}`}>{v.published ? 'live' : 'draft'}</span> : <span className="text-mute">—</span>}</td>; })}</tr>); })}</tbody></table>
    {groups.size === 0 && <p className="py-10 text-center text-sm text-mute">No plans yet.</p>}</div>);
}
