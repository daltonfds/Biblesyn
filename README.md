# Biblesyn
Understand the Word. Strengthen Your Spirit.

Stack: Next.js 14 (App Router, TypeScript), Tailwind, Supabase (Postgres + Auth), Anthropic (Bible Assistant), OpenAI TTS (audio).
Sales landing page: Brazilian Portuguese (pt-BR), BRL pricing, and external EscalePay checkout. The application does not use Stripe, a payment SDK, Stripe Checkout, payment links, or Stripe webhooks.

## Sales landing page
- Checkout URL: `NEXT_PUBLIC_CHECKOUT_URL`
- Default checkout: `https://checkout.escalepay.com/9630961`
- Offer: R$ 17 por R$ 5,90.
- Checkout actions are regular links to EscalePay; payment is handled externally.

## No static content
Everything the user reads in the application is added by admins in `/admin`: articles, study plans, devotions, topics, interface text, languages, countries and prices. The code ships English fallbacks for interface text (`src/lib/i18n-defaults.ts`).

## User app
Guest browsing; email/password and Google sign-in; country and language chosen at signup; language, country and reading typeface/size selectable in Settings; content gated by database rules; Bible Assistant; study plans with progress and streak; journal with goals and saved articles; daily devotion with audio; article reader Read / Listen / Read & Listen; sharing to WhatsApp, Facebook, X, Telegram, copy link, native share; Open Graph cards for shared links.

## Admin panel (`/admin`)
Roles: `admin` (everything) and `editor` (content only). Dashboard, Users, Articles and Study plans, Devotions, Topics, Interface text, Languages, Countries & pricing.

## Setup
1. Supabase: run the migrations in `supabase/migrations` in order.
2. Auth > Providers: enable Email and Google. Add your production callback URL and `http://localhost:3000/auth/callback` as redirect URLs.
3. Copy `.env.example` to `.env.local` and fill it in. `SUPABASE_SERVICE_ROLE_KEY` is server-only.
4. Run `npm install && npm run dev`.
5. First admin: create your account in the app, then grant the admin role in Supabase.
6. Deploy: push to GitHub, import in Vercel, and add the variables from `.env.example`.

## Notes
- The checkout is hosted by EscalePay. The Biblesyn site only links to the external checkout; it does not collect or process card details.
- Content exists per language. A visitor only sees content published in their language; add each translation in the admin.
