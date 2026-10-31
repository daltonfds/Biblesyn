import {supabaseServer} from '@/lib/supabase/server';
import {getLocale} from '@/lib/locale';
import {getT} from '@/lib/i18n';
import ShareButton from '@/components/ShareButton';
import Gate from '@/components/Gate';
export const metadata = {title: 'Devotion'};
export default async function Devotion({searchParams}: {searchParams: {listen?: string}}) {
  const sb = supabaseServer(); const t = await getT(); const locale = await getLocale();
  const {data: {user}} = await sb.auth.getUser(); const today = new Date().toISOString().slice(0, 10);
  const {data: d} = await sb.from('devotions').select('*').eq('locale', locale).lte('day', today).order('day', {ascending: false}).limit(1).maybeSingle();
  if (!d) return <div className="px-6 pt-14 text-sm text-mute">{t('home.empty')}</div>;
  return (<div className="px-6 pt-14">
    <div className="flex items-center justify-between"><span className="label">{t('home.devotion')}</span><ShareButton path="/devotion" title="Biblesyn" text={`"${d.verse_text}" ${d.verse_ref}`} /></div>
    <p className="mt-6 font-serif text-[36px] font-bold leading-[1.1]">{d.verse_text}</p><p className="mt-2 text-sm text-mute">{d.verse_ref}</p>
    {user && <audio controls autoPlay={searchParams.listen === '1'} preload="none" className="mt-6 w-full" src="/api/tts?devotion=1" />}
    <p className="mt-6 font-serif text-xl leading-relaxed">{d.reflection}</p>
    {d.prayer && <p className="mt-6 font-serif text-xl italic leading-relaxed">{d.prayer}</p>}
    {!user && <Gate next="/devotion" title={t('gate.title_listen')} />}
  </div>);
}
