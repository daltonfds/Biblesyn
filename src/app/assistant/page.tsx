'use client';
import {useState} from 'react';
import Link from 'next/link';
type M = {role: 'user' | 'assistant'; content: string};
export default function Assistant() {
  const [msgs, setMsgs] = useState<M[]>([]); const [text, setText] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  async function send(e: React.FormEvent) {
    e.preventDefault(); if (!text.trim() || busy) return;
    const next = [...msgs, {role: 'user' as const, content: text.trim()}]; setMsgs(next); setText(''); setBusy(true); setErr('');
    const r = await fetch('/api/assistant', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({messages: next})});
    if (r.status === 401) setErr('login'); else if (r.status === 402) setErr('premium');
    else if (r.ok) { const j = await r.json(); setMsgs([...next, {role: 'assistant', content: j.text}]); } else setErr('error');
    setBusy(false);
  }
  return (<div className="flex min-h-screen flex-col px-5 pt-14"><h1 className="font-serif text-4xl font-semibold">Bible Assistant</h1>
    <p className="text-xs text-[#6F5A40]">Answers grounded in Scripture</p>
    <div className="mt-4 flex-1 space-y-3">{msgs.map((m, i) => <div key={i} className={`max-w-[88%] whitespace-pre-line rounded-2xl p-3 text-sm leading-relaxed ${m.role === 'user' ? 'ml-auto bg-brown text-ivory' : 'bg-parchment'}`}>{m.content}</div>)}
      {busy && <div className="text-xs text-[#6F5A40]">Thinking…</div>}
      {err === 'login' && <p className="text-sm">Please <Link className="font-semibold underline" href="/login?next=/assistant">log in</Link> to ask questions.</p>}
      {err === 'premium' && <p className="text-sm">The assistant is part of <Link className="font-semibold underline" href="/premium">Premium</Link>.</p>}
      {err === 'error' && <p className="text-sm">Something went wrong. Try again.</p>}</div>
    <form onSubmit={send} className="sticky bottom-20 flex gap-2 bg-ivory py-3"><input value={text} onChange={e => setText(e.target.value)} aria-label="Ask a question" placeholder="Ask about a verse or a doubt" className="h-12 flex-1 rounded-full border border-[#D9C6A0] bg-[#FFFDF8] px-5 text-sm" /><button aria-label="Send" className="h-12 w-12 rounded-full bg-brown text-parchment">↑</button></form></div>);
}