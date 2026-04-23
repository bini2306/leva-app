import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingClient from "./onboarding-client";
import type { UserRole } from "@/lib/supabase/types";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const role = profile.role as UserRole;

  if (role === "player") {
    const { data } = await supabase
      .from("player_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (data) redirect("/dashboard");
  } else if (role === "coach") {
    const { data } = await supabase
      .from("coach_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (data) redirect("/dashboard");
  } else {
    // scout: nessun profilo aggiuntivo richiesto
    redirect("/dashboard");
  }

  return <OnboardingClient role={role} />;
}
