import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "player") {
    const { data: pp } = await supabase
      .from("player_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (!pp) redirect("/onboarding");
  } else if (profile?.role === "coach") {
    const { data: cp } = await supabase
      .from("coach_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (!cp) redirect("/onboarding");
  }

  const roleLabelMap: Record<string, string> = {
    player: "Giocatore",
    coach: "Allenatore FIGC",
    scout: "Scout",
  };
  const roleLabel = profile?.role ? roleLabelMap[profile.role] : "—";

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col px-6 py-12">
      <span className="text-green-500 font-black text-2xl tracking-tight mb-12">
        LEVA
      </span>

      <div className="flex-1">
        <p className="text-zinc-400 text-sm">Benvenuto</p>
        <h1 className="text-2xl font-bold text-white mt-1">
          {profile?.full_name}
        </h1>
        <span className="inline-block mt-3 px-3 py-1 bg-green-500/15 text-green-400 text-sm font-medium rounded-full">
          {roleLabel}
        </span>

        <div className="mt-10 space-y-3">
          <Link
            href="/feed"
            className="flex items-center justify-between px-5 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-green-500/15 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">Feed</p>
                <p className="text-zinc-400 text-sm">Scopri nuovi talenti</p>
              </div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-zinc-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>

          {profile?.role === "player" && (
            <Link
              href="/upload"
              className="flex items-center justify-between px-5 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-green-500/15 rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-green-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold">Carica video</p>
                  <p className="text-zinc-400 text-sm">Mostra le tue giocate</p>
                </div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-zinc-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      <form action={logout}>
        <button
          type="submit"
          className="w-full py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white rounded-xl transition-colors text-sm"
        >
          Esci
        </button>
      </form>
    </div>
  );
}
