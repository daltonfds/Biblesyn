import {supabaseServer} from '@/lib/supabase/server';
const SYSTEM = `You are Biblesyn's Bible Assistant. The Bible is the foundation and Jesus Christ is central. Respect Christian traditions. Distinguish biblical teaching from theological interpretation, represent contested views fairly, and never present speculation as biblical fact. Cite Scripture accurately, explain context, and offer practical application. Reply in the user's language with warmth and pastoral care.`;
export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY || !process.env.ANTHROPIC_MODEL) return new Response('assistant is not configured', {status: 503});
  const sb = supabaseServer();
  const {data: {user}} = await sb.auth.getUser();
  if (!user) return new Response('login required', {status: 401});
  const {data: profile} = await sb.from('profiles').select('is_premium').eq('id', user.id).single();
  if (!profile?.is_premium) return new Response('premium required', {status: 402});
  let body: any;
  try { body = await req.json(); } catch { return new Response('invalid JSON', {status: 400}); }
  const messages = (Array.isArray(body.messages) ? body.messages : []).slice(-12).filter((m: any) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').map((m: any) => ({role: m.role, content: m.content.slice(0, 4000)}));
  if (!messages.length || messages[0].role !== 'user') return new Response('bad request', {status: 400});
  const response = await fetch('https://api.anthropic.com/v1/messages', {method: 'POST', headers: {'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json'}, body: JSON.stringify({model: process.env.ANTHROPIC_MODEL, max_tokens: 1024, system: SYSTEM, messages})});
  if (!response.ok) return new Response('assistant provider error', {status: 502});
  const result = await response.json();
  return Response.json({text: result.content?.[0]?.text ?? ''});
}