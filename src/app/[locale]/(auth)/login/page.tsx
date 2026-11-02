import AuthForm from '@/components/AuthForm';
import {getCountries, getCountry, getLanguages, getLocale} from '@/lib/locale';
export const metadata = {title: 'Log in'};
export default async function P() { return <AuthForm mode="login" countries={await getCountries()} languages={await getLanguages()} defaultCountry={getCountry()} defaultLocale={await getLocale()} />; }
