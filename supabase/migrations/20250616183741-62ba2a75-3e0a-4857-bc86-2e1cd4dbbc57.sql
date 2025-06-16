
-- Enable RLS on chatbot_configs table (if not already enabled)
ALTER TABLE public.chatbot_configs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own chatbot configs" ON public.chatbot_configs;
DROP POLICY IF EXISTS "Users can create their own chatbot configs" ON public.chatbot_configs;
DROP POLICY IF EXISTS "Users can update their own chatbot configs" ON public.chatbot_configs;
DROP POLICY IF EXISTS "Users can delete their own chatbot configs" ON public.chatbot_configs;

-- Create policy for SELECT (viewing configs)
CREATE POLICY "Users can view their own chatbot configs" 
  ON public.chatbot_configs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for INSERT (creating configs)
CREATE POLICY "Users can create their own chatbot configs" 
  ON public.chatbot_configs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy for UPDATE (updating configs)
CREATE POLICY "Users can update their own chatbot configs" 
  ON public.chatbot_configs 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for DELETE (deleting configs)
CREATE POLICY "Users can delete their own chatbot configs" 
  ON public.chatbot_configs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create service role policy for system operations (like n8n)
CREATE POLICY "Service role can manage all chatbot configs" 
  ON public.chatbot_configs 
  FOR ALL 
  USING (true)
  WITH CHECK (true);
