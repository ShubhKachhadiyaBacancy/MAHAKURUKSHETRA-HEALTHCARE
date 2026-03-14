# Seed Credentials and Starter Access

These workspaces rely on the `supabase/seed.sql` data model plus the `services/auth/bootstrap` orchestration that the `/register` flow calls with your service-role SAP key. The following accounts mirror the seeded organizations, providers, and case managers so you can sign in directly after creating them via the Supabase Admin API or the seed script. The `/register` page only creates organizers.

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| Administrator | `admin1@northstar.test` | `admin123` | Creates the organization shell, notifications, and overview dashboard. |
| Organizer | `org1@northstar.test` | `org123` | Organizer profile plus linked case-manager seed data. |
| Patient | `patient1@northstar.test` | `patient123` | Patient profile plus linked patient workspace and seeded claims. |
| Doctor | `doctor1@northstar.test` | `doctor123` | Doctor profile plus linked provider seed data. |

Use the service role key to provision these accounts so their `profiles` rows match the seeded `case_managers`, `providers`, and `patients`. The `register` page wires identity, organization, and seeded case data together for organizers so they open directly into the live workspace that the matrix in `lib/permissions.ts` describes.
