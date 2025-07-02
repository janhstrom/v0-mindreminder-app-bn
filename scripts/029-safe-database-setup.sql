-- Safe database setup that handles existing policies
-- Drop existing policies first to avoid conflicts
DO $$ 
BEGIN
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
    DROP POLICY IF EXISTS "Users can view own user_settings" ON user_settings;
    DROP POLICY IF EXISTS "Users can update own user_settings" ON user_settings;
    DROP POLICY IF EXISTS "Users can view own quotes" ON quotes;
    DROP POLICY IF EXISTS "Users can create own quotes" ON quotes;
    DROP POLICY IF EXISTS "Users can update own quotes" ON quotes;
    DROP POLICY IF EXISTS "Users can delete own quotes" ON quotes;
END $$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_time TIME,
    reminder_date DATE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS micro_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    estimated_duration INTEGER,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_preferences JSONB DEFAULT '{}',
    theme_preference TEXT DEFAULT 'system',
    timezone TEXT DEFAULT 'UTC',
    date_format TEXT DEFAULT 'MM/dd/yyyy',
    time_format TEXT DEFAULT '12h',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author TEXT,
    category TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reminders" ON reminders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders" ON reminders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON reminders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON reminders
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own micro_actions" ON micro_actions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own micro_actions" ON micro_actions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own micro_actions" ON micro_actions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own micro_actions" ON micro_actions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own user_settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own user_settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quotes" ON quotes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quotes" ON quotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes" ON quotes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes" ON quotes
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
