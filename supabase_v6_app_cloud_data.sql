create table if not exists public.app_cloud_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_cloud_data enable row level security;

drop policy if exists "app_cloud_data_select_own" on public.app_cloud_data;
create policy "app_cloud_data_select_own"
on public.app_cloud_data
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "app_cloud_data_insert_own" on public.app_cloud_data;
create policy "app_cloud_data_insert_own"
on public.app_cloud_data
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "app_cloud_data_update_own" on public.app_cloud_data;
create policy "app_cloud_data_update_own"
on public.app_cloud_data
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
