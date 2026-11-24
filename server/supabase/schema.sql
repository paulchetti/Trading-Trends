create table if not exists public.app_store (
  id text primary key check (id = 'main_store'),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_store enable row level security;

grant select, insert, update, delete on public.app_store to service_role;
