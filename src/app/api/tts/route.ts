import {supabaseServer} from '@/lib/supabase/server';
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('slug') ?? '';
  const sb = supabaseServer();
  const {data: a} = await sb.from('articles').select('id').eq('slug', slug).maybeSingle();
  if (!a) return new Response('not found', {status: 404});
  const {data: b} = await sb.from('article_bodies').select('body').eq('article_id', a.id).maybeSingle();
  if (!b) return new Response('forbidden', {status: 403});
  const r = await fetch('https://api.openai.com/v1/audio/speech', {method: 'POST',
    headers: {authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json'},
    body: JSON.stringify({model: 'gpt-4o-mini-tts', voice: 'alloy', input: b.body.slice(0, 4000)})});
  if (!r.ok) return new Response('tts error', {status: 502});
  return new Response(r.body, {headers: {'content-type': 'audio/mpeg', 'cache-control': 'private, max-age=86400'}});
}