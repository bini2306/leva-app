"use client";

import { useState, useTransition } from "react";
import {
  searchCoaches,
  requestCertification,
  cancelRequest,
  type CoachResult,
} from "@/app/actions/certification";

type ExistingRequest = {
  id: string;
  coach_id: string;
  status: "pending" | "approved" | "rejected";
  player_message: string | null;
  rejection_reason: string | null;
  requested_at: string;
  reviewed_at: string | null;
};

type Props = {
  existingRequest: ExistingRequest | null;
  coachInfo: {
    fullName: string;
    licenseNumber: string | null;
    teamName: string | null;
  } | null;
};

export function CertifyClient({ existingRequest, coachInfo }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CoachResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<CoachResult | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const onSearch = async (q: string) => {
    setQuery(q);
    setError(null);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await searchCoaches(q);
      setResults(res);
    } catch {
      setError("Errore nella ricerca");
    } finally {
      setSearching(false);
    }
  };

  const onSubmitRequest = () => {
    if (!selectedCoach) return;
    setError(null);
    startTransition(async () => {
      const res = await requestCertification(
        selectedCoach.id,
        message.trim() || null
      );
      if ("error" in res) {
        setError(res.error);
      } else {
        setSelectedCoach(null);
        setMessage("");
      }
    });
  };

  const onCancel = () => {
    setError(null);
    startTransition(async () => {
      const res = await cancelRequest();
      if ("error" in res) setError(res.error);
    });
  };

  if (existingRequest) {
    return (
      <div className="px-6 py-8 space-y-5">
        <StatusCard
          status={existingRequest.status}
          coachName={coachInfo?.fullName ?? "Coach"}
          licenseNumber={coachInfo?.licenseNumber ?? null}
          teamName={coachInfo?.teamName ?? null}
          playerMessage={existingRequest.player_message}
          rejectionReason={existingRequest.rejection_reason}
        />

        {existingRequest.status !== "approved" && (
          <button
            onClick={onCancel}
            disabled={isPending}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-red-400 font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {isPending
              ? "…"
              : existingRequest.status === "pending"
              ? "Annulla richiesta"
              : "Rimuovi e invia una nuova richiesta"}
          </button>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (selectedCoach) {
    return (
      <div className="px-6 py-8 space-y-5">
        <div className="bg-zinc-900 rounded-2xl p-5">
          <p className="text-zinc-400 text-xs uppercase tracking-wide mb-2">
            Richiedi a
          </p>
          <h2 className="text-white text-xl font-bold">
            {selectedCoach.fullName}
          </h2>
          <CoachMeta coach={selectedCoach} />
        </div>

        <div>
          <label
            htmlFor="msg"
            className="block text-sm font-medium text-zinc-400 mb-1.5"
          >
            Messaggio{" "}
            <span className="text-zinc-600 font-normal">(facoltativo)</span>
          </label>
          <textarea
            id="msg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Presentati al coach: età, posizione, squadra attuale…"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setSelectedCoach(null)}
            disabled={isPending}
            className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Indietro
          </button>
          <button
            onClick={onSubmitRequest}
            disabled={isPending}
            className="flex-1 py-3 bg-green-500 hover:bg-green-400 disabled:opacity-40 text-black font-bold rounded-xl transition-colors"
          >
            {isPending ? "Invio…" : "Invia richiesta"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-5">
      <p className="text-zinc-400 text-sm">
        Per verificare il tuo profilo, cerca il tuo allenatore FIGC e
        invia la richiesta di certificazione.
      </p>

      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Nome o numero licenza FIGC"
          className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
          autoFocus
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="space-y-2">
        {searching && query.length >= 2 && (
          <p className="text-zinc-500 text-sm text-center py-4">Ricerca…</p>
        )}

        {!searching && query.length >= 2 && results.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-4">
            Nessun coach trovato per &ldquo;{query}&rdquo;
          </p>
        )}

        {results.map((coach) => (
          <button
            key={coach.id}
            onClick={() => setSelectedCoach(coach)}
            className="w-full text-left bg-zinc-900 hover:bg-zinc-800 rounded-xl p-4 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">
                  {coach.fullName}
                </p>
                <CoachMeta coach={coach} />
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5 text-zinc-500 shrink-0"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CoachMeta({ coach }: { coach: CoachResult }) {
  const parts = [
    coach.licenseType,
    coach.licenseNumber ? `N° ${coach.licenseNumber}` : null,
    coach.teamName,
    coach.city,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <p className="text-zinc-500 text-xs mt-1 truncate">{parts.join(" · ")}</p>
  );
}

function StatusCard({
  status,
  coachName,
  licenseNumber,
  teamName,
  playerMessage,
  rejectionReason,
}: {
  status: "pending" | "approved" | "rejected";
  coachName: string;
  licenseNumber: string | null;
  teamName: string | null;
  playerMessage: string | null;
  rejectionReason: string | null;
}) {
  const config = {
    pending: {
      card: "bg-amber-500/10 border-amber-500/30",
      dot: "bg-amber-400",
      text: "text-amber-300",
      title: "In attesa di risposta",
      hint: "Il coach riceverà una notifica. Appena risponde, il tuo profilo verrà aggiornato.",
    },
    approved: {
      card: "bg-green-500/10 border-green-500/30",
      dot: "bg-green-400",
      text: "text-green-300",
      title: "Profilo verificato",
      hint: "Il tuo profilo è stato certificato dal coach. Ora comparirà col badge FIGC agli scout.",
    },
    rejected: {
      card: "bg-red-500/10 border-red-500/30",
      dot: "bg-red-400",
      text: "text-red-300",
      title: "Richiesta rifiutata",
      hint: "Puoi rimuovere questa richiesta e inviarne una nuova a un altro coach.",
    },
  }[status];

  return (
    <div
      className={`${config.card} border rounded-2xl p-5 space-y-3`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`}
        />
        <p className={`${config.text} text-sm font-semibold uppercase tracking-wide`}>
          {config.title}
        </p>
      </div>

      <div>
        <p className="text-white text-lg font-bold">{coachName}</p>
        {(licenseNumber || teamName) && (
          <p className="text-zinc-400 text-xs mt-1">
            {[licenseNumber ? `N° ${licenseNumber}` : null, teamName]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>

      {playerMessage && (
        <div className="bg-black/30 rounded-lg p-3">
          <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">
            Il tuo messaggio
          </p>
          <p className="text-zinc-200 text-sm whitespace-pre-line">
            {playerMessage}
          </p>
        </div>
      )}

      {status === "rejected" && rejectionReason && (
        <div className="bg-black/30 rounded-lg p-3">
          <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">
            Motivazione
          </p>
          <p className="text-zinc-200 text-sm whitespace-pre-line">
            {rejectionReason}
          </p>
        </div>
      )}

      <p className="text-zinc-400 text-xs pt-1">{config.hint}</p>
    </div>
  );
}
