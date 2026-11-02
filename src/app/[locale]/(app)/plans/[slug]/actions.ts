'use server';
import {revalidatePath} from 'next/cache';
import {supabaseServer} from '@/lib/supabase/server';
export async function completeDay(fd: FormData) {
  const sb = supabaseServer(); const {data: {user}} = await sb.auth.getUser(); if (!user) return;
  await sb.from('plan_progress').upsert({user_id: user.id, plan_id: String(fd.get('plan_id')), day_number: Number(fd.get('day'))});
  revalidatePath(`/plans/${fd.get('slug')}`); revalidatePath('/plans'); revalidatePath('/');
}
