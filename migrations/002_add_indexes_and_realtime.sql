-- 002_add_indexes_and_realtime.sql
-- Add performance indexes for high-traffic lookup columns and ensure realtime publication.
-- Run in Supabase SQL editor or via `supabase db execute`.

-- Orders indexes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'orders'
  ) THEN
    CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);
    CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);
    CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
    CREATE INDEX IF NOT EXISTS orders_status_created_at_idx ON public.orders (status, created_at DESC);
  END IF;
END $$;

-- Inquiries indexes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'inquiries'
  ) THEN
    CREATE INDEX IF NOT EXISTS inquiries_status_idx ON public.inquiries (status);
    CREATE INDEX IF NOT EXISTS inquiries_event_date_idx ON public.inquiries (event_date);
    CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON public.inquiries (created_at DESC);
  END IF;
END $$;

-- Cakes indexes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'cakes'
      AND column_name = 'tag'
  ) THEN
    CREATE INDEX IF NOT EXISTS cakes_tag_idx ON public.cakes (tag);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'cakes'
      AND column_name = 'title'
  ) THEN
    CREATE INDEX IF NOT EXISTS cakes_title_idx ON public.cakes (title);
  END IF;
END $$;

-- M-Pesa requests indexes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'mpesa_requests'
  ) THEN
    CREATE INDEX IF NOT EXISTS mpesa_requests_reference_idx ON public.mpesa_requests (reference);
    CREATE INDEX IF NOT EXISTS mpesa_requests_status_idx ON public.mpesa_requests (status);
    CREATE INDEX IF NOT EXISTS mpesa_requests_created_at_idx ON public.mpesa_requests ("createdAt" DESC);
  END IF;
END $$;

-- Realtime publication for admin-managed tables. If the publication already exists, ignore duplicates.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.inquiries;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.cakes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
