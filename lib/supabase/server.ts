import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { env, hasPublicSupabaseEnv, hasServiceRoleEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export async function createServerSupabaseClient() {
  if (!hasPublicSupabaseEnv()) {
    throw new Error("Missing public Supabase environment variables.");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookieList: Array<{
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }>
      ) {
        try {
          cookieList.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as never);
          });
        } catch {
          // Cookie writes are ignored in Server Components.
        }
      }
    }
  });
}

export function createServiceSupabaseClient() {
  if (!hasServiceRoleEnv()) {
    throw new Error("Missing Supabase service role environment variables.");
  }

  return createClient<Database>(
    env.supabaseUrl!,
    env.supabaseServiceRoleKey!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
