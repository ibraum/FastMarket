-- Drop the existing insert policy
drop policy if exists "Users can insert their own seller profile" on public.sellers;

-- Create a new insert policy that allows any authenticated user to insert
-- as long as the id matches their auth.uid()
create policy "Users can insert their own seller profile"
  on public.sellers for insert
  to authenticated
  with check (auth.uid() = id);
