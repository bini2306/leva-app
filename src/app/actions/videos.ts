"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type UploadState = { error: string } | { success: true } | null;

export async function uploadVideo(
  _prevState: UploadState,
  formData: FormData
): Promise<UploadState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };

  const file = formData.get("video") as File;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;

  if (!file || file.size === 0) return { error: "Seleziona un video" };
  if (!title?.trim()) return { error: "Il titolo è obbligatorio" };
  if (file.size > 100 * 1024 * 1024)
    return { error: "Il video supera i 100MB" };

  const ext = file.name.split(".").pop() || "mp4";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[uploadVideo] storage error:", uploadError);
    return { error: `Caricamento fallito: ${uploadError.message}` };
  }

  const { error: insertError } = await supabase.from("videos").insert({
    player_id: user.id,
    title: title.trim(),
    description,
    video_url: path,
  });

  if (insertError) {
    console.error("[uploadVideo] insert error:", insertError);
    await supabase.storage.from("videos").remove([path]);
    return { error: `DB error: ${insertError.message}` };
  }

  revalidatePath("/feed");
  redirect("/feed");
}

export async function getSignedVideoUrl(path: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("videos")
    .createSignedUrl(path, 3600);

  if (error) {
    console.error("[getSignedVideoUrl] error:", error);
    return null;
  }
  return data.signedUrl;
}
