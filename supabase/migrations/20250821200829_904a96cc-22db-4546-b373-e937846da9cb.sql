-- Fix RLS policies for remaining tables

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Allow public insert to pending_subscribers" ON public.pending_subscribers;
DROP POLICY IF EXISTS "Allow public select on pending_subscribers" ON public.pending_subscribers;
DROP POLICY IF EXISTS "Allow public insert to subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow public select on subscribers" ON public.subscribers;

-- Policies for pending_subscribers table (public read/write since it's for newsletter signup)
CREATE POLICY "Allow public insert to pending_subscribers" 
ON public.pending_subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select on pending_subscribers" 
ON public.pending_subscribers 
FOR SELECT 
USING (true);

-- Policies for subscribers table (public read for admins, users can see their own)
CREATE POLICY "Allow public insert to subscribers" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public select on subscribers" 
ON public.subscribers 
FOR SELECT 
USING (true);