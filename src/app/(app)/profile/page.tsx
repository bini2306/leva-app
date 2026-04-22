import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { VideoGrid, type GridVideo } from "./video-grid";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

const SIGNED_URL_TTL = 60 * 60;

const ROLE_LABEL: Record<string, string> = {
  player: "Giocatore",
  coach: "Allenatore FIGC",
  scout: "Scout",
};

const POSITION_LABEL: Record<string, string> = {
  portiere: "Portiere",
  difensore: "Difensore",
  centrocampista: "Centrocampista",
  ala: "Ala",
  attaccante: "Attaccante",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const isPlayer = profile.role === "player";

  const [playerProfileRes, videosRes] = await Promise.all([
    isPlayer
      ? supabase
          .from("player_profiles")
          .select("position, city, bio, is_verified")
          .eq("id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    isPlayer
      ? supabase
          .from("videos")
          .select(
            "id, title, video_url, views_count, created_at, is_published"
          )
          .eq("player_id", user.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  const playerProfile = playerProfileRes.data;
  const videos = videosRes.data ?? [];

  let gridVideos: GridVideo[] = [];
  if (videos.length > 0) {
    const { data: signed } = await supabase.storage
      .from("Video")
      .createSignedUrls(
        videos.map((v) => v.video_url),
        SIGNED_URL_TTL
      );

    const urlByPath = new Map(
      (signed ?? [])
        .filter((s) => s.signedUrl)
        .map((s) => [s.path, s.signedUrl])
    );

    gridVideos = videos
      .map((v) => {
        const url = urlByPath.get(v.video_url);
        if (!url) return null;
        return {
          id: v.id,
          title: v.title,
          videoUrl: url,
          views: v.views_count ?? 0,
        };
      })
      .filter((v): v is GridVideo => v !== null);
  }

  const totalViews = videos.reduce((acc, v) => acc + (v.views_count ?? 0), 0);
  const videoCount = videos.length;
  const initial = profile.full_name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-[100dvh] bg-zinc-950 pb-28">
      <header className="flex items-center justify-between px-6 py-5 border-b border-zinc-900">
        <Link
          href="/feed"
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Feed
        </Link>
        <h1 className="text-white font-bold text-lg">Profilo</h1>
        <LogoutButton />
      </header>

      <section className="px-6 py-8 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-black text-3xl font-bold mb-4 overflow-hidden">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>

        <h2 className="text-white text-2xl font-bold">{profile.full_name}</h2>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-zinc-400 text-sm">
            {ROLE_LABEL[profile.role] ?? profile.role}
          </span>
          {isPlayer && playerProfile?.is_verified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 border border-green-500/40 text-green-300 text-xs font-medium rounded-full">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
              </svg>
              Verificato FIGC
            </span>
          )}
        </div>

        {isPlayer && playerProfile && (
          <div className="flex items-center gap-3 mt-2 text-zinc-500 text-sm">
            {playerProfile.position && (
              <span>{POSITION_LABEL[playerProfile.position] ?? playerProfile.position}</span>
            )}
            {playerProfile.position && playerProfile.city && <span>·</span>}
            {playerProfile.city && <span>{playerProfile.city}</span>}
          </div>
        )}

        {isPlayer && playerProfile?.bio && (
          <p className="text-zinc-300 text-sm mt-4 max-w-md whitespace-pre-line">
            {playerProfile.bio}
          </p>
        )}
      </section>

      {isPlayer && (
        <section className="px-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 rounded-xl p-4 text-center">
              <div className="text-white text-2xl font-bold">{videoCount}</div>
              <div className="text-zinc-400 text-xs mt-1">
                {videoCount === 1 ? "Video" : "Video caricati"}
              </div>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 text-center">
              <div className="text-white text-2xl font-bold">
                {formatCount(totalViews)}
              </div>
              <div className="text-zinc-400 text-xs mt-1">Visualizzazioni</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 mb-3">
            <h3 className="text-white font-semibold">I tuoi video</h3>
            <Link
              href="/upload"
              className="text-green-400 text-sm font-medium hover:text-green-300"
            >
              + Nuovo
            </Link>
          </div>

          <VideoGrid videos={gridVideos} />
        </section>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-20 px-6 pb-6 pt-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-around">
        <Link
          href="/feed"
          className="text-zinc-400 hover:text-white transition-colors flex flex-col items-center gap-1 text-xs"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Home
        </Link>
        <Link
          href="/upload"
          className="w-12 h-12 rounded-xl bg-green-500 hover:bg-green-400 text-black flex items-center justify-center transition-colors"
          aria-label="Carica video"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Link>
        <span className="text-green-400 flex flex-col items-center gap-1 text-xs font-medium">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
          </svg>
          Profilo
        </span>
      </nav>
    </div>
  );
}

function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}
