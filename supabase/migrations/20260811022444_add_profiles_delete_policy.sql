create policy "users can delete their own profile"
  on public.profiles for delete
  to authenticated
  using ( (select auth.uid()) = id );
