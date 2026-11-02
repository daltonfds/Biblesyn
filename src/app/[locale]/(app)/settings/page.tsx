import Link from 'next/link';
import {ChevronLeft} from 'lucide-react';
import {supabaseServer} from '@/lib/supabase/server';
import {getCountries, getCountry, getLanguages, getLocale, getReaderPrefs} from '@/lib/locale';
import {getT} from '@/lib/i18n';
import SettingsForm from '@/components/SettingsForm';
export const metadata = {title: 'Settings'};
export default async function Settings() {
  const sb = supabaseServer(); const t = await getT(); const prefs = getReaderPrefs();
  const {data: {user}} = await sb.auth.getUser();
  const {data: p} = user ? await sb.from('profiles').select('country').eq('id', user.id).maybeSingle() : {data: null};
  return (<div className="px-6 pt-12"><Link href="/" aria-label={t('common.back')} className="flex h-10 w-10 items-center justify-center rounded-full bg-mist"><ChevronLeft size={20} /></Link>
    <h1 className="mb-2 mt-5 font-serif text-[36px] font-bold leading-tight">{t('settings.title')}</h1>
    <SettingsForm languages={await getLanguages()} countries={await getCountries()} locale={await getLocale()} country={p?.country || getCountry()} f={prefs.f} s={prefs.s} />
  </div>);
}
