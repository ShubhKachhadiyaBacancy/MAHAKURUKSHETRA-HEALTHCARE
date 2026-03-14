insert into public.organizations (name, slug)
values ('Northstar Specialty Care', 'northstar-specialty-care')
on conflict (slug) do nothing;

-- Compatibility repair for older local databases that still use the pre-squash role
-- names and do not yet have the patient workspace additions.
alter table public.profiles
  drop constraint if exists profiles_role_check;

update public.profiles
set role = 'organizer'
where role in ('case_manager', 'staff');

update public.profiles
set role = 'doctor'
where role = 'provider';

update public.profiles
set role = 'patients'
where role = 'patient';

alter table public.profiles
  alter column role set default 'organizer';

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'organizer', 'patients', 'doctor'));

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

-- Seed auth users + profiles for local login (requires auth.users first).
-- Roles map directly to the live workspace roles: ADMIN->admin, ORGANIZER->organizer, PATIENTS->patients, DOCTOR->doctor.
-- These use a fresh set of simple dev usernames to avoid clashing with older local seeds.
do $$
declare
  org_id uuid;
begin
  select id into org_id
  from public.organizations
  where slug = 'northstar-specialty-care';

  if org_id is not null then
    insert into auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      aud,
      role,
      raw_app_meta_data,
      raw_user_meta_data
    )
    values
      (
        '11111111-1111-1111-1111-111111111111',
        '00000000-0000-0000-0000-000000000000',
        'admin1@northstar.test',
        crypt('admin123', gen_salt('bf')),
        timezone('utc', now()),
        timezone('utc', now()),
        timezone('utc', now()),
        'authenticated',
        'authenticated',
        jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
        jsonb_build_object('full_name', 'Northstar Admin', 'role', 'admin')
      ),
      (
        '22222222-2222-2222-2222-222222222222',
        '00000000-0000-0000-0000-000000000000',
        'org1@northstar.test',
        crypt('org123', gen_salt('bf')),
        timezone('utc', now()),
        timezone('utc', now()),
        timezone('utc', now()),
        'authenticated',
        'authenticated',
        jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
        jsonb_build_object('full_name', 'Avery Organizer', 'role', 'organizer')
      ),
      (
        '33333333-3333-3333-3333-333333333333',
        '00000000-0000-0000-0000-000000000000',
        'patient1@northstar.test',
        crypt('patient123', gen_salt('bf')),
        timezone('utc', now()),
        timezone('utc', now()),
        timezone('utc', now()),
        'authenticated',
        'authenticated',
        jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
        jsonb_build_object('full_name', 'Taylor Patient', 'role', 'patients')
      ),
      (
        '44444444-4444-4444-4444-444444444444',
        '00000000-0000-0000-0000-000000000000',
        'doctor1@northstar.test',
        crypt('doctor123', gen_salt('bf')),
        timezone('utc', now()),
        timezone('utc', now()),
        timezone('utc', now()),
        'authenticated',
        'authenticated',
        jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
        jsonb_build_object('full_name', 'Dr. Jordan Reed', 'role', 'doctor')
      )
    on conflict (id) do update
    set
      email = excluded.email,
      encrypted_password = excluded.encrypted_password,
      email_confirmed_at = excluded.email_confirmed_at,
      updated_at = excluded.updated_at,
      aud = excluded.aud,
      role = excluded.role,
      raw_app_meta_data = excluded.raw_app_meta_data,
      raw_user_meta_data = excluded.raw_user_meta_data;

    insert into public.profiles (id, organization_id, full_name, email, role, title)
    values
      (
        '11111111-1111-1111-1111-111111111111',
        null,
        'Northstar Admin',
        'admin1@northstar.test',
        'admin',
        'Administrator'
      ),
      (
        '22222222-2222-2222-2222-222222222222',
        org_id,
        'Avery Organizer',
        'org1@northstar.test',
        'organizer',
        'Organizer'
      ),
      (
        '33333333-3333-3333-3333-333333333333',
        org_id,
        'Taylor Patient',
        'patient1@northstar.test',
        'patients',
        'Patient'
      ),
      (
        '44444444-4444-4444-4444-444444444444',
        org_id,
        'Dr. Jordan Reed',
        'doctor1@northstar.test',
        'doctor',
        'Doctor'
      )
    on conflict (id) do update
    set
      organization_id = excluded.organization_id,
      full_name = excluded.full_name,
      email = excluded.email,
      role = excluded.role,
      title = excluded.title;
  end if;
