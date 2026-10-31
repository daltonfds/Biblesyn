import Link from 'next/link';
import {Lock} from 'lucide-react';
import GoogleButton from './GoogleButton';
import {getT} from '@/lib/i18n';
export default async function Gate({next, title}: {next: string; title?: string}) {
  const t = await getT(); const q = encodeURIComponent(next);
  return (<section className="my-6 rounded-[28px] bg-ink p-6 text-center text-white">
    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><Lock size={20} /></span>
    <h2 className="mt-4 font-serif text-[28px] font-bold leading-tight">{title ?? t('gate.title')}</h2>
    <p className="mt-2 text-sm text-white/70">{t('gate.sub')}</p>
    <div className="mt-5 space-y-3"><Link href={`/signup?next=${q}`} className="btn bg-leaf text-white">{t('auth.create_btn')}</Link><GoogleButton next={next} dark />
      <Link href={`/login?next=${q}`} className="block pt-1 text-sm text-white/70">{t('gate.member')} <span className="font-semibold text-white">{t('common.login')}</span></Link></div>
  </section>);
}
