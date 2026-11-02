'use client';
import {useRef, useEffect, useState} from 'react';
import Link from 'next/link';
import {ArrowUp, Sparkles} from 'lucide-react';
import {useT} from '@/components/I18nProvider';
type M = {role: 'user' | 'assistant'; content: string};
const REF = /(?:[1-3] )?\p{Lu}\p{L}+(?: \p{Lu}\p{L}+)? \d{1,3}:\d{1,3}(?:[-–]\d{1,3})?/gu;
export default function Assistant() {
  const t = useT(); const [msgs, setMsgs] = useState<M[]>([]); const [text, setText] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState(''); const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({behavior: 'smooth'}); }, [msgs, busy]);
  async function ask(q: string) {
    if (!q.trim() || busy) return;
    const next = [...msgs, {role: 'user' as const, content: q.trim()}]; setMsgs(next); setText(''); setBusy(true); setErr('');
    const r = await fetch('/api/assistant', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({messages: next})});
    if (r.status === 401) setErr('login'); else if (r.status === 402) setErr('premium'); else if (r.ok) { const j = await r.json(); setMsgs([...next, {role: 'assistant', content: j.text}]); } else setErr('error');
    setBusy(false);
  }
  const last = msgs[msgs.length - 1]; const chipCls = 'whitespace-nowrap rounded-full border border-line px-4 py-2.5 text-xs font-semibold';
  return (<div className="flex min-h-[calc(100vh-90px)] flex-col px-5 pt-[52px]">
    <h1 className="font-serif text-[36px] font-bold leading-tight">{t('asst.title')}</h1><p className="text-sm text-mute">{t('asst.sub')}</p>
    <div className="mt-5 flex-1 space-y-3">
      {msgs.length === 0 && <div className="rounded-3xl bg-mist p-5"><Sparkles size={20} className="text-leaf" /><p className="mt-2 font-serif text-xl font-bold">{t('asst.starter_title')}</p>
        <div className="mt-3 flex flex-col gap-2">{['asst.s1', 'asst.s2', 'asst.s3'].map(k => <button key={k} onClick={() => ask(t(k))} className="rounded-full bg-white px-4 py-2.5 text-left text-sm">{t(k)}</button>)}</div></div>}
      {msgs.map((m, i) => { const refs = m.role === 'assistant' ? Array.from(new Set(m.content.match(REF) ?? [])) : [];
        return (<div key={i} className={`max-w-[92%] ${m.role === 'user' ? 'ml-auto max-w-[80%]' : ''}`}>
          <div className={`whitespace-pre-line px-4 py-3 text-[15px] leading-relaxed ${m.role === 'user' ? 'rounded-3xl rounded-br-md bg-ink text-white' : 'rounded-3xl rounded-bl-md bg-mist'}`}>{m.content}</div>
          {refs.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{refs.map(r => <span key={r} className="whitespace-nowrap rounded-full bg-leafsoft px-3 py-1.5 text-xs font-semibold text-leaf">{r}</span>)}</div>}</div>); })}
      {last?.role === 'assistant' && <div className="flex flex-wrap gap-2"><button onClick={() => ask(t('asst.compare_q'))} className={chipCls}>{t('asst.compare')}</button><button onClick={() => ask(t('asst.related_q'))} className={chipCls}>{t('asst.related')}</button></div>}
      {busy && <div className="text-xs text-mute">{t('asst.thinking')}</div>}
      {err === 'login' && <p className="text-sm">{t('asst.login')} <Link className="font-semibold underline" href="/login?next=/assistant">{t('common.login')}</Link></p>}
      {err === 'premium' && <p className="text-sm">{t('asst.premium_only')} <Link className="font-semibold underline" href="/premium">{t('art.see_premium')}</Link></p>}
      {err === 'error' && <p className="text-sm text-red-600">{t('asst.error')}</p>}<div ref={end} /></div>
    <form onSubmit={e => { e.preventDefault(); ask(text); }} className="sticky bottom-[84px] flex gap-2 bg-white py-3">
      <label className="sr-only" htmlFor="ask">{t('asst.placeholder')}</label><input id="ask" value={text} onChange={e => setText(e.target.value)} placeholder={t('asst.placeholder')} className="field flex-1" />
      <button aria-label={t('asst.send')} className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white"><ArrowUp size={20} /></button></form></div>);
}
