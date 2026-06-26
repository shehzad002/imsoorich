-- ImsooRich Tools — run in Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.tools (
  id text primary key,
  name text not null,
  description text not null,
  version text not null default '1.0.0',
  featured boolean not null default false,
  tags text[] not null default '{}',
  downloads jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tools_updated_at_idx on public.tools (updated_at desc);

-- Private bucket for tool binaries (create in Dashboard → Storage if insert fails)
insert into storage.buckets (id, name, public)
values ('tool-files', 'tool-files', false)
on conflict (id) do nothing;

-- For files over 50 MB (up to 200 MB): Supabase Pro required.
-- Dashboard → Storage → Settings → Global file size limit → 209715200 (200 MB)

-- Service role bypasses RLS; no public policies needed for server-side access.
