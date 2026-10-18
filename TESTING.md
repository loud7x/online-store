# LOUDEFOOT — Testing Checklist (Stage 6)

Run through these before calling the product production-ready.  
Mark each item after verifying on your machine with `npm run dev` (and later on staging).

## Environment

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts on http://localhost:3000
- [ ] `.env.local` copied from `.env.example` (even if keys are empty for demo)
- [ ] No secret keys committed to git

## Stage 1 — Design & navigation

- [ ] Homepage loads (hero, featured, coins, FAQ, footer)
- [ ] Header links work: Accounts, Exchange, Coins
- [ ] Mobile menu opens/closes
- [ ] Layout is usable on a phone-width viewport (~390px)
- [ ] Demo banner is visible (sample data only)

## Stage 2 — Auth & marketplace

- [ ] `/accounts` lists accounts and filters (platform, price, strength, verified, sort)
- [ ] Empty filter state shows “no matches” + clear action
- [ ] `/accounts/[id]` shows detail, stats, seller, buy/favourite UI
- [ ] `/login` and `/register` forms validate required fields
- [ ] Without Supabase keys, forms show configuration message (not a crash)
- [ ] With Supabase: register → email verify → login works
- [ ] RLS: user cannot read another user’s private orders

## Stage 3 — Exchange & messaging

- [ ] `/exchange` lists offers; `/exchange/new` submits form (demo success)
- [ ] `/exchange/[id]` shows propose UI and comparison placeholder
- [ ] `/messages` inbox shows conversations + unread counts
- [ ] `/messages/[id]` sends a message (client-side demo)
- [ ] Offer accept/reject buttons visible on offer messages

## Stage 4 — Coins & payments

- [ ] `/coins` and `/coins/[id]` load; Order Now → checkout
- [ ] Checkout requires platform, email, terms checkbox
- [ ] Payment methods include OPay, PalmPay, bank transfer, USSD, card
- [ ] Demo checkout creates an order reference without live keys
- [ ] With Paystack/Flutterwave keys: initialize returns `authorization_url`
- [ ] `POST /api/payments/verify` rejects missing reference
- [ ] `/orders` lookup by reference; `/orders/[id]` status pipeline

## Stage 5 — Admin

- [ ] `/admin` overview stats and activity list
- [ ] Listings: approve / reject updates status in UI
- [ ] Orders: advance status, hold, cancel, refund
- [ ] Packages: edit price, activate/deactivate
- [ ] Users: verify / suspend
- [ ] Reports: review / resolve / dismiss
- [ ] **Security:** before go-live, block `/admin` unless `profiles.role = admin` (middleware + RLS)

## Cross-cutting

- [ ] Custom 404 page
- [ ] `robots.txt` disallows `/admin`, `/api/`, private areas
- [ ] `sitemap.ts` generates public URLs
- [ ] No Konami passwords requested on public forms
- [ ] Disclaimer: not affiliated with Konami
- [ ] Currency displays as ₦ / NGN

## Production gate

- [ ] Supabase project live + migration `001_initial_schema.sql` applied
- [ ] Storage bucket `listing-images` created
- [ ] Payment provider live keys (not test) if accepting real money
- [ ] Webhook or verify flow updates order status only after server verification
- [ ] Admin routes protected
- [ ] Privacy / Terms / Refund pages reviewed by you
