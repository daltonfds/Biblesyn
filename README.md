# Biblesyn
Understand the Word. Strengthen Your Spirit.

A Christian spiritual-growth platform built with Next.js 14, TypeScript, Tailwind CSS, Supabase, Stripe, Anthropic and OpenAI text-to-speech.

## Included
- Guest browsing, email/password and Google authentication
- Daily devotion and spiritual content library
- Bible study plans with progress tracking
- Personal spiritual journal
- Premium content gating with Supabase Row Level Security
- Country-based monthly pricing and Stripe subscription checkout/webhook
- Premium Bible assistant powered by Anthropic
- Article audio generation with OpenAI TTS

## Setup
1. Create a Supabase project and run `supabase/migrations/0001_init.sql` in the SQL editor.
2. Enable Email and Google providers in Supabase Auth. Configure the site URL and `/auth/callback` redirect URLs.
3. Copy `.env.example` to `.env.local` and fill in the Supabase, Stripe, Anthropic and OpenAI values. Never expose the service-role key in browser code.
4. Run `npm install`, then `npm run dev`.
5. Configure a Stripe webhook at `/api/stripe/webhook` for `checkout.session.completed` and `customer.subscription.deleted`.
6. Import the repository into Vercel and configure the same environment variables for deployment.

## Current scope
The initial implementation includes English UI with locale-ready database fields for English, Portuguese, French and Spanish. A full multilingual content workflow, admin CMS, growth analytics, saved-article interface and Bible text reader remain future work.

## Content management
Add articles to `articles` and their full text to `article_bodies`. Add study content to `study_plan_days` and daily readings to `devotions`.