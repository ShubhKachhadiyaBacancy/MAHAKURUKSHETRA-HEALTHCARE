import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProviderRow = Database["public"]["Tables"]["providers"]["Row"];

export class WorkspaceAccessError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "WorkspaceAccessError";
    this.status = status;
  }
}

export type WorkspaceActor = {
  db: any;
  userId: string;
  role: ProfileRow["role"];
  organizationId: string;
  organizationName: string;
  profile: Pick<ProfileRow, "email" | "full_name" | "phone" | "title">;
  provider: ProviderRow | null;
};

export async function getCurrentWorkspaceActor(): Promise<WorkspaceActor | null> {
  if (!hasPublicSupabaseEnv()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const db = supabase as any;
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("email, full_name, organization_id, phone, role, title")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileError || !profile?.organization_id) {
    return null;
  }

  const { data: organization, error: organizationError } = await db
    .from("organizations")
    .select("name")
    .eq("id", profile.organization_id)
    .maybeSingle();

  if (organizationError || !organization?.name) {
    return null;
  }

  return {
    db,
    userId: session.user.id,
    role: profile.role,
    organizationId: profile.organization_id,
    organizationName: organization.name,
    profile: {
      email: profile.email,
      full_name: profile.full_name,
      phone: profile.phone,
      title: profile.title
    },
    provider:
      profile.role === "provider"
        ? await resolveProviderRecord(db, {
            organizationId: profile.organization_id,
            email: profile.email,
            fullName: profile.full_name
          })
        : null
  };
}

export async function requireProviderActor(): Promise<WorkspaceActor> {
  const actor = await getCurrentWorkspaceActor();

  if (!actor) {
    throw new WorkspaceAccessError(401, "Authentication is required.");
  }

  if (actor.role !== "provider") {
    throw new WorkspaceAccessError(
      403,
      "Doctor access is only available to provider accounts."
    );
  }

  return actor;
}

async function resolveProviderRecord(
  db: any,
  {
    organizationId,
    email,
    fullName
  }: {
    organizationId: string;
    email: string | null;
    fullName: string;
  }
) {
  if (email) {
    const { data, error } = await db
      .from("providers")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("email", email)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (error) {
      throw new WorkspaceAccessError(500, "Unable to resolve the linked provider record.");
    }

    if (data?.[0]) {
      return data[0] as ProviderRow;
    }
  }

  const normalizedFullName = String(fullName ?? "").trim();
  if (!normalizedFullName) {
    return null;
  }

  const { data, error } = await db
    .from("providers")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("full_name", normalizedFullName)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new WorkspaceAccessError(500, "Unable to resolve the linked provider record.");
  }

  return (data?.[0] as ProviderRow | undefined) ?? null;
}
