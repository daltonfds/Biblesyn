import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
export default async function Plans() {
  const {data: plans} = await supabaseServer().from('study_plans').select('slug,title,description,days').eq('published', true).order('sort');
  return (<div className="px-5 pt-14"><h1 className="px-1 font-serif text-4xl font-semibold">Study Plans</h1>
    {plans?.length ? <div className="mt-4 space-y-2">{plans.map((plan: any) => <Link key={plan.slug} href={`/plans/${plan.slug}`} className="block rounded-2xl border border-[#E3D5B8] bg-[#FFFDF8] p-4"><div className="font-serif text-xl font-semibold">{plan.title}</div><div className="mt-1 text-xs text-[#6F5A40]">{plan.days} days</div>{plan.description && <p className="mt-2 text-sm text-[#6F5A40]">{plan.description}</p>}</Link>)}</div> : <p className="mt-4 rounded-2xl bg-parchment p-4 text-sm text-[#6F5A40]">There are no published study plans yet.</p>}</div>);
}