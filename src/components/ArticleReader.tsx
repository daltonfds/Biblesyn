'use client';
import {useRef, useState} from 'react';
import {Play, Pause} from 'lucide-react';
type Mode = 'read' | 'listen' | 'both';
const parse = (b: string) => b.split(/\n\n+/).map(t => t.trim()).filter(Boolean).map(t => ({t, h: t.length < 40 && !/[.!?]$/.test(t)}));
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
export default function ArticleReader({body, audioSrc}: {body: string; audioSrc: string}) {
  const [mode, setMode] = useState<Mode>('read'); const a = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false); const [cur, setCur] = useState(0); const [dur, setDur] = useState(0);
  const pick = (m: Mode) => { setMode(m); if (m === 'read') a.current?.pause(); else a.current?.play().catch(() => {}); };
  const toggle = () => { const el = a.current; if (el) (el.paused ? el.play().catch(() => {}) : el.pause()); };
  const modes: [Mode, string][] = [['read', 'Read'], ['listen', 'Listen'], ['both', 'Read & Listen']];
  return (<div>
    <div role="tablist" aria-label="Reading mode" className="flex rounded-full bg-mist p-1">{modes.map(([m, l]) => (
      <button key={m} role="tab" aria-selected={mode === m} onClick={() => pick(m)} className={`h-9 flex-1 rounded-full text-xs font-semibold transition ${mode === m ? 'bg-ink text-white' : 'text-ink'}`}>{l}</button>))}</div>
    <audio ref={a} src={audioSrc} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={e => setCur(e.currentTarget.currentTime)} onLoadedMetadata={e => setDur(e.currentTarget.duration)} />
    {mode !== 'listen' && <div className="mt-6 space-y-4">{parse(body).map((p, i) => p.h
      ? <h2 key={i} className="label !text-leaf pt-2">{p.t}</h2> : <p key={i} className="font-sans text-[19px] leading-[1.7]">{p.t}</p>)}</div>}
    {mode === 'listen' && <p className="mt-10 text-center font-sans text-xl text-mute">Listening mode. Press play below.</p>}
    {mode !== 'read' && (<div className="fixed inset-x-0 bottom-[76px] z-30 px-3"><div className="mx-auto flex max-w-md items-center gap-3 rounded-full bg-ink p-2 pr-5 text-white shadow-lg">
      <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink">{playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
      <div className="flex-1"><input type="range" aria-label="Seek" min={0} max={dur || 1} step={1} value={cur} onChange={e => { if (a.current) a.current.currentTime = Number(e.target.value); }} className="h-1 w-full accent-[#15803D]" />
        <div className="mt-1 text-[11px] text-white/60">{fmt(cur)} / {fmt(dur)}</div></div></div></div>)}
  </div>);
}
