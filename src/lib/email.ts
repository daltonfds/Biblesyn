import {Resend} from 'resend';

type Locale = 'en' | 'pt-BR' | 'pt-PT' | 'fr' | 'es' | 'it';
const COPY: Record<Locale, {subject: string; heading: string; body: string; cta: string}> = {
  en: {subject: 'Your Biblesyn Premium access is ready', heading: 'Welcome to Biblesyn Premium', body: 'Your payment has been confirmed. Your Premium access is now active.', cta: 'Open Biblesyn'},
  'pt-BR': {subject: 'Seu acesso ao Biblesyn Premium está disponível', heading: 'Bem-vindo ao Biblesyn Premium', body: 'Seu pagamento foi confirmado. Seu acesso Premium já está ativo.', cta: 'Acessar Biblesyn'},
  'pt-PT': {subject: 'O seu acesso ao Biblesyn Premium está disponível', heading: 'Bem-vindo ao Biblesyn Premium', body: 'O seu pagamento foi confirmado. O seu acesso Premium já está ativo.', cta: 'Abrir Biblesyn'},
  fr: {subject: 'Votre accès à Biblesyn Premium est prêt', heading: 'Bienvenue sur Biblesyn Premium', body: 'Votre paiement a été confirmé. Votre accès Premium est maintenant actif.', cta: 'Ouvrir Biblesyn'},
  es: {subject: 'Tu acceso a Biblesyn Premium está listo', heading: 'Te damos la bienvenida a Biblesyn Premium', body: 'Tu pago ha sido confirmado. Tu acceso Premium ya está activo.', cta: 'Abrir Biblesyn'},
  it: {subject: 'Il tuo accesso a Biblesyn Premium è pronto', heading: 'Benvenuto in Biblesyn Premium', body: 'Il pagamento è stato confermato. Il tuo accesso Premium è ora attivo.', cta: 'Apri Biblesyn'},
};

export async function sendSubscriptionConfirmation(email: string, profileLocale?: string | null) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from || !email) {
    console.warn('Biblesyn confirmation email skipped: RESEND_API_KEY, RESEND_FROM_EMAIL or recipient missing.');
    return false;
  }
  const locale: Locale = profileLocale === 'en-ZA' ? 'en' :
    (profileLocale && profileLocale in COPY ? profileLocale as Locale : 'en');
  const copy = COPY[locale];
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://blui.online';
  const url = `${site}/${locale}/home`;
  const resend = new Resend(apiKey);
  const {error} = await resend.emails.send({
    from, to: email, subject: copy.subject,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#17211b"><h1>${copy.heading}</h1><p>${copy.body}</p><p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#17211b;color:#fff;text-decoration:none;border-radius:999px">${copy.cta}</a></p><p>Biblesyn · Entenda a Palavra. Fortaleça seu Espírito.</p></div>`,
  });
  if (error) { console.error('Biblesyn Resend delivery failed:', error.message); return false; }
  return true;
}
