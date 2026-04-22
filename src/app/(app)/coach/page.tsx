import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RequestCard } from "./request-card";

export const dynamic = "force-dynamic";

export default async function CoachDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (profile.role !== "coach") redirect("/feed");

  const { data: requests } = await supabase
    .from("certification_requests")
    .select(
      "id, player_id, status, player_message, rejection_reason, requested_at, reviewed_at"
    )
    .eq("coach_id", user.id)
    .order("requested_at", { ascending: false });

  const playerIds = Array.from(
    new Set((requests ?? []).map((r) => r.player_id))
  );

  const { data: players } = playerIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", playerIds)
    : { data: [] };

  const playerMap = new Map(
    (players ?? []).map((p) => [p.id, p])
  );

  const pending = (requests ?? []).filter((r) => r.status === "pending");
  const reviewed = (requests ?? []).filter((r) => r.status !== "pending");

  return (
    <div className="min-h-[100dvh] bg-zinc-950 pb-20">
      <header className="flex items-center justify-between px-6 py-5 border-b border-zinc-900">
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wide">
            Coach
          </p>
          <h1 className="text-white font-bold text-lg">Richieste</h1>
        </div>
        <Link
          href="/feed"
          className="text-zinc-400 hover:text-white transition-colors text-sm"
        >
          Feed
        </Link>
      </header>

      <div className="px-6 py-6 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Da valutare</h2>
            {pending.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pending.length}
              </span>
            )}
          </div>
          {pending.length === 0 ? (
            <p className="text-zinc-500 text-sm bg-zinc-900 rounded-xl p-6 text-center">
              Nessuna richiesta in attesa
            </p>
          ) : (
            <div className="space-y-3">
              {pending.map((r) => (
                <RequestCard
                  key={r.id}
                  requestId={r.id}
                  playerName={playerMap.get(r.player_id)?.full_name ?? "Giocatore"}
                  avatarUrl={playerMap.get(r.player_id)?.avatar_url ?? null}
                  message={r.player_message}
                  requestedAt={r.requested_at}
                  status="pending"
                />
              ))}
            </div>
          )}
        </section>

        {reviewed.length > 0 && (
          <section>
            <h2 className="text-white font-semibold mb-3">Storico</h2>
            <div className="space-y-3">
              {reviewed.map((r) => (
                <RequestCard
                  key={r.id}
                  requestId={r.id}
                  playerName={playerMap.get(r.player_id)?.full_name ?? "Giocatore"}
                  avatarUrl={playerMap.get(r.player_id)?.avatar_url ?? null}
                  message={r.player_message}
                  requestedAt={r.requested_at}
                  reviewedAt={r.reviewed_at}
                  rejectionReason={r.rejection_reason}
                  status={r.status as "approved" | "rejected"}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
