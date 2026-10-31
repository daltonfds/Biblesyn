'use server';
import {revalidatePath} from 'next/cache';
import {supabaseServer} from '@/lib/supabase/server';
export async function toggleSave(fd: FormData) {
  const sb = supabaseServer(); const {data: {user}} = await sb.auth.getUser(); if (!user) return;
  const id = String(fd.get('article_id'));
  if (fd.get('saved') === '1') await sb.from('saved_articles').delete().eq('article_id', id).eq('user_id', user.id);
  else await sb.from('saved_articles').insert({article_id: id, user_id: user.id});
  revalidatePath(`/library/${fd.get('slug')}`); revalidatePath('/journal');
}
