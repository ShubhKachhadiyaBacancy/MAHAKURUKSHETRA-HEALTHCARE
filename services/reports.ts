import { hasPublicSupabaseEnv } from "@/lib/env";
import { demoReports } from "@/services/demo-data";
import { getCurrentWorkspaceActor } from "@/services/workspace-access";
import type { ReportsSnapshot } from "@/types/workspace";

export async function getReportsSnapshot(): Promise<ReportsSnapshot> {
  if (!hasPublicSupabaseEnv()) {
    return demoReports;
  }

  let actor: Awaited<ReturnType<typeof getCurrentWorkspaceActor>> = null;

  try {
    actor = await getCurrentWorkspaceActor();

    if (!actor) {
      return demoReports;
    }

    const isDoctor = actor.role === "doctor";
    if (isDoctor && !actor.provider?.id) {
      return createEmptyDoctorReports();
    }

    if (!actor.organizationId) {
      return demoReports;
    }

    let query = actor.db
      .from("patient_cases")
      .select(
        "id, status, created_at, priority, patients(first_name,last_name), prescriptions(medications(name)), insurance_policies(payer_name), case_managers(full_name)"
      )
      .eq("organization_id", actor.organizationId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (isDoctor && actor.provider?.id) {
      query = query.eq("provider_id", actor.provider.id);
    }

    const { data, error } = await query;

    if (error || !data) {
      return demoReports;
    }

    const rows = data.map((row: any) => ({
      id: row.id,
      patientName: `${row.patients?.first_name ?? ""} ${row.patients?.last_name ?? ""}`.trim(),
      therapy: row.prescriptions?.medications?.name ?? "Medication pending",
      payer: row.insurance_policies?.payer_name ?? "Payer pending",
      status: row.status,
      createdAt: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(new Date(row.created_at)),
      owner: row.case_managers?.full_name ?? "Unassigned"
    }));

    const criticalRows = rows.filter(
      (_row: (typeof rows)[number], index: number) => (data[index] as any)?.priority === "critical"
    ).length;
    const reviewRows = rows.filter((row: (typeof rows)[number]) =>
      ["prior_auth", "benefit_verification", "blocked"].includes(row.status)
    ).length;

    return {
      metrics: isDoctor
        ? [
            {
              label: "Assigned case rows",
              value: String(rows.length),
              note: "Rows in your doctor report export, limited to patients assigned to you."
            },
            {
              label: "Need doctor review",
              value: String(reviewRows),
              note: "Assigned cases sitting in benefit verification, prior auth, or blocked states."
            },
            {
              label: "Critical assigned cases",
              value: String(criticalRows),
              note: "Assigned patients currently marked critical."
            }
          ]
        : [
            {
              label: "Case exports available",
              value: String(rows.length),
              note: "Rows included in the submission export generated from the current organization."
            },
            ...demoReports.metrics.slice(1)
          ],
      rows: rows.length > 0 ? rows : isDoctor ? [] : demoReports.rows
    };
  } catch {
    return actor?.role === "doctor" ? createEmptyDoctorReports() : demoReports;
  }
}

export function convertReportsToCsv(snapshot: ReportsSnapshot) {
  const header = ["Patient", "Therapy", "Payer", "Status", "Created At", "Owner"];
  const rows = snapshot.rows.map((row) => [
    row.patientName,
    row.therapy,
    row.payer,
    row.status,
    row.createdAt,
    row.owner
  ]);

  return [header, ...rows]
    .map((columns) =>
      columns
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
}

function createEmptyDoctorReports(): ReportsSnapshot {
  return {
    metrics: [
      {
        label: "Assigned case rows",
        value: "0",
        note: "Rows in your doctor report export, limited to patients assigned to you."
      },
      {
        label: "Need doctor review",
        value: "0",
        note: "Assigned cases sitting in benefit verification, prior auth, or blocked states."
      },
      {
        label: "Critical assigned cases",
        value: "0",
        note: "Assigned patients currently marked critical."
      }
    ],
    rows: []
  };
}
