"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  completePlayerOnboarding,
  completeCoachOnboarding,
  type OnboardingState,
} from "@/app/actions/onboarding";
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
      className="w-full py-3.5 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors text-base"
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
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-colors"
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
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-colors appearance-none"
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
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
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
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
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
  const error = state && "error" in state ? state.error : null;

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
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
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
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-colors appearance-none"
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
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
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

export default function OnboardingClient({ role }: { role: UserRole }) {
  const isPlayer = role === "player";

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col px-6 py-12">
      <div className="mb-8">
        <span className="text-green-500 font-black text-2xl tracking-tight">
          LEVA
        </span>
        <div className="mt-6">
          <span className="inline-block px-3 py-1 bg-green-500/15 text-green-400 text-xs font-medium rounded-full mb-4">
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
    </div>
  );
}
