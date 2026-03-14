import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { modulePermissions } from "@/lib/permissions";
import type { Database } from "@/types/database";

export async function GET() {
  if (!hasPublicSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase authentication is not configured." },
      { status: 503 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();
    const profile = profileData as Pick<
      Database["public"]["Tables"]["profiles"]["Row"],
      "role"
    > | null;

    if (profileError) {
      throw profileError;
    }

    if (!profile?.role || profile.role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    return NextResponse.json({ permissions: modulePermissions });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load admin permissions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
