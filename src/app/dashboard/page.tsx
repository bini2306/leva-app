import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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

        <p className="mt-12 text-zinc-500 text-sm">
          L&apos;app è in costruzione — le funzionalità arriveranno presto.
        </p>
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
