"use client";

import { useState, useTransition } from "react";
import {
  approveRequest,
  rejectRequest,
} from "@/app/actions/certification";

type Props = {
  requestId: string;
  playerName: string;
  avatarUrl: string | null;
  message: string | null;
  requestedAt: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  status: "pending" | "approved" | "rejected";
};

export function RequestCard({
  requestId,
  playerName,
  avatarUrl,
  message,
  requestedAt,
  reviewedAt,
  rejectionReason,
  status,
}: Props) {
  const [mode, setMode] = useState<"idle" | "rejecting">("idle");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const initial = playerName?.[0]?.toUpperCase() ?? "?";

  const onApprove = () => {
    setError(null);
    startTransition(async () => {
      const res = await approveRequest(requestId);
      if ("error" in res) setError(res.error);
    });
  };

  const onReject = () => {
    setError(null);
    startTransition(async () => {
      const res = await rejectRequest(requestId, reason.trim() || null);
      if ("error" in res) setError(res.error);
    });
  };

  return (
    <div className="bg-zinc-900 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-black font-bold overflow-hidden shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={playerName} className="w-full h-full object-cover" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-white font-semibold truncate">{playerName}</p>
          <p className="text-zinc-500 text-xs mt-0.5">
            {formatDate(requestedAt)}
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      {message && (
        <div className="bg-black/30 rounded-lg p-3">
          <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">
            Messaggio
          </p>
          <p className="text-zinc-200 text-sm whitespace-pre-line">
            {message}
          </p>
        </div>
      )}

      {status === "rejected" && rejectionReason && (
        <div className="bg-black/30 rounded-lg p-3">
          <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">
            Motivazione rifiuto
          </p>
          <p className="text-zinc-200 text-sm whitespace-pre-line">
            {rejectionReason}
          </p>
        </div>
      )}

      {status !== "pending" && reviewedAt && (
        <p className="text-zinc-500 text-xs">
          Valutata il {formatDate(reviewedAt)}
        </p>
      )}

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {status === "pending" && mode === "idle" && (
        <div className="flex gap-2">
          <button
            onClick={() => setMode("rejecting")}
            disabled={isPending}
            className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-red-400 font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Rifiuta
          </button>
          <button
            onClick={onApprove}
            disabled={isPending}
            className="flex-1 py-2.5 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-bold rounded-xl transition-colors"
          >
            {isPending ? "…" : "Approva"}
          </button>
        </div>
      )}

      {status === "pending" && mode === "rejecting" && (
        <div className="space-y-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            maxLength={300}
            placeholder="Motivazione (facoltativa)"
            className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-500 transition-colors text-sm resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode("idle");
                setReason("");
              }}
              disabled={isPending}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              onClick={onReject}
              disabled={isPending}
              className="flex-1 py-2.5 bg-red-500 hover:bg-red-400 disabled:opacity-40 text-white font-bold rounded-xl transition-colors"
            >
              {isPending ? "…" : "Conferma rifiuto"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: "pending" | "approved" | "rejected" }) {
  const config = {
    pending: { label: "In attesa", cls: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    approved: { label: "Approvata", cls: "bg-green-500/20 text-green-300 border-green-500/30" },
    rejected: { label: "Rifiutata", cls: "bg-red-500/20 text-red-300 border-red-500/30" },
  }[status];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${config.cls}`}>
      {config.label}
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
