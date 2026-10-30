'use client';
import {useState} from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
type M={role:'user'|'assistant';content:string};
export default function Assistant(){
 const [msgs,setMsgs]=useState<M[]>([]);const [text,setText]=useState('');const [busy,setBusy]=useState(false);const [err,setErr]=useState('');
 async function send(e:React.FormEvent){
  e.preventDefault();if(!text.trim()||busy)return;
  const next=[...msgs,{role:'user' as const,content:text.trim()}];setMsgs(next);setText('');setBusy(true);setErr('');
  try{const r=await fetch('/api/assistant',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:next})});if(r.status===401)setErr('login');else if(r.status===402)setErr('premium');else if(r.ok){const j=await r.json();setMsgs([...next,{role:'assistant',content:j.text}])}else setErr('error')}catch{setErr('error')}finally{setBusy(false)}
 }
 return <div className="flex min-h-[calc(100vh-104px)] flex-col px-5 pb-4 pt-12">
  <div className="mb-6"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-green">GROUNDED IN SCRIPTURE</p><h1 className="mt-2 font-serif text-[34px] font-semibold">Bible Assistant</h1><p className="mt-2 text-sm text-muted">Explore Scripture with thoughtful, contextual guidance.</p></div>
  <div className="flex-1 space-y-4 pb-5">
   {!msgs.length&&!busy&&<div className="flex min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#DADADA] px-6 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-greenSoft text-green"><Icon name="message-circle" size={25}/></div><h2 className="mt-5 font-serif text-2xl font-semibold">A space to explore the Word</h2><p className="mt-2 max-w-[260px] text-sm leading-6 text-muted">Ask about a passage, a biblical theme or a question of faith.</p></div>}
   {msgs.map((m,i)=><div key={i} className={`max-w-[90%] whitespace-pre-line rounded-[20px] px-4 py-3.5 text-sm leading-7 ${m.role==='user'?'ml-auto bg-ink text-white':'mr-auto border border-line bg-[#FAFAFA] text-ink'}`}>{m.content}</div>)}
   {busy&&<div className="flex items-center gap-2 text-xs text-muted"><span className="h-2 w-2 animate-pulse rounded-full bg-green"/>Preparing a response…</div>}
   {err==='login'&&<p className="rounded-xl border border-line p-4 text-sm">Please <Link className="font-semibold text-green underline" href="/login?next=/assistant">log in</Link> to ask questions.</p>}
   {err==='premium'&&<p className="rounded-xl border border-line p-4 text-sm">The assistant is part of <Link className="font-semibold text-green underline" href="/premium">Premium</Link>.</p>}
   {err==='error'&&<p role="alert" className="text-sm text-red-700">Something went wrong. Please try again.</p>}
  </div>
  <form onSubmit={send} className="sticky bottom-24 flex items-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,.06)]"><label className="sr-only" htmlFor="question">Ask a question about Scripture</label><input id="question" value={text} onChange={e=>setText(e.target.value)} className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" /><button aria-label="Send question" disabled={!text.trim()||busy} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink text-white transition hover:bg-green disabled:opacity-40"><Icon name="send" size={18}/></button></form>
 </div>;
}