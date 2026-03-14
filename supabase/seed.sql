insert into public.organizations (name, slug)
values ('Northstar Specialty Care', 'northstar-specialty-care')
on conflict (slug) do nothing;

insert into public.case_managers (organization_id, full_name, email, phone)
select id, 'Maya Chen', 'maya.chen@northstar.test', '(555) 100-1001'
from public.organizations
where slug = 'northstar-specialty-care'
and not exists (
  select 1 from public.case_managers where full_name = 'Maya Chen'
);

insert into public.case_managers (organization_id, full_name, email, phone)
select id, 'Jordan Lee', 'jordan.lee@northstar.test', '(555) 100-1002'
from public.organizations
where slug = 'northstar-specialty-care'
and not exists (
  select 1 from public.case_managers where full_name = 'Jordan Lee'
);

insert into public.providers (organization_id, full_name, npi, specialty, practice_name, email)
select id, 'Dr. Priya Patel', '1234567890', 'Pulmonology', 'Lakeview Respiratory Partners', 'priya.patel@northstar.test'
from public.organizations
where slug = 'northstar-specialty-care'
on conflict do nothing;

insert into public.providers (organization_id, full_name, npi, specialty, practice_name, email)
select id, 'Dr. Elena Morris', '2234567890', 'Neurology', 'Central Texas Neuro Clinic', 'elena.morris@northstar.test'
from public.organizations
where slug = 'northstar-specialty-care'
on conflict do nothing;

insert into public.providers (organization_id, full_name, npi, specialty, practice_name, email)
select id, 'Dr. Martin Shah', '3234567890', 'Oncology', 'East Harbor Oncology', 'martin.shah@northstar.test'
from public.organizations
where slug = 'northstar-specialty-care'
on conflict do nothing;

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
