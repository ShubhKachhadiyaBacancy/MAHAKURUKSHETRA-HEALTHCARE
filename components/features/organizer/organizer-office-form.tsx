"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { OrganizerOfficeDetail, OrganizerOfficePayload } from "@/types/organizer";

type OrganizerOfficeFormProps = {
  mode: "create" | "edit";
  office?: OrganizerOfficeDetail;
};

export function OrganizerOfficeForm({ mode, office }: OrganizerOfficeFormProps) {
  const [form, setForm] = useState<OrganizerOfficePayload>({
    name: office?.name ?? "",
    addressLine1: office?.addressLine1 ?? "",
    addressLine2: office?.addressLine2 ?? "",
    city: office?.city ?? "",
    state: office?.state ?? "",
    zipCode: office?.zipCode ?? "",
    phone: office?.phone ?? "",
    email: office?.email ?? ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateField(key: keyof OrganizerOfficePayload, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        mode === "create" ? "/api/organizer/offices" : `/api/organizer/offices/${office?.id}`,
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
        throw new Error(payload.message ?? "Unable to save office.");
      }

      window.location.assign(mode === "create" ? `/offices/${payload.id}` : `/offices/${office?.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save office.");
      setIsSaving(false);
    }
  }

  return (
    <Card className="space-y-6 p-6">
      <div>
        <span className="eyebrow">{mode === "create" ? "Create office" : "Edit office"}</span>
        <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
          {mode === "create" ? "Add a new office" : "Update office details"}
        </h2>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="form-field">
          <label htmlFor="name">Office name</label>
          <Input
            id="name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Northstar Specialty Care - Downtown"
          />
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="addressLine1">Address line 1</label>
            <Input
              id="addressLine1"
              value={form.addressLine1 ?? ""}
              onChange={(event) => updateField("addressLine1", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="addressLine2">Address line 2</label>
            <Input
              id="addressLine2"
              value={form.addressLine2 ?? ""}
              onChange={(event) => updateField("addressLine2", event.target.value)}
            />
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="city">City</label>
            <Input
              id="city"
              value={form.city ?? ""}
              onChange={(event) => updateField("city", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="state">State</label>
            <Input
              id="state"
              value={form.state ?? ""}
              onChange={(event) => updateField("state", event.target.value)}
            />
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="zipCode">Zip code</label>
            <Input
              id="zipCode"
              value={form.zipCode ?? ""}
              onChange={(event) => updateField("zipCode", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="phone">Phone</label>
            <Input
              id="phone"
              value={form.phone ?? ""}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <Input
            id="email"
            type="email"
            value={form.email ?? ""}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </div>

        {message ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}

        <Button disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : mode === "create" ? "Create office" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
