# LOUDEFOOT — eFootball Marketplace

Premium marketplace for buying, selling, and exchanging eFootball accounts, plus coin loading services. Built for Nigeria with ₦ NGN pricing.

**Independent platform — not affiliated with Konami or eFootball.**

---

## Status: Stages 1–6 complete (codebase)

| Stage | Scope |
|-------|--------|
| 1 | Design system, homepage, navigation |
| 2 | Auth structure, DB schema, browse + filters, account detail |
| 3 | Exchange Hub, proposals, messaging |
| 4 | Coin packages, checkout, orders, Paystack/Flutterwave APIs, OPay/PalmPay methods |
| 5 | Admin dashboard (listings, orders, packages, users, reports) |
| 6 | Testing checklist, deploy guide, sitemap, robots, 404 |

Demo data powers the UI until Supabase and payment keys are connected. See **TESTING.md** and **DEPLOY.md**.

---

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4  
- **Auth / DB:** Supabase (Auth + PostgreSQL + Storage)  
- **Payments:** Paystack or Flutterwave (OPay / PalmPay via bank transfer & USSD channels)  
- **Host:** Vercel recommended  

---

## Quick start

```bash
cd loudefoot
npm install
cp .env.example .env.local
# Add keys when ready — app runs in demo mode without them
npm run dev
```

Open http://localhost:3000  
Admin: http://localhost:3000/admin  

---

## Environment

See `.env.example`:

- Supabase URL + anon + service role  
- `NEXT_PUBLIC_APP_URL`  
- Paystack and/or Flutterwave public + secret keys  

---

## Main routes

| Area | Paths |
|------|--------|
| Public | `/` `/accounts` `/accounts/[id]` `/exchange` `/coins` `/checkout` |
| Auth | `/login` `/register` |
| User | `/messages` `/orders` |
| Admin | `/admin` `/admin/listings` `/admin/orders` `/admin/packages` `/admin/users` `/admin/reports` |
| API | `/api/payments/initialize` `/api/payments/verify` |

---

## Database

Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor.  
Includes profiles, listings, images, favourites, exchanges, coin packages, orders, messages, reports, RLS, and coin package seeds.

---

## Docs

- **TESTING.md** — full QA checklist before launch  
- **DEPLOY.md** — Vercel + Supabase + payments go-live steps  

---

## Important

- Account transfers and third-party coin services may be restricted by the game publisher.  
- Never collect Konami passwords or OTP codes on public forms.  
- Verify payments only on the server.  
- Admin UI must be protected by `role = admin` in production.  

---

## License

Private project — All rights reserved.
