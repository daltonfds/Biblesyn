import {supabaseServer} from '@/lib/supabase/server';
export async function GET(req: Request) {
  if (!process.env.OPENAI_API_KEY) return new Response('audio is not configured', {status: 503});
  const slug = new URL(req.url).searchParams.get('slug') ?? '';
  const sb = supabaseServer();
  const {data: {user}} = await sb.auth.getUser();
  if (!user) return new Response('authentication required', {status: 401});
  const [{data: article}, {data: profile}] = await Promise.all([
    sb.from('articles').select('id,is_free,published').eq('slug', slug).maybeSingle(),
    sb.from('profiles').select('is_premium').eq('id', user.id).single()
  ]);
  if (!article?.published) return new Response('not found', {status: 404});
  if (!article.is_free && !profile?.is_premium) return new Response('Premium required', {status: 403});
  const {data: content} = await sb.from('article_bodies').select('body').eq('article_id', article.id).maybeSingle();
  if (!content?.body) return new Response('article content unavailable', {status: 404});
  const response = await fetch('https://api.openai.com/v1/audio/speech', {method: 'POST', headers: {authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json'}, body: JSON.stringify({model: 'gpt-4o-mini-tts', voice: 'alloy', input: content.body.slice(0, 4000)})});
  if (!response.ok) return new Response('audio provider error', {status: 502});
  return new Response(response.body, {headers: {'content-type': 'audio/mpeg', 'cache-control': 'private, max-age=86400'}});
}