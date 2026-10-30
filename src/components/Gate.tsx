import Link from 'next/link';
import Icon from '@/components/Icon';
export default function Gate({next,title='Create a free account to keep reading'}:{next:string;title?:string}){
 const q=encodeURIComponent(next);
 return <section className="my-8 rounded-[24px] bg-ink p-6 text-center text-white">
  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#A9C7B4]"><Icon name="lock" size={21}/></div>
  <h2 className="mt-4 font-serif text-[28px] font-semibold leading-tight">{title}</h2>
  <p className="mt-3 text-sm leading-6 text-white/70">Create an account to save your progress, access full studies, listen to audio and keep a spiritual journal.</p>
  <Link href={`/signup?next=${q}`} className="mt-6 block rounded-full bg-white py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-[#F0F0F0]">Create account</Link>
  <Link href={`/login?next=${q}`} className="mt-4 inline-block text-sm text-[#B8D0C0]">Already a member? Log in</Link>
 </section>;
}