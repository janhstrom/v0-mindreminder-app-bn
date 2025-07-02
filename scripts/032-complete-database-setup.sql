-- Complete database setup for MindReMinder
-- This script creates all necessary tables, policies, and functions

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS shared_reminders CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS micro_actions CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create micro_actions table
CREATE TABLE micro_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotes table (global quotes, not user-specific)
CREATE TABLE quotes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    text TEXT NOT NULL,
    author TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friends table
CREATE TABLE friends (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- Create shared_reminders table
CREATE TABLE shared_reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE NOT NULL,
    shared_with_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reminder_id, shared_with_user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_reminders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can create own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can update own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can delete own reminders" ON reminders;
DROP POLICY IF EXISTS "Users can view own micro_actions" ON micro_actions;
DROP POLICY IF EXISTS "Users can create own micro_actions" ON micro_actions;
DROP POLICY IF EXISTS "Users can update own micro_actions" ON micro_actions;
DROP POLICY IF EXISTS "Users can delete own micro_actions" ON micro_actions;
DROP POLICY IF EXISTS "Anyone can view quotes" ON quotes;
DROP POLICY IF EXISTS "Users can view own friends" ON friends;
DROP POLICY IF EXISTS "Users can create own friends" ON friends;
DROP POLICY IF EXISTS "Users can update own friends" ON friends;
DROP POLICY IF EXISTS "Users can delete own friends" ON friends;
DROP POLICY IF EXISTS "Users can view shared reminders" ON shared_reminders;
DROP POLICY IF EXISTS "Users can create shared reminders" ON shared_reminders;
DROP POLICY IF EXISTS "Users can delete shared reminders" ON shared_reminders;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Reminders policies
CREATE POLICY "Users can view own reminders" ON reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders" ON reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON reminders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON reminders
    FOR DELETE USING (auth.uid() = user_id);

-- Micro actions policies
CREATE POLICY "Users can view own micro_actions" ON micro_actions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own micro_actions" ON micro_actions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own micro_actions" ON micro_actions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own micro_actions" ON micro_actions
    FOR DELETE USING (auth.uid() = user_id);

-- Quotes policies (public read access)
CREATE POLICY "Anyone can view quotes" ON quotes
    FOR SELECT USING (true);

-- Friends policies
CREATE POLICY "Users can view own friends" ON friends
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create own friends" ON friends
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friends" ON friends
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own friends" ON friends
    FOR DELETE USING (auth.uid() = user_id);

-- Shared reminders policies
CREATE POLICY "Users can view shared reminders" ON shared_reminders
    FOR SELECT USING (
        auth.uid() = shared_with_user_id OR 
        auth.uid() IN (SELECT user_id FROM reminders WHERE id = reminder_id)
    );

CREATE POLICY "Users can create shared reminders" ON shared_reminders
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT user_id FROM reminders WHERE id = reminder_id)
    );

CREATE POLICY "Users can delete shared reminders" ON shared_reminders
    FOR DELETE USING (
        auth.uid() IN (SELECT user_id FROM reminders WHERE id = reminder_id)
    );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample quotes
INSERT INTO quotes (text, author, category) VALUES
('The only way to do great work is to love what you do.', 'Steve Jobs', 'motivation'),
('Life is what happens to you while you''re busy making other plans.', 'John Lennon', 'life'),
('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'dreams'),
('It is during our darkest moments that we must focus to see the light.', 'Aristotle', 'inspiration'),
('The only impossible journey is the one you never begin.', 'Tony Robbins', 'motivation'),
('In the middle of difficulty lies opportunity.', 'Albert Einstein', 'opportunity'),
('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'perseverance'),
('The way to get started is to quit talking and begin doing.', 'Walt Disney', 'action'),
('Don''t let yesterday take up too much of today.', 'Will Rogers', 'mindfulness'),
('You learn more from failure than from success. Don''t let it stop you. Failure builds character.', 'Unknown', 'growth')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
