"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { AdminUserDetail } from "@/types/admin";

type AdminUserFormProps = {
  mode: "create" | "edit";
  user?: AdminUserDetail;
};

export function AdminUserForm({ mode, user }: AdminUserFormProps) {
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    email: user?.email ?? "",
    password: "",
    phone: user?.phone ?? "",
    title: user?.title ?? "",
    role: user?.role ?? "staff",
    practiceName: user?.practiceName ?? "",
    specialty: user?.specialty ?? "",
    providerNpi: user?.providerNpi ?? ""
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
        mode === "create" ? "/api/admin/users" : `/api/admin/users/${user?.id}`,
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
        throw new Error(payload.message ?? "Unable to save user.");
      }

      window.location.assign(mode === "create" ? `/users/${payload.id}` : `/users/${user?.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save user.");
      setIsSaving(false);
    }
  }

  return (
    <Card className="space-y-6 p-6">
      <div>
        <span className="eyebrow">{mode === "create" ? "Create user" : "Edit user"}</span>
        <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
          {mode === "create" ? "Add a user" : "Update user access"}
        </h2>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="fullName">Full name</label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="password">
              {mode === "create" ? "Password" : "Password (leave blank to keep current)"}
            </label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="role">Role</label>
            <Select
              id="role"
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="patient">Patient</option>
              <option value="provider">Provider</option>
              <option value="case_manager">Case manager</option>
              <option value="staff">Staff</option>
            </Select>
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="title">Title</label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="phone">Phone</label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </div>
        </div>

        <div className="detail-grid">
          <div className="form-field">
            <label htmlFor="practiceName">Practice name</label>
            <Input
              id="practiceName"
              value={form.practiceName}
              onChange={(event) => updateField("practiceName", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="specialty">Specialty</label>
            <Input
              id="specialty"
              value={form.specialty}
              onChange={(event) => updateField("specialty", event.target.value)}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="providerNpi">Provider NPI</label>
          <Input
            id="providerNpi"
            value={form.providerNpi}
            onChange={(event) => updateField("providerNpi", event.target.value)}
          />
        </div>

        {message ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        ) : null}

        <Button disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : mode === "create" ? "Create user" : "Save changes"}
        </Button>
      </form>
    </Card>
  );
}
