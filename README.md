# Biblesyn
Understand the Word. Strengthen Your Spirit.

Stack: Next.js 14 (App Router, TypeScript), Tailwind, Supabase (Postgres + Auth), Anthropic (Bible Assistant), OpenAI TTS (audio).
Country-specific external checkout offers are configured in `src/lib/offer.ts`. The application has no Stripe dependency or Stripe environment variables.

## Sales landing page
- `OFFERS.BR`: `https://checkout.escalepay.com/9630961`, R$ 5,90 (antes R$ 17).
- `OFFERS.US`, `OFFERS.PT`, `OFFERS.IT` e `OFFERS.ZA` têm campos `TODO` para preço e link.
- Países fora da tabela usam a oferta US. O idioma da página não altera a moeda nem o checkout.
- Os links externos recebem parâmetros de atribuição (`user_id`, `email`, `locale`, `country` e `external_reference`). O fornecedor precisa preservar esses valores no webhook para associar a compra à conta.

## No static content
Everything the user reads in the application is added by admins in `/admin`: articles, study plans, devotions, topics, interface text, languages, countries and prices. The code ships English fallbacks for interface text (`src/lib/i18n-defaults.ts`).

## User app
Guest browsing; email/password and Google sign-in; country and language chosen at signup; language, country and reading typeface/size selectable in Settings; content gated by database rules; Bible Assistant; study plans with progress and streak; journal with goals and saved articles; daily devotion with audio; article reader Read / Listen / Read & Listen; sharing to WhatsApp, Facebook, X, Telegram, copy link, native share; Open Graph cards for shared links.

## Admin panel (`/admin`)
Roles: `admin` (everything) and `editor` (content only). Dashboard, Users, Articles and Study plans, Devotions, Topics, Interface text, Languages, country offers, Premium access and webhook history.

## Setup
1. Supabase: run the migrations in `supabase/migrations` in order. The payment webhook migration creates the event log and provider-neutral payment ledger.
2. Auth > Providers: enable Email and Google. Add your production callback URL and `http://localhost:3000/auth/callback` as redirect URLs.
3. Copy `.env.example` to `.env.local` and fill it in. `SUPABASE_SERVICE_ROLE_KEY` is server-only.
4. Run `npm install && npm run dev`.
5. First admin: create your account in the app, then grant the admin role in Supabase.
6. Deploy: push to GitHub, import in Vercel, and add the variables from `.env.example`.

## Notes
- The checkout is hosted by the selected provider. Premium access is granted only after a verified provider webhook; a browser redirect never confirms payment. Providers without webhooks require manual Premium access from the admin panel.
- Content exists per language. A visitor only sees content published in their language; add each translation in the admin.
