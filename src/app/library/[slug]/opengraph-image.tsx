import {ImageResponse} from 'next/og';
import {createClient} from '@supabase/supabase-js';
export const alt = 'Biblesyn'; export const size = {width: 1200, height: 630}; export const contentType = 'image/png';
export default async function Img({params}: {params: {slug: string}}) {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const {data: a} = await sb.from('articles').select('title,topic').eq('slug', params.slug).maybeSingle();
  return new ImageResponse(
    (<div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#0B0B0B', color: '#fff', padding: 72}}>
      <div style={{display: 'flex', fontSize: 30, letterSpacing: 8, color: '#15803D'}}>BIBLESYN</div>
      <div style={{display: 'flex', fontSize: 80, fontWeight: 700, lineHeight: 1.1}}>{a?.title ?? 'Understand the Word.'}</div>
      <div style={{display: 'flex', fontSize: 30, color: '#A3A3A3'}}>Understand the Word. Strengthen Your Spirit.</div></div>), size);
}
