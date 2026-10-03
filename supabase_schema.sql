-- ========================================================
-- AS Realty - Supabase Database Schema & Setup Script
-- Project ID: rmkalviluxpknpaaviyb
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New query -> Paste & Run
-- ========================================================

-- Enable UUID extension (usually pre-enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------
-- 1. Profiles Table (Syncs with Supabase Auth users)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Function and trigger to auto-create a profile on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------
-- 2. Lead Inquiries Table (Bookings, VIP Visits, Sell Listings)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lead_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  property_name TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS on lead_inquiries
ALTER TABLE public.lead_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous visitors and logged-in users to submit inquiries
CREATE POLICY "Allow public insert for lead inquiries"
  ON public.lead_inquiries FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to view their own submitted inquiries
CREATE POLICY "Allow users to view own inquiries"
  ON public.lead_inquiries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 3. Consultations Table (AI & Property Advisory Logs)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  query_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  interaction_type TEXT DEFAULT 'advisory',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS on consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Allow insert by any user (anon or authenticated)
CREATE POLICY "Allow public insert for consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own consultation history
CREATE POLICY "Allow users to read own consultations"
  ON public.consultations FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- --------------------------------------------------------
-- 4. Voice Sessions Table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  query_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  interaction_type TEXT DEFAULT 'voice_consultation',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS on voice_sessions
ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for voice sessions"
  ON public.voice_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to read own voice sessions"
  ON public.voice_sessions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- --------------------------------------------------------
-- 5. Indexes for fast query performance
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_lead_inquiries_created_at ON public.lead_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_inquiries_user_id ON public.lead_inquiries (user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON public.consultations (user_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_user_id ON public.voice_sessions (user_id);
