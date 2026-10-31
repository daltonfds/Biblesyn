'use client';
import {createContext, useContext} from 'react';
type Ctx = {strings: Record<string, string>; locale: string};
const C = createContext<Ctx>({strings: {}, locale: 'en'});
export default function I18nProvider({strings, locale, children}: Ctx & {children: React.ReactNode}) {
  return <C.Provider value={{strings, locale}}>{children}</C.Provider>;
}
export function useT() {
  const {strings} = useContext(C);
  return (k: string, v?: Record<string, string | number>) => (strings[k] ?? k).replace(/\{(\w+)\}/g, (_, x) => String(v?.[x] ?? ''));
}
export const useLocale = () => useContext(C).locale;