end $$;

update public.case_managers cm
set email = 'case1@northstar.test'
from public.organizations o
where o.slug = 'northstar-specialty-care'
  and cm.organization_id = o.id
  and cm.full_name = 'Maya Chen'
  and cm.email is distinct from 'case1@northstar.test';

update public.providers pr
set email = 'provider1@northstar.test'
from public.organizations o
where o.slug = 'northstar-specialty-care'
  and pr.organization_id = o.id
  and pr.npi = '1234567890'
  and pr.email is distinct from 'provider1@northstar.test';

-- These role records are aligned to AUTH_CREDENTIALS.md so service-role bootstrap
-- can attach the documented organizer, doctor, and patient accounts to the seeded queue.
insert into public.case_managers (organization_id, full_name, email, phone)
select o.id, 'Maya Chen', 'case1@northstar.test', '(555) 100-1001'
from public.organizations o
where o.slug = 'northstar-specialty-care'
and not exists (
  select 1
  from public.case_managers cm
  where cm.organization_id = o.id
    and cm.email = 'case1@northstar.test'
);

insert into public.case_managers (organization_id, full_name, email, phone)
select o.id, 'Jordan Lee', 'jordan.lee@northstar.test', '(555) 100-1002'
from public.organizations o
where o.slug = 'northstar-specialty-care'
and not exists (
  select 1
  from public.case_managers cm
  where cm.organization_id = o.id
    and cm.email = 'jordan.lee@northstar.test'
);

insert into public.case_managers (organization_id, full_name, email, phone)
select o.id, 'Avery Organizer', 'org1@northstar.test', '(555) 100-1010'
from public.organizations o
where o.slug = 'northstar-specialty-care'
and not exists (
  select 1
  from public.case_managers cm
  where cm.organization_id = o.id
    and cm.email = 'org1@northstar.test'
);

update public.case_managers cm
set profile_id = '22222222-2222-2222-2222-222222222222'
from public.organizations o
where o.slug = 'northstar-specialty-care'
  and cm.organization_id = o.id
  and cm.email = 'org1@northstar.test'
  and cm.profile_id is distinct from '22222222-2222-2222-2222-222222222222';

update public.providers pr
set
  full_name = seed.full_name,
  specialty = seed.specialty,
  practice_name = seed.practice_name,
  email = seed.email
from public.organizations o
join (
  values
    ('1234567890', 'Dr. Priya Patel', 'Pulmonology', 'Lakeview Respiratory Partners', 'provider1@northstar.test'),
    ('2234567890', 'Dr. Elena Morris', 'Neurology', 'Central Texas Neuro Clinic', 'elena.morris@northstar.test'),
    ('3234567890', 'Dr. Martin Shah', 'Oncology', 'East Harbor Oncology', 'martin.shah@northstar.test'),
    ('4234567890', 'Dr. Jordan Reed', 'Cardiology', 'Northstar Heart Center', 'doctor1@northstar.test')
) as seed(npi, full_name, specialty, practice_name, email)
  on true
where o.slug = 'northstar-specialty-care'
  and pr.organization_id = o.id
  and pr.npi = seed.npi;

insert into public.providers (organization_id, full_name, npi, specialty, practice_name, email)
select
  o.id,
  seed.full_name,
  seed.npi,
  seed.specialty,
  seed.practice_name,
  seed.email
