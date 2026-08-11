create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  constraint username_length check (char_length(username) between 3 and 20),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]+$')
);

create unique index profiles_username_key on public.profiles (lower(username));

alter table public.profiles enable row level security;

create policy "profiles are viewable by their owner"
  on public.profiles for select
  to authenticated
  using ( (select auth.uid()) = id );

create policy "users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check ( (select auth.uid()) = id );
