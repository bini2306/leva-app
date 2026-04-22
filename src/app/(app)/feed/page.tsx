import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FeedClient, type FeedVideo } from "./feed-client";

export const dynamic = "force-dynamic";

const SIGNED_URL_TTL = 60 * 60;

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: videos } = await supabase
    .from("videos")
    .select("id, title, description, video_url, player_id, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!videos || videos.length === 0) {
    return <FeedClient videos={[]} />;
  }

  const playerIds = Array.from(new Set(videos.map((v) => v.player_id)));

  const [{ data: profiles }, { data: playerProfiles }, signedUrlsResult] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", playerIds),
      supabase
        .from("player_profiles")
        .select("id, is_verified")
        .in("id", playerIds),
      supabase.storage
        .from("Video")
        .createSignedUrls(
          videos.map((v) => v.video_url),
          SIGNED_URL_TTL
        ),
    ]);

  const profileByUser = new Map(
    (profiles ?? []).map((p) => [p.id, p])
  );
  const playerByUser = new Map(
    (playerProfiles ?? []).map((p) => [p.id, p])
  );
  const signedByPath = new Map(
    (signedUrlsResult.data ?? [])
      .filter((s) => s.signedUrl)
      .map((s) => [s.path, s.signedUrl])
  );

  const enriched: FeedVideo[] = videos
    .map((v) => {
      const signedUrl = signedByPath.get(v.video_url);
      if (!signedUrl) return null;
      return {
        id: v.id,
        title: v.title,
        description: v.description,
        videoUrl: signedUrl,
        playerName: profileByUser.get(v.player_id)?.full_name ?? "giocatore",
        isVerified: playerByUser.get(v.player_id)?.is_verified ?? false,
      };
    })
    .filter((v): v is FeedVideo => v !== null);

  return <FeedClient videos={enriched} />;
}