from public.organizations o
join (
  values
    ('1234567890', 'Dr. Priya Patel', 'Pulmonology', 'Lakeview Respiratory Partners', 'provider1@northstar.test'),
    ('2234567890', 'Dr. Elena Morris', 'Neurology', 'Central Texas Neuro Clinic', 'elena.morris@northstar.test'),
    ('3234567890', 'Dr. Martin Shah', 'Oncology', 'East Harbor Oncology', 'martin.shah@northstar.test'),
    ('4234567890', 'Dr. Jordan Reed', 'Cardiology', 'Northstar Heart Center', 'doctor1@northstar.test')
) as seed(npi, full_name, specialty, practice_name, email)
  on true
where o.slug = 'northstar-specialty-care'
  and not exists (
    select 1
    from public.providers pr
    where pr.organization_id = o.id
      and pr.npi = seed.npi
  );

insert into public.medications (name, therapy_area, support_program, requires_prior_auth)
values
  ('Dupixent', 'Immunology', 'Dupixent MyWay', true),
  ('Ocrevus', 'Neurology', 'Bridge therapy support', true),
  ('Tagrisso', 'Oncology', 'Manufacturer affordability hub', true)
on conflict (lower(name)) do nothing;

insert into public.patients (
  organization_id, first_name, last_name, date_of_birth, sex, email, phone, preferred_channel, city, state, zip_code, consent_status
)
select o.id, 'Ava', 'Thompson', '1988-04-12', 'female', 'ava.thompson@example.com', '(555) 010-1001', 'sms', 'Chicago', 'IL', '60611', 'received'
from public.organizations o
where o.slug = 'northstar-specialty-care'
and not exists (select 1 from public.patients where first_name = 'Ava' and last_name = 'Thompson');

insert into public.patients (
  organization_id, first_name, last_name, date_of_birth, sex, email, phone, preferred_channel, city, state, zip_code, consent_status
)
select o.id, 'Rafael', 'Kim', '1977-09-19', 'male', 'rafael.kim@example.com', '(555) 010-1002', 'email', 'Austin', 'TX', '78701', 'received'
from public.organizations o
where o.slug = 'northstar-specialty-care'
and not exists (select 1 from public.patients where first_name = 'Rafael' and last_name = 'Kim');

insert into public.patients (
  organization_id, first_name, last_name, date_of_birth, sex, email, phone, preferred_channel, city, state, zip_code, consent_status
)
select o.id, 'Leah', 'Brooks', '1969-01-27', 'female', 'leah.brooks@example.com', '(555) 010-1003', 'call', 'Boston', 'MA', '02110', 'received'
from public.organizations o
where o.slug = 'northstar-specialty-care'
and not exists (select 1 from public.patients where first_name = 'Leah' and last_name = 'Brooks');

insert into public.patients (
  organization_id, first_name, last_name, date_of_birth, sex, email, phone, preferred_channel, city, state, zip_code, consent_status
)
select o.id, 'Taylor', 'Patient', '1992-08-03', 'unknown', 'patient1@northstar.test', '(555) 010-1010', 'email', 'Chicago', 'IL', '60611', 'received'
from public.organizations o
where o.slug = 'northstar-specialty-care'
and not exists (select 1 from public.patients where email = 'patient1@northstar.test');

update public.patients p
set profile_id = '33333333-3333-3333-3333-333333333333'
from public.organizations o
where o.slug = 'northstar-specialty-care'
  and p.organization_id = o.id
  and p.email = 'patient1@northstar.test'
  and p.profile_id is distinct from '33333333-3333-3333-3333-333333333333';

insert into public.claims (
  organization_id, patient_id, claim_number, claim_type, status, payer_name, service_date, amount, note
)
select
  o.id,
  p.id,
  'CLM-TAYLOR-001',
  'medical',
  'submitted',
  'Blue Cross Blue Shield',
  '2026-02-20',
  245.00,
  'Submitted through the patient workspace for outpatient specialist follow-up.'
