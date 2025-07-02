// This script checks the connection to Supabase and fetches the first 5 users.
// It relies on environment variables being set in the execution environment.
// It does NOT use dotenv.

import { createClient } from '@supabase/supabase-js'

async function checkSupabaseConnection() {
  console.log('Attempting to connect to Supabase...')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Supabase environment variables are not set.')
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are available.')
    process.exit(1)
  }

  console.log('Supabase URL found:', supabaseUrl.slice(0, 20) + '...')

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('Supabase client created successfully.')

    console.log('Fetching first 5 users from auth.users...')
    const { data: users, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 5,
    })

    if (error) {
      console.error('Error fetching users:', error.message)
      return
    }

    if (users && users.users.length > 0) {
      console.log('Successfully fetched users:')
      users.users.forEach(user => {
        console.log(`- User ID: ${user.id}, Email: ${user.email}`)
      })
    } else {
      console.log('Connection successful, but no users found in the auth.users table.')
    }

    console.log('\nSupabase connection check complete.')
  } catch (err) {
    console.error('An unexpected error occurred:', err.message)
  }
}

checkSupabaseConnection()
