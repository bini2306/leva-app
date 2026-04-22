"use client";

import { useTransition } from "react";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="text-zinc-400 hover:text-red-400 transition-colors text-sm disabled:opacity-50"
    >
      {isPending ? "…" : "Esci"}
    </button>
  );
}
