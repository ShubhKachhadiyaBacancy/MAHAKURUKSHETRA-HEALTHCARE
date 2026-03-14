## Default Workspace Accounts

These credentials are for local/dev use and rely on the service role seeding the matching organization and role data. The `/register` page only creates organizers; use the Supabase Admin API or `supabase/seed.sql` for the other roles.

| Role      | Email                     | Password        | Notes |
|-----------|---------------------------|-----------------|-------|
| ADMIN     | `admin1@northstar.test`   | `admin123`      | Creates organization shell + dashboards. |
| ORGANIZER | `org1@northstar.test`     | `org123`        | Maps to the organizer case manager seed. |
| PATIENTS  | `patient1@northstar.test` | `patient123`    | Maps to the seeded patient record. |
| DOCTOR    | `doctor1@northstar.test`  | `doctor123`     | Maps to the seeded provider record. |

Run the register form for the organizer (fill required fields) or call `serviceClient.auth.admin.createUser` with these emails/passwords plus `user_metadata.role` to match (`admin`, `organizer`, `patients`, `doctor` respectively).

For a ready-to-read summary that mirrors `supabase/seed.sql`, see [`SEED_CREDENTIALS.md`](./SEED_CREDENTIALS.md).
