# LOUDEFOOT — Deploy Guide (Vercel)

## 1. Prerequisites

1. GitHub/GitLab repo with this project
2. Supabase project (Auth + Postgres + Storage)
3. Paystack and/or Flutterwave account (Nigeria)
4. Domain (optional)

## 2. Database

1. Supabase → SQL Editor
2. Run entire file: `supabase/migrations/001_initial_schema.sql`
3. Storage → New bucket: `listing-images` (public, images only, max ~5MB)

## 3. Environment variables (Vercel)

Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_APP_URL=https://your-domain.com

NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=

# OR
# NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=
# FLUTTERWAVE_SECRET_KEY=
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` or payment secret keys to the client.

## 4. Deploy

```bash
# Local check
npm run build

# Push to Git, import on vercel.com
# Framework: Next.js (auto-detected)
# Build command: next build
# Output: default
```

Or CLI:

```bash
npx vercel
npx vercel --prod
```

## 5. After deploy

1. Set `NEXT_PUBLIC_APP_URL` to the production URL
2. In Paystack/Flutterwave, set callback URL to `https://your-domain.com/orders`
3. Create first admin: sign up normally, then in Supabase SQL:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';
```

4. Protect admin routes in middleware (check `role === 'admin'`) before public launch
5. Walk through `TESTING.md` on production

## 6. Optional

- Custom domain in Vercel
- Supabase Auth redirect URLs → add production domain
- Enable Paystack webhooks to `https://your-domain.com/api/payments/verify` (extend route for webhook signature if needed)

## Security reminders

- Verify every payment on the server
- Do not store card numbers, CVV, or Konami credentials
- RLS must stay enabled on all tables
- Admin UI is not security by itself — enforce role on the server
