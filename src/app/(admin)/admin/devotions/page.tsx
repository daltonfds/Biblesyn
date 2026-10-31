import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff} from '@/lib/admin';
import LangTabs from '@/components/LangTabs';
import Link from 'next/link';
import {saveDevotion, deleteDevotion} from '../actions';
export default async function Devotions({searchParams}: {searchParams: {lang?: string; day?: string; saved?: string; err?: string}}) {
  await requireStaff(); const db = supabaseAdmin(); const {data: langs} = await db.from('languages').select('code,name').eq('active', true).order('sort');
  const lang = searchParams.lang && langs?.some((l: any) => l.code === searchParams.lang) ? searchParams.lang : langs?.[0]?.code ?? 'en';
  const {data: list} = await db.from('devotions').select('*').eq('locale', lang).order('day', {ascending: false}).limit(60); const cur: any = list?.find((d: any) => d.day === searchParams.day);
  return (<div><h1 className="mb-3 font-serif text-3xl font-bold">Daily devotions</h1><LangTabs base="/admin/devotions" langs={langs ?? []} cur={lang} />
    {searchParams.saved && <p className="mb-2 text-sm text-leaf">Saved.</p>}{searchParams.err && <p role="alert" className="mb-2 text-sm text-red-600">{searchParams.err}</p>}
    <form action={saveDevotion} key={cur?.day ?? 'new'} className="grid gap-3 md:grid-cols-2"><input type="hidden" name="locale" value={lang} />
      <label className="text-sm font-semibold">Date<input type="date" name="day" required defaultValue={cur?.day ?? new Date().toISOString().slice(0, 10)} className="ai mt-1" /></label><label className="text-sm font-semibold">Verse reference<input name="verse_ref" required defaultValue={cur?.verse_ref} placeholder="Psalm 46:10" className="ai mt-1" /></label>
      <label className="text-sm font-semibold md:col-span-2">Verse text<textarea name="verse_text" required rows={2} defaultValue={cur?.verse_text} className="ai mt-1" /></label><label className="text-sm font-semibold">Reflection<textarea name="reflection" rows={4} defaultValue={cur?.reflection ?? ''} className="ai mt-1" /></label><label className="text-sm font-semibold">Prayer<textarea name="prayer" rows={4} defaultValue={cur?.prayer ?? ''} className="ai mt-1" /></label>
      <button className="ab md:w-fit">Save devotion ({lang})</button></form>
    <table className="tbl mt-8"><thead><tr><th>Date</th><th>Verse</th><th></th></tr></thead><tbody>{list?.map((d: any) => <tr key={d.day}><td>{d.day}</td><td>{d.verse_ref}</td><td className="flex gap-2"><Link className="ab-line" href={`/admin/devotions?lang=${lang}&day=${d.day}`}>Edit</Link>
      <form action={deleteDevotion}><input type="hidden" name="day" value={d.day} /><input type="hidden" name="locale" value={lang} /><button className="ab-line !text-red-700">Delete</button></form></td></tr>)}</tbody></table></div>);
}
