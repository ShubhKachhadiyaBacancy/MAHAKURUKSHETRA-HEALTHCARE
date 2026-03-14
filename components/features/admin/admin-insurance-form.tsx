"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AdminInsuranceDetail, AdminPatientOption } from "@/types/admin";

type AdminInsuranceFormProps = {
  mode: "create" | "edit";
  insurance?: AdminInsuranceDetail;
  patients: AdminPatientOption[];
};

export function AdminInsuranceForm({
  mode,
  insurance,
  patients
}: AdminInsuranceFormProps) {
  const [form, setForm] = useState({
    patientId: insurance?.patientId ?? patients[0]?.id ?? "",
    payerName: insurance?.payerName ?? "",
    planName: insurance?.planName ?? "",
    memberId: insurance?.memberId ?? "",
    groupNumber: insurance?.groupNumber ?? "",
    bin: insurance?.bin ?? "",
    pcn: insurance?.pcn ?? "",
    status: insurance?.status ?? "pending",
    verificationNotes: insurance?.verificationNotes ?? ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        mode === "create"
          ? "/api/organizer/insurance"
          : `/api/organizer/insurance/${insurance?.id}`,
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
        throw new Error(payload.message ?? "Unable to save insurance.");
      }

      window.location.assign(
        mode === "create" ? `/insurance/${payload.id}` : `/insurance/${insurance?.id}`
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save insurance.");
      setIsSaving(false);
    }
  }

  return (
    <Card className="space-y-6 p-6">
      <div>
        <span className="eyebrow">{mode === "create" ? "Create insurance" : "Edit insurance"}</span>
        <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
          {mode === "create" ? "Add insurance policy" : "Update insurance policy"}
        </h2>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="form-field">
          <label htmlFor="patientId">Patient</label>
          <Select
            id="patientId"
            value={form.patientId}
            onChange={(event) => updateField("patientId", event.target.value)}
          >
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="payerName">Payer</label>
            <Input
              id="payerName"
              value={form.payerName}
              onChange={(event) => updateField("payerName", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="planName">Plan name</label>
            <Input
              id="planName"
              value={form.planName}
              onChange={(event) => updateField("planName", event.target.value)}
            />
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="memberId">Member ID</label>
            <Input
              id="memberId"
              value={form.memberId}
              onChange={(event) => updateField("memberId", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="status">Status</label>
            <Select
              id="status"
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="active">Active</option>
              <option value="denied">Denied</option>
            </Select>
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="groupNumber">Group number</label>
            <Input
              id="groupNumber"
              value={form.groupNumber}
              onChange={(event) => updateField("groupNumber", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="bin">BIN</label>
            <Input id="bin" value={form.bin} onChange={(event) => updateField("bin", event.target.value)} />
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="pcn">PCN</label>
            <Input id="pcn" value={form.pcn} onChange={(event) => updateField("pcn", event.target.value)} />
          </div>
          <div className="form-field">
            <label htmlFor="verificationNotes">Verification notes</label>
            <Input
              id="verificationNotes"
              value={form.verificationNotes}
              onChange={(event) => updateField("verificationNotes", event.target.value)}
            />
          </div>
        </div>

        {message ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}

        <Button disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : mode === "create" ? "Create insurance" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
