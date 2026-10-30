import {supabaseServer} from '@/lib/supabase/server';
import {addEntry,deleteEntry} from './actions';
import Icon from '@/components/Icon';
export default async function Journal(){
 const {data}=await supabaseServer().from('journal_entries').select('*').order('created_at',{ascending:false});
 const field='w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none transition focus:border-green';
 return <div className="px-5 pt-12">
  <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-green">REFLECT & REMEMBER</p><div className="flex items-center justify-between"><h1 className="mt-2 font-serif text-[34px] font-semibold">Spiritual Journal</h1><span className="flex h-11 w-11 items-center justify-center rounded-full bg-greenSoft text-green"><Icon name="pen-line"/></span></div>
  <form action={addEntry} className="mt-7 rounded-[22px] border border-line p-5">
   <label className="block text-sm font-semibold" htmlFor="reflection">Today's reflection</label><p className="mt-1 text-xs leading-5 text-muted">Write honestly about your walk, questions and moments of faith.</p>
   <textarea id="reflection" name="body" required rows={5} className={`${field} mt-4 resize-y leading-6`}/>
   <label className="mt-4 block text-xs font-semibold" htmlFor="verse_ref">Scripture reference <span className="font-normal text-muted">(optional)</span></label><input id="verse_ref" name="verse_ref" className={`${field} mt-2`}/>
   <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-semibold text-white transition hover:bg-green"><Icon name="plus" size={16}/> Save reflection</button>
  </form>
  <section className="mt-8"><div className="mb-4 flex items-center justify-between"><h2 className="font-serif text-2xl font-semibold">Your entries</h2><span className="text-xs text-muted">{data?.length??0} saved</span></div>
   {data?.length?<div className="space-y-3">{data.map((entry:any)=><article key={entry.id} className="rounded-[22px] border border-line p-5"><div className="flex items-center justify-between gap-3 text-[11px] text-muted"><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleDateString()}</time>{entry.verse_ref&&<span className="rounded-full bg-greenSoft px-3 py-1 font-medium text-green">{entry.verse_ref}</span>}</div><p className="mt-3 whitespace-pre-line font-serif text-xl leading-relaxed">{entry.body}</p><form action={deleteEntry} className="mt-4"><input type="hidden" name="id" value={entry.id}/><button aria-label="Delete journal entry" className="inline-flex items-center gap-1 text-xs text-muted transition hover:text-red-700"><Icon name="trash-2" size={14}/> Delete</button></form></article>)}</div>:<div className="rounded-[22px] border border-dashed border-[#DADADA] px-6 py-9 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-greenSoft text-green"><Icon name="bookmark"/></div><h3 className="mt-4 font-serif text-2xl font-semibold">Your story, in your words</h3><p className="mt-2 text-sm leading-6 text-muted">Your saved reflections will appear here. Start with the entry above whenever you're ready.</p></div>}
  </section>
 </div>;
}