import {Resend} from 'resend';

type Locale = 'en' | 'pt-BR' | 'pt-PT' | 'fr' | 'es' | 'it';
const COPY: Record<Locale, {subject: string; heading: string; body: string; cta: string}> = {
  en: {subject: 'Your Biblesyn Premium access is ready', heading: 'Welcome to Biblesyn Premium', body: 'Your subscription has been confirmed. You can now continue your journey with the complete spiritual library, study plans and Bible assistant.', cta: 'Open Biblesyn'},
  'pt-BR': {subject: 'Seu acesso ao Biblesyn Premium está disponível', heading: 'Bem-vindo ao Biblesyn Premium', body: 'Sua assinatura foi confirmada. Agora você tem acesso à biblioteca espiritual completa, aos planos de estudo e ao Assistente Bíblico.', cta: 'Acessar Biblesyn'},
  'pt-PT': {subject: 'O seu acesso ao Biblesyn Premium está disponível', heading: 'Bem-vindo ao Biblesyn Premium', body: 'A sua subscrição foi confirmada. Já pode aceder à biblioteca espiritual completa, aos planos de estudo e ao Assistente Bíblico.', cta: 'Abrir Biblesyn'},
  fr: {subject: 'Votre accès à Biblesyn Premium est prêt', heading: 'Bienvenue sur Biblesyn Premium', body: 'Votre abonnement a été confirmé. Vous pouvez désormais accéder à la bibliothèque spirituelle complète, aux programmes d’étude et à l’assistant biblique.', cta: 'Ouvrir Biblesyn'},
  es: {subject: 'Tu acceso a Biblesyn Premium está listo', heading: 'Te damos la bienvenida a Biblesyn Premium', body: 'Tu suscripción ha sido confirmada. Ya puedes acceder a la biblioteca espiritual completa, los planes de estudio y el asistente bíblico.', cta: 'Abrir Biblesyn'},
  it: {subject: 'Il tuo accesso a Biblesyn Premium è pronto', heading: 'Benvenuto in Biblesyn Premium', body: 'Il tuo abbonamento è stato confermato. Ora puoi accedere alla biblioteca spirituale completa, ai piani di studio e all’assistente biblico.', cta: 'Apri Biblesyn'},
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
    from,
    to: email,
    subject: copy.subject,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#17211b"><h1>${copy.heading}</h1><p>${copy.body}</p><p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#17211b;color:#fff;text-decoration:none;border-radius:999px">${copy.cta}</a></p><p>Biblesyn · Entenda a Palavra. Fortaleça seu Espírito.</p></div>`,
  });
  if (error) {
    console.error('Biblesyn Resend delivery failed:', error.message);
    return false;
  }
  return true;
}
