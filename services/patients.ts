import { notFound } from "next/navigation";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { demoCaseDetails, demoCases } from "@/services/demo-data";
import { getCurrentWorkspaceActor } from "@/services/workspace-access";
import { humanizeSnakeCase } from "@/utils/formatters";
import type { CaseDetail, CaseListItem } from "@/types/workspace";

export async function getCaseList(search = ""): Promise<CaseListItem[]> {
  const normalizedSearch = search.trim().toLowerCase();

  if (!hasPublicSupabaseEnv()) {
    return filterDemoCases(normalizedSearch);
  }

  let actor: Awaited<ReturnType<typeof getCurrentWorkspaceActor>> = null;

  try {
    actor = await getCurrentWorkspaceActor();

    if (!actor) {
      return filterDemoCases(normalizedSearch);
    }

    const isDoctor = actor.role === "doctor";
    if (isDoctor && !actor.provider?.id) {
      return [];
    }

    if (!actor.organizationId) {
      return filterDemoCases(normalizedSearch);
    }

    let query = actor.db
      .from("patient_cases")
      .select(
        "id, status, priority, next_action, updated_at, case_managers(full_name), patients(first_name,last_name), prescriptions(medications(name,therapy_area)), insurance_policies(payer_name)"
      )
      .eq("organization_id", actor.organizationId)
      .order("updated_at", { ascending: false });

    if (isDoctor && actor.provider?.id) {
      query = query.eq("provider_id", actor.provider.id);
    }

    const { data, error } = normalizedSearch
      ? await query.or(
          `patients.first_name.ilike.%${normalizedSearch}%,patients.last_name.ilike.%${normalizedSearch}%`
        )
      : await query;

    if (error || !data) {
      return actor.role === "doctor" ? [] : filterDemoCases(normalizedSearch);
    }

    const mapped = data.map((row: any) => ({
      id: row.id,
      patientName: `${row.patients?.first_name ?? ""} ${row.patients?.last_name ?? ""}`.trim(),
      therapy: row.prescriptions?.medications?.name ?? "Unassigned therapy",
      therapyArea: row.prescriptions?.medications?.therapy_area ?? "General",
      payer: row.insurance_policies?.payer_name ?? "Payer pending",
      status: humanizeSnakeCase(row.status),
      affordabilityStatus: row.status === "financial_assistance" ? "Active affordability workflow" : "Not started",
      nextAction: row.next_action ?? "Review case",
      owner: row.case_managers?.full_name ?? "Unassigned",
      priority: row.priority,
      updatedAt: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(new Date(row.updated_at))
    }));

    return mapped.length > 0 ? mapped : actor.role === "doctor" ? [] : filterDemoCases(normalizedSearch);
  } catch {
    return actor?.role === "doctor" ? [] : filterDemoCases(normalizedSearch);
  }
}