from public.organizations o
join public.patients p on p.organization_id = o.id and p.email = 'patient1@northstar.test'
where o.slug = 'northstar-specialty-care'
and not exists (
  select 1
  from public.claims c
  where c.organization_id = o.id
    and c.claim_number = 'CLM-TAYLOR-001'
);

insert into public.claims (
  organization_id, patient_id, claim_number, claim_type, status, payer_name, service_date, amount, note
)
select
  o.id,
  p.id,
  'CLM-TAYLOR-002',
  'reimbursement',
  'paid',
  'Blue Cross Blue Shield',
  '2026-01-14',
  118.40,
  'Reimbursement claim already closed and paid.'
from public.organizations o
join public.patients p on p.organization_id = o.id and p.email = 'patient1@northstar.test'
where o.slug = 'northstar-specialty-care'
and not exists (
  select 1
  from public.claims c
  where c.organization_id = o.id
    and c.claim_number = 'CLM-TAYLOR-002'
);

insert into public.prescriptions (
  organization_id, patient_id, provider_id, medication_id, dosage, diagnosis, clinical_notes
)
select
  o.id,
  p.id,
  pr.id,
  m.id,
  '300mg pen',
  'Severe eosinophilic asthma',
  'Recent pulmonary notes received. Lab panel still needed.'
from public.organizations o
join public.patients p on p.organization_id = o.id and p.first_name = 'Ava' and p.last_name = 'Thompson'
join public.providers pr on pr.organization_id = o.id and pr.npi = '1234567890'
join public.medications m on lower(m.name) = lower('Dupixent')
where o.slug = 'northstar-specialty-care'
and not exists (select 1 from public.prescriptions x where x.patient_id = p.id and x.medication_id = m.id);

insert into public.prescriptions (
  organization_id, patient_id, provider_id, medication_id, dosage, diagnosis, clinical_notes
)
select
  o.id,
  p.id,
  pr.id,
  m.id,
  '600mg infusion',
  'Relapsing multiple sclerosis',
  'Benefits verified. Affordability support in review.'
from public.organizations o
join public.patients p on p.organization_id = o.id and p.first_name = 'Rafael' and p.last_name = 'Kim'
join public.providers pr on pr.organization_id = o.id and pr.npi = '2234567890'
join public.medications m on lower(m.name) = lower('Ocrevus')
where o.slug = 'northstar-specialty-care'
and not exists (select 1 from public.prescriptions x where x.patient_id = p.id and x.medication_id = m.id);

insert into public.prescriptions (
  organization_id, patient_id, provider_id, medication_id, dosage, diagnosis, clinical_notes
)
select
  o.id,
  p.id,
  pr.id,
  m.id,
  '80mg tablet',
  'EGFR-mutated NSCLC',
  'Appeal likely required because of payer denial.'
from public.organizations o
join public.patients p on p.organization_id = o.id and p.first_name = 'Leah' and p.last_name = 'Brooks'
join public.providers pr on pr.organization_id = o.id and pr.npi = '3234567890'
join public.medications m on lower(m.name) = lower('Tagrisso')
where o.slug = 'northstar-specialty-care'
and not exists (select 1 from public.prescriptions x where x.patient_id = p.id and x.medication_id = m.id);

insert into public.insurance_policies (
  organization_id, patient_id, payer_name, plan_name, member_id, status, verification_notes
)
select o.id, p.id, 'Blue Cross Blue Shield', 'PPO Gold 3500', 'BCBS-44391', 'verified', 'Prior auth required. Payer requested missing labs.'
from public.organizations o
join public.patients p on p.organization_id = o.id and p.first_name = 'Ava' and p.last_name = 'Thompson'
where o.slug = 'northstar-specialty-care'
and not exists (select 1 from public.insurance_policies x where x.patient_id = p.id and x.member_id = 'BCBS-44391');

insert into public.insurance_policies (
  organization_id, patient_id, payer_name, plan_name, member_id, status, verification_notes
)
select o.id, p.id, 'Aetna', 'Open Choice PPO', 'AET-19902', 'verified', 'High out-of-pocket exposure remains.'
from public.organizations o
join public.patients p on p.organization_id = o.id and p.first_name = 'Rafael' and p.last_name = 'Kim'
where o.slug = 'northstar-specialty-care'
and not exists (select 1 from public.insurance_policies x where x.patient_id = p.id and x.member_id = 'AET-19902');

