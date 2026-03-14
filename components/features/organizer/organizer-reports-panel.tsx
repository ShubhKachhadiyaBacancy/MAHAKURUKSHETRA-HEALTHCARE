"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { OrganizerReportsSnapshot } from "@/types/organizer";

const reportTypeOptions = [
  "Operations export",
  "Patient summary",
  "Medication utilization",
  "Coverage throughput"
];

type OrganizerReportsPanelProps = {
  snapshot: OrganizerReportsSnapshot;
};

export function OrganizerReportsPanel({ snapshot }: OrganizerReportsPanelProps) {
  const router = useRouter();
  const [reportType, setReportType] = useState(reportTypeOptions[0]);
  const [message, setMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function onGenerate() {
    setIsGenerating(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ type: reportType })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to generate report.");
      }

      setMessage(payload.message ?? "Report generated.");
      router.refresh();
      window.location.assign(payload.downloadUrl ?? "/reports/export");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to generate report.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="section-stack">
      <section className="metric-grid">
        {snapshot.metrics.map((metric) => (
          <Card className="space-y-3 p-6" key={metric.label}>
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
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

      <section className="grid gap-6 xl:grid-cols-[0.9fr_minmax(0,1.1fr)]">
        <Card className="space-y-5 p-6">
          <div>
            <span className="eyebrow">Generate</span>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
              Produce a new export
            </h2>
          </div>

          <div className="form-field">
            <label htmlFor="reportType">Report type</label>
            <Select
              id="reportType"
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
            >
              {reportTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          {message ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
              {message}
            </div>
          ) : null}

          <Button disabled={isGenerating} onClick={onGenerate} type="button">
            {isGenerating ? "Generating..." : "Generate report"}
          </Button>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="workspace-table min-w-full divide-y divide-slate-200 text-left dark:divide-slate-800">
              <thead>
                <tr className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4 font-medium">Report type</th>
                  <th className="px-6 py-4 font-medium">Generated</th>
                  <th className="px-6 py-4 font-medium">Source</th>
                  <th className="px-6 py-4 font-medium text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50">
                {snapshot.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {row.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {row.generatedAt}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      {row.source}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        className="ui-link-button"
                        href={row.downloadUrl}
                      >
                        Download
                      </a>
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
