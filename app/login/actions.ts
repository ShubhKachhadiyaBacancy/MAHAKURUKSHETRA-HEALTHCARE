"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv } from "@/lib/env";

export type LoginActionState = {
  status: "idle" | "error";
  message?: string;
};

export async function signInAction(
  _previousState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  if (!hasPublicSupabaseEnv()) {
    return {
      status: "error",
      message: "Supabase authentication is not configured yet."
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!email || !password) {
    return {
      status: "error",
      message: "Email and password are required."
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
        message: error.message
      };
    }
  } catch {
    return {
      status: "error",
      message: "Unable to sign in right now."
    };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  if (hasPublicSupabaseEnv()) {
    try {
      const supabase = await createServerSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore sign-out errors and still redirect.
    }
  }

  redirect("/login");
}
