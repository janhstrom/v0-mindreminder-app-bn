-- This function will be triggered after a new user is inserted into auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- Drop existing trigger if it exists, to prevent errors on re-run
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Also, ensure RLS is enabled on the profiles table
alter table public.profiles enable row level security;

-- Create policies for profiles table if they don't exist
-- 1. Allow users to see their own profile
drop policy if exists "Users can view their own profile." on public.profiles;
create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id);

-- 2. Allow users to update their own profile
drop policy if exists "Users can update their own profile." on public.profiles;
create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);
