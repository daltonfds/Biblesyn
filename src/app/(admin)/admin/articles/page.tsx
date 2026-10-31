import Link from 'next/link';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff} from '@/lib/admin';
export default async function Articles() {
  await requireStaff(); const db = supabaseAdmin();
  const [{data: arts}, {data: langs}] = await Promise.all([db.from('articles').select('id,group_id,locale,title,published,is_free,created_at').order('created_at', {ascending: false}), db.from('languages').select('code,name').order('sort')]);
  const groups = new Map<string, any[]>(); (arts ?? []).forEach((a: any) => groups.set(a.group_id, [...(groups.get(a.group_id) ?? []), a]));
  return (<div><div className="mb-4 flex items-center justify-between"><h1 className="font-serif text-3xl font-bold">Articles</h1><Link href={`/admin/articles/${crypto.randomUUID()}`} className="ab">New article</Link></div>
    <table className="tbl"><thead><tr><th>Title</th>{langs?.map((l: any) => <th key={l.code}>{l.code}</th>)}</tr></thead><tbody>{[...groups.entries()].map(([g, vs]) => { const first = vs.find(v => v.locale === langs?.[0]?.code) ?? vs[0];
      return (<tr key={g}><td><Link className="font-semibold underline" href={`/admin/articles/${g}?lang=${first.locale}`}>{first.title}</Link></td>{langs?.map((l: any) => { const v = vs.find(x => x.locale === l.code);
        return <td key={l.code}>{v ? <span className={`rounded px-1.5 text-xs ${v.published ? 'bg-leafsoft text-leaf' : 'bg-mist text-mute'}`}>{v.published ? 'live' : 'draft'}</span> : <span className="text-mute">—</span>}</td>; })}</tr>); })}</tbody></table>
    {groups.size === 0 && <p className="py-10 text-center text-sm text-mute">No articles yet. Create the first one.</p>}</div>);
}
