-- Gamification tables for Homestead Architect
-- Run this SQL in your Supabase SQL Editor

-- User stats table (stores total XP and level)
CREATE TABLE IF NOT EXISTS public.user_stats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_xp integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- XP events table (audit log of all XP awards)
CREATE TABLE IF NOT EXISTS public.xp_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action text NOT NULL,
    xp integer NOT NULL,
    metadata jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- User achievements table (tracks unlocked achievements)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id text NOT NULL,
    unlocked_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE (user_id, achievement_id)
);

-- User privacy settings table (controls leaderboard visibility)
CREATE TABLE IF NOT EXISTS public.user_privacy_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    show_on_leaderboard boolean DEFAULT true NOT NULL,
    display_name text,
    show_achievements boolean DEFAULT true NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_stats
CREATE POLICY "Users can view their own stats"
    ON public.user_stats FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
    ON public.user_stats FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
    ON public.user_stats FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to view other users' stats for leaderboard (only if they allow it)
CREATE POLICY "Users can view leaderboard stats"
    ON public.user_stats FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_privacy_settings ps
            WHERE ps.user_id = user_stats.user_id
            AND ps.show_on_leaderboard = true
        )
    );

-- RLS Policies for xp_events
CREATE POLICY "Users can view their own xp events"
    ON public.xp_events FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own xp events"
    ON public.xp_events FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
    ON public.user_achievements FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
    ON public.user_achievements FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_privacy_settings
CREATE POLICY "Users can view their own privacy settings"
    ON public.user_privacy_settings FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own privacy settings"
    ON public.user_privacy_settings FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings"
    ON public.user_privacy_settings FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to view privacy settings for leaderboard display name
CREATE POLICY "Users can view public privacy settings"
    ON public.user_privacy_settings FOR SELECT
    TO authenticated
    USING (show_on_leaderboard = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_xp ON public.user_stats(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON public.xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON public.xp_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_privacy_settings_user_id ON public.user_privacy_settings(user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON public.user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_privacy_settings_updated_at
    BEFORE UPDATE ON public.user_privacy_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
