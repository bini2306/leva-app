"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { PlayerPosition, FigcLicenseType } from "@/lib/supabase/types";

export type OnboardingState = { error: string } | null;

export async function completePlayerOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const birth_date = formData.get("birth_date") as string;
  const position = formData.get("position") as PlayerPosition | "";
  const team_name = formData.get("team_name") as string;
  const city = formData.get("city") as string;

  const { error } = await supabase.from("player_profiles").insert({
    id: user.id,
    birth_date,
    position: position || null,
    team_name: team_name || null,
    city: city || null,
  });

  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function completeCoachOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const figc_license_number = formData.get("figc_license_number") as string;
  const figc_license_type = formData.get("figc_license_type") as FigcLicenseType | "";
  const team_name = formData.get("team_name") as string;

  const { error } = await supabase.from("coach_profiles").insert({
    id: user.id,
    figc_license_number,
    figc_license_type: figc_license_type || null,
    team_name: team_name || null,
  });

  if (error) return { error: error.message };
  redirect("/dashboard");
}
