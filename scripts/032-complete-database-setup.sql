-- Complete Database Setup for MindReMinder
-- This script creates all necessary tables and policies from scratch

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS shared_reminders CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS micro_actions CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
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
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quotes table (global quotes, no user_id)
CREATE TABLE quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content TEXT NOT NULL,
  author TEXT,
  category TEXT DEFAULT 'motivation',
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

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for reminders
CREATE POLICY "Users can view own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for micro_actions
CREATE POLICY "Users can view own micro_actions" ON micro_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own micro_actions" ON micro_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own micro_actions" ON micro_actions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own micro_actions" ON micro_actions
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for quotes (global access)
CREATE POLICY "Anyone can view quotes" ON quotes
  FOR SELECT TO authenticated USING (true);

-- Create RLS policies for friends
CREATE POLICY "Users can view own friends" ON friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create own friends" ON friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own friends" ON friends
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own friends" ON friends
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for shared_reminders
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
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample quotes
INSERT INTO quotes (content, author, category) VALUES
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

SELECT 'Database setup completed successfully!' as message;
