import {supabaseServer} from '@/lib/supabase/server';
import ShareButton from '@/components/ShareButton';
import Gate from '@/components/Gate';
export const metadata = {title: 'Daily devotion'};
export default async function Devotion({searchParams}: {searchParams: {listen?: string}}) {
  const sb = supabaseServer();
  const {data: {user}} = await sb.auth.getUser();
  const {data: d} = await sb.from('devotions').select('*').order('day', {ascending: false}).limit(1).maybeSingle();
  if (!d) return <div className="px-6 pt-14">No devotion yet.</div>;
  return (<div className="px-6 pt-14">
    <div className="flex items-center justify-between"><span className="label">Daily devotion</span><ShareButton path="/devotion" title="Biblesyn daily devotion" text={`"${d.verse_text}" ${d.verse_ref}`} /></div>
    <p className="mt-6 font-serif text-[36px] font-bold leading-[1.1]">{d.verse_text}</p><p className="mt-2 text-sm text-mute">{d.verse_ref}</p>
    {user ? <audio controls autoPlay={searchParams.listen === '1'} preload="none" className="mt-6 w-full" src="/api/tts?devotion=1" /> : null}
    <p className="mt-6 font-serif text-xl leading-relaxed">{d.reflection}</p>
    <h2 className="label mb-2 mt-8">Prayer</h2><p className="font-serif text-xl italic leading-relaxed">{d.prayer}</p>
    {!user && <Gate next="/devotion" title="Create a free account to listen" />}
  </div>);
}
