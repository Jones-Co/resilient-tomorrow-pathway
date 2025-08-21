-- Drop existing problematic RLS policies
DROP POLICY IF EXISTS "Users can view their own plans" ON public.user_plans;
DROP POLICY IF EXISTS "Users can create their own plans" ON public.user_plans;
DROP POLICY IF EXISTS "Users can update their own plans" ON public.user_plans;

-- Create new, correct RLS policies that don't access auth.users directly
CREATE POLICY "Users can view their own plans" 
ON public.user_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans" 
ON public.user_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans" 
ON public.user_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans" 
ON public.user_plans 
FOR DELETE 
USING (auth.uid() = user_id);