import Link from 'next/link';
import {Plus, LogOut, Trash2, Circle, CheckCircle2} from 'lucide-react';
import {supabaseServer} from '@/lib/supabase/server';
import {addEntry, deleteEntry, addGoal, toggleGoal, signOut} from './actions';
export const metadata = {title: 'My journal'};
export default async function Journal({searchParams}: {searchParams: {tab?: string}}) {
  const sb = supabaseServer(); const tab = searchParams.tab === 'goals' || searchParams.tab === 'saved' ? searchParams.tab : 'entries';
  const {data: {user}} = await sb.auth.getUser();
  const {data: profile} = await sb.from('profiles').select('is_premium').eq('id', user!.id).maybeSingle();
  const pill = (t: string, l: string) => <Link key={t} href={`/journal?tab=${t}`} className={`rounded-full px-4 py-2 text-[13px] font-semibold ${tab === t ? 'bg-ink text-white' : 'bg-mist'}`}>{l}</Link>;
  return (<div className="px-5 pt-12">
    <header className="flex items-center justify-between"><h1 className="font-serif text-[36px] font-bold leading-tight">Journal</h1>
      <a href="#new" aria-label="New entry" className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white"><Plus size={22} /></a></header>
    <div className="mt-3 flex items-center gap-3 rounded-2xl bg-mist p-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-semibold text-white">{(user!.email ?? '?')[0].toUpperCase()}</span>
      <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{user!.email}</div><div className="text-xs text-mute">{profile?.is_premium ? 'Premium member' : <Link href="/premium" className="font-semibold text-leaf">Go Premium</Link>}</div></div>
      <form action={signOut}><button aria-label="Log out" className="flex h-10 w-10 items-center justify-center rounded-full bg-white"><LogOut size={18} /></button></form></div>
    <div className="mt-4 flex gap-2">{pill('entries', 'Entries')}{pill('goals', 'Goals')}{pill('saved', 'Saved')}</div>
    {tab === 'entries' && <Entries sb={sb} />}{tab === 'goals' && <Goals sb={sb} />}{tab === 'saved' && <Saved sb={sb} />}</div>);
}
async function Entries({sb}: {sb: any}) {
  const {data} = await sb.from('journal_entries').select('*').order('created_at', {ascending: false});
  return (<>
    <form id="new" action={addEntry} className="mt-4 space-y-2 rounded-3xl bg-mist p-4"><label className="label block">Today&apos;s reflection<textarea name="body" required rows={4} placeholder="Where did you sense God's presence today?" className="mt-2 w-full rounded-2xl border border-line bg-white p-3 text-[15px] normal-case tracking-normal text-ink outline-none focus:border-ink" /></label>
      <input name="verse_ref" aria-label="Verse" placeholder="Verse (optional), e.g. Psalm 46:10" className="field" /><button className="btn-ink">Save entry</button></form>
    <div className="mt-4 space-y-2">{data?.map((e: any) => <div key={e.id} className="card p-4"><div className="flex items-center justify-between text-xs text-mute"><span>{new Date(e.created_at).toLocaleDateString()}</span>{e.verse_ref && <span className="rounded-full bg-leafsoft px-2.5 py-0.5 font-semibold text-leaf">{e.verse_ref}</span>}</div>
      <p className="mt-2 whitespace-pre-line font-serif text-xl leading-snug">{e.body}</p><form action={deleteEntry}><input type="hidden" name="id" value={e.id} /><button className="mt-2 flex items-center gap-1 text-xs text-mute"><Trash2 size={13} />Delete</button></form></div>)}</div></>);
}
async function Goals({sb}: {sb: any}) {
  const {data} = await sb.from('goals').select('*').order('created_at', {ascending: false});
  return (<><form action={addGoal} className="mt-4 flex gap-2"><input name="body" required aria-label="New goal" placeholder="A spiritual goal" className="field flex-1" /><button aria-label="Add goal" className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white"><Plus size={20} /></button></form>
    <div className="mt-4 space-y-2">{data?.map((g: any) => <form key={g.id} action={toggleGoal} className="card flex items-center gap-3 p-4"><input type="hidden" name="id" value={g.id} /><input type="hidden" name="done" value={g.done ? '1' : '0'} />
      <button aria-label={g.done ? 'Mark not done' : 'Mark done'}>{g.done ? <CheckCircle2 size={24} className="text-leaf" /> : <Circle size={24} className="text-mute" />}</button><span className={`font-serif text-xl ${g.done ? 'text-mute line-through' : ''}`}>{g.body}</span></form>)}</div></>);
}
async function Saved({sb}: {sb: any}) {
  const {data} = await sb.from('saved_articles').select('articles(slug,title,topic,read_minutes)');
  const rows = (data ?? []).map((r: any) => r.articles).filter(Boolean);
  return (<div className="mt-4 space-y-2">{rows.map((a: any) => <Link key={a.slug} href={`/library/${a.slug}`} className="card block p-4"><div className="font-serif text-xl font-bold leading-tight">{a.title}</div><div className="mt-1 text-xs text-mute">{a.read_minutes} min · {a.topic}</div></Link>)}
    {rows.length === 0 && <p className="py-8 text-center text-sm text-mute">Saved articles appear here.</p>}</div>);
}
