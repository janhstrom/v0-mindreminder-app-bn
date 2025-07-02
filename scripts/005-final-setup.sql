-- Final setup and verification script
-- Ensure all tables exist and have proper permissions

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify all tables exist
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'reminders', 'quotes', 'micro_actions', 'micro_action_completions', 'user_settings');
    
    IF table_count = 6 THEN
        RAISE NOTICE 'SUCCESS: All 6 required tables exist!';
    ELSE
        RAISE NOTICE 'WARNING: Only % out of 6 tables found', table_count;
    END IF;
END $$;

-- Show table row counts
SELECT 
    'profiles' as table_name, 
    COUNT(*) as row_count 
FROM profiles
UNION ALL
SELECT 
    'reminders' as table_name, 
    COUNT(*) as row_count 
FROM reminders
UNION ALL
SELECT 
    'quotes' as table_name, 
    COUNT(*) as row_count 
FROM quotes
UNION ALL
SELECT 
    'micro_actions' as table_name, 
    COUNT(*) as row_count 
FROM micro_actions
UNION ALL
SELECT 
    'micro_action_completions' as table_name, 
    COUNT(*) as row_count 
FROM micro_action_completions
UNION ALL
SELECT 
    'user_settings' as table_name, 
    COUNT(*) as row_count 
FROM user_settings
ORDER BY table_name;

-- Final success message
SELECT 'Database setup completed successfully!' as status;
