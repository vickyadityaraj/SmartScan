-- 1. Aggressively drop old recursive policies that cause the loop
DROP POLICY IF EXISTS "Users can view their own profile" ON "public"."users";
DROP POLICY IF EXISTS "Admins can view and manage all users" ON "public"."users";

-- 2. Fully Disable RLS on all tables so Next.js can manage access
ALTER TABLE "public"."users" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."products" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."carts" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."orders" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" DISABLE ROW LEVEL SECURITY;

-- 3. Detach from Supabase's built-in Auth system
-- Drop the foreign key constraint to auth.users if it exists
ALTER TABLE "public"."users" DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 4. Change ID to be a simple UUID with a default
ALTER TABLE "public"."users" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "id" SET DATA TYPE UUID;
ALTER TABLE "public"."users" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();

-- 5. Add password_hash column for manual login
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;

-- 6. Drop the trigger that relies on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
