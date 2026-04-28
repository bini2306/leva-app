"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  completePlayerOnboarding,
  completeCoachOnboarding,
  type OnboardingState,
} from "@/app/actions/onboarding";
import { logout } from "@/app/actions/auth";
import type { UserRole, PlayerPosition, FigcLicenseType } from "@/lib/supabase/types";

const POSITIONS: { value: PlayerPosition; label: string }[] = [
  { value: "portiere", label: "Portiere" },
  { value: "difensore", label: "Difensore" },
  { value: "centrocampista", label: "Centrocampista" },
  { value: "ala", label: "Ala" },
  { value: "attaccante", label: "Attaccante" },
];

const LICENSE_TYPES: { value: FigcLicenseType; label: string }[] = [
  { value: "UEFA A", label: "UEFA A" },
  { value: "UEFA B", label: "UEFA B" },
  { value: "UEFA C", label: "UEFA C" },
  { value: "Patentino", label: "Patentino" },
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 bg-leva-accent hover:bg-leva-accent/80 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors text-base"
    >
      {pending ? "Salvataggio in corso…" : label}
    </button>
  );
}

function PlayerOnboarding() {
  const [state, action] = useActionState<OnboardingState, FormData>(
    completePlayerOnboarding,
    null
  );
  const error = state && "error" in state ? state.error : null;

  return (
    <form action={action} className="space-y-5">
      <div>
        <label
          htmlFor="birth_date"
          className="block text-sm font-medium text-zinc-400 mb-1.5"
        >
          Data di nascita <span className="text-red-400">*</span>
        </label>
        <input
          id="birth_date"
          name="birth_date"
          type="date"
          required
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-leva-accent transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="position"
          className="block text-sm font-medium text-zinc-400 mb-1.5"
        >
          Ruolo in campo <span className="text-red-400">*</span>
        </label>
        <select
          id="position"
          name="position"
          required
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-leva-accent transition-colors appearance-none"
        >
          <option value="">Seleziona ruolo</option>
          {POSITIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="team_name"
          className="block text-sm font-medium text-zinc-400 mb-1.5"
        >
          Squadra attuale
        </label>
        <input
          id="team_name"
          name="team_name"
          type="text"
          placeholder="Es. A.C. Milan Giovanili"
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-leva-accent transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="city"
          className="block text-sm font-medium text-zinc-400 mb-1.5"
        >
          Provincia
        </label>
        <input
          id="city"
          name="city"
          type="text"
          placeholder="Es. Milano"
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-leva-accent transition-colors"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="pt-2">
        <SubmitButton label="Completa profilo" />
      </div>
    </form>
  );
}

function CoachOnboarding() {
  const [state, action] = useActionState<OnboardingState, FormData>(
    completeCoachOnboarding,
    null
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const error = state && "error" in state ? state.error : null;

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) { setPreview(null); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFileError("Formato non supportato. Usa JPG, PNG o WebP.");
      e.target.value = "";
      setPreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("Il file supera i 5MB.");
      e.target.value = "";
      setPreview(null);
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <form action={action} className="space-y-5">
      <div>
        <label
          htmlFor="figc_license_number"
          className="block text-sm font-medium text-zinc-400 mb-1.5"
        >
          Numero licenza FIGC <span className="text-red-400">*</span>
        </label>
        <input
          id="figc_license_number"
          name="figc_license_number"
          type="text"
          required
          placeholder="Es. 123456"
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-leva-accent transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="figc_license_type"
          className="block text-sm font-medium text-zinc-400 mb-1.5"
        >
          Tipo licenza
        </label>
        <select
          id="figc_license_type"
          name="figc_license_type"
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-leva-accent transition-colors appearance-none"
        >
          <option value="">Seleziona tipo</option>
          {LICENSE_TYPES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="team_name"
          className="block text-sm font-medium text-zinc-400 mb-1.5"
        >
          Squadra
        </label>
        <input
          id="team_name"
          name="team_name"
          type="text"
          placeholder="Es. F.C. Juventus Academy"
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-leva-accent transition-colors"
        />
      </div>

      {/* Upload tessera FIGC */}
      <div>
        <p className="block text-sm font-medium text-zinc-400 mb-1.5">
          Foto tessera FIGC{" "}
          <span className="text-zinc-600 font-normal">(facoltativa)</span>
        </p>
        <label
          htmlFor="figc_card"
          className="block cursor-pointer"
        >
          {preview ? (
            <div className="relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Anteprima tessera FIGC"
                className="w-full object-contain max-h-48"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium px-3 py-1.5 rounded-lg bg-black/60">
                  Cambia immagine
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl bg-zinc-900 border-2 border-dashed border-zinc-700 hover:border-leva-accent/50 transition-colors">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-8 h-8 text-zinc-500"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              <p className="text-sm text-zinc-500">Tocca per caricare la tessera FIGC</p>
              <p className="text-xs text-zinc-600">JPG · PNG · WebP · max 5MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            id="figc_card"
            name="figc_card"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            className="sr-only"
          />
        </label>
        {fileError && (
          <p className="text-red-400 text-xs mt-1.5">{fileError}</p>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="pt-2">
        <SubmitButton label="Completa profilo" />
      </div>
    </form>
  );
}

export default function OnboardingClient({ role }: { role: UserRole }) {
  const isPlayer = role === "player";

  return (
    <div className="min-h-screen bg-leva-bg flex flex-col px-6 py-12">
      <div className="mb-8">
        <span className="text-leva-accent font-black text-2xl tracking-tight">
          LEVA
        </span>
        <div className="mt-6">
          <span className="inline-block px-3 py-1 bg-leva-accent/15 text-leva-accent text-xs font-medium rounded-full mb-4">
            {isPlayer ? "Giocatore" : "Allenatore FIGC"}
          </span>
          <h1 className="text-3xl font-bold text-white">Completa il profilo</h1>
          <p className="text-zinc-400 mt-2">
            {isPlayer
              ? "Inserisci i tuoi dati per essere scoperto dagli scout."
              : "Inserisci i dati della tua licenza per certificare i tuoi giocatori."}
          </p>
        </div>
      </div>

      {isPlayer ? <PlayerOnboarding /> : <CoachOnboarding />}

      <p className="mt-8 text-center text-zinc-500 text-sm">
        Account sbagliato?{" "}
        <form action={logout} className="inline">
          <button
            type="submit"
            className="text-leva-accent font-semibold hover:text-leva-accent/80 transition-colors"
          >
            Accedi
          </button>
        </form>
      </p>
    </div>
  );
}
