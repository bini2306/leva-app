import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushToMultiple } from "@/lib/firebase/admin";

// Payload inviato da Supabase Webhook su certification_requests
interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: {
    id: string;
    player_id: string;
    coach_id: string;
    status: "pending" | "approved" | "rejected";
    player_message: string | null;
    rejection_reason: string | null;
  };
  old_record: {
    status: "pending" | "approved" | "rejected";
  } | null;
}

export async function POST(request: NextRequest) {
  // Verifica il secret del webhook per sicurezza
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  const authHeader = request.headers.get("authorization");

  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: WebhookPayload = await request.json();

  // Gestione solo di certification_requests
  if (payload.table !== "certification_requests") {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createClient();
  const { record, old_record, type } = payload;

  // --- INSERT: nuova richiesta → notifica al coach ---
  if (type === "INSERT") {
    const { data: tokens } = await supabase
      .from("fcm_tokens")
      .select("token")
      .eq("user_id", record.coach_id);

    const { data: playerProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", record.player_id)
      .single();

    if (tokens && tokens.length > 0 && playerProfile) {
      await sendPushToMultiple(
        tokens.map((t) => ({
          token: t.token,
          title: "Nuova richiesta di certificazione",
          body: `${playerProfile.full_name} ti ha chiesto di certificare il suo profilo.`,
          data: {
            type: "certification_request",
            request_id: record.id,
            player_id: record.player_id,
          },
        }))
      );
    }
  }

  // --- UPDATE: approvazione o rifiuto → notifica al giocatore ---
  if (
    type === "UPDATE" &&
    old_record?.status === "pending" &&
    (record.status === "approved" || record.status === "rejected")
  ) {
    const { data: tokens } = await supabase
      .from("fcm_tokens")
      .select("token")
      .eq("user_id", record.player_id);

    const { data: coachProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", record.coach_id)
      .single();

    if (tokens && tokens.length > 0 && coachProfile) {
      const isApproved = record.status === "approved";

      await sendPushToMultiple(
        tokens.map((t) => ({
          token: t.token,
          title: isApproved
            ? "Profilo certificato!"
            : "Richiesta di certificazione rifiutata",
          body: isApproved
            ? `${coachProfile.full_name} ha certificato il tuo profilo. Ora hai il badge FIGC!`
            : `${coachProfile.full_name} non ha approvato la tua richiesta.${record.rejection_reason ? ` Motivo: ${record.rejection_reason}` : ""}`,
          data: {
            type: "certification_update",
            status: record.status,
            request_id: record.id,
          },
        }))
      );
    }
  }

  return NextResponse.json({ ok: true });
}
