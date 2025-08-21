-- Enable RLS and create policies for user_plans table
-- First drop the public access policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON public.user_plans;
DROP POLICY IF EXISTS "Allow public insert access" ON public.user_plans;
DROP POLICY IF EXISTS "Allow public update access" ON public.user_plans;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view their own plans" 
ON public.user_plans 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create their own plans" 
ON public.user_plans 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own plans" 
ON public.user_plans 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Add user_id column to link plans to auth.users
ALTER TABLE public.user_plans 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON public.user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_email ON public.user_plans(email);