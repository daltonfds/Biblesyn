import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff} from '@/lib/admin';
import {DEFAULTS} from '@/lib/i18n-defaults';
import LangTabs from '@/components/LangTabs';
import {saveStrings, fillStrings} from '../actions';
export default async function Strings({searchParams}: {searchParams: {lang?: string; saved?: string}}) {
  await requireStaff(); const db = supabaseAdmin(); const {data: langs} = await db.from('languages').select('code,name').eq('active', true).order('sort');
  const lang = searchParams.lang && langs?.some((l: any) => l.code === searchParams.lang) ? searchParams.lang : langs?.[0]?.code ?? 'en';
  const {data} = await db.from('ui_strings').select('key,value').eq('locale', lang); const cur: Record<string, string> = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value]));
  const groups: Record<string, string[]> = {}; Object.keys(DEFAULTS).forEach(k => { (groups[k.split('.')[0]] ??= []).push(k); });
  return (<div><h1 className="mb-1 font-serif text-3xl font-bold">Interface text</h1><p className="mb-3 text-sm text-mute">Every label in the app, per language. Empty fields fall back to the English text. Use {'{n}'}, {'{total}'}, {'{price}'}, {'{country}'} where shown.</p>
    <LangTabs base="/admin/strings" langs={langs ?? []} cur={lang} />{searchParams.saved && <p className="mb-2 text-sm text-leaf">Saved.</p>}
    <form action={fillStrings} className="mb-4"><input type="hidden" name="locale" value={lang} /><button className="ab-line">Fill empty fields with the English text</button></form>
    <form action={saveStrings}><input type="hidden" name="locale" value={lang} />{Object.entries(groups).map(([g, keys]) => (<fieldset key={g} className="mb-6"><legend className="label mb-2">{g}</legend><div className="space-y-2">{keys.map(k => (<label key={k} className="grid items-center gap-2 md:grid-cols-[220px_1fr_1fr]"><span className="text-xs font-mono text-mute">{k}</span><span className="text-xs text-mute">{DEFAULTS[k]}</span><input name={`k:${k}`} defaultValue={cur[k] ?? ''} className="ai" /></label>))}</div></fieldset>))}
      <button className="ab sticky bottom-4">Save {lang}</button></form></div>);
}