export async function getCaseDetail(caseId: string): Promise<CaseDetail> {
  if (!hasPublicSupabaseEnv()) {
    return demoCaseDetails[caseId] ?? demoCaseDetails["case-ava-thompson"];
  }

  let actor: Awaited<ReturnType<typeof getCurrentWorkspaceActor>> = null;

  try {
    actor = await getCurrentWorkspaceActor();

    if (!actor) {
      return demoCaseDetails[caseId] ?? demoCaseDetails["case-ava-thompson"];
    }

    const isDoctor = actor.role === "doctor";
    if (isDoctor && !actor.provider?.id) {
      notFound();
    }

    if (!actor.organizationId) {
      return demoCaseDetails[caseId] ?? demoCaseDetails["case-ava-thompson"];
    }

    let caseQuery = actor.db
      .from("patient_cases")
      .select(
        "id, status, priority, next_action, next_action_due_at, barrier_summary, case_managers(full_name), patients(*), providers(full_name,specialty,npi,practice_name), prescriptions(dosage,diagnosis,medications(name,therapy_area)), insurance_policies(payer_name,plan_name,member_id,status,verification_notes)"
      )
      .eq("organization_id", actor.organizationId)
      .eq("id", caseId);

    let paQuery = actor.db
      .from("prior_authorizations")
      .select("id, status, submitted_at, decision_due_at, clinical_requirements, patient_cases!inner(provider_id)")
      .eq("organization_id", actor.organizationId)
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });

    let assistanceQuery = actor.db
      .from("financial_assistance_cases")
      .select("id, program_name, status, estimated_monthly_savings, patient_cases!inner(provider_id)")
      .eq("organization_id", actor.organizationId)
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });

    let communicationsQuery = actor.db
      .from("communications")
      .select("id, channel, direction, summary, created_at, patient_cases!inner(provider_id)")
      .eq("organization_id", actor.organizationId)
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });

    let documentsQuery = actor.db
      .from("documents")
      .select("id, title, category, created_at, patient_cases!inner(provider_id)")
      .eq("organization_id", actor.organizationId)
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });

    if (isDoctor && actor.provider?.id) {
      caseQuery = caseQuery.eq("provider_id", actor.provider.id);
      paQuery = paQuery.eq("patient_cases.provider_id", actor.provider.id);
      assistanceQuery = assistanceQuery.eq("patient_cases.provider_id", actor.provider.id);
      communicationsQuery = communicationsQuery.eq(
        "patient_cases.provider_id",
        actor.provider.id
      );
      documentsQuery = documentsQuery.eq("patient_cases.provider_id", actor.provider.id);
    }

    const [caseResult, paResult, faResult, communicationsResult, docsResult] =
      await Promise.all([
        caseQuery.maybeSingle(),
        paQuery,
        assistanceQuery,
        communicationsQuery,
        documentsQuery
      ]);

    if (caseResult.error || !caseResult.data) {
      if (actor.role !== "doctor" && demoCaseDetails[caseId]) {
        return demoCaseDetails[caseId];
      }

      notFound();
    }

    const row = caseResult.data;

    return {
      id: row.id,
      patient: {
        fullName: `${row.patients?.first_name ?? ""} ${row.patients?.last_name ?? ""}`.trim(),
        dob: row.patients?.date_of_birth ?? "DOB pending",
        contact: [row.patients?.email, row.patients?.phone].filter(Boolean).join(" • "),
        location: [row.patients?.city, row.patients?.state, row.patients?.zip_code]
          .filter(Boolean)
          .join(", "),
        preferredChannel: row.patients?.preferred_channel ?? "Not set"
      },
      provider: {
        name: row.providers?.full_name ?? "Provider pending",
        specialty: row.providers?.specialty ?? "Specialty pending",
        npi: row.providers?.npi ?? "NPI pending",
        practice: row.providers?.practice_name ?? "Practice pending"
      },
      therapy: {
        medication: row.prescriptions?.medications?.name ?? "Medication pending",
        therapyArea: row.prescriptions?.medications?.therapy_area ?? "General",
        dosage: row.prescriptions?.dosage ?? "Dosage pending",
        diagnosis: row.prescriptions?.diagnosis ?? "Diagnosis pending"
      },
      coverage: {
        payer: row.insurance_policies?.payer_name ?? "Payer pending",
        plan: row.insurance_policies?.plan_name ?? "Plan pending",
        memberId: row.insurance_policies?.member_id ?? "Member ID pending",
        status: row.insurance_policies?.status ?? "pending",
        notes: row.insurance_policies?.verification_notes ?? "Verification notes pending"
      },
      caseState: {
        status: row.status,
        priority: row.priority,
        nextAction: row.next_action ?? "Review case",
        owner: row.case_managers?.full_name ?? "Unassigned",
        dueAt: row.next_action_due_at ?? "Not scheduled",
        barrierSummary: row.barrier_summary ?? "No barrier summary recorded"
      },
      priorAuthorization:
        paResult.data?.map((item: any) => ({
          id: item.id,
          status: item.status,
          submittedAt: item.submitted_at ?? "Not submitted",
          dueAt: item.decision_due_at ?? "No due date",
          summary: item.clinical_requirements ?? "No clinical requirements recorded"
        })) ?? [],
      financialAssistance:
        faResult.data?.map((item: any) => ({
          id: item.id,
          program: item.program_name ?? "Program pending",
          status: item.status,
          savings: item.estimated_monthly_savings
            ? `$${item.estimated_monthly_savings.toFixed(2)} / month`
            : "Savings pending"
        })) ?? [],
      communications:
        communicationsResult.data?.map((item: any) => ({
          id: item.id,
          channel: item.channel,
          direction: item.direction,
          summary: item.summary,
          timestamp: item.created_at
        })) ?? [],
      documents:
        docsResult.data?.map((item: any) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          addedAt: item.created_at
        })) ?? []
    };
  } catch {
    if (actor?.role !== "doctor" && demoCaseDetails[caseId]) {
      return demoCaseDetails[caseId];
    }

    notFound();
  }
}

function filterDemoCases(search: string) {
  if (!search) {
    return demoCases;
  }

  return demoCases.filter((entry) =>
    `${entry.patientName} ${entry.therapy} ${entry.payer}`
      .toLowerCase()
      .includes(search)
  );
}
