import Link from 'next/link';
export default function Gate({next, title = 'Create a free account to keep reading'}: {next: string; title?: string}) {
  const q = encodeURIComponent(next);
  return (<section className="mx-5 my-6 rounded-3xl border border-gold bg-brown p-6 text-center text-ivory">
    <h2 className="font-serif text-3xl font-semibold leading-tight">{title}</h2>
    <p className="mt-2 text-sm text-parchment/90">Browse freely. An account unlocks full articles, audio, plans and your journal.</p>
    <Link href={`/signup?next=${q}`} className="mt-5 block rounded-full bg-gold py-3 font-semibold text-umber">Create account</Link>
    <Link href={`/login?next=${q}`} className="mt-3 block text-sm text-gold">Already a member? Log in</Link>
  </section>);
}