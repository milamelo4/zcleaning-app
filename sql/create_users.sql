-- Create users table for ZCleaning App
-- Only store admin/supervisor accounts (Google OAuth)

CREATE TABLE IF NOT EXISTS public.users (
  account_id SERIAL PRIMARY KEY,
  account_firstname VARCHAR(50) NOT NULL,
  account_lastname VARCHAR(50) NOT NULL,
  account_email VARCHAR(100) UNIQUE,
  account_type TEXT CHECK (account_type IN ('Employee', 'Admin'))
);
