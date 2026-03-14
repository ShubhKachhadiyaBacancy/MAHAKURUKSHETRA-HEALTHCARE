"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { PatientProfileSnapshot } from "@/types/patient";

type PatientProfileFormProps = {
  snapshot: PatientProfileSnapshot;
};

export function PatientProfileForm({ snapshot }: PatientProfileFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(snapshot.fullName);
  const [phone, setPhone] = useState(snapshot.phone);
  const [dateOfBirth, setDateOfBirth] = useState(snapshot.dateOfBirth);
  const [preferredChannel, setPreferredChannel] = useState(snapshot.preferredChannel);
  const [city, setCity] = useState(snapshot.city);
  const [state, setState] = useState(snapshot.state);
  const [zipCode, setZipCode] = useState(snapshot.zipCode);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/patient/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          city,
          dateOfBirth,
          fullName,
          phone,
          preferredChannel,
          state,
          zipCode
        })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to update profile.");
      }

      setMessage(payload.message ?? "Profile updated successfully.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_minmax(0,1.1fr)]">
      <Card className="space-y-5 p-6">
        <div>
          <span className="eyebrow">Personal summary</span>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
            Your care identity
          </h2>
        </div>

        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <InfoBlock label="Organization" value={snapshot.organizationName} />
          <InfoBlock label="Assigned office" value={snapshot.officeName} />
          <InfoBlock label="Role" value={snapshot.roleLabel} />
          <InfoBlock label="Email" value={snapshot.email || "Email pending"} />
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Assigned medications
          </div>
          {snapshot.medications.map((entry) => (
            <div key={entry.id}>
              <div className="font-medium text-slate-950">{entry.medicationName}</div>
              <div className="mt-1 text-sm text-slate-600">
                {entry.dosage} | {entry.officeName}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-6 p-6">
        <div>
          <span className="eyebrow">Edit profile</span>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
            Update your own details
          </h2>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="form-field">
            <label htmlFor="fullName">Full name</label>
            <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-field">
              <label htmlFor="phone">Phone</label>
              <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor="dateOfBirth">Date of birth</label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="form-field">
              <label htmlFor="preferredChannel">Preferred channel</label>
              <Select
                id="preferredChannel"
                value={preferredChannel}
                onChange={(event) => setPreferredChannel(event.target.value as typeof preferredChannel)}
              >
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="call">Call</option>
                <option value="portal">Portal</option>
              </Select>
            </div>
            <div className="form-field">
              <label htmlFor="city">City</label>
              <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} />
            </div>
            <div className="form-field">
              <label htmlFor="state">State</label>
              <Input id="state" value={state} onChange={(event) => setState(event.target.value)} />
            </div>
          </div>

          <div className="form-field max-w-xs">
            <label htmlFor="zipCode">ZIP code</label>
            <Input id="zipCode" value={zipCode} onChange={(event) => setZipCode(event.target.value)} />
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
      <div className="mt-1 text-base font-medium text-slate-950 dark:text-white">{value}</div>
    </div>
  );
}
