"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PatientClaimsSnapshot } from "@/types/patient";

type PatientClaimsPanelProps = {
  snapshot: PatientClaimsSnapshot;
};

type ClaimFormState = {
  amount: string;
  caseId: string;
  claimNumber: string;
  claimType: string;
  note: string;
  payerName: string;
  serviceDate: string;
  status: string;
};

const initialFormState: ClaimFormState = {
  amount: "",
  caseId: "",
  claimNumber: "",
  claimType: "medical",
  note: "",
  payerName: "",
  serviceDate: "",
  status: "draft"
};

export function PatientClaimsPanel({ snapshot }: PatientClaimsPanelProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<ClaimFormState>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function updateField<Key extends keyof ClaimFormState>(key: Key, value: ClaimFormState[Key]) {
    setFormState((current) => ({
      ...current,
      [key]: value
    }));
  }

  function startEdit(claimId: string) {
    const claim = snapshot.rows.find((entry) => entry.id === claimId);

    if (!claim) {
      return;
    }

    setEditingId(claimId);
    setMessage(null);
    setFormState({
      amount: claim.amountValue,
      caseId: claim.caseId ?? "",
      claimNumber: claim.claimNumber,
      claimType: claim.claimType,
      note: claim.note === "No note recorded." ? "" : claim.note,
      payerName: claim.payerName === "Payer pending" ? "" : claim.payerName,
      serviceDate: claim.serviceDateValue,
      status: claim.status
    });
  }

  function resetForm() {
    setEditingId(null);
    setFormState(initialFormState);
    setMessage(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(
        editingId ? `/api/patient/claims/${editingId}` : "/api/patient/claims",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: formState.amount,
            caseId: formState.caseId || null,
            claimNumber: formState.claimNumber,
            claimType: formState.claimType,
            note: formState.note,
            payerName: formState.payerName,
            serviceDate: formState.serviceDate,
            status: formState.status
          })
        }
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to save claim.");
      }

      resetForm();
      setMessage(payload.message ?? "Claim saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save claim.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(claimId: string) {
    setMessage(null);

    try {
      const response = await fetch(`/api/patient/claims/${claimId}`, {
        method: "DELETE"
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to delete claim.");
      }

      if (editingId === claimId) {
        resetForm();
      }

      setMessage(payload.message ?? "Claim deleted.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete claim.");
    }
  }

  return (
    <div className="section-stack">
      <section className="metric-grid">
        {snapshot.metrics.map((metric) => (
          <Card className="space-y-3 p-5" key={metric.label}>
            <div className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
              {metric.label}
            </div>
            <div className="font-display text-4xl tracking-tight text-slate-950 dark:text-white">
              {metric.value}
            </div>
            <div className="text-sm leading-7 text-slate-600 dark:text-slate-300">
              {metric.note}
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_minmax(0,1.05fr)]">
        <Card className="space-y-6 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="eyebrow">{editingId ? "Edit claim" : "Create claim"}</span>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
                Manage your claims
              </h2>
            </div>
            {editingId ? (
              <Button onClick={resetForm} type="button" variant="secondary">
                Cancel
              </Button>
            ) : null}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="form-field">
                <label htmlFor="claimNumber">Claim number</label>
                <Input
                  id="claimNumber"
                  value={formState.claimNumber}
                  onChange={(event) => updateField("claimNumber", event.target.value)}
                  placeholder="CLM-240301"
                />
              </div>
              <div className="form-field">
                <label htmlFor="payerName">Payer</label>
                <Input
                  id="payerName"
                  value={formState.payerName}
                  onChange={(event) => updateField("payerName", event.target.value)}
                  placeholder="Blue Cross Blue Shield"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="form-field">
                <label htmlFor="claimType">Claim type</label>
                <Select
                  id="claimType"
                  value={formState.claimType}
                  onChange={(event) => updateField("claimType", event.target.value)}
                >
                  <option value="medical">Medical</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="reimbursement">Reimbursement</option>
                  <option value="support">Support</option>
                </Select>
              </div>
              <div className="form-field">
                <label htmlFor="status">Status</label>
                <Select
                  id="status"
                  value={formState.status}
                  onChange={(event) => updateField("status", event.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="in_review">In review</option>
                  <option value="approved">Approved</option>
                  <option value="partially_approved">Partially approved</option>
                  <option value="denied">Denied</option>
                  <option value="paid">Paid</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="form-field">
                <label htmlFor="amount">Amount</label>
                <Input
                  id="amount"
                  inputMode="decimal"
                  value={formState.amount}
                  onChange={(event) => updateField("amount", event.target.value)}
                  placeholder="1250.00"
                />
              </div>
              <div className="form-field">
                <label htmlFor="serviceDate">Service date</label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={formState.serviceDate}
                  onChange={(event) => updateField("serviceDate", event.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="caseId">Assigned case</label>
                <Select
                  id="caseId"
                  value={formState.caseId}
                  onChange={(event) => updateField("caseId", event.target.value)}
                >
                  <option value="">No linked case</option>
                  {snapshot.caseOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="note">Note</label>
              <Textarea
                id="note"
                value={formState.note}
                onChange={(event) => updateField("note", event.target.value)}
                placeholder="Add payer notes, reimbursement context, or anything the care team should know."
              />
            </div>

            {message ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                {message}
              </div>
            ) : null}

            <Button disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : editingId ? "Update claim" : "Create claim"}
            </Button>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <span className="eyebrow">Your claim list</span>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
              Personal claim history
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="workspace-table min-w-full divide-y divide-slate-200 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  <th className="px-6 py-4 font-medium">Claim</th>
                  <th className="px-6 py-4 font-medium">Medication</th>
                  <th className="px-6 py-4 font-medium">Office</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {snapshot.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-950">{row.claimNumber}</div>
                      <div className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                        {row.payerName} | {row.amount}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{row.medicationName}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{row.officeName}</td>
                    <td className="px-6 py-4">
                      <StatusPill
                        tone={
                          row.status === "denied"
                            ? "critical"
                            : row.status === "approved" || row.status === "paid"
                              ? "default"
                              : "warning"
                        }
                      >
                        {row.status.replaceAll("_", " ")}
                      </StatusPill>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-3">
                        <button
                          className="text-sm font-medium text-slate-900 underline"
                          onClick={() => startEdit(row.id)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="text-sm font-medium text-rose-600 underline"
                          onClick={() => handleDelete(row.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
