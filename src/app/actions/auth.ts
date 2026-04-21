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

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: formData.get("full_name") as string,
        role: formData.get("role") as string,
      },
    },
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
