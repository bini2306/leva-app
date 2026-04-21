"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AuthState = { error: string } | { success: true } | null;

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const full_name = formData.get("full_name") as string;
  const role = formData.get("role") as string;
  const email = formData.get("email") as string;

  console.log("[signup] tentativo:", { email, role, full_name });

  const { data, error } = await supabase.auth.signUp({
    email,
    password: formData.get("password") as string,
    options: {
      data: { full_name, role },
    },
  });

  if (error) {
    console.error("[signup] errore Supabase:", {
      message: error.message,
      status: error.status,
      code: (error as unknown as Record<string, unknown>).code,
    });
    return { error: error.message };
  }

  console.log("[signup] successo, user id:", data.user?.id);
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
