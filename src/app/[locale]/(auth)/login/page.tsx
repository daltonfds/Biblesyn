import AuthForm from '@/components/AuthForm';
import {getCountries, getCountry, getLanguages, getLocale} from '@/lib/locale';
import {getStrings} from '@/lib/i18n';

export async function generateMetadata({params}: {params: {locale: string}}) {
  const strings = await getStrings(params.locale);
  return {title: strings['seo.login'], robots: {index: false, follow: false}};
}
export default async function P() {
  return <AuthForm mode="login" countries={await getCountries()} languages={await getLanguages()} defaultCountry={getCountry()} defaultLocale={await getLocale()} />;
}
