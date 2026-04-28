"use client";
import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { BookOpen, LogIn } from "lucide-react";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg text-lg" style={{ background: "var(--sidebar-primary)" }}>
            HA
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">HuskyADAPT Engineering OS</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Sign in to your account</p>
          </div>
        </div>

        <form action={action} className="space-y-4">
          {state?.errors?.form && (
            <p className="text-sm text-destructive text-center bg-destructive/10 rounded-lg px-3 py-2">{state.errors.form}</p>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="alex@uw.edu"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/50 transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/50 transition"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-60"
            style={{ background: "var(--primary)" }}
          >
            <LogIn className="size-4" />
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          No account?{" "}
          <Link href="/register" className="font-medium underline underline-offset-2" style={{ color: "var(--primary)" }}>
            Register here
          </Link>
        </p>

        <div className="flex items-center justify-center gap-1.5 mt-8 text-xs text-muted-foreground/50">
          <BookOpen className="size-3" />
          <span>Handbook Copilot available after sign-in</span>
        </div>
      </div>
    </div>
  );
}
