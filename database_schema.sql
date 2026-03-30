-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS "public"."order_items";
DROP TABLE IF EXISTS "public"."orders";
DROP TABLE IF EXISTS "public"."carts";
DROP TABLE IF EXISTS "public"."products";
DROP TABLE IF EXISTS "public"."users";

-- Create Enum for Roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'management', 'security', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Users Table
-- ==========================================
CREATE TABLE "public"."users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "role" user_role NOT NULL DEFAULT 'customer',
    "password_hash" TEXT, -- Added for custom auth
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for Users
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- Helper for non-recursive admin checks
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Users can view their own profile" 
ON "public"."users" FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view and manage all users" 
ON "public"."users" FOR ALL 
USING (is_admin());


-- ==========================================
-- 2. Products Table
-- ==========================================
CREATE TABLE "public"."products" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "barcode" TEXT NOT NULL UNIQUE,
    "price" NUMERIC(10, 2) NOT NULL,
    "weight" NUMERIC(10, 2) NOT NULL, -- in kilograms
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for Products
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone" 
ON "public"."products" FOR SELECT 
USING (true);

CREATE POLICY "Management and Admin can insert products" 
ON "public"."products" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."users" WHERE id = auth.uid() AND role IN ('management', 'admin')
  )
);

CREATE POLICY "Management and Admin can update products" 
ON "public"."products" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "public"."users" WHERE id = auth.uid() AND role IN ('management', 'admin')
  )
);


-- ==========================================
-- 3. Carts Table (Optional per-user state)
-- ==========================================
CREATE TABLE "public"."carts" (
    "user_id" UUID PRIMARY KEY REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "items" JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- RLS Policies for Carts
ALTER TABLE "public"."carts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart" 
ON "public"."carts" FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own cart" 
ON "public"."carts" FOR ALL 
USING (auth.uid() = user_id);


-- ==========================================
-- 4. Orders Table
-- ==========================================
CREATE TABLE "public"."orders" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL REFERENCES "public"."users"("id"),
    "total_price" NUMERIC(10, 2) NOT NULL,
    "total_weight" NUMERIC(10, 2) NOT NULL,
    "qr_code_value" TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    "status" TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'verified')),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for Orders
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" 
ON "public"."orders" FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Security can view all orders" 
ON "public"."orders" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "public"."users" WHERE id = auth.uid() AND role IN ('security', 'admin')
  )
);

CREATE POLICY "Security can update order status" 
ON "public"."orders" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "public"."users" WHERE id = auth.uid() AND role IN ('security', 'admin')
  )
);

CREATE POLICY "Users can insert orders" 
ON "public"."orders" FOR INSERT 
WITH CHECK (auth.uid() = user_id);


-- ==========================================
-- 5. Order Items Table
-- ==========================================
CREATE TABLE "public"."order_items" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "order_id" UUID NOT NULL REFERENCES "public"."orders"("id") ON DELETE CASCADE,
    "product_id" UUID NOT NULL REFERENCES "public"."products"("id"),
    "quantity" INTEGER NOT NULL,
    "price_at_purchase" NUMERIC(10, 2) NOT NULL
);

-- RLS Policies for Order Items
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items" 
ON "public"."order_items" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "public"."orders" WHERE "orders".id = order_items.order_id AND "orders".user_id = auth.uid()
  )
);

CREATE POLICY "Security can view all order items" 
ON "public"."order_items" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "public"."users" WHERE id = auth.uid() AND role IN ('security', 'admin')
  )
);

CREATE POLICY "Users can insert order items" 
ON "public"."order_items" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."orders" WHERE "orders".id = order_id AND "orders".user_id = auth.uid()
  )
);


-- ==========================================
-- 6. Storage Bucket for Products
-- ==========================================
-- Note: Replace with actual Supabase Storage queries if running via SQL Editor.
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;

-- Enable Realtime for Products
ALTER PUBLICATION supabase_realtime ADD TABLE "public"."products";
