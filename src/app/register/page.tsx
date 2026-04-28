"use client";
import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg text-lg" style={{ background: "var(--sidebar-primary)" }}>
            HA
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">Join HuskyADAPT</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Create your team account</p>
          </div>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              required
              placeholder="Alex Chen"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/50 transition"
            />
            {state?.errors?.name && <p className="text-xs text-destructive">{state.errors.name}</p>}
          </div>
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
            {state?.errors?.email && <p className="text-xs text-destructive">{state.errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="role">Role</label>
            <input
              id="role"
              name="role"
              placeholder="Mechanical Lead"
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
              placeholder="Min. 8 characters"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/50 transition"
            />
            {state?.errors?.password && <p className="text-xs text-destructive">{state.errors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-60"
            style={{ background: "var(--primary)" }}
          >
            <UserPlus className="size-4" />
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-medium underline underline-offset-2" style={{ color: "var(--primary)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
