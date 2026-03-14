create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  title text,
  role text not null default 'organizer' check (role in ('admin', 'organizer', 'patients', 'doctor')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.viewer_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.profiles
  where id = auth.uid()
  limit 1
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.role() = 'service_role' or org_id = public.viewer_organization_id()
$$;

create table if not exists public.case_managers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid unique references public.profiles(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid unique references public.profiles(id) on delete set null,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  sex text not null default 'unknown' check (sex in ('female', 'male', 'non_binary', 'unknown')),
  email text,
  phone text,
  preferred_channel text not null default 'sms' check (preferred_channel in ('sms', 'email', 'call', 'portal')),
  city text,
  state text,
  zip_code text,
  consent_status text not null default 'pending' check (consent_status in ('pending', 'received', 'declined')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  npi text,
  specialty text,
  practice_name text,
  email text,
  phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  manufacturer text,
  therapy_area text,
  support_program text,
  requires_prior_auth boolean not null default true,
  requires_cold_chain boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid not null references public.providers(id) on delete cascade,
  medication_id uuid not null references public.medications(id) on delete restrict,
  dosage text,
  frequency text,
  quantity integer,
  written_at date,
  diagnosis text,
  clinical_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.insurance_policies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  payer_name text not null,
  plan_name text,
  member_id text not null,
  group_number text,
  bin text,
  pcn text,
  status text not null default 'pending' check (status in ('pending', 'verified', 'active', 'denied')),
  verification_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.patient_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  prescription_id uuid references public.prescriptions(id) on delete set null,
  insurance_policy_id uuid references public.insurance_policies(id) on delete set null,
  case_manager_id uuid references public.case_managers(id) on delete set null,
  owner_profile_id uuid references public.profiles(id) on delete set null,
  status text not null default 'intake' check (
    status in (
      'intake',
      'benefit_verification',
      'prior_auth',
      'financial_assistance',
      'pharmacy_coordination',
      'ready_to_start',
      'on_therapy',
      'blocked'
    )
  ),
  priority text not null default 'routine' check (priority in ('routine', 'watch', 'critical')),
  therapy_start_target date,
  barrier_summary text,
  next_action text,
  next_action_due_at timestamptz,
  last_activity_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

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

create table if not exists public.prior_authorizations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  case_id uuid not null references public.patient_cases(id) on delete cascade,
  payer_case_id text,
  submission_method text not null default 'electronic' check (submission_method in ('electronic', 'fax', 'portal', 'phone')),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'pending', 'approved', 'denied', 'appeal')),
  submitted_at timestamptz,
  decision_due_at timestamptz,
  decided_at timestamptz,
  denial_reason text,
  clinical_requirements text,
  notes text,
  appeal_required boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.financial_assistance_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  case_id uuid not null references public.patient_cases(id) on delete cascade,
  program_type text not null check (program_type in ('copay', 'pap', 'foundation', 'bridge')),
  program_name text,
  status text not null default 'screening' check (status in ('screening', 'submitted', 'active', 'denied', 'expired', 'closed')),
  estimated_monthly_savings numeric(12,2),
  household_income_band text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  case_id uuid references public.patient_cases(id) on delete cascade,
  category text not null check (category in ('insurance', 'clinical', 'authorization', 'consent', 'appeal', 'other')),
  title text not null,
  storage_path text,
  mime_type text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  case_id uuid references public.patient_cases(id) on delete cascade,
  title text not null,
  body text not null,
  priority text not null default 'info' check (priority in ('info', 'watch', 'critical')),
  read_at timestamptz,
  action_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.communications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  case_id uuid references public.patient_cases(id) on delete cascade,
  recipient_type text not null check (recipient_type in ('patient', 'provider', 'payer', 'pharmacy', 'manufacturer')),
  direction text not null check (direction in ('inbound', 'outbound')),
  channel text not null check (channel in ('sms', 'email', 'call', 'portal')),
  status text not null default 'scheduled' check (status in ('scheduled', 'sent', 'completed', 'failed', 'received')),
  scheduled_for timestamptz,
  summary text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  entity_name text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists providers_org_npi_uidx
  on public.providers (organization_id, npi)
  where npi is not null;

create unique index if not exists medications_name_uidx
  on public.medications (lower(name));

create index if not exists profiles_org_idx on public.profiles (organization_id);
create index if not exists case_managers_org_idx on public.case_managers (organization_id, active);
create index if not exists patients_profile_idx on public.patients (profile_id);
create index if not exists patients_org_name_idx on public.patients (organization_id, last_name, first_name);
create index if not exists prescriptions_org_idx on public.prescriptions (organization_id, patient_id);
create index if not exists insurance_org_patient_idx on public.insurance_policies (organization_id, patient_id, status);
create index if not exists patient_cases_queue_idx on public.patient_cases (organization_id, status, priority, last_activity_at desc);
create unique index if not exists claims_org_claim_number_uidx on public.claims (organization_id, claim_number);
create index if not exists claims_patient_idx on public.claims (patient_id, created_at desc);
create index if not exists prior_auth_case_idx on public.prior_authorizations (organization_id, case_id, status);
create index if not exists financial_case_idx on public.financial_assistance_cases (organization_id, case_id, status);
create index if not exists notifications_unread_idx on public.notifications (organization_id, read_at, priority);
create index if not exists communications_schedule_idx on public.communications (organization_id, status, scheduled_for);
create index if not exists documents_case_idx on public.documents (organization_id, case_id, category);
create index if not exists audit_logs_entity_idx on public.audit_logs (organization_id, entity_name, created_at desc);

drop trigger if exists organizations_touch_updated_at on public.organizations;
create trigger organizations_touch_updated_at
before update on public.organizations
for each row execute function public.touch_updated_at();

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists case_managers_touch_updated_at on public.case_managers;
create trigger case_managers_touch_updated_at
before update on public.case_managers
for each row execute function public.touch_updated_at();

drop trigger if exists patients_touch_updated_at on public.patients;
create trigger patients_touch_updated_at
before update on public.patients
for each row execute function public.touch_updated_at();

drop trigger if exists providers_touch_updated_at on public.providers;
create trigger providers_touch_updated_at
before update on public.providers
for each row execute function public.touch_updated_at();

drop trigger if exists medications_touch_updated_at on public.medications;
create trigger medications_touch_updated_at
before update on public.medications
for each row execute function public.touch_updated_at();

drop trigger if exists prescriptions_touch_updated_at on public.prescriptions;
create trigger prescriptions_touch_updated_at
before update on public.prescriptions
for each row execute function public.touch_updated_at();

drop trigger if exists insurance_policies_touch_updated_at on public.insurance_policies;
create trigger insurance_policies_touch_updated_at
before update on public.insurance_policies
for each row execute function public.touch_updated_at();

drop trigger if exists patient_cases_touch_updated_at on public.patient_cases;
create trigger patient_cases_touch_updated_at
before update on public.patient_cases
for each row execute function public.touch_updated_at();

drop trigger if exists claims_touch_updated_at on public.claims;
create trigger claims_touch_updated_at
before update on public.claims
for each row execute function public.touch_updated_at();

drop trigger if exists prior_authorizations_touch_updated_at on public.prior_authorizations;
create trigger prior_authorizations_touch_updated_at
before update on public.prior_authorizations
for each row execute function public.touch_updated_at();

drop trigger if exists financial_assistance_cases_touch_updated_at on public.financial_assistance_cases;
create trigger financial_assistance_cases_touch_updated_at
before update on public.financial_assistance_cases
for each row execute function public.touch_updated_at();

drop trigger if exists documents_touch_updated_at on public.documents;
create trigger documents_touch_updated_at
before update on public.documents
for each row execute function public.touch_updated_at();

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.case_managers enable row level security;
alter table public.patients enable row level security;
alter table public.providers enable row level security;
alter table public.medications enable row level security;
alter table public.prescriptions enable row level security;
alter table public.insurance_policies enable row level security;
alter table public.patient_cases enable row level security;
alter table public.claims enable row level security;
alter table public.prior_authorizations enable row level security;
alter table public.financial_assistance_cases enable row level security;
alter table public.documents enable row level security;
alter table public.notifications enable row level security;
alter table public.communications enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists organizations_select on public.organizations;
create policy organizations_select
on public.organizations
for select
to authenticated
using (id = public.viewer_organization_id());

drop policy if exists profiles_select on public.profiles;
create policy profiles_select
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_org_member(organization_id));

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists case_managers_select on public.case_managers;
create policy case_managers_select on public.case_managers
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists case_managers_insert on public.case_managers;
create policy case_managers_insert on public.case_managers
for insert to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists case_managers_update on public.case_managers;
create policy case_managers_update on public.case_managers
for update to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists patients_select on public.patients;
create policy patients_select on public.patients
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists patients_insert on public.patients;
create policy patients_insert on public.patients
for insert to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists patients_update on public.patients;
create policy patients_update on public.patients
for update to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists providers_select on public.providers;
create policy providers_select on public.providers
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists providers_insert on public.providers;
create policy providers_insert on public.providers
for insert to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists providers_update on public.providers;
create policy providers_update on public.providers
for update to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists medications_select on public.medications;
create policy medications_select on public.medications
for select to authenticated
using (true);

