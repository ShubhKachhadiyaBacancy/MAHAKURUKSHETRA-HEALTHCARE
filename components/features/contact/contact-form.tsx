"use client";

import { useActionState } from "react";
import {
  sendContactMessageAction,
  type ContactActionState
} from "@/app/contactus/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: ContactActionState = {
  status: "idle"
};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    sendContactMessageAction,
    initialState
  );

  const isSuccess = state.status === "success";

  return (
    <Card className="relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/50 to-transparent" />
      <span className="eyebrow">Contact us</span>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-slate-950">
        Send a note before you sign in
      </h1>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        Use this form for onboarding questions, access issues, or implementation
        requests. Messages are routed to the team inbox immediately.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="form-field">
            <label className="text-sm font-medium text-slate-800" htmlFor="name">
              Full name
            </label>
            <Input id="name" name="name" placeholder="Aarav Patel" type="text" />
          </div>

          <div className="form-field">
            <label className="text-sm font-medium text-slate-800" htmlFor="email">
              Work email
            </label>
            <Input
              id="email"
              name="email"
              placeholder="name@clinic.com"
              type="email"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="form-field">
            <label
              className="text-sm font-medium text-slate-800"
              htmlFor="organization"
            >
              Organization
            </label>
            <Input
              id="organization"
              name="organization"
              placeholder="Specialty therapy team"
              type="text"
            />
          </div>

          <div className="form-field">
            <label className="text-sm font-medium text-slate-800" htmlFor="subject">
              Subject
            </label>
            <Input
              id="subject"
              name="subject"
              placeholder="Need help with onboarding"
              type="text"
            />
          </div>
        </div>

        <div className="hidden">
          <label htmlFor="website">Website</label>
          <Input
            autoComplete="off"
            id="website"
            name="website"
            tabIndex={-1}
            type="text"
          />
        </div>

        <div className="form-field">
          <label className="text-sm font-medium text-slate-800" htmlFor="message">
            Message
          </label>
          <Textarea
            id="message"
            name="message"
            placeholder="Tell us what you need from the team."
          />
        </div>

        {state.message ? (
          <div
            className={
              isSuccess
                ? "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                : "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            }
          >
            {state.message}
          </div>
        ) : null}

        <Button className="w-full sm:w-auto" disabled={isPending} type="submit">
          {isPending ? "Sending..." : "Send message"}
        </Button>
      </form>
    </Card>
  );
}
