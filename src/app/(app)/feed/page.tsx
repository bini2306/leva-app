import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FeedClient, type FeedVideo } from "./feed-client";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const enriched: FeedVideo[] = [];

  for (const v of videos ?? []) {
    const [{ data: profile }, { data: playerProfile }, { data: signed }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", v.player_id).single(),
        supabase
          .from("player_profiles")
          .select("*")
          .eq("id", v.player_id)
          .single(),
        supabase.storage.from("videos").createSignedUrl(v.video_url, 3600),
      ]);

    if (!signed?.signedUrl) continue;

    enriched.push({
      id: v.id,
      title: v.title,
      description: v.description,
      videoUrl: signed.signedUrl,
      playerName: profile?.full_name ?? "giocatore",
      isVerified: playerProfile?.is_verified ?? false,
    });
  }

  return <FeedClient videos={enriched} />;
}
