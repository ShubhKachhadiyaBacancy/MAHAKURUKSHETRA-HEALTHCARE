# Seed Credentials and Starter Access

These workspaces rely on the `supabase/seed.sql` data model plus the `services/auth/bootstrap` orchestration that the `/register` flow calls with your service-role SAP key. The following accounts mirror the seeded organizations, providers, and case managers so you can sign in directly after creating them via the register form or the Supabase Admin API.

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| Administrator | `admin@northstar.test` | `AdminPass1!` | Creates the organization shell, notifications, and overview dashboard. |
| Provider | `provider@northstar.test` | `Provider2!` | Provider profile plus clinical/payer seed data. |
| Case Manager | `case.manager@northstar.test` | `CaseMgr3!` | Owns outreach workflows, affordability requests, and prior-auth cases. |
| Staff | `staff@northstar.test` | `StaffOps4!` | General workspace collaborator with read-only ops and communication visibility. |

Use the service role key to provision these accounts so their `profiles` rows match the seeded `case_managers`, `providers`, and `patients`. The `register` page wires identity, organization, and seeded case data together so each role opens directly into the live workspace that the matrix in `lib/permissions.ts` describes.
