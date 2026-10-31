'use client';
import {useEffect, useState} from 'react';
import {useT} from './I18nProvider';
export default function Greeting() {
  const t = useT(); const [k, setK] = useState('greet.morning');
  useEffect(() => { const h = new Date().getHours(); setK(h < 12 ? 'greet.morning' : h < 18 ? 'greet.afternoon' : 'greet.evening'); }, []);
  return <span>{t(k)}</span>;
}
