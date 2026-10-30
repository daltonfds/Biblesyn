import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
export default async function Plans() {
  const sb = supabaseServer();
  const {data} = await sb.from('study_plans').select('slug,title,description,days').eq('published', true).order('sort');
  return (<div className="px-5 pt-14"><h1 className="px-1 font-serif text-4xl font-semibold">Study Plans</h1>
    <div className="mt-4 space-y-2">{data?.map((p: any) => <Link key={p.slug} href={`/plans/${p.slug}`} className="block rounded-2xl border border-[#E3D5B8] bg-[#FFFDF8] p-4">
      <div className="font-serif text-xl font-semibold">{p.title}</div><div className="mt-1 text-xs text-[#6F5A40]">{p.days} days</div></Link>)}</div></div>);
}