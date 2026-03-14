"use client";

import { useActionState } from "react";
import { submitPatientRegistrationAction } from "@/app/intake/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supportNeedOptions } from "@/types/intake";
import type { IntakeActionState } from "@/types/intake";

const initialState: IntakeActionState = {
  status: "idle"
};

export function PatientRegistrationForm() {
  const [state, formAction, isPending] = useActionState(
    submitPatientRegistrationAction,
    initialState
  );

  return (
    <Card className="rounded-[36px] border border-slate-200 bg-white/80 p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900/70">
      <span className="eyebrow">Patient registration</span>
      <h2 className="mt-3 font-display text-4xl text-slate-950 dark:text-white">
        Capture the next therapy start inside your workspace
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
        After signing in, this form routes new patients, prescriptions, and cases directly
        into your organization queue.
      </p>

      <form action={formAction} className="mt-8 space-y-6">
        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="patientFullName">Patient full name</label>
            <Input id="patientFullName" name="patientFullName" placeholder="Ava Thompson" />
          </div>
          <div className="form-field">
            <label htmlFor="therapyArea">Therapy area</label>
            <Input id="therapyArea" name="therapyArea" placeholder="Immunology" />
          </div>
          <div className="form-field">
            <label htmlFor="medicationName">Medication</label>
            <Input id="medicationName" name="medicationName" placeholder="Dupixent" />
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="providerName">Provider name</label>
            <Input id="providerName" name="providerName" placeholder="Dr. Priya Patel" />
          </div>
          <div className="form-field">
            <label htmlFor="providerNpi">Provider NPI</label>
            <Input id="providerNpi" name="providerNpi" placeholder="1234567890" />
          </div>
          <div className="form-field">
            <label htmlFor="payerName">Payer</label>
            <Input id="payerName" name="payerName" placeholder="Blue Cross Blue Shield" />
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="planName">Plan name</label>
            <Input id="planName" name="planName" placeholder="PPO Gold 3500" />
          </div>
          <div className="form-field">
            <label htmlFor="memberId">Member ID</label>
            <Input id="memberId" name="memberId" placeholder="BCBS-44391" />
          </div>
          <div className="form-field">
            <label htmlFor="priority">Case priority</label>
            <Select id="priority" name="priority" defaultValue="watch">
              <option value="critical">Critical</option>
              <option value="watch">Watch</option>
              <option value="routine">Routine</option>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            Support needs
          </span>
          <div className="flex flex-wrap gap-2">
            {supportNeedOptions.map((option) => (
              <label
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
                key={option}
              >
                <input name="supportNeeds" type="checkbox" value={option} />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="notes">Coordinator notes</label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Document urgency, barriers, or required documentation."
          />
        </div>

        {state.message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              state.status === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {state.message}
            {state.reference ? ` Case: ${state.reference}` : null}
          </div>
        ) : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Registering patient..." : "Register patient"}
        </Button>
      </form>
    </Card>
  );
}
