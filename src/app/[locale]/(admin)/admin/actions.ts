'use server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {requireStaff} from '@/lib/admin';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {DEFAULTS} from '@/lib/i18n-defaults';
const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const bool = (fd: FormData, k: string) => fd.get(k) === 'on';
const back = (path: string, q: string) => redirect(`${path}${path.includes('?') ? '&' : '?'}${q}`);
// ---------- articles
export async function saveArticle(fd: FormData) {
  await requireStaff(); const db = supabaseAdmin(); const group = str(fd, 'group'); const locale = str(fd, 'locale'); const base = `/admin/articles/${group}?lang=${locale}`;
  const title = str(fd, 'title'); const slug = slugify(str(fd, 'slug') || title); if (!title || !slug) back(base, 'err=Title is required');
  const {data, error} = await db.from('articles').upsert({group_id: group, locale, title, slug, excerpt: str(fd, 'excerpt') || null, topic_id: str(fd, 'topic_id') || null, read_minutes: Number(str(fd, 'read_minutes')) || 8,
    is_free: bool(fd, 'is_free'), published: bool(fd, 'published'), audio_url: str(fd, 'audio_url') || null}, {onConflict: 'group_id,locale'}).select('id').single();
  if (error || !data) back(base, `err=${encodeURIComponent(error?.message ?? 'Could not save')}`);
  await db.from('article_bodies').upsert({article_id: data!.id, body: str(fd, 'body')}, {onConflict: 'article_id'});
  revalidatePath('/library'); revalidatePath('/'); back(base, 'saved=1');
}
export async function deleteArticle(fd: FormData) {
  await requireStaff(); await supabaseAdmin().from('articles').delete().eq('group_id', str(fd, 'group')).eq('locale', str(fd, 'locale')); revalidatePath('/library'); redirect('/admin/articles');
}
// ---------- plans
export async function savePlan(fd: FormData) {
  await requireStaff(); const db = supabaseAdmin(); const group = str(fd, 'group'); const locale = str(fd, 'locale'); const base = `/admin/plans/${group}?lang=${locale}`;
  const title = str(fd, 'title'); const slug = slugify(str(fd, 'slug') || title); if (!title || !slug) back(base, 'err=Title is required');
  const {error} = await db.from('study_plans').upsert({group_id: group, locale, title, slug, description: str(fd, 'description') || null, days: Number(str(fd, 'days')) || 7, sort: Number(str(fd, 'sort')) || 0, published: bool(fd, 'published')}, {onConflict: 'group_id,locale'});
  if (error) back(base, `err=${encodeURIComponent(error.message)}`); revalidatePath('/plans'); back(base, 'saved=1');
}
export async function deletePlan(fd: FormData) { await requireStaff(); await supabaseAdmin().from('study_plans').delete().eq('group_id', str(fd, 'group')).eq('locale', str(fd, 'locale')); revalidatePath('/plans'); redirect('/admin/plans'); }
export async function saveDay(fd: FormData) {
  await requireStaff(); const db = supabaseAdmin(); const base = `/admin/plans/${str(fd, 'group')}?lang=${str(fd, 'locale')}`;
  const {error} = await db.from('study_plan_days').upsert({plan_id: str(fd, 'plan_id'), day_number: Number(str(fd, 'day_number')), title: str(fd, 'title') || `Day ${str(fd, 'day_number')}`, passage: str(fd, 'passage') || null, body: str(fd, 'body') || null, reflection: str(fd, 'reflection') || null, prayer: str(fd, 'prayer') || null}, {onConflict: 'plan_id,day_number'});
  if (error) back(base, `err=${encodeURIComponent(error.message)}`); back(base, 'saved=1');
}
export async function deleteDay(fd: FormData) { await requireStaff(); await supabaseAdmin().from('study_plan_days').delete().eq('id', str(fd, 'id')); back(`/admin/plans/${str(fd, 'group')}?lang=${str(fd, 'locale')}`, 'saved=1'); }
// ---------- devotions
export async function saveDevotion(fd: FormData) {
  await requireStaff(); const locale = str(fd, 'locale'); const base = `/admin/devotions?lang=${locale}`;
  const {error} = await supabaseAdmin().from('devotions').upsert({day: str(fd, 'day'), locale, verse_ref: str(fd, 'verse_ref'), verse_text: str(fd, 'verse_text'), reflection: str(fd, 'reflection') || null, prayer: str(fd, 'prayer') || null}, {onConflict: 'day,locale'});
  if (error) back(base, `err=${encodeURIComponent(error.message)}`); revalidatePath('/'); back(base, 'saved=1');
}
export async function deleteDevotion(fd: FormData) { await requireStaff(); await supabaseAdmin().from('devotions').delete().eq('day', str(fd, 'day')).eq('locale', str(fd, 'locale')); revalidatePath('/'); back(`/admin/devotions?lang=${str(fd, 'locale')}`, 'saved=1'); }
// ---------- topics
export async function saveTopic(fd: FormData) {
  await requireStaff(); const db = supabaseAdmin(); const slug = slugify(str(fd, 'slug')); if (!slug) back('/admin/topics', 'err=Slug is required');
  const {data: t, error} = await db.from('topics').upsert({slug, sort: Number(str(fd, 'sort')) || 0}, {onConflict: 'slug'}).select('id').single(); if (error || !t) back('/admin/topics', `err=${encodeURIComponent(error?.message ?? 'error')}`);
  const {data: langs} = await db.from('languages').select('code');
  for (const l of langs ?? []) { const name = str(fd, `name_${l.code}`); if (name) await db.from('topic_names').upsert({topic_id: t!.id, locale: l.code, name}, {onConflict: 'topic_id,locale'}); else await db.from('topic_names').delete().eq('topic_id', t!.id).eq('locale', l.code); }
  revalidatePath('/library'); back('/admin/topics', 'saved=1');
}
export async function deleteTopic(fd: FormData) { await requireStaff(); await supabaseAdmin().from('topics').delete().eq('id', str(fd, 'id')); revalidatePath('/library'); back('/admin/topics', 'saved=1'); }
// ---------- languages
export async function saveLanguage(fd: FormData) {
  await requireStaff(true); const db = supabaseAdmin(); const code = slugify(str(fd, 'code')); if (!code) back('/admin/languages', 'err=Code is required');
  const {data: cur} = await db.from('languages').select('is_default').eq('code', code).maybeSingle();
  const {error} = await db.from('languages').upsert({code, name: str(fd, 'name') || code, native_name: str(fd, 'native_name') || null, sort: Number(str(fd, 'sort')) || 0, active: cur?.is_default ? true : bool(fd, 'active')}, {onConflict: 'code'});
  if (error) back('/admin/languages', `err=${encodeURIComponent(error.message)}`); revalidatePath('/', 'layout'); back('/admin/languages', 'saved=1');
}
export async function makeDefaultLanguage(fd: FormData) { await requireStaff(true); const db = supabaseAdmin(); await db.from('languages').update({is_default: false}).eq('is_default', true); await db.from('languages').update({is_default: true, active: true}).eq('code', str(fd, 'code')); revalidatePath('/', 'layout'); back('/admin/languages', 'saved=1'); }
// ---------- countries & pricing
export async function saveCountry(fd: FormData) {
  await requireStaff(true); const db = supabaseAdmin(); const code = str(fd, 'code').toUpperCase(); const star = code === '*'; if (!code) back('/admin/pricing', 'err=Code is required');
  if (!star) { const {error} = await db.from('countries').upsert({code, name: str(fd, 'name') || code, default_locale: str(fd, 'default_locale') || null, active: bool(fd, 'active')}, {onConflict: 'code'}); if (error) back('/admin/pricing', `err=${encodeURIComponent(error.message)}`); }
  const cur = str(fd, 'currency').toUpperCase(); const amt = Math.round(Number(str(fd, 'amount').replace(',', '.')) * 100);
  if (cur.length === 3 && amt > 0) await db.from('prices').upsert({country: code, currency: cur, amount_cents: amt, active: star ? true : bool(fd, 'price_active')}, {onConflict: 'country'}); else if (!star) await db.from('prices').delete().eq('country', code);
  revalidatePath('/premium'); back('/admin/pricing', 'saved=1');
}
export async function deleteCountry(fd: FormData) { await requireStaff(true); const db = supabaseAdmin(); const code = str(fd, 'code'); await db.from('prices').delete().eq('country', code); await db.from('countries').delete().eq('code', code); back('/admin/pricing', 'saved=1'); }
// ---------- interface strings
export async function saveStrings(fd: FormData) {
  await requireStaff(); const db = supabaseAdmin(); const locale = str(fd, 'locale'); const rows: {key: string; locale: string; value: string}[] = []; const del: string[] = [];
  for (const k of Object.keys(DEFAULTS)) { const v = str(fd, `k:${k}`); if (v) rows.push({key: k, locale, value: v}); else del.push(k); }
  if (rows.length) await db.from('ui_strings').upsert(rows, {onConflict: 'key,locale'}); if (del.length) await db.from('ui_strings').delete().eq('locale', locale).in('key', del);
  revalidatePath('/', 'layout'); back(`/admin/strings?lang=${locale}`, 'saved=1');
}
export async function fillStrings(fd: FormData) {
  await requireStaff(); const db = supabaseAdmin(); const locale = str(fd, 'locale'); const {data} = await db.from('ui_strings').select('key').eq('locale', locale); const have = new Set((data ?? []).map((r: any) => r.key));
  const rows = Object.entries(DEFAULTS).filter(([k]) => !have.has(k)).map(([key, value]) => ({key, locale, value})); if (rows.length) await db.from('ui_strings').insert(rows);
  revalidatePath('/', 'layout'); back(`/admin/strings?lang=${locale}`, 'saved=1');
}
// ---------- users
export async function userAction(fd: FormData) {
  const me = await requireStaff(true); const db = supabaseAdmin(); const id = str(fd, 'id'); const op = str(fd, 'op'); const base = `/admin/users/${id}`;
  if (op === 'grant') await db.from('profiles').update({is_premium: true, premium_source: 'admin'}).eq('id', id);
  if (op === 'revoke') await db.from('profiles').update({is_premium: false, premium_source: null}).eq('id', id);
  if (op === 'suspend' && id !== me.id) await db.from('profiles').update({suspended: true}).eq('id', id);
  if (op === 'unsuspend') await db.from('profiles').update({suspended: false}).eq('id', id);
  if (op === 'role' && id !== me.id && ['user', 'editor', 'admin'].includes(str(fd, 'role'))) await db.from('profiles').update({role: str(fd, 'role')}).eq('id', id);
  back(base, 'saved=1');
}
