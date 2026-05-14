-- Chreol Empire — Supabase Schema

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Utilisateur',
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  total_orders INT DEFAULT 0
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,              -- Firebase UID
  user_email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount_fcfa INT NOT NULL,
  amount_label TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('orange_money','mtn_momo','crypto','paypal')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','delivered','failed')),
  code TEXT,
  moneroo_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see their own data
CREATE POLICY "Users see own orders" ON orders
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users insert own orders" ON orders
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Admin functions use service role key — they bypass RLS automatically
-- Webhook trigger: send email when status changes (paid / delivered / failed)
-- Configure in Supabase Dashboard → Database → Webhooks
-- Event: UPDATE on orders table
-- URL: https://<project>.supabase.co/functions/v1/send-order-email

-- Realtime: enable for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
