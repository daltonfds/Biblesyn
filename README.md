# Biblesyn
Understand the Word. Strengthen Your Spirit.

Stack: Next.js 14 (App Router, TypeScript), Tailwind, Supabase (Postgres + Auth), Anthropic (Bible Assistant), OpenAI TTS (audio).
Country-specific external checkout offers are configured in `src/lib/offer.ts`. The application has no Stripe dependency or Stripe environment variables.

## Sales landing page
- `src/lib/offer.ts` is the single source of truth for country, currency, current/previous prices and EscalePay checkout URLs.
- The language (`NEXT_LOCALE`) and country (`NEXT_COUNTRY`) are independent preferences. Explicit localized URLs take priority for language; the country cookie/profile determines the offer and currency.
- Unknown countries fall back to the US offer. Price formatting and discount calculation are shared by Premium and the Brazil-only private landing page.
- Checkout URLs receive `user_id`, `email`, `locale`, `country` and `external_reference` attribution parameters.
- In Vercel Preview, set the `NEXT_COUNTRY` environment variable to a supported two-letter country code, or override it in the browser with `NEXT_COUNTRY=PT` (and optionally `NEXT_LOCALE=pt-PT`). The cookies take priority over deployment geolocation.
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
