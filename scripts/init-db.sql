-- Initialize local development database
-- This script runs when PostgreSQL container starts for the first time

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic schema structure for offline development
-- Note: This is a simplified version for local development only
-- Full schema should be synced from Supabase

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    size_acres DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Animals Table
CREATE TABLE IF NOT EXISTS public.animals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    breed VARCHAR(100),
    birth_date DATE,
    weight_lbs DECIMAL(8, 2),
    gender VARCHAR(20),
    breeding_status VARCHAR(50),
    notes TEXT,
    photo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic Indexes
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON public.animals(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_property_id ON public.tasks(property_id);

-- Insert sample data for development (optional)
INSERT INTO public.user_profiles (email, created_at) VALUES 
('dev@homestead.local', NOW()) 
ON CONFLICT (email) DO NOTHING;

-- Get the sample user ID for use in other inserts
DO $$
DECLARE
    dev_user UUID;
BEGIN
    SELECT id INTO dev_user FROM public.user_profiles WHERE email = 'dev@homestead.local';
    
    -- Sample properties
    INSERT INTO public.properties (user_id, name, location, size_acres, created_at) VALUES 
    (dev_user, 'Main Homestead', 'Rural Valley', 5.5, NOW()),
    (dev_user, 'Back Garden', 'Urban Setting', 0.25, NOW())
    ON CONFLICT DO NOTHING;
    
    -- Sample animals
    INSERT INTO public.animals (user_id, name, type, breed, birth_date, weight_lbs, gender, created_at) VALUES 
    (dev_user, 'Bessie', 'Cow', 'Jersey', '2022-03-15', 800, 'female', NOW()),
    (dev_user, 'Clucky', 'Chicken', 'Rhode Island Red', '2023-05-20', 4.5, 'female', NOW()),
    (dev_user, 'Billy', 'Goat', 'Nubian', '2022-08-10', 120, 'male', NOW())
    ON CONFLICT DO NOTHING;
    
    -- Sample tasks
    INSERT INTO public.tasks (user_id, title, description, category, status, due_date, created_at) VALUES 
    (dev_user, 'Check fence lines', 'Walk perimeter and check for any damage', 'Maintenance', 'pending', NOW() + INTERVAL '7 days', NOW()),
    (dev_user, 'Order winter feed', 'Calculate feed needs for winter months', 'Planning', 'pending', NOW() + INTERVAL '3 days', NOW()),
    (dev_user, 'Clean chicken coop', 'Deep clean and replace bedding', 'Animal Care', 'in_progress', NOW() + INTERVAL '1 day', NOW())
    ON CONFLICT DO NOTHING;
END $$;