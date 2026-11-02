import Link from 'next/link';
import {Plus, LogOut, Trash2, Circle, CheckCircle2, Settings} from 'lucide-react';
import {supabaseServer} from '@/lib/supabase/server';
import {getT} from '@/lib/i18n';
import {addEntry, deleteEntry, addGoal, toggleGoal, signOut} from './actions';
export const metadata = {title: 'Journal'};
export default async function Journal({searchParams}: {searchParams: {tab?: string}}) {
  const sb = supabaseServer(); const t = await getT(); const tab = searchParams.tab === 'goals' || searchParams.tab === 'saved' ? searchParams.tab : 'entries';
  const {data: {user}} = await sb.auth.getUser(); const {data: profile} = await sb.from('profiles').select('is_premium,role').eq('id', user!.id).maybeSingle();
  const pill = (k: string, l: string) => <Link key={k} href={`/journal?tab=${k}`} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-semibold ${tab === k ? 'bg-ink text-white' : 'bg-mist'}`}>{l}</Link>;
  return (<div className="px-5 pt-[52px]">
    <header className="flex items-center justify-between"><h1 className="font-serif text-[36px] font-bold leading-tight">{t('journal.title')}</h1><a href="#new" aria-label={t('journal.write')} className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white"><Plus size={22} /></a></header>
    <div className="mt-3 flex items-center gap-3 rounded-[20px] bg-mist p-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-semibold text-white">{(user!.email ?? '?')[0].toUpperCase()}</span>
      <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{user!.email}</div><div className="text-xs">{profile?.is_premium ? <span className="text-mute">{t('journal.premium_member')}</span> : <Link href="/premium" className="font-semibold text-leaf">{t('journal.go_premium')}</Link>}{(profile?.role === 'admin' || profile?.role === 'editor') && <> · <Link href="/admin" className="font-semibold underline">Admin</Link></>}</div></div>
      <Link href="/settings" aria-label={t('journal.settings')} className="flex h-10 w-10 items-center justify-center rounded-full bg-white"><Settings size={18} /></Link>
      <form action={signOut}><button aria-label={t('journal.logout')} className="flex h-10 w-10 items-center justify-center rounded-full bg-white"><LogOut size={18} /></button></form></div>
    <div className="mt-3.5 flex gap-2">{pill('entries', t('journal.entries'))}{pill('goals', t('journal.goals'))}{pill('saved', t('journal.saved'))}</div>
    {tab === 'entries' && <Entries sb={sb} />}{tab === 'goals' && <Goals sb={sb} />}{tab === 'saved' && <Saved sb={sb} />}</div>);
}
async function Entries({sb}: {sb: any}) {
  const t = await getT(); const {data} = await sb.from('journal_entries').select('*').order('created_at', {ascending: false});
  return (<>
    <form id="new" action={addEntry} className="mt-3.5 space-y-2 rounded-3xl bg-mist p-4"><label className="label block">{t('journal.reflection')}<textarea name="body" required rows={3} placeholder={t('journal.prompt')} className="mt-2 w-full rounded-2xl border border-line bg-white p-3 font-serif text-[20px] font-semibold normal-case leading-tight tracking-normal text-ink outline-none focus:border-ink" /></label>
      <input name="verse_ref" aria-label={t('journal.verse_ph')} placeholder={t('journal.verse_ph')} className="field" /><button className="btn-ink">{t('journal.save')}</button></form>
    <div className="mt-3 space-y-3">{data?.map((e: any) => <div key={e.id} className="card p-4"><div className="flex items-center justify-between text-xs text-mute"><span className="whitespace-nowrap">{new Date(e.created_at).toLocaleDateString()}</span>{e.verse_ref && <span className="whitespace-nowrap rounded-full bg-leafsoft px-2.5 py-0.5 font-semibold text-leaf">{e.verse_ref}</span>}</div>
      <p className="mt-2 whitespace-pre-line font-serif text-xl leading-snug">{e.body}</p><form action={deleteEntry}><input type="hidden" name="id" value={e.id} /><button className="mt-2 flex items-center gap-1 text-xs text-mute"><Trash2 size={13} />{t('journal.delete')}</button></form></div>)}</div></>);
}
async function Goals({sb}: {sb: any}) {
  const t = await getT(); const {data} = await sb.from('goals').select('*').order('created_at', {ascending: false});
  return (<><form action={addGoal} className="mt-4 flex gap-2"><input name="body" required aria-label={t('journal.goal_ph')} placeholder={t('journal.goal_ph')} className="field flex-1" /><button aria-label="+" className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white"><Plus size={20} /></button></form>
    <div className="mt-4 space-y-2">{data?.map((g: any) => <form key={g.id} action={toggleGoal} className="card flex items-center gap-3 p-4"><input type="hidden" name="id" value={g.id} /><input type="hidden" name="done" value={g.done ? '1' : '0'} />
      <button aria-label="toggle">{g.done ? <CheckCircle2 size={24} className="text-leaf" /> : <Circle size={24} className="text-mute" />}</button><span className={`font-serif text-xl ${g.done ? 'text-mute line-through' : ''}`}>{g.body}</span></form>)}</div></>);
}
async function Saved({sb}: {sb: any}) {
  const t = await getT(); const {data} = await sb.from('saved_articles').select('articles(slug,title,read_minutes)'); const rows = (data ?? []).map((r: any) => r.articles).filter(Boolean);
  return (<div className="mt-4 space-y-2">{rows.map((a: any) => <Link key={a.slug} href={`/library/${a.slug}`} className="card block p-4"><div className="font-serif text-xl font-bold leading-tight">{a.title}</div><div className="mt-1 text-xs text-mute">{t('common.min', {n: a.read_minutes})}</div></Link>)}
    {rows.length === 0 && <p className="py-8 text-center text-sm text-mute">{t('journal.saved_empty')}</p>}</div>);
}