drop policy if exists medications_insert on public.medications;
create policy medications_insert on public.medications
for insert to authenticated
with check (true);

drop policy if exists medications_update on public.medications;
create policy medications_update on public.medications
for update to authenticated
using (true)
with check (true);

drop policy if exists prescriptions_select on public.prescriptions;
create policy prescriptions_select on public.prescriptions
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists prescriptions_insert on public.prescriptions;
create policy prescriptions_insert on public.prescriptions
for insert to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists prescriptions_update on public.prescriptions;
create policy prescriptions_update on public.prescriptions
for update to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists insurance_policies_select on public.insurance_policies;
create policy insurance_policies_select on public.insurance_policies
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists insurance_policies_insert on public.insurance_policies;
create policy insurance_policies_insert on public.insurance_policies
for insert to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists insurance_policies_update on public.insurance_policies;
create policy insurance_policies_update on public.insurance_policies
for update to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists patient_cases_select on public.patient_cases;
create policy patient_cases_select on public.patient_cases
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists patient_cases_insert on public.patient_cases;
create policy patient_cases_insert on public.patient_cases
for insert to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists patient_cases_update on public.patient_cases;
create policy patient_cases_update on public.patient_cases
for update to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

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

drop policy if exists prior_authorizations_select on public.prior_authorizations;
create policy prior_authorizations_select on public.prior_authorizations
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists prior_authorizations_insert on public.prior_authorizations;
create policy prior_authorizations_insert on public.prior_authorizations
for insert to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists prior_authorizations_update on public.prior_authorizations;
create policy prior_authorizations_update on public.prior_authorizations
for update to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists financial_assistance_cases_select on public.financial_assistance_cases;
create policy financial_assistance_cases_select on public.financial_assistance_cases
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists financial_assistance_cases_insert on public.financial_assistance_cases;
create policy financial_assistance_cases_insert on public.financial_assistance_cases
for insert to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists financial_assistance_cases_update on public.financial_assistance_cases;
create policy financial_assistance_cases_update on public.financial_assistance_cases
for update to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists documents_insert on public.documents;
create policy documents_insert on public.documents
for insert to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists documents_update on public.documents;
create policy documents_update on public.documents
for update to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
for insert to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
for update to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists communications_select on public.communications;
create policy communications_select on public.communications
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists communications_insert on public.communications;
create policy communications_insert on public.communications
for insert to authenticated
with check (public.is_org_member(organization_id));

drop policy if exists communications_update on public.communications;
create policy communications_update on public.communications
for update to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs
for insert to authenticated
with check (public.is_org_member(organization_id));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('case-documents', 'case-documents', false)
on conflict (id) do nothing;

drop policy if exists case_documents_read on storage.objects;
create policy case_documents_read
on storage.objects
for select
to authenticated
using (bucket_id = 'case-documents');

drop policy if exists case_documents_insert on storage.objects;
create policy case_documents_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'case-documents');

drop policy if exists case_documents_update on storage.objects;
create policy case_documents_update
on storage.objects
for update
to authenticated
using (bucket_id = 'case-documents')
with check (bucket_id = 'case-documents');

drop policy if exists case_documents_delete on storage.objects;
create policy case_documents_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'case-documents');
