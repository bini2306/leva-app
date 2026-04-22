"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { FigcLicenseType } from "@/lib/supabase/types";

export type CoachResult = {
  id: string;
  fullName: string;
  licenseNumber: string | null;
  licenseType: FigcLicenseType | null;
  teamName: string | null;
  city: string | null;
};

export async function searchCoaches(query: string): Promise<CoachResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const supabase = await createClient();

  const byName = supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "coach")
    .ilike("full_name", `%${q}%`)
    .limit(20);

  const byLicense = supabase
    .from("coach_profiles")
    .select("id, figc_license_number, figc_license_type, team_name, city")
    .ilike("figc_license_number", `%${q}%`)
    .limit(20);

  const [nameRes, licenseRes] = await Promise.all([byName, byLicense]);

  const coachIds = new Set<string>();
  (nameRes.data ?? []).forEach((p) => coachIds.add(p.id));
  (licenseRes.data ?? []).forEach((p) => coachIds.add(p.id));

  if (coachIds.size === 0) return [];

  const ids = Array.from(coachIds);
  const [profilesRes, coachDataRes] = await Promise.all([
    supabase.from("profiles").select("id, full_name").in("id", ids),
    supabase
      .from("coach_profiles")
      .select("id, figc_license_number, figc_license_type, team_name, city")
      .in("id", ids),
  ]);

  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p])
  );
  const coachMap = new Map(
    (coachDataRes.data ?? []).map((c) => [c.id, c])
  );

  return ids
    .map((id) => {
      const p = profileMap.get(id);
      const c = coachMap.get(id);
      if (!p) return null;
      return {
        id,
        fullName: p.full_name,
        licenseNumber: c?.figc_license_number ?? null,
        licenseType: c?.figc_license_type ?? null,
        teamName: c?.team_name ?? null,
        city: c?.city ?? null,
      };
    })
    .filter((c): c is CoachResult => c !== null);
}

export async function requestCertification(
  coachId: string,
  message: string | null
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "player") {
    return { error: "Solo i giocatori possono richiedere la certificazione" };
  }

  const { error } = await supabase.from("certification_requests").insert({
    player_id: user.id,
    coach_id: coachId,
    player_message: message,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Hai già una richiesta attiva. Annullala prima di crearne una nuova." };
    }
    console.error("[requestCertification]", error);
    return { error: error.message };
  }

  revalidatePath("/certify");
  return { success: true };
}

export async function cancelRequest(): Promise<
  { error: string } | { success: true }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };

  const { error } = await supabase
    .from("certification_requests")
    .delete()
    .eq("player_id", user.id);

  if (error) {
    console.error("[cancelRequest]", error);
    return { error: error.message };
  }

  revalidatePath("/certify");
  return { success: true };
}

export async function approveRequest(
  requestId: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };

  const { error } = await supabase
    .from("certification_requests")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("coach_id", user.id);

  if (error) {
    console.error("[approveRequest]", error);
    return { error: error.message };
  }

  revalidatePath("/coach");
  return { success: true };
}

export async function rejectRequest(
  requestId: string,
  reason: string | null
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };

  const { error } = await supabase
    .from("certification_requests")
    .update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("coach_id", user.id);

  if (error) {
    console.error("[rejectRequest]", error);
    return { error: error.message };
  }

  revalidatePath("/coach");
  return { success: true };
}
