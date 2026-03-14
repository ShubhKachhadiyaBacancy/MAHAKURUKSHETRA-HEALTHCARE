"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { ModulePermission, modulePermissions } from "@/lib/permissions";

type ActionKey = "add" | "edit" | "delete";

const actionLabels: Record<ActionKey, string> = {
  add: "Add",
  edit: "Edit",
  delete: "Delete"
};

const ACTION_ORDER: ActionKey[] = ["add", "edit", "delete"];

type FetchStatus = "idle" | "loading" | "success" | "error";

export function AdminModuleGrid() {
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [message, setMessage] = useState("Ready to fetch admin API data.");

  useEffect(() => {
    void handleRefresh();
  }, []);

  async function handleRefresh() {
    setStatus("loading");
    setMessage("Loading module permissions...");

    try {
      const response = await fetch("/api/admin/modules");
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to load admin modules.");
      }

      setStatus("success");
      setMessage(`API returned ${payload.permissions.length} modules at ${new Date().toLocaleTimeString()}.`);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Unexpected error while calling admin API."
      );
    }
  }

  return (
    <Card className="space-y-6 rounded-[32px] bg-gradient-to-br from-slate-50 to-white/90 p-6 dark:from-slate-900/80 dark:to-slate-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Admin API
          </p>
          <h3 className="font-display text-3xl text-slate-950 dark:text-white">
            Module permissions
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            The admin endpoint consolidates the RBAC matrix so integrations can respect
            full/edit/delete rights without replicating logic.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Button
            variant="ghost"
            onClick={() => void handleRefresh()}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Refreshing..." : "Refresh API data"}
          </Button>
          <span
            className={cn(
              "text-xs",
              status === "error"
                ? "text-rose-500"
                : status === "success"
                ? "text-emerald-500"
                : "text-slate-500"
            )}
          >
            {message}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {modulePermissions.map((entry) => (
          <article
            key={entry.id}
            className="flex flex-col rounded-3xl border border-slate-100 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                {entry.module}
              </h4>
              <span className="text-[10px] uppercase tracking-[0.4em] text-slate-400">
                {entry.id}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {entry.description}
            </p>

            <div className="mt-4 space-y-2">
              {(Object.keys(entry.privileges) as Array<keyof ModulePermission["privileges"]>).map(
                (role) => {
                  const privilege = entry.privileges[role];
                  const label = role.replaceAll("_", " ");

                  return (
                    <div
                      key={`${entry.id}-${role}`}
                      className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-500 dark:border-slate-800 dark:text-slate-300"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {label}
                      </span>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {ACTION_ORDER.map((action) => (
                            <span
                              key={action}
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-semibold transition",
                                privilege[action]
                                  ? "bg-ink text-white shadow-sm"
                                  : "border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400"
                              )}
                            >
                              {actionLabels[action]}
                            </span>
                          ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}
