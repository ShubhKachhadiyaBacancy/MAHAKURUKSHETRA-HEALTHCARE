import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv, hasServiceRoleEnv } from "@/lib/env";
import type {
  PatientClaimCaseOption,
  PatientClaimPayload,
  PatientClaimRecord,
  PatientClaimsSnapshot,
  PatientClaimStatus,
  PatientClaimType,
  PatientDashboardSnapshot,
  PatientMedicationRecord,
  PatientProfilePayload,
  PatientProfileSnapshot
} from "@/types/patient";

const claimStatusSet = new Set<PatientClaimStatus>([
  "draft",
  "submitted",
  "in_review",
  "approved",
  "partially_approved",
  "denied",
  "paid"
]);

const claimTypeSet = new Set<PatientClaimType>([
  "medical",
  "pharmacy",
  "reimbursement",
  "support"
]);

const preferredChannelSet = new Set(["sms", "email", "call", "portal"]);

type PatientWorkspaceContext = {
  organizationName: string;
  patient: any;
  profile: any;
  // Supabase's generated service-role helpers are too narrow for these server-only mutations.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  service: any;
};

export class PatientServiceError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function getPatientDashboardSnapshot(): Promise<PatientDashboardSnapshot> {
  const context = await requirePatientWorkspaceContext();
  const [medications, claims, caseSummary] = await Promise.all([
    listPatientMedications(context),
    listPatientClaims(context),
    getPatientCaseSummary(context)
  ]);

  const openClaims = claims.filter((entry: PatientClaimRecord) =>
    ["draft", "submitted", "in_review", "partially_approved"].includes(entry.status)
  ).length;

  return {
    sourceLabel: "Live patient workspace",
    metrics: [
      {
        label: "Open claims",
        value: String(openClaims),
        detail: "Claims still waiting on payer or internal follow-up.",
        tone: openClaims > 0 ? "warning" : "default"
      },
      {
        label: "Assigned medications",
        value: String(medications.length),
        detail: "Therapies currently linked to your care journey.",
        tone: "accent"
      },
      {
        label: "Reports ready",
        value: String(claims.length),
        detail: "Claim rows available in your personal export.",
        tone: "default"
      },
      {
        label: "Next care action",
        value: caseSummary.nextAction === "No pending action" ? "0" : "1",
        detail: "Operational next step currently visible to the patient workspace.",
        tone: caseSummary.nextAction === "No pending action" ? "default" : "critical"
      }
    ],
    organizationName: context.organizationName,
    officeName: caseSummary.officeName,
    careCoordinator: caseSummary.careCoordinator,
    nextAction: caseSummary.nextAction,
    medications,
    claims: claims.slice(0, 5)
  };
}

export async function getPatientClaimsSnapshot(): Promise<PatientClaimsSnapshot> {
  const context = await requirePatientWorkspaceContext();
  const [rows, caseOptions] = await Promise.all([
    listPatientClaims(context),
    listPatientCaseOptions(context)
  ]);

  return {
    metrics: [
      {
        label: "Total claims",
        value: String(rows.length),
        note: "Claims created inside your self-service workspace."
      },
      {
        label: "Pending review",
        value: String(
          rows.filter((row: PatientClaimRecord) =>
            ["submitted", "in_review", "partially_approved"].includes(row.status)
          )
            .length
        ),
        note: "Claims currently waiting on review or a partial decision."
      },
      {
        label: "Paid claims",
        value: String(rows.filter((row: PatientClaimRecord) => row.status === "paid").length),
        note: "Claims that have reached a paid state."
      }
    ],
    rows,
    caseOptions
  };
}

export async function getPatientProfileSnapshot(): Promise<PatientProfileSnapshot> {
  const context = await requirePatientWorkspaceContext();
  const [medications, caseSummary] = await Promise.all([
    listPatientMedications(context),
    getPatientCaseSummary(context)
  ]);

  return {
    fullName:
      context.profile.full_name ??
      `${context.patient.first_name ?? ""} ${context.patient.last_name ?? ""}`.trim(),
    email: context.profile.email ?? context.patient.email ?? "",
    phone: context.profile.phone ?? context.patient.phone ?? "",
    roleLabel: "Patient",
    dateOfBirth: context.patient.date_of_birth ?? "",
    preferredChannel: context.patient.preferred_channel ?? "portal",
    city: context.patient.city ?? "",
    state: context.patient.state ?? "",
    zipCode: context.patient.zip_code ?? "",
    organizationName: context.organizationName,
    officeName: caseSummary.officeName,
    medications
  };
}

