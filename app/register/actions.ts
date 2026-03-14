"use server";

import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient
} from "@/lib/supabase/server";
import { hasPublicSupabaseEnv, hasServiceRoleEnv } from "@/lib/env";
import { bootstrapRegisteredUser } from "@/services/auth/bootstrap";

export type RegisterActionState = {
  status: "error" | "idle";
  message?: string;
};

export async function registerAction(
  _previousState: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  if (!hasPublicSupabaseEnv() || !hasServiceRoleEnv()) {
    return {
      status: "error",
      message:
        "Registration requires both public Supabase keys and the service role key."
    };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const organizationName = String(formData.get("organizationName") ?? "").trim();
  const phone = readOptionalValue(formData, "phone");
  const selectedRole = "admin";

  if (!fullName || !email || !password || !organizationName) {
    return {
      status: "error",
      message: "Full name, organization, email, and password are required."
    };
  }

  if (password.length < 8) {
    return {
      status: "error",
      message: "Password must be at least 8 characters."
    };
  }

  if (!isValidEmail(email)) {
    return {
      status: "error",
      message: "Enter a valid email address."
    };
  }

  if (!isValidOrganizationName(organizationName)) {
    return {
      status: "error",
      message: "Organization name must be between 3 and 80 characters."
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
        role: selectedRole
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
      organizationName,
      phone,
      role: selectedRole,
      userId: data.user.id
    });
  } catch (error) {
    if (createdUserId) {
      await serviceClient.auth.admin.deleteUser(createdUserId);
    }

    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to complete registration right now."
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return {
        status: "error",
        message: "Account created, but automatic sign-in failed. Please log in manually."
      };
    }
  } catch {
    return {
      status: "error",
      message: "Account created, but automatic sign-in failed. Please log in manually."
    };
  }

  redirect("/dashboard");
}

function readOptionalValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value ? value : undefined;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidOrganizationName(value: string) {
  return value.length >= 3 && value.length <= 80;
}
