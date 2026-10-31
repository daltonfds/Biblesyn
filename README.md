# Biblesyn
Understand the Word. Strengthen Your Spirit.
Stack: Next.js 14 (App Router, TypeScript), Tailwind, Supabase (Postgres + Auth), Stripe, Anthropic (Bible Assistant), OpenAI TTS (audio).
Design: white and black with a touch of green. Source Serif 4 (titles and reading), Inter (interface), Lora (optional reading typeface). lucide-react icons, react-icons for brand icons.

## No static content
Everything the user reads is added by admins in `/admin`: articles, study plans, devotions, topics, interface text, languages, countries and prices. The code only ships English fallbacks for interface text (`src/lib/i18n-defaults.ts`).

## User app
Guest browsing; email/password and Google sign-in; country and language chosen at signup (country sets currency, price and suggested language); language, country and reading typeface/size selectable in Settings (and a globe button on Home for guests); content gated by database rules (guests read excerpts, members read free articles and day 1 of plans, Premium reads everything); Stripe subscriptions with Customer Portal; Bible Assistant (Premium); study plans with progress and streak; journal with goals and saved articles; daily devotion with audio; article reader Read / Listen / Read & Listen; sharing to WhatsApp, Facebook, X, Telegram, copy link, native share; Open Graph cards for shared links.

## Admin panel (`/admin`)
Roles: `admin` (everything) and `editor` (content only). Dashboard (users, MRR, revenue, churn, conversion, users by country), Users (search, filters, premium grant/revoke, suspend, roles), Subscriptions, Earnings (by month and country, CSV export), Articles and Study plans (one tab per language), Devotions, Topics, Interface text (every label per language), Languages, Countries & pricing.

## Setup
1. Supabase: run `supabase/migrations/0001_init.sql`, `0002_goals.sql`, `0003_i18n_admin.sql` in order (SQL editor or `supabase db push`).
2. Auth > Providers: enable Email and Google. Auth > URL Configuration: Site URL = production domain; add `https://YOUR_DOMAIN/auth/callback` and `http://localhost:3000/auth/callback` as redirect URLs.
3. Copy `.env.example` to `.env.local` and fill it in. `SUPABASE_SERVICE_ROLE_KEY` is server-only.
4. `npm install && npm run dev`.
5. Stripe webhook: `https://YOUR_DOMAIN/api/stripe/webhook` with events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `charge.refunded`. Enable the Customer Portal in Stripe settings.
6. First admin: create your account in the app, then run `update public.profiles set role = 'admin' where email = 'YOUR_EMAIL';`.
7. Deploy: push to GitHub, import in Vercel, add the variables from `.env.example`, set `NEXT_PUBLIC_SITE_URL` to the production URL.

## Notes
- Prices are created inline in Stripe from the `prices` table, so use currencies Stripe supports. Countries without their own price use the default price (`*`).
- Content exists per language. A visitor only sees content published in their language; add each translation in the admin.
- Earnings are shown per currency, without conversion.
