-- Create a function that automatically creates a seller profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.sellers (id, email, whatsapp)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'whatsapp', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger that runs the function after a user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
