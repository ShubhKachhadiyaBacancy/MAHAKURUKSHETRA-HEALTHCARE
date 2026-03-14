create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  zip_code text,
  phone text,
  email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists offices_org_idx
  on public.offices (organization_id, created_at desc);

drop trigger if exists offices_touch_updated_at on public.offices;
create trigger offices_touch_updated_at
before update on public.offices
for each row execute function public.touch_updated_at();

alter table public.offices enable row level security;

drop policy if exists offices_select on public.offices;
create policy offices_select
on public.offices
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists offices_insert on public.offices;
create policy offices_insert
on public.offices
for insert
to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists offices_update on public.offices;
create policy offices_update
on public.offices
for update
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists offices_delete on public.offices;
create policy offices_delete
on public.offices
for delete
to authenticated
using (public.is_org_member(organization_id));
