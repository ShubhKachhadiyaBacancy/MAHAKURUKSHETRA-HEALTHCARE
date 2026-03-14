"use client";

import type { Route } from "next";
import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type LoginActionState } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState: LoginActionState = {
  status: "idle"
};

export function LoginForm() {
  const contactRoute = "/contactus" as Route;
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <Card className="max-w-md p-6 sm:p-8">
      <span className="eyebrow">Provider sign in</span>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-slate-950">
        Access the workspace
      </h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Sign in with an existing workspace account to open live case data. If you
        still need one, use the registration flow to create an organization and
        seed the workspace automatically.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div className="form-field">
          <label className="text-sm font-medium text-slate-800" htmlFor="email">
            Email
          </label>
          <Input id="email" name="email" placeholder="name@clinic.com" type="email" />
        </div>

        <div className="form-field">
          <label className="text-sm font-medium text-slate-800" htmlFor="password">
            Password
          </label>
          <Input id="password" name="password" type="password" />
        </div>

        {state.message ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.message}
          </div>
        ) : null}

        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Signing in..." : "Sign in"}
        </Button>

        <p className="text-center text-sm leading-7 text-slate-600">
          Need a new account?{" "}
          <Link className="font-medium text-slate-900 underline" href="/register">
            Register here
          </Link>
          .{" "}
          <Link className="font-medium text-slate-900 underline" href={contactRoute}>
            Contact support
          </Link>
          .
        </p>
      </form>
    </Card>
  );
}
