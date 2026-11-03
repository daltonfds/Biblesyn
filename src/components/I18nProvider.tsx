'use client';
import {useTranslations, useLocale as useNextIntlLocale} from 'next-intl';

export default function I18nProvider({
  children,
}: {
  children: React.ReactNode;
  strings?: Record<string, string>;
  locale?: string;
}) {
  return <>{children}</>;
}

export function useT() {
  const translate = useTranslations();
  return (key: string, values?: Record<string, string | number>) =>
    translate(key as never, values as never);
}

export const useLocale = useNextIntlLocale;
