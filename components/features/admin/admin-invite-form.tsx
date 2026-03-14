"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { inviteUserAction, type AdminInviteActionState } from "@/app/(workspace)/admin/actions";

const initialState: AdminInviteActionState = {
  status: "idle"
};

const roleOptions = [
  {
    value: "patient",
    label: "Patient",
    description: "Creates or links the patient record and unlocks the self-service claims workspace."
  },
  {
    value: "provider",
    label: "Provider (Doctor)",
    description: "Creates provider records and ready cases tied to clinical workflows."
  },
  {
    value: "case_manager",
    label: "Case manager",
    description: "Seeds outreach, affordability, and prior auth queues for this collaborator."
  },
  {
    value: "staff",
    label: "Staff",
    description: "General workspace collaborator with read-only visibility."
  }
] as const;

type RoleValue = (typeof roleOptions)[number]["value"];

export function AdminInviteForm() {
  const [selectedRole, setSelectedRole] = useState<RoleValue>("provider");
  const [actionState, formAction, isPending] = useActionState(inviteUserAction, initialState);
  const roleDescription = roleOptions.find((option) => option.value === selectedRole)?.description;

  return (
    <Card className="rounded-[36px] border border-slate-100 bg-white/80 p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900/70">
      <span className="eyebrow">Invite collaborator</span>
      <h2 className="mt-3 font-display text-3xl tracking-tight text-slate-900 dark:text-white">
        Add patients, providers, case managers, or staff
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
        Only admins can invite new workspace members. Select the role, enter the credentials, and the system
        automatically seeds the supporting records for their workflows.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="form-field">
            <label htmlFor="role">Role</label>
            <Select
              id="role"
              name="role"
              className="border register-field"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value as RoleValue)}
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="form-field">
            <label htmlFor="fullName">Full name</label>
            <Input id="fullName" name="fullName" placeholder="Jordan Lee" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <Input id="email" name="email" placeholder="name@northstar.test" type="email" />
          </div>
          <div className="form-field">
            <label htmlFor="password">Temporary password</label>
            <Input id="password" name="password" type="password" placeholder="Provider1!" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="form-field">
            <label htmlFor="phone">Phone</label>
            <Input id="phone" name="phone" placeholder="(555) 100-1002" />
          </div>
        </div>

        {selectedRole === "provider" ? (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="form-field">
              <label htmlFor="practiceName">Practice name</label>
              <Input id="practiceName" name="practiceName" placeholder="Lakeview Respiratory Partners" />
            </div>
            <div className="form-field">
              <label htmlFor="specialty">Specialty</label>
              <Input id="specialty" name="specialty" placeholder="Pulmonology" />
            </div>
            <div className="form-field">
              <label htmlFor="providerNpi">NPI</label>
              <Input id="providerNpi" name="providerNpi" placeholder="1234567890" />
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-500">
          {roleDescription}
        </div>

        {actionState.message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              actionState.status === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {actionState.message}
          </div>
        ) : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Inviting collaborator..." : "Invite to workspace"}
        </Button>
      </form>
    </Card>
  );
}
