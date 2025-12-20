-- Run this SQL in your Supabase Cloud dashboard SQL Editor

-- Create infrastructure table
CREATE TABLE IF NOT EXISTS public.infrastructure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_cost DECIMAL(10, 2) DEFAULT 0,
  planned_completion TIMESTAMPTZ,
  materials_needed TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.infrastructure ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own infrastructure projects"
  ON public.infrastructure
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own infrastructure projects"
  ON public.infrastructure
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own infrastructure projects"
  ON public.infrastructure
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own infrastructure projects"
  ON public.infrastructure
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_infrastructure_user_id ON public.infrastructure(user_id);
CREATE INDEX idx_infrastructure_status ON public.infrastructure(status);
CREATE INDEX idx_infrastructure_type ON public.infrastructure(type);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_infrastructure_updated_at
  BEFORE UPDATE ON public.infrastructure
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
