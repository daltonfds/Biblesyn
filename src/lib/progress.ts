const day = (d: string | Date) => new Date(d).toISOString().slice(0, 10);
export async function getStreak(sb: any, uid: string): Promise<number> {
  const [a, b] = await Promise.all([
    sb.from('plan_progress').select('completed_at').eq('user_id', uid),
    sb.from('journal_entries').select('created_at').eq('user_id', uid)]);
  const s = new Set<string>([...(a.data ?? []).map((r: any) => day(r.completed_at)), ...(b.data ?? []).map((r: any) => day(r.created_at))]);
  const d = new Date(); if (!s.has(day(d))) d.setUTCDate(d.getUTCDate() - 1);
  let n = 0; while (s.has(day(d))) { n++; d.setUTCDate(d.getUTCDate() - 1); }
  return n;
}
export async function getContinuePlan(sb: any, uid: string) {
  const {data: last} = await sb.from('plan_progress').select('plan_id,day_number').eq('user_id', uid).order('completed_at', {ascending: false}).limit(1).maybeSingle();
  if (!last) return null;
  const [{data: plan}, {count}] = await Promise.all([
    sb.from('study_plans').select('slug,title,days').eq('id', last.plan_id).single(),
    sb.from('plan_progress').select('*', {count: 'exact', head: true}).eq('user_id', uid).eq('plan_id', last.plan_id)]);
  if (!plan) return null;
  return {slug: plan.slug as string, title: plan.title as string, days: plan.days as number, done: count ?? 0, next: Math.min((last.day_number ?? 0) + 1, plan.days) as number};
}
