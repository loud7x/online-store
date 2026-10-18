-- LOUDEFOOT Initial Schema
-- Run this in Supabase SQL Editor or via CLI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_sales INTEGER NOT NULL DEFAULT 0,
  total_purchases INTEGER NOT NULL DEFAULT 0,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_is_verified ON public.profiles(is_verified);

-- ============================================================
-- ACCOUNT LISTINGS
-- ============================================================
CREATE TABLE public.account_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  platform TEXT NOT NULL CHECK (platform IN ('PlayStation', 'Xbox', 'PC', 'Android', 'iOS')),
  team_strength INTEGER NOT NULL CHECK (team_strength >= 0),
  overall_rating INTEGER NOT NULL DEFAULT 0 CHECK (overall_rating >= 0 AND overall_rating <= 99),
  manager TEXT NOT NULL DEFAULT '',
  coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
  player_count INTEGER NOT NULL DEFAULT 0,
  featured_players TEXT[] NOT NULL DEFAULT '{}',
  epic_players INTEGER NOT NULL DEFAULT 0,
  big_time_players INTEGER NOT NULL DEFAULT 0,
  show_time_players INTEGER NOT NULL DEFAULT 0,
  legendary_players INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Under Review'
    CHECK (status IN ('Available', 'Reserved', 'Sold', 'Under Review', 'Rejected')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_best_value BOOLEAN NOT NULL DEFAULT FALSE,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_seller ON public.account_listings(seller_id);
CREATE INDEX idx_listings_status ON public.account_listings(status);
CREATE INDEX idx_listings_platform ON public.account_listings(platform);
CREATE INDEX idx_listings_price ON public.account_listings(price);
CREATE INDEX idx_listings_team_strength ON public.account_listings(team_strength);
CREATE INDEX idx_listings_created ON public.account_listings(created_at DESC);
CREATE INDEX idx_listings_featured ON public.account_listings(is_featured) WHERE is_featured = TRUE;

-- ============================================================
-- LISTING IMAGES
-- ============================================================
CREATE TABLE public.listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.account_listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_images_listing ON public.listing_images(listing_id);

-- ============================================================
-- FAVOURITES
-- ============================================================
CREATE TABLE public.favourites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.account_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

CREATE INDEX idx_favourites_user ON public.favourites(user_id);

-- ============================================================
-- EXCHANGE OFFERS
-- ============================================================
CREATE TABLE public.exchange_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('PlayStation', 'Xbox', 'PC', 'Android', 'iOS')),
  team_strength INTEGER NOT NULL,
  overall_rating INTEGER NOT NULL DEFAULT 0,
  estimated_value INTEGER NOT NULL,
  preferred TEXT NOT NULL DEFAULT '',
  exchange_type TEXT NOT NULL DEFAULT 'equal'
    CHECK (exchange_type IN ('equal', 'upgrade', 'downgrade')),
  additional_cash INTEGER DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'negotiating', 'accepted', 'completed', 'withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exchange_seller ON public.exchange_offers(seller_id);
CREATE INDEX idx_exchange_status ON public.exchange_offers(status);

-- ============================================================
-- COIN PACKAGES
-- ============================================================
CREATE TABLE public.coin_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  coins INTEGER NOT NULL CHECK (coins > 0),
  price INTEGER NOT NULL CHECK (price > 0),
  processing_time TEXT NOT NULL DEFAULT '15–60 mins',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.coin_packages(id),
  listing_id UUID REFERENCES public.account_listings(id),
  order_type TEXT NOT NULL CHECK (order_type IN ('coin_loading', 'account_purchase')),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN (
      'pending_payment', 'payment_confirmed', 'processing',
      'completed', 'on_hold', 'cancelled', 'refunded'
    )),
  reference TEXT UNIQUE NOT NULL,
  platform TEXT,
  notes TEXT,
  payment_provider TEXT,
  payment_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_reference ON public.orders(reference);

-- ============================================================
-- CONVERSATIONS & MESSAGES (basic for Stage 3 readiness)
-- ============================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.account_listings(id) ON DELETE SET NULL,
  exchange_id UUID REFERENCES public.exchange_offers(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);

-- ============================================================
-- REPORTS
-- ============================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.account_listings(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);

-- ============================================================
-- ACTIVITY LOGS (admin)
-- ============================================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.account_listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER exchange_updated_at
  BEFORE UPDATE ON public.exchange_offers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER packages_updated_at
  BEFORE UPDATE ON public.coin_packages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Listings
CREATE POLICY "Available listings are public"
  ON public.account_listings FOR SELECT
  USING (status = 'Available' OR seller_id = auth.uid() OR
         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Sellers can insert own listings"
  ON public.account_listings FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own listings"
  ON public.account_listings FOR UPDATE
  USING (auth.uid() = seller_id OR
         EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Images
CREATE POLICY "Listing images are public"
  ON public.listing_images FOR SELECT USING (true);

CREATE POLICY "Sellers can manage own listing images"
  ON public.listing_images FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.account_listings
    WHERE id = listing_id AND seller_id = auth.uid()
  ));

-- Favourites
CREATE POLICY "Users manage own favourites"
  ON public.favourites FOR ALL USING (auth.uid() = user_id);

-- Coin packages (public read)
CREATE POLICY "Coin packages are public"
  ON public.coin_packages FOR SELECT USING (true);

CREATE POLICY "Admins manage coin packages"
  ON public.coin_packages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Orders
CREATE POLICY "Users see own orders"
  ON public.orders FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users create own orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Exchange offers
CREATE POLICY "Open exchange offers are public"
  ON public.exchange_offers FOR SELECT
  USING (status IN ('open', 'negotiating') OR seller_id = auth.uid());

CREATE POLICY "Users create own exchange offers"
  ON public.exchange_offers FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users update own exchange offers"
  ON public.exchange_offers FOR UPDATE USING (auth.uid() = seller_id);

-- Notifications
CREATE POLICY "Users see own notifications"
  ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Conversations & Messages
CREATE POLICY "Participants see conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Participants see messages"
  ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  ));

CREATE POLICY "Participants send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  ));

-- ============================================================
-- SEED COIN PACKAGES
-- ============================================================
INSERT INTO public.coin_packages (name, coins, price, processing_time, is_available, is_popular, sort_order) VALUES
  ('Starter Pack', 100000, 8500, '15–30 mins', true, false, 1),
  ('Standard Pack', 500000, 38000, '15–45 mins', true, true, 2),
  ('Pro Pack', 1000000, 72000, '30–60 mins', true, false, 3),
  ('Elite Pack', 2500000, 165000, '1–2 hours', true, false, 4);

-- Storage bucket note (create in Supabase Dashboard):
-- Bucket name: listing-images
-- Public: true
-- Allowed MIME: image/jpeg, image/png, image/webp
-- Max size: 5MB
