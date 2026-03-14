import { hasPublicSupabaseEnv } from "@/lib/env";
import { demoCases, demoDashboard } from "@/services/demo-data";
import { getCurrentWorkspaceActor } from "@/services/workspace-access";
import { formatScheduledAt, humanizeSnakeCase } from "@/utils/formatters";
import { getPriorityLabel, getStatusTone } from "@/utils/status";
import type { ProviderDashboardData } from "@/types/dashboard";

export async function getDashboardSnapshot(): Promise<ProviderDashboardData> {
  if (!hasPublicSupabaseEnv()) {
    return demoDashboard;
  }

  let actor: Awaited<ReturnType<typeof getCurrentWorkspaceActor>> = null;

  try {
    actor = await getCurrentWorkspaceActor();

    if (!actor) {
      return demoDashboard;
    }

    const isDoctor = actor.role === "doctor";
    if (isDoctor && !actor.provider?.id) {
      return createEmptyDoctorDashboard();
    }

    if (!actor.organizationId) {
      return demoDashboard;
    }

    let casesQuery = actor.db
        .from("patient_cases")
        .select(
          "id, status, priority, next_action, patients(first_name,last_name), prescriptions(medications(name)), insurance_policies(payer_name), last_activity_at"
        )
        .eq("organization_id", actor.organizationId)
        .order("last_activity_at", { ascending: false })
        .limit(6);

    let authQuery = actor.db
        .from("prior_authorizations")
        .select("status, patient_cases!inner(provider_id)")
        .eq("organization_id", actor.organizationId);

    let affordabilityQuery = actor.db
        .from("financial_assistance_cases")
        .select("status, patient_cases!inner(provider_id)")
        .eq("organization_id", actor.organizationId);

    let communicationsQuery = actor.db
        .from("communications")
        .select("summary, channel, scheduled_for, patient_cases!inner(provider_id)")
        .eq("organization_id", actor.organizationId)
        .eq("status", "scheduled")
        .order("scheduled_for", { ascending: true })
        .limit(5);

    if (isDoctor && actor.provider?.id) {
      casesQuery = casesQuery.eq("provider_id", actor.provider.id);
      authQuery = authQuery.eq("patient_cases.provider_id", actor.provider.id);
      affordabilityQuery = affordabilityQuery.eq("patient_cases.provider_id", actor.provider.id);
      communicationsQuery = communicationsQuery.eq(
        "patient_cases.provider_id",
        actor.provider.id
      );
    }

    const [caseResult, authResult, faResult, communicationResult] = await Promise.all([
      casesQuery,
      authQuery,
      affordabilityQuery,
      communicationsQuery
    ]);

    if (caseResult.error || authResult.error || faResult.error || communicationResult.error) {
      return demoDashboard;
    }

    const caseRows = caseResult.data ?? [];
    const authRows = authResult.data ?? [];
    const faRows = faResult.data ?? [];
    const communicationRows = communicationResult.data ?? [];

    return {
      sourceLabel: "Live Supabase data",
      metrics: [
        {
          label: isDoctor ? "Assigned patients" : "Active access cases",
          value: String(caseRows.length),
          detail: isDoctor
            ? "Patients currently assigned to you for clinical review and response."
            : "Cases currently assigned to your organization work queues.",
          tone: "default"
        },
        {
          label: isDoctor ? "Prior auth review" : "Prior auth in flight",
          value: String(
            authRows.filter((row: any) =>
              ["submitted", "pending", "appeal"].includes(row.status)
            ).length
          ),
          detail: isDoctor
            ? "Assigned authorizations waiting on supporting documentation or payer action."
            : "Authorizations waiting on payer action or supporting documentation.",
          tone: "warning"
        },
        {
          label: isDoctor ? "Access support active" : "Affordability opportunities",
          value: String(
            faRows.filter((row: any) =>
              ["screening", "submitted", "active"].includes(row.status)
            ).length
          ),
          detail: isDoctor
            ? "Assigned patients with active affordability or bridge support workflows."
            : "Patients with active affordability workflows underway.",
          tone: "accent"
        },
        {
          label: isDoctor ? "Urgent follow-up" : "Critical blockers",
          value: String(
            caseRows.filter(
              (row: any) => row.priority === "critical" || row.status === "blocked"
            ).length
          ),
          detail: isDoctor
            ? "Assigned cases flagged as blocked or critical for doctor action."
            : "Cases flagged as blocked or critical in the current queue.",
          tone: "critical"
        }
      ],
      cases:
        caseRows.length > 0
          ? caseRows.map((row: any) => ({
              id: row.id,
              patientName: `${row.patients?.first_name ?? ""} ${row.patients?.last_name ?? ""}`.trim(),
              therapy: row.prescriptions?.medications?.name ?? "Unassigned therapy",
              payer: row.insurance_policies?.payer_name ?? "Payer pending",
              status: humanizeSnakeCase(row.status),
              nextAction: row.next_action ?? (isDoctor ? "Add doctor feedback" : "Review case"),
              priorityLabel: getPriorityLabel(row.priority),
              tone: getStatusTone(row.status, row.priority)
            }))
          : isDoctor
            ? []
            : demoDashboard.cases,
      outreachQueue:
        communicationRows.length > 0
          ? communicationRows.map((row: any) => ({
              recipient: isDoctor ? "Assigned case update" : "Scheduled outreach",
              channel: row.channel.toUpperCase(),
              summary: row.summary,
              scheduledFor: formatScheduledAt(row.scheduled_for)
            }))
          : isDoctor
            ? []
            : demoDashboard.outreachQueue,
      activityLog:
        caseRows.length > 0
          ? caseRows.slice(0, 3).map((entry: any, index: number) => ({
              title: `${`${entry.patients?.first_name ?? ""} ${entry.patients?.last_name ?? ""}`.trim() || "Assigned patient"} moved into ${humanizeSnakeCase(entry.status)}`,
              description: `${entry.prescriptions?.medications?.name ?? "Medication pending"} with ${entry.insurance_policies?.payer_name ?? "payer pending"}. Next action: ${entry.next_action ?? (isDoctor ? "Add doctor feedback" : "Review case")}.`,
              timestamp: index === 0 ? "Just now" : `${index * 18 + 16} minutes ago`
            }))
          : isDoctor
            ? []
            : demoCases.slice(0, 3).map((entry, index) => ({
                title: `${entry.patientName} moved into ${entry.status}`,
                description: `${entry.therapy} with ${entry.payer}. Next action: ${entry.nextAction}.`,
                timestamp: index === 0 ? "Just now" : `${index * 18 + 16} minutes ago`
              }))
    };
  } catch {
    return actor?.role === "doctor" ? createEmptyDoctorDashboard() : demoDashboard;
  }
}

function createEmptyDoctorDashboard(): ProviderDashboardData {
  return {
    sourceLabel: "Live Supabase data",
    metrics: [
      {
        label: "Assigned patients",
        value: "0",
        detail: "Patients currently assigned to you for clinical review and response.",
        tone: "default"
      },
      {
        label: "Prior auth review",
        value: "0",
        detail: "Assigned authorizations waiting on supporting documentation or payer action.",
        tone: "warning"
      },
      {
        label: "Access support active",
        value: "0",
        detail: "Assigned patients with active affordability or bridge support workflows.",
        tone: "accent"
      },
      {
        label: "Urgent follow-up",
        value: "0",
        detail: "Assigned cases flagged as blocked or critical for doctor action.",
        tone: "critical"
      }
    ],
    cases: [],
    outreachQueue: [],
    activityLog: []
  };
}
