"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signup } from "@/app/actions/auth";
import type { AuthState } from "@/app/actions/auth";
import type { UserRole } from "@/lib/supabase/types";

const ROLES: {
  value: UserRole;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "player",
    label: "Giocatore",
    subtitle: "Ho 14-18 anni e voglio farmi notare dagli scout",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <circle cx="12" cy="8" r="3.5" />
        <path strokeLinecap="round" d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" />
      </svg>
    ),
  },
  {
    value: "coach",
    label: "Allenatore FIGC",
    subtitle: "Ho una licenza FIGC e voglio certificare i miei giocatori",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
      </svg>
    ),
  },
  {
    value: "scout",
    label: "Scout",
    subtitle: "Cerco talenti verificati nel calcio giovanile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors text-base"
    >
      {pending ? "Registrazione in corso…" : "Crea account"}
    </button>
  );
}

function RoleSelection({ onSelect }: { onSelect: (role: UserRole) => void }) {
  const [selected, setSelected] = useState<UserRole | null>(null);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col px-6 py-12">
      <div className="mb-8">
        <span className="text-green-500 font-black text-2xl tracking-tight">
          LEVA
        </span>
        <h1 className="text-3xl font-bold text-white mt-6">Chi sei?</h1>
        <p className="text-zinc-400 mt-2">Scegli il tuo ruolo per iniziare</p>
      </div>

      <div className="space-y-3 flex-1">
        {ROLES.map((role) => {
          const isSelected = selected === role.value;
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelected(role.value)}
              className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${
                isSelected
                  ? "border-green-500 bg-green-500/10"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
              }`}
            >
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-green-500 text-black"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {role.icon}
              </div>
              <div>
                <p
                  className={`font-semibold ${isSelected ? "text-white" : "text-zinc-200"}`}
                >
                  {role.label}
                </p>
                <p className="text-sm text-zinc-400 mt-0.5">{role.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-4">
        <button
          type="button"
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
          className="w-full py-3.5 bg-green-500 hover:bg-green-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors text-base"
        >
          Continua
        </button>

        <p className="text-center text-zinc-400 text-sm">
          Hai già un account?{" "}
          <Link
            href="/login"
            className="text-green-400 font-semibold hover:text-green-300 transition-colors"
          >
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}

function SignupForm({
  role,
  onBack,
  state,
  action,
}: {
  role: UserRole;
  onBack: () => void;
  state: AuthState;
  action: (payload: FormData) => void;
}) {
  const roleLabel = ROLES.find((r) => r.value === role)?.label ?? role;
  const error = state && "error" in state ? state.error : null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col px-6 py-12">
      <div className="mb-8">
        <button
          type="button"
          onClick={onBack}
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm mb-6"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Cambia ruolo
        </button>

        <span className="text-green-500 font-black text-2xl tracking-tight">
          LEVA
        </span>
        <h1 className="text-3xl font-bold text-white mt-6">Crea account</h1>
        <p className="text-zinc-400 mt-2">
          Registrati come{" "}
          <span className="text-green-400 font-medium">{roleLabel}</span>
        </p>
      </div>

      <form action={action} className="space-y-4">
        <input type="hidden" name="role" value={role} />

        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-zinc-400 mb-1.5"
          >
            Nome e cognome
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            autoComplete="name"
            placeholder="Mario Rossi"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-zinc-400 mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="la-tua@email.com"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-zinc-400 mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Minimo 8 caratteri"
            minLength={8}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="pt-2">
          <SubmitButton />
        </div>
      </form>

      <p className="mt-8 text-center text-zinc-400 text-sm">
        Hai già un account?{" "}
        <Link
          href="/login"
          className="text-green-400 font-semibold hover:text-green-300 transition-colors"
        >
          Accedi
        </Link>
      </p>
    </div>
  );
}

function CheckEmail() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-6 text-center">
      <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-green-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">Controlla la tua email</h1>
      <p className="text-zinc-400 max-w-xs">
        Ti abbiamo inviato un link di conferma. Clicca sul link per attivare il
        tuo account Leva.
      </p>
      <Link
        href="/login"
        className="mt-8 text-green-400 font-semibold hover:text-green-300 transition-colors text-sm"
      >
        Torna al login
      </Link>
    </div>
  );
}

export default function SignupPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [state, action] = useActionState<AuthState, FormData>(signup, null);

  if (state && "success" in state) {
    return <CheckEmail />;
  }

  if (!role) {
    return <RoleSelection onSelect={setRole} />;
  }

  return (
    <SignupForm
      role={role}
      onBack={() => setRole(null)}
      state={state}
      action={action}
    />
  );
}
