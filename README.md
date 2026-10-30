# Biblesyn
Understand the Word. Strengthen Your Spirit.
Stack: Next.js 14 (App Router, TypeScript), Tailwind, Supabase (Postgres + Auth), Stripe, Anthropic (Bible Assistant), OpenAI TTS (audio). Design: white and black with a touch of green; Source Serif 4 (reading and titles) + Inter (interface); lucide icons; brand icons from react-icons.

## Features
Guest browsing; email/password and Google sign-in; content gated by database rules (guests read excerpts, members read free articles and day 1 of plans, Premium reads everything); Premium paywall with price by country from the `prices` table; Stripe subscription + webhook; Bible Assistant (Premium); study plans with progress and streak; spiritual journal with goals and saved articles; daily devotion with audio; article reader with Read / Listen / Read & Listen; sharing to WhatsApp, Facebook, X, Telegram, copy link and the phone's native share sheet; Open Graph cards so shared links show a preview.

## Not built yet
Translations of the interface and content (database already has `locale`), admin/CMS for articles, Bible text reader.

## Setup
1. Supabase: run `supabase/migrations/0001_init.sql`, then `0002_goals.sql` (SQL editor), or use the project already created.
2. Auth > Providers: enable Email and Google. Auth > URL Configuration: Site URL = your domain; add `https://YOUR_DOMAIN/auth/callback` and `http://localhost:3000/auth/callback` as redirect URLs.
3. Copy `.env.example` to `.env.local` and fill it in (the service role key stays server-only).
4. `npm install && npm run dev`.
5. Stripe: webhook to `https://YOUR_DOMAIN/api/stripe/webhook` for `checkout.session.completed` and `customer.subscription.deleted`; copy the signing secret to `STRIPE_WEBHOOK_SECRET`. Prices are created inline from the `prices` table.
6. Deploy: push to GitHub, import in Vercel, add the variables from `.env.example`, set `NEXT_PUBLIC_SITE_URL` to the production URL.

## Content
Add rows to `articles` + `article_bodies` (`published = true`; `is_free` for free reads). In the body, a short line without a final period becomes a section label. Add days to `study_plan_days` and a row to `devotions` per date.