insert into public.insurance_policies (
  organization_id, patient_id, payer_name, plan_name, member_id, status, verification_notes
)
select o.id, p.id, 'UnitedHealthcare', 'Choice Plus', 'UHC-51711', 'denied', 'Initial prior auth denied due to payer policy mismatch.'
from public.organizations o
join public.patients p on p.organization_id = o.id and p.first_name = 'Leah' and p.last_name = 'Brooks'
where o.slug = 'northstar-specialty-care'
and not exists (select 1 from public.insurance_policies x where x.patient_id = p.id and x.member_id = 'UHC-51711');

insert into public.patient_cases (
  organization_id, patient_id, provider_id, prescription_id, insurance_policy_id, case_manager_id, status, priority, next_action, next_action_due_at, barrier_summary
)
select
  o.id, p.id, pr.id, rx.id, ins.id, cm.id,
  'prior_auth', 'critical', 'Collect lab panel and resubmit clinical packet',
  timezone('utc', now()) + interval '6 hours',
  'Clinical documentation incomplete for payer review.'
from public.organizations o
join public.patients p on p.organization_id = o.id and p.first_name = 'Ava' and p.last_name = 'Thompson'
join public.providers pr on pr.organization_id = o.id and pr.npi = '1234567890'
join public.prescriptions rx on rx.organization_id = o.id and rx.patient_id = p.id
join public.insurance_policies ins on ins.organization_id = o.id and ins.patient_id = p.id
join public.case_managers cm on cm.organization_id = o.id and cm.full_name = 'Maya Chen'
where o.slug = 'northstar-specialty-care'
and not exists (select 1 from public.patient_cases x where x.patient_id = p.id);

insert into public.patient_cases (
  organization_id, patient_id, provider_id, prescription_id, insurance_policy_id, case_manager_id, status, priority, next_action, next_action_due_at, barrier_summary
)
select
  o.id, p.id, pr.id, rx.id, ins.id, cm.id,
  'financial_assistance', 'watch', 'Confirm bridge enrollment eligibility',
  timezone('utc', now()) + interval '1 day',
  'High patient cost exposure before infusion scheduling.'
from public.organizations o
join public.patients p on p.organization_id = o.id and p.first_name = 'Rafael' and p.last_name = 'Kim'
join public.providers pr on pr.organization_id = o.id and pr.npi = '2234567890'
join public.prescriptions rx on rx.organization_id = o.id and rx.patient_id = p.id
join public.insurance_policies ins on ins.organization_id = o.id and ins.patient_id = p.id
join public.case_managers cm on cm.organization_id = o.id and cm.full_name = 'Jordan Lee'
where o.slug = 'northstar-specialty-care'
and not exists (select 1 from public.patient_cases x where x.patient_id = p.id);

insert into public.patient_cases (
  organization_id, patient_id, provider_id, prescription_id, insurance_policy_id, case_manager_id, status, priority, next_action, next_action_due_at, barrier_summary
)
select
  o.id, p.id, pr.id, rx.id, ins.id, cm.id,
  'blocked', 'critical', 'Prepare denial appeal with chart notes',
  timezone('utc', now()) + interval '8 hours',
  'Payer denial requires appeal and manufacturer support review.'
from public.organizations o
join public.patients p on p.organization_id = o.id and p.first_name = 'Leah' and p.last_name = 'Brooks'
join public.providers pr on pr.organization_id = o.id and pr.npi = '3234567890'
join public.prescriptions rx on rx.organization_id = o.id and rx.patient_id = p.id
join public.insurance_policies ins on ins.organization_id = o.id and ins.patient_id = p.id
join public.case_managers cm on cm.organization_id = o.id and cm.full_name = 'Maya Chen'
where o.slug = 'northstar-specialty-care'
and not exists (select 1 from public.patient_cases x where x.patient_id = p.id);

