'use client';
import {useRef, useEffect, useState} from 'react';
import Link from 'next/link';
import {ArrowUp, Sparkles} from 'lucide-react';
type M = {role: 'user' | 'assistant'; content: string};
const REF = /(?:[1-3] )?[A-Z][a-z]+(?: [A-Z][a-z]+)? \d{1,3}:\d{1,3}(?:[-–]\d{1,3})?/g;
const STARTERS = ['Why did God test Abraham?', 'How do I pray when I feel nothing?', 'What does Romans 8:28 really mean?'];
export default function Assistant() {
  const [msgs, setMsgs] = useState<M[]>([]); const [text, setText] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({behavior: 'smooth'}); }, [msgs, busy]);
  async function ask(q: string) {
    if (!q.trim() || busy) return;
    const next = [...msgs, {role: 'user' as const, content: q.trim()}]; setMsgs(next); setText(''); setBusy(true); setErr('');
    const r = await fetch('/api/assistant', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({messages: next})});
    if (r.status === 401) setErr('login'); else if (r.status === 402) setErr('premium');
    else if (r.ok) { const j = await r.json(); setMsgs([...next, {role: 'assistant', content: j.text}]); } else setErr('error');
    setBusy(false);
  }
  const last = msgs[msgs.length - 1];
  return (<div className="flex min-h-[calc(100vh-80px)] flex-col px-5 pt-12">
    <h1 className="font-serif text-[36px] font-bold leading-tight">Bible Assistant</h1><p className="text-sm text-mute">Answers grounded in Scripture</p>
    <div className="mt-5 flex-1 space-y-3">
      {msgs.length === 0 && <div className="rounded-3xl bg-mist p-5"><Sparkles size={20} className="text-leaf" /><p className="mt-2 font-serif text-xl font-bold">Ask anything about the Bible.</p>
        <div className="mt-3 flex flex-col gap-2">{STARTERS.map(s => <button key={s} onClick={() => ask(s)} className="rounded-full bg-white px-4 py-2.5 text-left text-sm">{s}</button>)}</div></div>}
      {msgs.map((m, i) => { const refs = m.role === 'assistant' ? Array.from(new Set(m.content.match(REF) ?? [])) : [];
        return (<div key={i} className={`max-w-[90%] ${m.role === 'user' ? 'ml-auto' : ''}`}>
          <div className={`whitespace-pre-line rounded-3xl px-4 py-3 text-[15px] leading-relaxed ${m.role === 'user' ? 'rounded-br-md bg-ink text-white' : 'rounded-bl-md bg-mist'}`}>{m.content}</div>
          {refs.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{refs.map(r => <span key={r} className="rounded-full bg-leafsoft px-3 py-1 text-xs font-semibold text-leaf">{r}</span>)}</div>}</div>); })}
      {last?.role === 'assistant' && <div className="flex flex-wrap gap-2">{['Compare views', 'Related studies'].map(s => <button key={s} onClick={() => ask(s === 'Compare views' ? 'Compare the main Christian views on this.' : 'Suggest related studies and passages.')} className="rounded-full border border-line px-4 py-2 text-xs font-semibold">{s}</button>)}</div>}
      {busy && <div className="text-xs text-mute">Thinking…</div>}
      {err === 'login' && <p className="text-sm">Please <Link className="font-semibold underline" href="/login?next=/assistant">log in</Link> to ask questions.</p>}
      {err === 'premium' && <p className="text-sm">The assistant is part of <Link className="font-semibold underline" href="/premium">Premium</Link>.</p>}
      {err === 'error' && <p className="text-sm text-red-600">Something went wrong. Try again.</p>}<div ref={end} /></div>
    <form onSubmit={e => { e.preventDefault(); ask(text); }} className="sticky bottom-[76px] flex gap-2 bg-white py-3">
      <label className="sr-only" htmlFor="ask">Ask a question</label><input id="ask" value={text} onChange={e => setText(e.target.value)} placeholder="Ask about a verse or a doubt" className="field flex-1" />
      <button aria-label="Send" className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white"><ArrowUp size={20} /></button></form></div>);
}
