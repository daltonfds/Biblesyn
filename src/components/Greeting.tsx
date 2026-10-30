'use client';
import {useEffect, useState} from 'react';
export default function Greeting() {
  const [g, setG] = useState('Welcome');
  useEffect(() => { const h = new Date().getHours(); setG(h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'); }, []);
  return <span>{g}</span>;
}
