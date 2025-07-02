-- MindReMinder Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create micro_actions table
CREATE TABLE IF NOT EXISTS public.micro_actions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    author TEXT,
    category TEXT DEFAULT 'motivation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for reminders
CREATE POLICY "Users can view own reminders" ON public.reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders" ON public.reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON public.reminders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON public.reminders
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for micro_actions
CREATE POLICY "Users can view own micro actions" ON public.micro_actions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own micro actions" ON public.micro_actions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own micro actions" ON public.micro_actions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own micro actions" ON public.micro_actions
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for quotes
CREATE POLICY "Anyone can view quotes" ON public.quotes
    FOR SELECT TO authenticated USING (true);

-- Create function to handle user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample quotes
INSERT INTO public.quotes (text, author, category) VALUES
('The only way to do great work is to love what you do.', 'Steve Jobs', 'motivation'),
('Life is what happens to you while you''re busy making other plans.', 'John Lennon', 'life'),
('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'dreams'),
('It is during our darkest moments that we must focus to see the light.', 'Aristotle', 'inspiration'),
('The only impossible journey is the one you never begin.', 'Tony Robbins', 'motivation'),
('In the end, we will remember not the words of our enemies, but the silence of our friends.', 'Martin Luther King Jr.', 'friendship'),
('The only thing we have to fear is fear itself.', 'Franklin D. Roosevelt', 'courage'),
('Darkness cannot drive out darkness: only light can do that.', 'Martin Luther King Jr.', 'inspiration'),
('The way to get started is to quit talking and begin doing.', 'Walt Disney', 'action'),
('Don''t let yesterday take up too much of today.', 'Will Rogers', 'mindfulness')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_time ON public.reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_micro_actions_user_id ON public.micro_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_category ON public.quotes(category);

SELECT 'Database setup completed successfully!' as message;
