# Biblesyn
**Understand the Word. Strengthen Your Spirit.**

Biblesyn is a Christian spiritual-growth platform built with Next.js 14, TypeScript, Tailwind CSS, Supabase, Stripe, Anthropic and OpenAI text-to-speech.

## Implemented application features
- Guest browsing and Supabase email/password + Google authentication
- Daily devotion feed backed by published database entries
- Spiritual article library with member and Premium access rules
- Study plans with per-user progress tracking
- Private spiritual journal
- Premium Bible assistant powered by Anthropic
- Article audio generation through OpenAI TTS
- Stripe monthly subscription checkout and webhook

## Subscription
The Premium subscription is USD $1 per month. Stripe checkout creates the recurring subscription.

## Setup
1. Create a Supabase project and run the SQL files in `supabase/migrations/` in numerical order. Migration `0002` also removes demo rows if the original scaffold migration was already applied.
2. Enable Email and Google providers in Supabase Auth. Configure the site URL and `/auth/callback` redirect URLs.
3. Copy `.env.example` to `.env.local` and fill in the Supabase, Stripe, Anthropic and OpenAI credentials. Never expose the service-role key in browser code.
4. Run `npm install`, then `npm run dev`.
5. Configure a Stripe webhook at `/api/stripe/webhook` for `checkout.session.completed` and `customer.subscription.deleted`.
6. Import the repository into Vercel and configure the same environment variables for deployment.

## Editorial content
The database migration deliberately inserts no sample articles, devotions, study plans, or test customers. Publish reviewed material by inserting records into `articles` and `article_bodies`, `study_plans` and `study_plan_days`, and `devotions`. Unpublished content stays hidden from visitors.

## Not yet implemented
A content-management dashboard, full Portuguese/French/Spanish interface translations, analytics dashboard, and a complete Bible text reader are not part of this initial codebase.