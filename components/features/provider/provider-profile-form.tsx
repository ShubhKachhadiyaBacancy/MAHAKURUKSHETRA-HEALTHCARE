"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProviderProfileSnapshot } from "@/types/provider";

type ProviderProfileFormProps = {
  snapshot: ProviderProfileSnapshot;
};

export function ProviderProfileForm({ snapshot }: ProviderProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(snapshot.fullName);
  const [phone, setPhone] = useState(snapshot.phone);
  const [title, setTitle] = useState(snapshot.title);
  const [practiceName, setPracticeName] = useState(snapshot.practiceName);
  const [specialty, setSpecialty] = useState(snapshot.specialty);
  const [npi, setNpi] = useState(snapshot.npi);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/provider/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          phone,
          title,
          practiceName,
          specialty,
          npi
        })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to update profile.");
      }

      setMessage("Doctor profile updated successfully.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.88fr_minmax(0,1.12fr)]">
      <Card className="space-y-5 p-6">
        <div>
          <span className="eyebrow">Doctor profile</span>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
            Identity overview
          </h2>
        </div>

        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <InfoBlock label="Organization" value={snapshot.organizationName} />
          <InfoBlock label="Role" value={snapshot.roleLabel} />
          <InfoBlock label="Email" value={snapshot.email || "Email pending"} />
          <InfoBlock label="Practice" value={snapshot.practiceName || "Practice pending"} />
          <InfoBlock label="Specialty" value={snapshot.specialty || "Specialty pending"} />
          <InfoBlock label="NPI" value={snapshot.npi || "NPI pending"} />
        </div>
      </Card>

      <Card className="space-y-6 p-6">
        <div>
          <span className="eyebrow">Update details</span>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
            Keep doctor information current
          </h2>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="form-field">
            <label htmlFor="fullName">Full name</label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div className="detail-grid">
            <div className="form-field">
              <label htmlFor="title">Title</label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="phone">Phone</label>
              <Input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
          </div>

          <div className="detail-grid">
            <div className="form-field">
              <label htmlFor="practiceName">Practice</label>
              <Input
                id="practiceName"
                value={practiceName}
                onChange={(event) => setPracticeName(event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="specialty">Specialty</label>
              <Input
                id="specialty"
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="npi">NPI</label>
            <Input id="npi" value={npi} onChange={(event) => setNpi(event.target.value)} />
          </div>

          {message ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
              {message}
            </div>
          ) : null}

          <Button disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-base font-medium text-slate-950 dark:text-white">
        {value}
      </div>
    </div>
  );
}
