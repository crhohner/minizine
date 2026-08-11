create table public.zines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  pages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index zines_user_id_idx on public.zines (user_id);

alter table public.zines enable row level security;

create policy "users can view their own zines"
  on public.zines for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "users can create their own zines"
  on public.zines for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "users can update their own zines"
  on public.zines for update
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "users can delete their own zines"
  on public.zines for delete
  to authenticated
  using ( (select auth.uid()) = user_id );
