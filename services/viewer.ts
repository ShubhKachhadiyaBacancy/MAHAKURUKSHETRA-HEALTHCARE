import { cache } from "react";
import { redirect } from "next/navigation";
import { registerRoleDetails } from "@/lib/auth/register";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { demoViewer } from "@/services/demo-data";
import type { ViewerContext } from "@/types/workspace";
import { isRegisterRole } from "@/lib/auth/register";

export const getViewerContext = cache(async (): Promise<ViewerContext> => {
  if (!hasPublicSupabaseEnv()) {
    return demoViewer;
  }

  try {
    const supabase = await createServerSupabaseClient();
    const db = supabase as any;
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return demoViewer;
    }

    const { data: profile } = await db
      .from("profiles")
      .select("full_name, role, organization_id")
      .eq("id", session.user.id)
      .maybeSingle();

    const rawRole = profile?.role ?? "";
    const role = isRegisterRole(rawRole) ? rawRole : "organizer";
    let organizationId = profile?.organization_id ?? null;
    let organizationName = "SpecialtyRx Organization";
    let mode: ViewerContext["mode"] = "demo";

    if (!organizationId && role === "patients") {
      const { data: patient } = await db
        .from("patients")
        .select("organization_id")
        .eq("profile_id", session.user.id)
        .maybeSingle();

      organizationId = patient?.organization_id ?? null;
    }

    if (organizationId) {
      const { data: organization } = await db
        .from("organizations")
        .select("name")
        .eq("id", organizationId)
        .maybeSingle();

      organizationName = organization?.name ?? organizationName;
      mode = "live";
    }

    return {
      displayName: profile?.full_name ?? session.user.email ?? "Workspace user",
      role,
      roleLabel: registerRoleDetails[role].label,
      organizationName,
      mode,
      hasSession: true
    };
  } catch {
    return demoViewer;
  }
});

export const requireViewerContext = cache(async (): Promise<ViewerContext> => {
  const viewer = await getViewerContext();

  if (!viewer.hasSession) {
    redirect("/login");
  }

  return viewer;
});
