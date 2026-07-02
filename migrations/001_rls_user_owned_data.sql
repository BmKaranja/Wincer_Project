-- 001_rls_user_owned_data.sql
-- Enforce strict RLS for user-owned data, admin-managed resources, and sensitive payment state.
-- Run in Supabase SQL editor or via `supabase db execute`.

-- Helper: normalized text version of auth.uid()
create or replace function public.current_user_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid()::text;
$$;

-- Recreate is_admin() helper in case the function is missing or stale.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where uid = auth.uid()
      and role = 'admin'
  );
$$;

-- Orders: only owners and admins may access user-owned order records.
do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'orders'
  ) then
    alter table public.orders enable row level security;

    drop policy if exists orders_select_owner_or_admin on public.orders;
    create policy orders_select_owner_or_admin
      on public.orders for select
      using (
        public.is_admin() or user_id = public.current_user_id()
      );

    drop policy if exists orders_insert_owner_or_admin on public.orders;
    create policy orders_insert_owner_or_admin
      on public.orders for insert
      with check (
        public.is_admin() or user_id = public.current_user_id()
      );

    drop policy if exists orders_update_owner_or_admin on public.orders;
    create policy orders_update_owner_or_admin
      on public.orders for update
      using (
        public.is_admin() or user_id = public.current_user_id()
      )
      with check (
        public.is_admin() or user_id = public.current_user_id()
      );

    drop policy if exists orders_delete_owner_or_admin on public.orders;
    create policy orders_delete_owner_or_admin
      on public.orders for delete
      using (
        public.is_admin() or user_id = public.current_user_id()
      );

    if not exists (
      select 1 from pg_constraint c
      join pg_class t on t.oid = c.conrelid
      join pg_namespace n on n.oid = t.relnamespace
      where n.nspname = 'public'
        and t.relname = 'orders'
        and c.conname = 'orders_user_id_fkey'
    ) then
      alter table public.orders
      add constraint orders_user_id_fkey
      foreign key (user_id)
      references public.users (id)
      on delete cascade;
    end if;
  end if;
end $$;

-- Cakes: public read access, admin-only writes.
do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'cakes'
  ) then
    alter table public.cakes enable row level security;

    drop policy if exists cakes_select_public on public.cakes;
    create policy cakes_select_public
      on public.cakes for select
      using (true);

    drop policy if exists cakes_modify_admin on public.cakes;
    create policy cakes_modify_admin
      on public.cakes for insert
      with check (public.is_admin());

    drop policy if exists cakes_update_admin on public.cakes;
    create policy cakes_update_admin
      on public.cakes for update
      using (public.is_admin())
      with check (public.is_admin());

    drop policy if exists cakes_delete_admin on public.cakes;
    create policy cakes_delete_admin
      on public.cakes for delete
      using (public.is_admin());
  end if;
end $$;

-- Inquiries: public insert only; only admins may read or modify.
do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'inquiries'
  ) then
    alter table public.inquiries enable row level security;

    drop policy if exists inquiries_insert_public on public.inquiries;
    create policy inquiries_insert_public
      on public.inquiries for insert
      with check (true);

    drop policy if exists inquiries_select_admin on public.inquiries;
    create policy inquiries_select_admin
      on public.inquiries for select
      using (public.is_admin());

    drop policy if exists inquiries_update_admin on public.inquiries;
    create policy inquiries_update_admin
      on public.inquiries for update
      using (public.is_admin())
      with check (public.is_admin());

    drop policy if exists inquiries_delete_admin on public.inquiries;
    create policy inquiries_delete_admin
      on public.inquiries for delete
      using (public.is_admin());
  end if;
end $$;

-- M-Pesa requests: service role only, no public access.
do $$
begin
  if exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'mpesa_requests'
  ) then
    alter table public.mpesa_requests enable row level security;
    drop policy if exists mpesa_requests_select_admin on public.mpesa_requests;
    create policy mpesa_requests_select_admin
      on public.mpesa_requests for select
      using (public.is_admin());

    drop policy if exists mpesa_requests_insert_admin on public.mpesa_requests;
    create policy mpesa_requests_insert_admin
      on public.mpesa_requests for insert
      with check (public.is_admin());

    drop policy if exists mpesa_requests_update_admin on public.mpesa_requests;
    create policy mpesa_requests_update_admin
      on public.mpesa_requests for update
      using (public.is_admin())
      with check (public.is_admin());

    drop policy if exists mpesa_requests_delete_admin on public.mpesa_requests;
    create policy mpesa_requests_delete_admin
      on public.mpesa_requests for delete
      using (public.is_admin());
  end if;
end $$;
