# SpecialtyRx Connect

SpecialtyRx Connect is a production-oriented Next.js + Supabase application for specialty medication operations. It focuses the MVP around the highest-friction work in therapy initiation:

- digital patient enrollment
- provider-facing command center
- prior authorization visibility
- insurance verification context
- financial assistance coordination
- communication history and support workflows
- reports and exportability

The UI is intentionally shallow and operational, informed by the reference-product analysis in [IAssist_UI_Analysis.md](/D:/PROJECTS/MAHAKURUKSHETRA/DEFINITION/IAssist_UI_Analysis.md) and the project rules in [SUPER_AGENTS.md](/D:/PROJECTS/MAHAKURUKSHETRA/DEFINITION/SUPER_AGENTS.md).

## Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- Supabase Postgres, Auth, and Storage
- Vercel

## Application Structure

Key directories:

- [app](/D:/PROJECTS/MAHAKURUKSHETRA/app)
- [components](/D:/PROJECTS/MAHAKURUKSHETRA/components)
- [services](/D:/PROJECTS/MAHAKURUKSHETRA/services)
- [lib](/D:/PROJECTS/MAHAKURUKSHETRA/lib)
- [types](/D:/PROJECTS/MAHAKURUKSHETRA/types)
- [utils](/D:/PROJECTS/MAHAKURUKSHETRA/utils)
- [supabase](/D:/PROJECTS/MAHAKURUKSHETRA/supabase)

## Product Surfaces

Public routes:

- `/`
- `/intake`
- `/login`
- `/register`

Workspace routes:

- `/dashboard`
- `/patients`
- `/patients/[id]`
- `/reports`
- `/reports/export`
- `/settings`
- `/help`

The workspace uses server-side Supabase queries when an authenticated session and organization-scoped profile exist. Otherwise it falls back to preview data so the interface remains reviewable before backend setup is complete.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local environment variables:

```bash
cp .env.example .env.local
```

3. Fill in:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Apply the schema in Supabase SQL Editor using [0001_initial_schema.sql](/D:/PROJECTS/MAHAKURUKSHETRA/supabase/migrations/0001_initial_schema.sql).

5. Optionally load preview records using [seed.sql](/D:/PROJECTS/MAHAKURUKSHETRA/supabase/seed.sql).

6. Start the development server:

```bash
npm run dev
```

## Supabase Setup Notes

The schema includes:

- organizations and profiles
- patients, providers, medications, prescriptions
- insurance policies
- patient cases
- prior authorizations
- financial assistance cases
- communications
- notifications
- documents
- audit logs
- case managers

Security model:

- Row Level Security enabled across application tables
- organization-scoped helper functions for policies
- automatic profile creation trigger for new auth users
- private storage bucket for case documents

Important:

- the public enrollment form writes live records only when `SUPABASE_SERVICE_ROLE_KEY` is configured
- authenticated workspace reads depend on a `profiles` row with a valid `organization_id`

## Initial User Provisioning

You have two ways to create users:

1. Use the public `/register` page to create an auth user, attach the profile to an organization, and seed starter workspace records automatically.
2. Provision the auth user directly in Supabase if you prefer an admin-managed flow.

If you provision users manually in Supabase:

1. Ensure the user has a row in `public.profiles`
2. Assign `organization_id`
3. Set a role such as `admin`, `provider`, `case_manager`, or `staff`

The auth trigger will create the profile automatically. You only need to attach the organization and adjust the role.

## Registration Bootstrap

The `/register` flow:

- creates the auth user with confirmed email
- attaches the profile to an organization
- creates linked `providers` or `case_managers` records when the selected role needs them
- seeds starter queue data so the dashboard opens in live mode immediately

## Deployment to Vercel

1. Import the repository into Vercel
2. Add the environment variables from `.env.local`
3. Deploy

Recommended Vercel environment variables:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Performance Notes

The application is optimized around the constraints in `SUPER_AGENTS.md`:

- server components first
- minimal client boundaries
- no unnecessary client-side fetching
- route-level code splitting
- Tailwind-only styling
- simple CSV export instead of heavy reporting dependencies
- demo fallback instead of duplicate staging APIs

## Reference Inputs

Project context lives in:

- [PRD.md](/D:/PROJECTS/MAHAKURUKSHETRA/DEFINITION/PRD.md)
- [SUPER_AGENTS.md](/D:/PROJECTS/MAHAKURUKSHETRA/DEFINITION/SUPER_AGENTS.md)
- [IAssist_UI_Analysis.md](/D:/PROJECTS/MAHAKURUKSHETRA/DEFINITION/IAssist_UI_Analysis.md)
