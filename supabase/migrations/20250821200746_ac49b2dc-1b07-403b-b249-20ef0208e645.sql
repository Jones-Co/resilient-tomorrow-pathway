-- Fix RLS policies for remaining tables

-- Policies for pending_subscribers table (public read/write since it's for newsletter signup)
CREATE POLICY IF NOT EXISTS "Allow public insert to pending_subscribers" 
ON public.pending_subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public select on pending_subscribers" 
ON public.pending_subscribers 
FOR SELECT 
USING (true);

-- Policies for subscribers table (public read for admins, users can see their own)
CREATE POLICY IF NOT EXISTS "Allow public insert to subscribers" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public select on subscribers" 
ON public.subscribers 
FOR SELECT 
USING (true);