-- =============================================================================
-- Wincer Project — Users table + all_users_admin view setup
-- Run this in the Supabase SQL Editor (or via `supabase db execute`).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Base table: public.users
--    Columns match what the app reads/writes:
--      - id            : app-generated string id (Date.now().toString())
--      - uid           : links to auth.users.id (used by App.tsx .eq('uid', ...))
--      - email, name, role, joined_at, orders_count
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id            text primary key,
  uid           uuid references auth.users (id) on delete cascade,
  email         text,
  name          text default 'New Member',
  role          text not null default 'user' check (role in ('user', 'admin')),
  joined_at     timestamptz not null default now(),
  orders_count  integer not null default 0,
  created_at    timestamptz not null default now()
);

-- Helpful indexes
create index if not exists users_uid_idx   on public.users (uid);
create index if not exists users_email_idx on public.users (email);

-- -----------------------------------------------------------------------------
-- 1b. MIGRATION FIX: repair an already-existing public.users table where the
--     `uid` column was previously created as TEXT instead of UUID.
--     This is what causes: "operator does not exist: uuid = text" at runtime,
--     because auth.uid() always returns a real uuid, and RLS/is_admin() need
--     to compare it against users.uid using the SAME type.
--     `id` is correctly TEXT (app uses Date.now().toString()) and is left
--     untouched here — only `uid` is fixed if it's the wrong type.
-- -----------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'users'
      and column_name  = 'uid'
      and data_type    <> 'uuid'
  ) then
    raise notice 'Fixing public.users.uid: converting % -> uuid', (
      select data_type from information_schema.columns
      where table_schema = 'public' and table_name = 'users' and column_name = 'uid'
    );

    -- Drop objects that depend on the uid column's current type/policies
    drop view if exists public.all_users_admin;
    drop policy if exists "users_select_self_or_admin" on public.users;
    drop policy if exists "users_insert_self_or_admin" on public.users;
    drop policy if exists "users_update_self_or_admin" on public.users;
    drop policy if exists "users_delete_admin"          on public.users;

    -- Drop any existing FK on uid before retyping (name may vary)
    alter table public.users drop constraint if exists users_uid_fkey;

    -- Safely cast existing text values to uuid (blank/invalid -> null)
    alter table public.users
      alter column uid type uuid
      using (case when uid is null or uid = '' then null else uid::uuid end);

    -- Re-attach the foreign key to auth.users
    alter table public.users
      add constraint users_uid_fkey foreign key (uid)
      references auth.users (id) on delete cascade;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- 2. Admin check helper (SECURITY DEFINER avoids RLS recursion on public.users)
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where uid = auth.uid()
      and role = 'admin'
  );
$$;


-- -----------------------------------------------------------------------------
-- 3. Row Level Security on public.users
--    - Users can see/update their own row.
--    - Admins can see/insert/update/delete any row.
-- -----------------------------------------------------------------------------
alter table public.users enable row level security;

drop policy if exists "users_select_self_or_admin" on public.users;
create policy "users_select_self_or_admin"
  on public.users for select
  using (uid = auth.uid() or public.is_admin());

drop policy if exists "users_insert_self_or_admin" on public.users;
create policy "users_insert_self_or_admin"
  on public.users for insert
  with check (uid = auth.uid() or public.is_admin());

drop policy if exists "users_update_self_or_admin" on public.users;
create policy "users_update_self_or_admin"
  on public.users for update
  using (uid = auth.uid() or public.is_admin())
  with check (uid = auth.uid() or public.is_admin());

drop policy if exists "users_delete_admin" on public.users;
create policy "users_delete_admin"
  on public.users for delete
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. The all_users_admin VIEW (what Admin.tsx reads for the User Registry)
--    security_invoker = true => the RLS policies above are enforced,
--    so only admins get the full list; regular users only see themselves.
-- -----------------------------------------------------------------------------
create or replace view public.all_users_admin
with (security_invoker = true) as
select
  id,
  uid,
  email,
  name,
  role,
  joined_at,
  orders_count,
  created_at
from public.users;

-- Expose the view to the API roles
grant select on public.all_users_admin to authenticated;

-- -----------------------------------------------------------------------------
-- 5. Auto-create a users profile row when a new auth user signs up
--    Keeps App.tsx's `.from('users').eq('uid', currentUser.id)` lookup working.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, uid, email, name, role, joined_at, orders_count)
  values (
    new.id::text,
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New Member'),
    case
      when lower(new.email) in ('bmkaranja001@gmail.com', 'medillin254@gmail.com')
        then 'admin'
      else 'user'
    end,
    now(),
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- 6. Realtime — Admin.tsx subscribes to changes on the `users` table.
--    Add it to the supabase_realtime publication (ignore error if already added).
-- -----------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.users;
exception
  when duplicate_object then null;
  when others then null;
end $$;

-- -----------------------------------------------------------------------------
-- 7. (Optional) Backfill: create profile rows for any existing auth users
--    and promote the two hard-coded admin emails.
-- -----------------------------------------------------------------------------
insert into public.users (id, uid, email, name, role, joined_at, orders_count)
select
  au.id::text,
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data ->> 'full_name', 'New Member'),
  case
    when lower(au.email) in ('bmkaranja001@gmail.com', 'medillin254@gmail.com')
      then 'admin'
    else 'user'
  end,
  now(),
  0
from auth.users au
on conflict (id) do nothing;

update public.users
set role = 'admin'
where lower(email) in ('bmkaranja001@gmail.com', 'medillin254@gmail.com')
  and role <> 'admin';