export async function updatePatientProfile(payload: PatientProfilePayload) {
  const context = await requirePatientWorkspaceContext();
  const fullName = normalizeValue(payload.fullName);
  const phone = normalizeValue(payload.phone);
  const dateOfBirth = normalizeValue(payload.dateOfBirth);
  const city = normalizeValue(payload.city);
  const state = normalizeValue(payload.state);
  const zipCode = normalizeValue(payload.zipCode);
  const preferredChannel = normalizeValue(payload.preferredChannel);

  if (preferredChannel && !preferredChannelSet.has(preferredChannel)) {
    throw new PatientServiceError(400, "Select a valid preferred communication channel.");
  }

  const patientUpdate: Record<string, string | null> = {};
  const profileUpdate: Record<string, string | null> = {};

  if (fullName) {
    const [firstName, ...rest] = fullName.split(/\s+/);
    patientUpdate.first_name = firstName;
    patientUpdate.last_name = rest.join(" ") || "Patient";
    profileUpdate.full_name = fullName;
  }

  if (phone !== undefined) {
    patientUpdate.phone = phone || null;
    profileUpdate.phone = phone || null;
  }

  if (dateOfBirth !== undefined) {
    patientUpdate.date_of_birth = dateOfBirth || null;
  }

  if (city !== undefined) {
    patientUpdate.city = city || null;
  }

  if (state !== undefined) {
    patientUpdate.state = state || null;
  }

  if (zipCode !== undefined) {
    patientUpdate.zip_code = zipCode || null;
  }

  if (preferredChannel !== undefined) {
    patientUpdate.preferred_channel = preferredChannel || "portal";
  }

  const updates = [];

  if (Object.keys(profileUpdate).length > 0) {
    updates.push(
      context.service
        .from("profiles")
        .update(profileUpdate)
        .eq("id", context.profile.id)
    );
  }

  if (Object.keys(patientUpdate).length > 0) {
    updates.push(
      context.service
        .from("patients")
        .update(patientUpdate)
        .eq("id", context.patient.id)
    );
  }

  await Promise.all(updates);

  return {
    message: "Profile updated successfully."
  };
}

export async function createPatientClaim(payload: PatientClaimPayload) {
  const context = await requirePatientWorkspaceContext();
  const normalized = await normalizeClaimPayload(context, payload);
  const { error } = await context.service.from("claims").insert({
    amount: normalized.amount,
    case_id: normalized.caseId,
    claim_number: normalized.claimNumber,
    claim_type: normalized.claimType,
    note: normalized.note,
    organization_id: context.patient.organization_id,
    patient_id: context.patient.id,
    payer_name: normalized.payerName,
    service_date: normalized.serviceDate,
    status: normalized.status
  });

  if (error) {
    throw new PatientServiceError(400, error.message);
  }

  return {
    message: "Claim created successfully."
  };
}

export async function updatePatientClaim(claimId: string, payload: PatientClaimPayload) {
  const context = await requirePatientWorkspaceContext();
  const normalized = await normalizeClaimPayload(context, payload, false);
  const { error } = await context.service
    .from("claims")
    .update({
      amount: normalized.amount,
      case_id: normalized.caseId,
      claim_number: normalized.claimNumber,
      claim_type: normalized.claimType,
      note: normalized.note,
      payer_name: normalized.payerName,
      service_date: normalized.serviceDate,
      status: normalized.status
    })
    .eq("id", claimId)
    .eq("patient_id", context.patient.id);

  if (error) {
    throw new PatientServiceError(400, error.message);
  }

  return {
    message: "Claim updated successfully."
  };
}

export async function deletePatientClaim(claimId: string) {
  const context = await requirePatientWorkspaceContext();
  const { error } = await context.service
    .from("claims")
    .delete()
    .eq("id", claimId)
    .eq("patient_id", context.patient.id);

  if (error) {
    throw new PatientServiceError(400, error.message);
  }

  return {
    message: "Claim deleted successfully."
  };
}

