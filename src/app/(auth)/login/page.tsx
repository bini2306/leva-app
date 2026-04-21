"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import type { AuthState } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3.5 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors text-base"
    >
      {pending ? "Accesso in corso…" : "Accedi"}
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useActionState<AuthState, FormData>(login, null);
  const error = state && "error" in state ? state.error : null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center px-6 py-12">
      <div className="mb-10">
        <span className="text-green-500 font-black text-2xl tracking-tight">
          LEVA
        </span>
        <h1 className="text-3xl font-bold text-white mt-6">Bentornato</h1>
        <p className="text-zinc-400 mt-2">Accedi al tuo account</p>
      </div>

      <form action={action} className="space-y-4">
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
            autoComplete="current-password"
            placeholder="••••••••"
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
        Non hai un account?{" "}
        <Link
          href="/signup"
          className="text-green-400 font-semibold hover:text-green-300 transition-colors"
        >
          Registrati
        </Link>
      </p>
    </div>
  );
}
