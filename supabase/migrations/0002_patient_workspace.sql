alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'patient', 'provider', 'case_manager', 'staff'));

alter table public.patients
  add column if not exists profile_id uuid unique references public.profiles(id) on delete set null;

create index if not exists patients_profile_idx on public.patients (profile_id);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  case_id uuid references public.patient_cases(id) on delete set null,
  claim_number text not null,
  claim_type text not null default 'medical' check (claim_type in ('medical', 'pharmacy', 'reimbursement', 'support')),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'in_review', 'approved', 'partially_approved', 'denied', 'paid')),
  payer_name text,
  service_date date,
  amount numeric(12, 2),
  note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists claims_org_claim_number_uidx
  on public.claims (organization_id, claim_number);

create index if not exists claims_patient_idx
  on public.claims (patient_id, created_at desc);

drop trigger if exists claims_touch_updated_at on public.claims;
create trigger claims_touch_updated_at
before update on public.claims
for each row
execute function public.touch_updated_at();

alter table public.claims enable row level security;

drop policy if exists claims_select on public.claims;
create policy claims_select
on public.claims
for select
using (public.is_org_member(organization_id));

drop policy if exists claims_insert on public.claims;
create policy claims_insert
on public.claims
for insert
with check (public.is_org_member(organization_id));

drop policy if exists claims_update on public.claims;
create policy claims_update
on public.claims
for update
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists claims_delete on public.claims;
create policy claims_delete
on public.claims
for delete
using (public.is_org_member(organization_id));
