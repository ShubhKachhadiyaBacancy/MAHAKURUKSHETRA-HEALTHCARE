"use server";

import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv, hasServiceRoleEnv } from "@/lib/env";
import { bootstrapRegisteredUser } from "@/services/auth/bootstrap";
import type { RegisterRole } from "@/lib/auth/register";
import type { Database } from "@/types/database";

export type AdminInviteActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const allowList: RegisterRole[] = ["organizer", "patients", "doctor"];

export async function inviteUserAction(
  _previousState: AdminInviteActionState,
  formData: FormData
): Promise<AdminInviteActionState> {
  if (!hasPublicSupabaseEnv() || !hasServiceRoleEnv()) {
    return {
      status: "error",
      message: "Invites require Supabase public and service role credentials."
    };
  }

  const supabaseSession = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabaseSession.auth.getSession();

  if (!session?.user) {
    return {
      status: "error",
      message: "You must be signed in as an admin to send invites."
    };
  }

  const { data: profileData } = await supabaseSession
    .from("profiles")
    .select("role, organization_id")
    .eq("id", session.user.id)
    .maybeSingle();
  const profile = profileData as Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "role" | "organization_id"
  > | null;

  if (!profile || profile.role !== "admin") {
    return {
      status: "error",
      message: "Only administrators can send invites."
    };
  }

  const { data: organizationData } = profile.organization_id
    ? await supabaseSession
        .from("organizations")
        .select("name")
        .eq("id", profile.organization_id)
        .maybeSingle()
    : { data: null };
  const organization = organizationData as Pick<
    Database["public"]["Tables"]["organizations"]["Row"],
    "name"
  > | null;

  const email = readValue(formData, "email").toLowerCase();
  const fullName = readValue(formData, "fullName");
  const password = readValue(formData, "password");
  const role = (readValue(formData, "role") || "doctor") as RegisterRole;
  const organizationNameInput = readOptionalValue(formData, "organizationName");
  const phone = readOptionalValue(formData, "phone");
  const specialty = readOptionalValue(formData, "specialty");
  const practiceName = readOptionalValue(formData, "practiceName");
  const providerNpi = readOptionalValue(formData, "providerNpi");

  if (!fullName || !email || !password) {
    return {
      status: "error",
      message: "Name, email, and password are required."
    };
  }

  if (!allowList.includes(role)) {
    return {
      status: "error",
      message: "Select a valid workspace collaborator role."
    };
  }

  if (password.length < 8) {
    return {
      status: "error",
      message: "Password must be at least 8 characters."
    };
  }

  if (role === "doctor" && (!practiceName || !specialty)) {
    return {
      status: "error",
      message: "Doctors need a practice name and specialty."
    };
  }

  if (!isValidEmail(email)) {
    return {
      status: "error",
      message: "Enter a valid email address."
    };
  }

  const resolvedOrganizationName = organization?.name ?? organizationNameInput;
  if (role !== "admin" && !resolvedOrganizationName) {
    return {
      status: "error",
      message: "Organization name is required for this invite."
    };
  }

  const serviceClient = createServiceSupabaseClient();
  let createdUserId: string | null = null;

  try {
    const { data, error } = await serviceClient.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
      user_metadata: {
        full_name: fullName,
        role
      }
    });

    if (error || !data.user?.id) {
      return {
        status: "error",
        message: error?.message ?? "Unable to create user."
      };
    }

    createdUserId = data.user.id;

    await bootstrapRegisteredUser({
      client: serviceClient,
      email,
      fullName,
      organizationName: resolvedOrganizationName ?? "",
      phone,
      practiceName,
      providerNpi,
      role,
      specialty,
      userId: data.user.id
    });
  } catch (error) {
    if (createdUserId) {
      await serviceClient.auth.admin.deleteUser(createdUserId);
    }

    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to send invite right now."
    };
  }

  return {
    status: "success",
    message: `${role.replaceAll("_", " ")} invited. Credentials were sent via email (placeholder).`
  };
}

function readValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readOptionalValue(formData: FormData, key: string) {
  const value = readValue(formData, key);
  return value ? value : undefined;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
