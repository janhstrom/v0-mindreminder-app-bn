-- Function to create a profile for a new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$;

-- Trigger to call the function when a new user is created
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Grant usage on the sequence for profile IDs if it's not already there
-- This might be needed if your 'id' column in profiles has a default value like nextval('profiles_id_seq'::regclass)
-- In our case, we are using the user's auth.id, so this is less critical but good practice.
grant usage, select on sequence public.profiles_id_seq to authenticated;
