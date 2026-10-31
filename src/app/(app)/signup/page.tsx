import AuthForm from '@/components/AuthForm';
import {getCountries, getCountry, getLanguages, getLocale} from '@/lib/locale';
export const metadata = {title: 'Create account'};
export default async function P() { return <AuthForm mode="signup" countries={await getCountries()} languages={await getLanguages()} defaultCountry={getCountry()} defaultLocale={await getLocale()} />; }
