'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Check} from 'lucide-react';
import {useT} from './I18nProvider';
import {FONT_CSS} from './ReaderSettings';
export default function SettingsForm({languages, countries, locale, country, f: f0, s: s0}: {languages: {code: string; name: string; native_name: string | null}[]; countries: {code: string; name: string; default_locale: string | null}[]; locale: string; country: string; f: string; s: number}) {
  const t = useT(); const router = useRouter();
  const [l, setL] = useState(locale); const [c, setC] = useState(country); const [f, setF] = useState(f0); const [s, setS] = useState(s0); const [ok, setOk] = useState(false); const [busy, setBusy] = useState(false);
  async function save() { setBusy(true); await fetch('/api/prefs', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({locale: l, country: c, font: f, size: s})}); setBusy(false); setOk(true); router.refresh(); setTimeout(() => setOk(false), 1800); }
  const lab = 'label mb-2 mt-6 block';
  return (<div>
    <label className={lab} htmlFor="lang">{t('settings.language')}</label>
    <select id="lang" className="field" value={l} onChange={e => setL(e.target.value)}>{languages.map(x => <option key={x.code} value={x.code}>{x.native_name || x.name}</option>)}</select>
    <label className={lab} htmlFor="ctry">{t('settings.country')}</label>
    <select id="ctry" className="field" value={c} onChange={e => setC(e.target.value)}><option value="">—</option>{countries.map(x => <option key={x.code} value={x.code}>{x.name}</option>)}</select>
    <p className="mt-2 px-1 text-xs text-mute">{t('settings.country_hint')}</p>
    <div className={lab}>{t('settings.typeface')}</div>
    <div className="grid grid-cols-3 gap-2">{(['serif', 'sans', 'classic'] as const).map(k => (<button key={k} type="button" onClick={() => setF(k)} aria-pressed={f === k} className={`rounded-2xl border p-3 text-center ${f === k ? 'border-ink bg-ink text-white' : 'border-line'}`}><div className="text-2xl" style={{fontFamily: FONT_CSS[k]}}>{t('settings.sample')}</div><div className="mt-1 text-xs">{t(`settings.${k}`)}</div></button>))}</div>
    <label className={lab} htmlFor="size">{t('settings.size')} · {s}</label>
    <input id="size" type="range" min={15} max={28} value={s} onChange={e => setS(Number(e.target.value))} className="w-full accent-[#15803D]" />
    <p className="mt-3 rounded-2xl bg-mist p-4" style={{fontFamily: FONT_CSS[f], fontSize: s, lineHeight: 1.6}}>{t('journal.prompt')}</p>
    <button onClick={save} disabled={busy} className="btn-ink mt-6">{ok ? <><Check size={18} />{t('settings.saved')}</> : t('settings.save')}</button>
  </div>);
}
