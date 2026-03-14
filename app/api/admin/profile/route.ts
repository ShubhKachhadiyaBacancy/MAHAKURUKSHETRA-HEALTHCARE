import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getAdminProfileSnapshot,
  updateAdminProfile,
  AdminWorkspaceError
} from "@/services/admin-workspace";
import {
  OrganizerServiceError,
  getOrganizerProfileSnapshot,
  updateOrganizerProfile
} from "@/services/organizer";
import type { Database } from "@/types/database";

export async function GET() {
  try {
    const role = await getCurrentRole();
    const snapshot =
      role === "admin"
        ? await getAdminProfileSnapshot()
        : role === "organizer"
        ? await getOrganizerProfileSnapshot()
        : null;

    if (!snapshot) {
      return NextResponse.json({ message: "Access restricted." }, { status: 403 });
    }

    return NextResponse.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const role = await getCurrentRole();
    const result =
      role === "admin"
        ? await updateAdminProfile(body)
        : role === "organizer"
        ? await updateOrganizerProfile(body)
        : null;

    if (!result) {
      return NextResponse.json({ message: "Access restricted." }, { status: 403 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

async function getCurrentRole() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();
  const profile = profileData as Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "role"
  > | null;

  return profile?.role ?? null;
}

function toErrorResponse(error: unknown) {
  if (error instanceof OrganizerServiceError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  if (error instanceof AdminWorkspaceError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json({ message: "Unexpected admin profile API error." }, { status: 500 });
}
