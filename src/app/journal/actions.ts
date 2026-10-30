'use server';
import {revalidatePath} from 'next/cache';
import {supabaseServer} from '@/lib/supabase/server';
export async function addEntry(fd: FormData) {
  const body = String(fd.get('body') ?? '').trim(); if (!body) return;
  await supabaseServer().from('journal_entries').insert({body, verse_ref: String(fd.get('verse_ref') ?? '') || null});
  revalidatePath('/journal');
}
export async function deleteEntry(fd: FormData) {
  await supabaseServer().from('journal_entries').delete().eq('id', String(fd.get('id')));
  revalidatePath('/journal');
}