export async function getPatientReportsSnapshot() {
  return getPatientClaimsSnapshot();
}

export function convertPatientReportsToCsv(snapshot: PatientClaimsSnapshot) {
  const header = [
    "Claim Number",
    "Claim Type",
    "Status",
    "Payer",
    "Amount",
    "Service Date",
    "Medication",
    "Office"
  ];

  return [header, ...snapshot.rows.map((row) => [
    row.claimNumber,
    row.claimType,
    row.status,
    row.payerName,
    row.amount,
    row.serviceDate,
    row.medicationName,
    row.officeName
  ])]
    .map((columns) =>
      columns
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
}

async function requirePatientWorkspaceContext(): Promise<PatientWorkspaceContext> {
  if (!hasPublicSupabaseEnv() || !hasServiceRoleEnv()) {
    throw new PatientServiceError(
      503,
      "Patient workspace requires public and service Supabase credentials."
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new PatientServiceError(401, "Authentication required.");
  }

  // Supabase's generated service-role helpers are too narrow for these server-only lookups.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service: any = createServiceSupabaseClient();
  const profileResult = await service
    .from("profiles")
    .select("id, full_name, email, phone, role")
    .eq("id", session.user.id)
    .maybeSingle();
  const profile = profileResult.data as any;
  const profileError = profileResult.error;

  if (profileError || !profile) {
    throw new PatientServiceError(403, "Unable to resolve your profile.");
  }

  if (profile.role !== "patient") {
    throw new PatientServiceError(403, "Patient workspace access is required.");
  }

  const patientResult = await service
    .from("patients")
    .select(
      "id, organization_id, first_name, last_name, date_of_birth, email, phone, preferred_channel, city, state, zip_code"
    )
    .eq("profile_id", session.user.id)
    .maybeSingle();
  const patient = patientResult.data as any;
  const patientError = patientResult.error;

  if (patientError || !patient) {
    throw new PatientServiceError(404, "Your patient record is not linked yet.");
  }

  const organizationResult = await service
    .from("organizations")
    .select("name")
    .eq("id", patient.organization_id)
    .maybeSingle();
  const organization = organizationResult.data as any;

  return {
    organizationName: organization?.name ?? "Assigned organization",
    patient,
    profile,
    service
  };
}

async function listPatientMedications(context: PatientWorkspaceContext): Promise<PatientMedicationRecord[]> {
  const { data, error } = await context.service
    .from("prescriptions")
    .select(
      "id, dosage, diagnosis, written_at, medications(name,therapy_area), providers(full_name,practice_name)"
    )
    .eq("organization_id", context.patient.organization_id)
    .eq("patient_id", context.patient.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new PatientServiceError(500, "Unable to load assigned medications.");
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    medicationName: row.medications?.name ?? "Medication pending",
    therapyArea: row.medications?.therapy_area ?? "General",
    dosage: row.dosage ?? "Dosage pending",
    diagnosis: row.diagnosis ?? "Diagnosis pending",
    providerName: row.providers?.full_name ?? "Provider pending",
    officeName: row.providers?.practice_name ?? "Office pending",
    writtenAt: formatDate(row.written_at)
  }));
}

async function listPatientClaims(context: PatientWorkspaceContext): Promise<PatientClaimRecord[]> {
  const { data, error } = await context.service
    .from("claims")
    .select("id, claim_number, claim_type, status, payer_name, amount, service_date, note, case_id, created_at")
    .eq("organization_id", context.patient.organization_id)
    .eq("patient_id", context.patient.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new PatientServiceError(500, "Unable to load claims.");
  }

  const caseIds = Array.from(
    new Set((data ?? []).map((row: any) => row.case_id).filter(Boolean))
  );

  const caseMeta = new Map<string, { medicationName: string; officeName: string }>();

  if (caseIds.length > 0) {
    const { data: caseRows, error: caseError } = await context.service
      .from("patient_cases")
      .select("id, providers(practice_name), prescriptions(medications(name))")
      .in("id", caseIds);

    if (caseError) {
      throw new PatientServiceError(500, "Unable to resolve claim case details.");
    }

    for (const row of caseRows ?? []) {
      caseMeta.set(row.id, {
        medicationName: (row as any).prescriptions?.medications?.name ?? "Medication pending",
        officeName: (row as any).providers?.practice_name ?? "Office pending"
      });
    }
  }

  return (data ?? []).map((row: any) => {
    const linkedCase = row.case_id ? caseMeta.get(row.case_id) : null;

    return {
      id: row.id,
      claimNumber: row.claim_number,
      claimType: row.claim_type,
      status: row.status,
      payerName: row.payer_name ?? "Payer pending",
      amount: formatCurrency(row.amount),
      amountValue: row.amount === null || row.amount === undefined ? "" : String(row.amount),
      serviceDate: formatDate(row.service_date),
      serviceDateValue: row.service_date ?? "",
      note: row.note ?? "No note recorded.",
      caseId: row.case_id,
      medicationName: linkedCase?.medicationName ?? "Unlinked claim",
      officeName: linkedCase?.officeName ?? "Office pending",
      createdAt: formatDate(row.created_at)
    };
  });
}

