import {supabaseServer} from '@/lib/supabase/server';
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const sb = supabaseServer();
  const {data: {user}} = await sb.auth.getUser();
  if (!user) return new Response('login required', {status: 401});
  let input = '';
  if (sp.get('devotion')) {
    const {data: d} = await sb.from('devotions').select('*').order('day', {ascending: false}).limit(1).maybeSingle();
    if (!d) return new Response('not found', {status: 404});
    input = `${d.verse_text} ${d.verse_ref}. ${d.reflection ?? ''} ${d.prayer ?? ''}`;
  } else {
    const {data: a} = await sb.from('articles').select('id').eq('slug', sp.get('slug') ?? '').maybeSingle();
    if (!a) return new Response('not found', {status: 404});
    const {data: b} = await sb.from('article_bodies').select('body').eq('article_id', a.id).maybeSingle();
    if (!b) return new Response('forbidden', {status: 403});
    input = b.body;
  }
  const r = await fetch('https://api.openai.com/v1/audio/speech', {method: 'POST',
    headers: {authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json'},
    body: JSON.stringify({model: 'gpt-4o-mini-tts', voice: 'alloy', input: input.slice(0, 4000)})});
  if (!r.ok) return new Response('tts error', {status: 502});
  return new Response(r.body, {headers: {'content-type': 'audio/mpeg', 'cache-control': 'private, max-age=86400'}});
}
