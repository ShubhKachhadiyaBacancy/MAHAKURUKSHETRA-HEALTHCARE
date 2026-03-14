## Default Workspace Accounts

Use the `/register` page or the Supabase Admin API to create the following seed users (a `profile` row and workspace queue already exist in `supabase/seed.sql` for their roles). These credentials are just for local/dev use and rely on the service role getting the matching organization and role data.

| Role         | Email                         | Password       | Notes |
|--------------|-------------------------------|----------------|-------|
| Administrator| `admin@northstar.test`        | `AdminPass1!`  | Creates organization shell + dashboards. |
| Provider     | `provider@northstar.test`     | `Provider2!`   | Attach practice and specialty when registering. |
| Case manager | `case.manager@northstar.test` | `CaseMgr3!`    | Seeds outreach queue entries. |
| Staff        | `staff@northstar.test`        | `StaffOps4!`   | General workspace collaborator. |

Run the register form for each role (fill required fields) or call `serviceClient.auth.admin.createUser` with these emails/passwords plus `user_metadata.role` to match.

For a ready-to-read summary that mirrors `supabase/seed.sql`, see [`SEED_CREDENTIALS.md`](./SEED_CREDENTIALS.md).
