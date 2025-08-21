-- Add policy to allow service role (N8N) to write to user_plans
CREATE POLICY "Service role can insert user plans" 
ON public.user_plans 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update user plans" 
ON public.user_plans 
FOR UPDATE 
TO service_role
USING (true);

CREATE POLICY "Service role can select user plans" 
ON public.user_plans 
FOR SELECT 
TO service_role
USING (true);