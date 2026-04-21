"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveVideoRecord(input: {
  path: string;
  title: string;
  description: string | null;
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autenticato" };

  const title = input.title.trim();
  if (!title) return { error: "Il titolo è obbligatorio" };
  if (!input.path.startsWith(`${user.id}/`)) {
    return { error: "Percorso non valido" };
  }

  const { error } = await supabase.from("videos").insert({
    player_id: user.id,
    title,
    description: input.description,
    video_url: input.path,
  });

  if (error) {
    console.error("[saveVideoRecord] insert error:", error);
    await supabase.storage.from("videos").remove([input.path]);
    return { error: `DB error: ${error.message}` };
  }

  revalidatePath("/feed");
  return { success: true };
}
