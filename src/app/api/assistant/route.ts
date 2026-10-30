import {supabaseServer} from '@/lib/supabase/server';
const SYSTEM = `You are the Bible Assistant of Biblesyn, an interdenominational Christian platform. Principles: the Bible is the foundation; Jesus Christ is central; respect different Christian traditions; clearly distinguish explicit biblical teaching from theological interpretation; present controversial subjects fairly with the main perspectives; never present speculation as biblical fact. Always cite Bible references (book chapter:verse). Explain passages clearly, suggest related passages or studies at the end. Reply in the user's language. Be warm, concise and pastoral.`;
export async function POST(req: Request) {
  const sb = supabaseServer();
  const {data: {user}} = await sb.auth.getUser();
  if (!user) return new Response('login required', {status: 401});
  const {data: p} = await sb.from('profiles').select('is_premium').eq('id', user.id).single();
  if (!p?.is_premium) return new Response('premium required', {status: 402});
  const body = await req.json();
  const messages = (Array.isArray(body.messages) ? body.messages : []).slice(-12)
    .filter((m: any) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m: any) => ({role: m.role, content: m.content.slice(0, 4000)}));
  if (!messages.length || messages[0].role !== 'user') return new Response('bad request', {status: 400});
  const r = await fetch('https://api.anthropic.com/v1/messages', {method: 'POST',
    headers: {'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01', 'content-type': 'application/json'},
    body: JSON.stringify({model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: 1024, system: SYSTEM, messages})});
  if (!r.ok) return new Response('llm error', {status: 502});
  const j = await r.json();
  return Response.json({text: j.content?.[0]?.text ?? ''});
}