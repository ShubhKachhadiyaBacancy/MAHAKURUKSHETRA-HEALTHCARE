"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { OrganizerPatientDetail } from "@/types/organizer";

type OrganizerPatientFormProps = {
  mode: "create" | "edit";
  patient?: OrganizerPatientDetail;
};

type FormValues = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  email: string;
  phone: string;
  preferredChannel: string;
  city: string;
  state: string;
  zipCode: string;
  consentStatus: string;
};

export function OrganizerPatientForm({
  mode,
  patient
}: OrganizerPatientFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    firstName: patient?.firstName ?? "",
    lastName: patient?.lastName ?? "",
    dateOfBirth: patient?.dateOfBirth ?? "",
    sex: patient?.sex ?? "unknown",
    email: patient?.email ?? "",
    phone: patient?.phone ?? "",
    preferredChannel: patient?.preferredChannel ?? "sms",
    city: patient?.city ?? "",
    state: patient?.state ?? "",
    zipCode: patient?.zipCode ?? "",
    consentStatus: patient?.consentStatus ?? "pending"
  });
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [isSaving, setIsSaving] = useState(false);

  function updateValue(key: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setStatus("idle");

    try {
      const response = await fetch(
        mode === "create"
          ? "/api/organizer/patients"
          : `/api/organizer/patients/${patient?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(values)
        }
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to save patient.");
      }

      setStatus("success");
      setMessage(
        mode === "create"
          ? "Patient created successfully."
          : "Patient updated successfully."
      );

      const nextId = payload.id ?? patient?.id;
      if (nextId) {
        router.push(`/patients/manage/${nextId}`);
        router.refresh();
      } else {
        router.push("/patients");
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to save patient.");
      setIsSaving(false);
    }
  }

  return (
    <Card className="space-y-6 p-6">
      <div>
        <span className="eyebrow">
          {mode === "create" ? "Create patient" : "Edit patient"}
        </span>
        <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
          {mode === "create"
            ? "Add a patient to your organization"
            : "Update patient information"}
        </h2>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="firstName">First name</label>
            <Input
              id="firstName"
              value={values.firstName}
              onChange={(event) => updateValue("firstName", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="lastName">Last name</label>
            <Input
              id="lastName"
              value={values.lastName}
              onChange={(event) => updateValue("lastName", event.target.value)}
            />
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="dateOfBirth">Date of birth</label>
            <Input
              id="dateOfBirth"
              type="date"
              value={values.dateOfBirth}
              onChange={(event) => updateValue("dateOfBirth", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="sex">Sex</label>
            <Select
              id="sex"
              value={values.sex}
              onChange={(event) => updateValue("sex", event.target.value)}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non_binary">Non-binary</option>
              <option value="unknown">Unknown</option>
            </Select>
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(event) => updateValue("email", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="phone">Phone</label>
            <Input
              id="phone"
              value={values.phone}
              onChange={(event) => updateValue("phone", event.target.value)}
            />
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="preferredChannel">Preferred channel</label>
            <Select
              id="preferredChannel"
              value={values.preferredChannel}
              onChange={(event) =>
                updateValue("preferredChannel", event.target.value)
              }
            >
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="call">Call</option>
              <option value="portal">Portal</option>
            </Select>
          </div>
          <div className="form-field">
            <label htmlFor="consentStatus">Consent status</label>
            <Select
              id="consentStatus"
              value={values.consentStatus}
              onChange={(event) => updateValue("consentStatus", event.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="received">Received</option>
              <option value="declined">Declined</option>
            </Select>
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="city">City</label>
            <Input
              id="city"
              value={values.city}
              onChange={(event) => updateValue("city", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="state">State</label>
            <Input
              id="state"
              value={values.state}
              onChange={(event) => updateValue("state", event.target.value)}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="zipCode">ZIP code</label>
          <Input
            id="zipCode"
            value={values.zipCode}
            onChange={(event) => updateValue("zipCode", event.target.value)}
          />
        </div>

        {message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              status === "error"
                ? "border border-rose-200 bg-rose-50 text-rose-700"
                : "border border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button disabled={isSaving} type="submit">
            {isSaving
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
                ? "Create patient"
                : "Save changes"}
          </Button>
          <Button
            onClick={() =>
              router.push(mode === "create" ? "/patients" : `/patients/manage/${patient?.id}`)
            }
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
