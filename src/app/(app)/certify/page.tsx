import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CertifyClient } from "./certify-client";

export const dynamic = "force-dynamic";

export default async function CertifyPage() {
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
  if (profile.role !== "player") redirect("/feed");

  const { data: existingRequest } = await supabase
    .from("certification_requests")
    .select(
      "id, coach_id, status, player_message, rejection_reason, requested_at, reviewed_at"
    )
    .eq("player_id", user.id)
    .maybeSingle();

  let coachInfo: {
    fullName: string;
    licenseNumber: string | null;
    teamName: string | null;
  } | null = null;

  if (existingRequest) {
    const [coachProfileRes, coachDataRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", existingRequest.coach_id)
        .maybeSingle(),
      supabase
        .from("coach_profiles")
        .select("figc_license_number, team_name")
        .eq("id", existingRequest.coach_id)
        .maybeSingle(),
    ]);
    if (coachProfileRes.data) {
      coachInfo = {
        fullName: coachProfileRes.data.full_name,
        licenseNumber: coachDataRes.data?.figc_license_number ?? null,
        teamName: coachDataRes.data?.team_name ?? null,
      };
    }
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 pb-20">
      <header className="flex items-center justify-between px-6 py-5 border-b border-zinc-900">
        <Link
          href="/profile"
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Profilo
        </Link>
        <h1 className="text-white font-bold text-lg">Certificazione</h1>
        <span className="w-16" />
      </header>

      <CertifyClient
        existingRequest={existingRequest}
        coachInfo={coachInfo}
      />
    </div>
  );
}