async function getPatientCaseSummary(context: PatientWorkspaceContext) {
  const { data, error } = await context.service
    .from("patient_cases")
    .select("next_action, providers(full_name,practice_name)")
    .eq("organization_id", context.patient.organization_id)
    .eq("patient_id", context.patient.id)
    .order("last_activity_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new PatientServiceError(500, "Unable to load assigned office details.");
  }

  return {
    careCoordinator: (data as any)?.providers?.full_name ?? "Care team pending",
    nextAction: data?.next_action ?? "No pending action",
    officeName: (data as any)?.providers?.practice_name ?? "Office pending"
  };
}

async function listPatientCaseOptions(
  context: PatientWorkspaceContext
): Promise<PatientClaimCaseOption[]> {
  const { data, error } = await context.service
    .from("patient_cases")
    .select("id, providers(practice_name), prescriptions(medications(name))")
    .eq("organization_id", context.patient.organization_id)
    .eq("patient_id", context.patient.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new PatientServiceError(500, "Unable to load claim case options.");
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    label: `${row.prescriptions?.medications?.name ?? "Medication pending"} | ${row.providers?.practice_name ?? "Office pending"}`
  }));
}

async function normalizeClaimPayload(
  context: PatientWorkspaceContext,
  payload: PatientClaimPayload,
  generateClaimNumber = true
) {
  const claimType = normalizeValue(payload.claimType) || "medical";
  const status = normalizeValue(payload.status) || "draft";
  const payerName = normalizeValue(payload.payerName) || "Payer pending";
  const serviceDate = normalizeValue(payload.serviceDate) || new Date().toISOString().slice(0, 10);
  const note = normalizeValue(payload.note) || null;
  const caseId = normalizeValue(payload.caseId) || null;
  const claimNumber =
    normalizeValue(payload.claimNumber) ||
    (generateClaimNumber ? `CLM-${Date.now().toString().slice(-8)}` : "");

  if (!claimTypeSet.has(claimType as PatientClaimType)) {
    throw new PatientServiceError(400, "Select a valid claim type.");
  }

  if (!claimStatusSet.has(status as PatientClaimStatus)) {
    throw new PatientServiceError(400, "Select a valid claim status.");
  }

  if (!claimNumber) {
    throw new PatientServiceError(400, "Claim number is required.");
  }

  if (caseId) {
    const { data: linkedCase, error: caseError } = await context.service
      .from("patient_cases")
      .select("id")
      .eq("id", caseId)
      .eq("patient_id", context.patient.id)
      .maybeSingle();

    if (caseError || !linkedCase) {
      throw new PatientServiceError(400, "Select a valid assigned case.");
    }
  }

  const amountValue = normalizeValue(payload.amount);
  const amount = amountValue ? Number.parseFloat(amountValue) : null;

  if (amountValue && Number.isNaN(amount)) {
    throw new PatientServiceError(400, "Amount must be a valid number.");
  }

  return {
    amount,
    caseId,
    claimNumber,
    claimType: claimType as PatientClaimType,
    note,
    payerName,
    serviceDate,
    status: status as PatientClaimStatus
  };
}

function normalizeValue(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const normalized = String(value ?? "").trim();
  return normalized;
}

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) {
    return "Amount pending";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}