insert into public.prior_authorizations (
  organization_id, case_id, payer_case_id, submission_method, status, submitted_at, decision_due_at, clinical_requirements, notes, appeal_required
)
select c.organization_id, c.id, 'PA-AVA-001', 'electronic', 'pending', timezone('utc', now()) - interval '2 days', timezone('utc', now()) + interval '1 day', 'Recent eosinophil lab panel and updated pulmonology note', 'Electronic PA sent. Awaiting supplemental clinicals.', false
from public.patient_cases c
join public.patients p on p.id = c.patient_id
where p.first_name = 'Ava' and p.last_name = 'Thompson'
and not exists (select 1 from public.prior_authorizations x where x.case_id = c.id);

insert into public.prior_authorizations (
  organization_id, case_id, payer_case_id, submission_method, status, submitted_at, decision_due_at, clinical_requirements, notes, appeal_required
)
select c.organization_id, c.id, 'PA-LEAH-001', 'electronic', 'denied', timezone('utc', now()) - interval '4 days', timezone('utc', now()) - interval '1 day', 'Medical necessity statement and mutation documentation', 'Initial denial received. Appeal needed.', true
from public.patient_cases c
join public.patients p on p.id = c.patient_id
where p.first_name = 'Leah' and p.last_name = 'Brooks'
and not exists (select 1 from public.prior_authorizations x where x.case_id = c.id and x.payer_case_id = 'PA-LEAH-001');

insert into public.financial_assistance_cases (
  organization_id, case_id, program_type, program_name, status, estimated_monthly_savings, household_income_band, notes
)
select c.organization_id, c.id, 'bridge', 'Bridge therapy support', 'active', 1850.00, '75k-100k', 'Bridge support under review before first infusion.'
from public.patient_cases c
join public.patients p on p.id = c.patient_id
where p.first_name = 'Rafael' and p.last_name = 'Kim'
and not exists (select 1 from public.financial_assistance_cases x where x.case_id = c.id);

insert into public.communications (
  organization_id, case_id, recipient_type, direction, channel, status, scheduled_for, summary
)
select c.organization_id, c.id, 'patient', 'outbound', 'sms', 'scheduled', timezone('utc', now()) + interval '2 hours', 'Reminder to upload supporting lab results before payer cutoff.'
from public.patient_cases c
join public.patients p on p.id = c.patient_id
where p.first_name = 'Ava' and p.last_name = 'Thompson'
and not exists (select 1 from public.communications x where x.case_id = c.id and x.summary like 'Reminder to upload%');

insert into public.notifications (
  organization_id, case_id, title, body, priority, action_url
)
select c.organization_id, c.id, 'Critical blocker', 'Ava Thompson requires supplemental labs before the payer deadline.', 'critical', '/patients/' || c.id
from public.patient_cases c
join public.patients p on p.id = c.patient_id
where p.first_name = 'Ava' and p.last_name = 'Thompson'
and not exists (select 1 from public.notifications x where x.case_id = c.id and x.title = 'Critical blocker');

insert into public.documents (
  organization_id, case_id, category, title, storage_path, mime_type
)
select c.organization_id, c.id, 'clinical', 'Pulmonology chart note', 'case-documents/demo/pulmonology-chart-note.pdf', 'application/pdf'
from public.patient_cases c
join public.patients p on p.id = c.patient_id
where p.first_name = 'Ava' and p.last_name = 'Thompson'
and not exists (select 1 from public.documents x where x.case_id = c.id and x.title = 'Pulmonology chart note');

insert into public.audit_logs (
  organization_id, entity_name, entity_id, action, metadata
)
select c.organization_id, 'patient_case', c.id, 'seed_created', jsonb_build_object('source', 'seed.sql')
from public.patient_cases c
where not exists (
  select 1 from public.audit_logs x where x.entity_id = c.id and x.action = 'seed_created'
);
