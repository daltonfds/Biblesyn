'use client';
import {useEffect, useRef, useState} from 'react';
import {Play, Pause} from 'lucide-react';
import {useT} from './I18nProvider';
import {FONT_CSS} from './ReaderSettings';
type Mode = 'read' | 'listen' | 'both';
const parse = (b: string) => b.split(/\n\n+/).map(x => x.trim()).filter(Boolean).map(x => ({x, h: x.length < 40 && !/[.!?]$/.test(x)}));
const fmtT = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
export default function ArticleReader({body, audioSrc, f: f0, s: s0}: {body: string; audioSrc: string; f: string; s: number}) {
  const t = useT(); const [mode, setMode] = useState<Mode>('read'); const a = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false); const [cur, setCur] = useState(0); const [dur, setDur] = useState(0); const [f, setF] = useState(f0); const [s, setS] = useState(s0);
  useEffect(() => { const h = (e: Event) => { const d = (e as CustomEvent).detail; setF(d.f); setS(d.s); }; window.addEventListener('reader-prefs', h); return () => window.removeEventListener('reader-prefs', h); }, []);
  const pick = (m: Mode) => { setMode(m); if (m === 'read') a.current?.pause(); else a.current?.play().catch(() => {}); };
  const toggle = () => { const el = a.current; if (el) (el.paused ? el.play().catch(() => {}) : el.pause()); };
  const modes: [Mode, string][] = [['read', 'common.read'], ['listen', 'common.listen'], ['both', 'common.read_listen']];
  return (<div>
    <div role="tablist" aria-label={t('art.reading_mode')} className="flex rounded-full bg-mist p-1">{modes.map(([m, k]) => (
      <button key={m} role="tab" aria-selected={mode === m} onClick={() => pick(m)} className={`h-10 flex-1 whitespace-nowrap rounded-full text-xs font-semibold transition ${mode === m ? 'bg-ink text-white' : 'text-ink'}`}>{t(k)}</button>))}</div>
    <audio ref={a} src={audioSrc} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={e => setCur(e.currentTarget.currentTime)} onLoadedMetadata={e => setDur(e.currentTarget.duration)} />
    {mode !== 'listen' && <div className="mt-5 space-y-4" style={{fontFamily: FONT_CSS[f], fontSize: s, lineHeight: 1.7}}>{parse(body).map((p, i) => p.h
      ? <h2 key={i} className="label !text-leaf pt-2" style={{fontFamily: 'var(--sans)'}}>{p.x}</h2> : <p key={i}>{p.x}</p>)}</div>}
    {mode === 'listen' && <p className="mt-10 text-center font-serif text-xl text-mute">{t('art.listening')}</p>}
    {mode !== 'read' && (<div className="fixed inset-x-0 bottom-[84px] z-30 px-3"><div className="mx-auto flex max-w-md items-center gap-3 rounded-full bg-ink p-2 pr-5 text-white shadow-lg">
      <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink">{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
      <div className="flex-1"><input type="range" aria-label={t('art.seek')} min={0} max={dur || 1} step={1} value={cur} onChange={e => { if (a.current) a.current.currentTime = Number(e.target.value); }} className="h-1 w-full accent-[#15803D]" />
        <div className="mt-1 text-[11px] text-white/60">{fmtT(cur)} / {fmtT(dur)}</div></div></div></div>)}
  </div>);
}
