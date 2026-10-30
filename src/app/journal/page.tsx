import {supabaseServer} from '@/lib/supabase/server';
import {addEntry, deleteEntry} from './actions';
export default async function Journal() {
  const {data} = await supabaseServer().from('journal_entries').select('*').order('created_at', {ascending: false});
  const f = 'w-full rounded-2xl border border-[#D9C6A0] bg-[#FFFDF8] p-3 text-sm';
  return (<div className="px-5 pt-14"><h1 className="px-1 font-serif text-4xl font-semibold">Spiritual Journal</h1>
    <form action={addEntry} className="mt-4 space-y-2 rounded-2xl bg-parchment p-4">
      <label className="block text-[11px] tracking-[.14em] text-[#6F5A40]">TODAY&apos;S REFLECTION<textarea name="body" required rows={4} placeholder="Where did you sense God's presence today?" className={`${f} mt-2`} /></label>
      <input name="verse_ref" placeholder="Verse (optional), e.g. Psalm 46:10" aria-label="Verse" className={f} />
      <button className="h-10 rounded-full bg-gold px-5 text-sm font-semibold text-umber">Save entry</button></form>
    <div className="mt-4 space-y-2">{data?.map((e: any) => <div key={e.id} className="rounded-2xl border border-[#E3D5B8] bg-[#FFFDF8] p-4">
      <div className="flex justify-between text-xs text-[#6F5A40]"><span>{new Date(e.created_at).toLocaleDateString()}</span>{e.verse_ref && <span className="rounded-full bg-parchment px-2">{e.verse_ref}</span>}</div>
      <p className="mt-2 whitespace-pre-line font-serif text-xl leading-snug">{e.body}</p>
      <form action={deleteEntry}><input type="hidden" name="id" value={e.id} /><button className="mt-2 text-xs text-[#6F5A40] underline">Delete</button></form></div>)}</div></div>);
}