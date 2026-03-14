"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AdminMedicationDetail } from "@/types/admin";

type AdminMedicationFormProps = {
  mode: "create" | "edit";
  medication?: AdminMedicationDetail;
};

export function AdminMedicationForm({
  mode,
  medication
}: AdminMedicationFormProps) {
  const [form, setForm] = useState({
    name: medication?.name ?? "",
    manufacturer: medication?.manufacturer ?? "",
    therapyArea: medication?.therapyArea ?? "",
    supportProgram: medication?.supportProgram ?? "",
    requiresPriorAuth: medication?.requiresPriorAuth ?? true,
    requiresColdChain: medication?.requiresColdChain ?? false,
    active: medication?.active ?? true
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateField(
    key: keyof typeof form,
    value: string | boolean
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        mode === "create"
          ? "/api/admin/medications"
          : `/api/admin/medications/${medication?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to save medication.");
      }

      window.location.assign(
        mode === "create"
          ? `/medications/${payload.id}`
          : `/medications/${medication?.id}`
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save medication.");
      setIsSaving(false);
    }
  }

  return (
    <Card className="space-y-6 p-6">
      <div>
        <span className="eyebrow">{mode === "create" ? "Create medication" : "Edit medication"}</span>
        <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
          {mode === "create" ? "Add medication" : "Update medication"}
        </h2>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <Input id="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="manufacturer">Manufacturer</label>
            <Input
              id="manufacturer"
              value={form.manufacturer}
              onChange={(event) => updateField("manufacturer", event.target.value)}
            />
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="therapyArea">Therapy area</label>
            <Input
              id="therapyArea"
              value={form.therapyArea}
              onChange={(event) => updateField("therapyArea", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="supportProgram">Support program</label>
            <Input
              id="supportProgram"
              value={form.supportProgram}
              onChange={(event) => updateField("supportProgram", event.target.value)}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
          <input
            checked={form.requiresPriorAuth}
            type="checkbox"
            onChange={(event) => updateField("requiresPriorAuth", event.target.checked)}
          />
          Requires prior authorization
        </label>
        <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
          <input
            checked={form.requiresColdChain}
            type="checkbox"
            onChange={(event) => updateField("requiresColdChain", event.target.checked)}
          />
          Requires cold chain
        </label>
        <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
          <input
            checked={form.active}
            type="checkbox"
            onChange={(event) => updateField("active", event.target.checked)}
          />
          Active
        </label>

        {message ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}

        <Button disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : mode === "create" ? "Create medication" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
