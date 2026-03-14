"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type RegisterActionState } from "@/app/register/actions";
import { registerRoleDetails, type RegisterRole } from "@/lib/auth/register";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState: RegisterActionState = {
  status: "idle"
};

export function RegisterForm() {
  const selectedRole: RegisterRole = "admin";
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const roleDetail = registerRoleDetails[selectedRole];

  return (
    <Card className="register-card register-surface relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
      <span className="eyebrow register-kicker">External registration</span>
      <h1 className="register-heading mt-3 max-w-xl font-display text-4xl tracking-tight sm:text-5xl">
        Create your admin workspace.
      </h1>
      <p className="register-body mt-4 max-w-2xl text-sm leading-7 sm:text-base">
        This form creates the first admin who owns the organization. After signing
        in, invite other collaborators from the workspace admin console. Providers,
        case managers, and staff gain access through the admin pathway only.
      </p>

      <div className="register-subtle-surface mt-6 rounded-[28px] p-5">
        <div className="register-kicker text-[11px] uppercase tracking-[0.28em]">
          Admin access
        </div>
        <div className="register-heading mt-2 font-display text-2xl tracking-tight">
          {roleDetail.label}
        </div>
        <p className="register-body mt-2 text-sm leading-7">{roleDetail.description}</p>
      </div>

      <form action={formAction} className="mt-8 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="form-field">
            <label className="register-field-label text-sm font-medium" htmlFor="fullName">
              Full name
            </label>
            <Input className="register-field" id="fullName" name="fullName" placeholder="Maya Chen" />
          </div>

          <div className="form-field">
            <label className="register-field-label text-sm font-medium" htmlFor="organizationName">
              Organization
            </label>
            <Input
              className="register-field"
              id="organizationName"
              name="organizationName"
              placeholder="Northstar Specialty Care"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="form-field">
            <label className="register-field-label text-sm font-medium" htmlFor="phone">
              Phone
            </label>
            <Input
              className="register-field"
              id="phone"
              name="phone"
              placeholder="(555) 100-1001"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="form-field">
            <label className="register-field-label text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              className="register-field"
              id="email"
              name="email"
              placeholder="name@clinic.com"
              type="email"
            />
          </div>

          <div className="form-field">
            <label className="register-field-label text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input className="register-field" id="password" name="password" type="password" />
          </div>
        </div>

        {state.message ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.message}
          </div>
        ) : null}

        <div className="register-divider flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="register-body text-sm leading-7">
            Already provisioned?{" "}
            <Link className="register-link font-medium underline" href="/login">
              Sign in here
            </Link>
            .
          </div>

          <Button className="w-full sm:w-auto" disabled={isPending} type="submit">
            {isPending ? "Creating admin workspace..." : "Create admin account"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
