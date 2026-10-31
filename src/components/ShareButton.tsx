'use client';
import {useState} from 'react';
import {Share2, Link2, Check, X, Ellipsis} from 'lucide-react';
import {FaWhatsapp, FaFacebookF, FaXTwitter, FaTelegram} from 'react-icons/fa6';
import {useT} from './I18nProvider';
type Props = {path: string; title: string; text?: string; tone?: 'dark' | 'light'};
export default function ShareButton({path, title, text, tone = 'light'}: Props) {
  const t = useT(); const [open, setOpen] = useState(false); const [copied, setCopied] = useState(false); const [url, setUrl] = useState('');
  const show = () => { setUrl(new URL(path, window.location.origin).toString()); setOpen(true); };
  const msg = text ?? title; const u = encodeURIComponent(url); const m = encodeURIComponent(msg);
  const items = [
    {l: 'WhatsApp', I: FaWhatsapp, bg: '#25D366', h: `https://wa.me/?text=${encodeURIComponent(`${msg} ${url}`)}`},
    {l: 'Facebook', I: FaFacebookF, bg: '#1877F2', h: `https://www.facebook.com/sharer/sharer.php?u=${u}`},
    {l: 'X', I: FaXTwitter, bg: '#000000', h: `https://twitter.com/intent/tweet?text=${m}&url=${u}`},
    {l: 'Telegram', I: FaTelegram, bg: '#27A7E7', h: `https://t.me/share/url?url=${u}&text=${m}`},
  ];
  async function copy() { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} }
  async function more() { try { await navigator.share({title, text: msg, url}); } catch {} }
  const canNative = typeof navigator !== 'undefined' && 'share' in navigator;
  return (<>
    <button type="button" onClick={show} aria-label={t('share.title')} className={`flex h-10 w-10 items-center justify-center rounded-full ${tone === 'dark' ? 'bg-white/10 text-white' : 'bg-mist text-ink'}`}><Share2 size={18} /></button>
    {open && (<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setOpen(false)}>
      <div role="dialog" aria-modal="true" aria-label={t('share.title')} onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-t-[28px] bg-white p-6 pb-10 text-ink">
        <div className="mb-5 flex items-center justify-between"><h2 className="font-serif text-2xl font-bold">{t('share.title')}</h2><button aria-label={t('common.close')} onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-mist"><X size={18} /></button></div>
        <div className="grid grid-cols-4 gap-3">{items.map(({l, I, bg, h}) => (<a key={l} href={h} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-xs"><span className="flex h-14 w-14 items-center justify-center rounded-full text-white" style={{background: bg}}><I size={24} /></span>{l}</a>))}</div>
        <button onClick={copy} className="btn-line mt-6">{copied ? <><Check size={18} className="text-leaf" />{t('share.copied')}</> : <><Link2 size={18} />{t('share.copy')}</>}</button>
        {canNative && <button onClick={more} className="btn-line mt-2"><Ellipsis size={18} />{t('share.more')}</button>}
      </div></div>)}
  </>);
}
