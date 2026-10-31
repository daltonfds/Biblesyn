'use client';
import {useState} from 'react';
import {X, Minus, Plus} from 'lucide-react';
import {useT} from './I18nProvider';
export const FONT_CSS: Record<string, string> = {serif: 'var(--serif), Georgia, serif', sans: 'var(--sans), system-ui, sans-serif', classic: 'var(--classic), Georgia, serif'};
export function applyPrefs(f: string, s: number) {
  window.dispatchEvent(new CustomEvent('reader-prefs', {detail: {f, s}}));
  fetch('/api/prefs', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({font: f, size: s})});
}
export default function ReaderSettings({f: f0, s: s0}: {f: string; s: number}) {
  const t = useT(); const [open, setOpen] = useState(false); const [f, setF] = useState(f0); const [s, setS] = useState(s0);
  const set = (nf: string, ns: number) => { setF(nf); setS(ns); applyPrefs(nf, ns); };
  return (<>
    <button type="button" onClick={() => setOpen(true)} aria-label={t('settings.reading')} className="flex h-10 w-10 items-center justify-center rounded-full bg-mist text-[15px] font-semibold" style={{fontFamily: FONT_CSS.serif}}>{t('settings.sample')}</button>
    {open && (<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label={t('settings.reading')} onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-t-[28px] bg-white p-6 pb-10 text-ink">
        <div className="mb-5 flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">{t('settings.reading')}</h2><button aria-label={t('common.close')} onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-mist"><X size={18} /></button></div>
        <div className="label mb-2">{t('settings.typeface')}</div>
        <div className="grid grid-cols-3 gap-2">{(['serif', 'sans', 'classic'] as const).map(k => (<button key={k} onClick={() => set(k, s)} aria-pressed={f === k} className={`rounded-2xl border p-3 text-center ${f === k ? 'border-ink bg-ink text-white' : 'border-line'}`}><div className="text-2xl" style={{fontFamily: FONT_CSS[k]}}>{t('settings.sample')}</div><div className="mt-1 text-xs">{t(`settings.${k}`)}</div></button>))}</div>
        <div className="label mb-2 mt-5">{t('settings.size')}</div>
        <div className="flex items-center justify-between rounded-full border border-line p-1"><button aria-label="-" onClick={() => set(f, Math.max(15, s - 1))} className="flex h-10 w-10 items-center justify-center rounded-full bg-mist"><Minus size={18} /></button><span className="font-semibold">{s}</span><button aria-label="+" onClick={() => set(f, Math.min(28, s + 1))} className="flex h-10 w-10 items-center justify-center rounded-full bg-mist"><Plus size={18} /></button></div>
      </div></div>)}
  </>);
}
