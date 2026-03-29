-- 1. First, make sure you've run the updated database_schema.sql to get the `search_path` fix

-- 2. Run this block to create a powerful Admin user without using the dashboard.
-- Email: admin@smartscan.com
-- Password: password
INSERT INTO auth.users (
  id, 
  instance_id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  raw_user_meta_data, 
  created_at, 
  updated_at,
  role,
  aud
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@smartscan.com',
  crypt('password', gen_salt('bf')),
  now(),
  '{"name":"System Admin","role":"admin"}',
  now(),
  now(),
  'authenticated',
  'authenticated'
);
