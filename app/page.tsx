"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CheckStatus = "checking" | "connected" | "error";

type CheckState = {
  status: CheckStatus;
  detail: string;
};

// A missing probe function still means PostgREST answered.
const REACHABLE_CODES = new Set(["PGRST202", "PGRST205", "42P01"]);

export default function Home() {
  const [check, setCheck] = useState<CheckState>({
    status: "checking",
    detail: "Contacting Supabase…",
  });

  useEffect(() => {
    let cancelled = false;

    async function checkConnection() {
      try {
        const supabase = createClient();
        const { error } = await supabase.rpc("connection_check");

        if (cancelled) return;

        if (!error || REACHABLE_CODES.has(error.code ?? "")) {
          setCheck({
            status: "connected",
            detail: "The Supabase API responded.",
          });
          return;
        }

        setCheck({ status: "error", detail: error.message });
      } catch (err) {
        if (cancelled) return;
        setCheck({
          status: "error",
          detail:
            err instanceof Error ? err.message : "Could not reach Supabase.",
        });
      }
    }

    void checkConnection();

    return () => {
      cancelled = true;
    };
  }, []);

  const label =
    check.status === "checking"
      ? "Checking"
      : check.status === "connected"
        ? "Connected"
        : "Not connected";

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="w-full max-w-md rounded-2xl border border-black/8 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Supabase
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Connection check
        </h1>
        <div className="mt-6 flex items-center gap-3">
          <span
            className={
              check.status === "connected"
                ? "size-2.5 rounded-full bg-emerald-500"
                : check.status === "error"
                  ? "size-2.5 rounded-full bg-red-500"
                  : "size-2.5 animate-pulse rounded-full bg-amber-400"
            }
            aria-hidden
          />
          <p className="text-base font-medium text-black dark:text-zinc-50">
            {label}
          </p>
        </div>
        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {check.detail}
        </p>
      </main>
    </div>
  );
}
