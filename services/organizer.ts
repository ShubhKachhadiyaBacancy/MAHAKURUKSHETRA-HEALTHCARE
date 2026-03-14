import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { getReportsSnapshot } from "@/services/reports";
import {
  AdminWorkspaceError,
  createInsurancePolicy,
  deleteInsurancePolicy,
  getAdminInsurancePage,
  getInsuranceDetail,
  getPatientOptions,
  updateInsurancePolicy
} from "@/services/admin-workspace";
import type {
  AdminInsuranceDetail,
  AdminInsurancePage,
  AdminInsurancePayload,
  AdminPatientOption
} from "@/types/admin";
import type {
  OrganizerDashboardSnapshot,
  OrganizerMedicationRecord,
  OrganizerMedicationsSnapshot,
  OrganizerOfficeRecord,
  OrganizerOfficesSnapshot,
  OrganizerPatientDetail,
  OrganizerPatientPayload,
  OrganizerPatientsPage,
  OrganizerPatientSortField,
  OrganizerProfileSnapshot,
  OrganizerReportsSnapshot,
  OrganizerSortDirection
} from "@/types/organizer";
import { humanizeSnakeCase } from "@/utils/formatters";

const DEFAULT_PAGE_SIZE = 10;
const patientSortFieldSet = new Set<OrganizerPatientSortField>([
  "created_at",
  "first_name",
  "last_name"
]);

export class OrganizerServiceError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "OrganizerServiceError";
    this.status = status;
  }
}

type OrganizerContext = {
  db: any;
  userId: string;
  organizationId: string;
  organizationName: string;
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    title: string | null;
  };
};

async function requireOrganizerContext(): Promise<OrganizerContext> {
  if (!hasPublicSupabaseEnv()) {
    throw new OrganizerServiceError(
      500,
      "Supabase authentication is required for admin APIs."
    );
  }

  const supabase = await createServerSupabaseClient();
  const db = supabase as any;
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new OrganizerServiceError(401, "Authentication is required.");
  }

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("full_name, email, phone, title, role, organization_id")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    throw new OrganizerServiceError(403, "Unable to resolve your workspace profile.");
  }

  if (profile.role !== "admin") {
    throw new OrganizerServiceError(
      403,
      "Admin access is only available to organization administrators."
    );
  }

  if (!profile.organization_id) {
    throw new OrganizerServiceError(
      403,
      "Your profile is not linked to an organization."
    );
  }

  const { data: organization, error: organizationError } = await db
    .from("organizations")
    .select("name")
    .eq("id", profile.organization_id)
    .maybeSingle();

  if (organizationError || !organization?.name) {
    throw new OrganizerServiceError(403, "Unable to resolve organization context.");
  }

  return {
    db,
    userId: session.user.id,
    organizationId: profile.organization_id,
    organizationName: organization.name,
    profile
  };
}

export async function getOrganizerDashboardSnapshot(): Promise<OrganizerDashboardSnapshot> {
  const context = await requireOrganizerContext();
  const now = new Date();
  const growthStart = new Date(
    now.getFullYear(),
    now.getMonth() - 5,
    1
  ).toISOString();

  const [
    patientCountResult,
    providerResult,
    prescriptionResult,
    caseResult,
    patientGrowthResult,
    recentPatientsResult
  ] = await Promise.all([
    context.db
      .from("patients")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId),
    context.db
      .from("providers")
      .select("practice_name")
      .eq("organization_id", context.organizationId),
    context.db
      .from("prescriptions")
      .select("medication_id")
      .eq("organization_id", context.organizationId),
    context.db
      .from("patient_cases")
      .select("status")
      .eq("organization_id", context.organizationId),
    context.db
      .from("patients")
      .select("created_at")
      .eq("organization_id", context.organizationId)
      .gte("created_at", growthStart),
    context.db
      .from("patients")
      .select("id, first_name, last_name, city, state, consent_status, created_at")
      .eq("organization_id", context.organizationId)
      .order("created_at", { ascending: false })
      .limit(5)
  ]);

  if (
    patientCountResult.error ||
    providerResult.error ||
    prescriptionResult.error ||
    caseResult.error ||
    patientGrowthResult.error ||
    recentPatientsResult.error
  ) {
    throw new OrganizerServiceError(500, "Unable to load admin dashboard data.");
  }

  const officeNames = new Set<string>();
  for (const row of providerResult.data ?? []) {
    const value = String(row.practice_name ?? "").trim();
    if (value) {
      officeNames.add(value);
    }
  }

  const medicationIds = new Set<string>();
  for (const row of prescriptionResult.data ?? []) {
    if (row.medication_id) {
      medicationIds.add(row.medication_id);
    }
  }

  const growthBuckets = createMonthlyBuckets(now, 6);
  for (const row of patientGrowthResult.data ?? []) {
    const label = formatMonthKey(row.created_at);
    if (growthBuckets[label] !== undefined) {
      growthBuckets[label] += 1;
    }
  }

  const distributionMap = new Map<string, number>();
  for (const row of caseResult.data ?? []) {
    const key = humanizeSnakeCase(String(row.status ?? "unknown"));
    distributionMap.set(key, (distributionMap.get(key) ?? 0) + 1);
  }

  const distributionTotal = Array.from(distributionMap.values()).reduce(
    (sum, value) => sum + value,
    0
  );

  return {
    organizationName: context.organizationName,
    sourceLabel: "Live admin data",
    summary: [
      {
        label: "Total patients",
        value: String(patientCountResult.count ?? 0),
        detail: "Patient records currently assigned to your organization."
      },
      {
        label: "Total offices",
        value: String(officeNames.size),
        detail: "Derived from provider practice names linked to your organization."
      },
      {
        label: "Total medications",
        value: String(medicationIds.size),
        detail: "Distinct medications actively used in organization prescriptions."
      }
    ],
    growth: Object.entries(growthBuckets).map(([label, value]) => ({
      label,
      value
    })),
    distribution: Array.from(distributionMap.entries())
      .sort((left, right) => right[1] - left[1])
      .map(([label, value]) => ({
        label,
        value,
        share: distributionTotal > 0 ? Math.round((value / distributionTotal) * 100) : 0
      })),
    recentPatients: (recentPatientsResult.data ?? []).map((row: any) => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`.trim(),
      location: [row.city, row.state].filter(Boolean).join(", ") || "Location pending",
      consentStatus: row.consent_status,
      createdAt: formatDate(row.created_at)
    }))
  };
}

export async function getOrganizerPatientsPage(options: {
  query?: string;
  page?: number | string;
  pageSize?: number | string;
  sort?: string;
  direction?: string;
}): Promise<OrganizerPatientsPage> {
  const context = await requireOrganizerContext();
  const query = String(options.query ?? "").trim();
  const page = Math.max(1, Number(options.page ?? 1) || 1);
  const pageSize = Math.max(
    1,
    Math.min(50, Number(options.pageSize ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE)
  );
  const sort = patientSortFieldSet.has(options.sort as OrganizerPatientSortField)
    ? (options.sort as OrganizerPatientSortField)
    : "created_at";
  const direction: OrganizerSortDirection =
    options.direction === "asc" ? "asc" : "desc";

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let queryBuilder = context.db
    .from("patients")
    .select(
      "id, first_name, last_name, email, phone, city, state, preferred_channel, consent_status, created_at",
      { count: "exact" }
    )
    .eq("organization_id", context.organizationId)
    .order(sort, { ascending: direction === "asc" })
    .range(from, to);

  if (query) {
    queryBuilder = queryBuilder.or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`
    );
  }

  const { data, error, count } = await queryBuilder;

  if (error) {
    throw new OrganizerServiceError(500, "Unable to load patient records.");
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    rows: (data ?? []).map((row: any) => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`.trim(),
      email: row.email ?? "Email pending",
      phone: row.phone ?? "Phone pending",
      location:
        [row.city, row.state].filter(Boolean).join(", ") || "Location pending",
      preferredChannel: row.preferred_channel,
      consentStatus: row.consent_status,
      createdAt: formatDate(row.created_at)
    })),
    total,
    page,
    pageSize,
    totalPages,
    query,
    sort,
    direction
  };
}

export async function getOrganizerPatientDetail(
  patientId: string
): Promise<OrganizerPatientDetail> {
  const context = await requireOrganizerContext();
  const normalizedPatientId = patientId.trim();

  const [patientResult, prescriptionResult, caseResult, insuranceResult] =
    await Promise.all([
      context.db
        .from("patients")
        .select("*")
        .eq("organization_id", context.organizationId)
        .eq("id", normalizedPatientId)
        .maybeSingle(),
      context.db
        .from("prescriptions")
        .select("id, dosage, diagnosis, medications(name, therapy_area)")
        .eq("organization_id", context.organizationId)
        .eq("patient_id", normalizedPatientId)
        .order("created_at", { ascending: false }),
      context.db
        .from("patient_cases")
        .select("id, status, priority, last_activity_at")
        .eq("organization_id", context.organizationId)
        .eq("patient_id", normalizedPatientId)
        .order("last_activity_at", { ascending: false }),
      context.db
        .from("insurance_policies")
        .select("id, payer_name, plan_name, member_id, status")
        .eq("organization_id", context.organizationId)
        .eq("patient_id", normalizedPatientId)
        .order("created_at", { ascending: false })
    ]);

  if (patientResult.error) {
    throw new OrganizerServiceError(500, "Unable to load the patient record.");
  }

  if (!patientResult.data) {
    throw new OrganizerServiceError(404, "Patient not found.");
  }

  return {
    id: patientResult.data.id,
    firstName: patientResult.data.first_name,
    lastName: patientResult.data.last_name,
    dateOfBirth: patientResult.data.date_of_birth,
    sex: patientResult.data.sex,
    email: patientResult.data.email,
    phone: patientResult.data.phone,
    preferredChannel: patientResult.data.preferred_channel,
    city: patientResult.data.city,
    state: patientResult.data.state,
    zipCode: patientResult.data.zip_code,
    consentStatus: patientResult.data.consent_status,
    createdAt: formatDate(patientResult.data.created_at),
    updatedAt: formatDate(patientResult.data.updated_at),
    relatedPrescriptions: (prescriptionResult.data ?? []).map((row: any) => ({
      id: row.id,
      medication: row.medications?.name ?? "Medication pending",
      therapyArea: row.medications?.therapy_area ?? "General",
      dosage: row.dosage ?? "Dosage pending",
      diagnosis: row.diagnosis ?? "Diagnosis pending"
    })),
    relatedCases: (caseResult.data ?? []).map((row: any) => ({
      id: row.id,
      status: humanizeSnakeCase(row.status),
      priority: row.priority,
      lastActivityAt: formatDate(row.last_activity_at)
    })),
    insurancePolicies: (insuranceResult.data ?? []).map((row: any) => ({
      id: row.id,
      payerName: row.payer_name,
      planName: row.plan_name ?? "Plan pending",
      memberId: row.member_id,
      status: row.status
    }))
  };
}

export async function createOrganizerPatient(
  payload: OrganizerPatientPayload
): Promise<{ id: string }> {
  const context = await requireOrganizerContext();
  const normalized = normalizePatientPayload(payload);

  const { data, error } = await context.db
    .from("patients")
    .insert({
      organization_id: context.organizationId,
      first_name: normalized.firstName,
      last_name: normalized.lastName,
      date_of_birth: normalized.dateOfBirth,
      sex: normalized.sex,
      email: normalized.email,
      phone: normalized.phone,
      preferred_channel: normalized.preferredChannel,
      city: normalized.city,
      state: normalized.state,
      zip_code: normalized.zipCode,
      consent_status: normalized.consentStatus
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new OrganizerServiceError(
      500,
      error?.message ?? "Unable to create the patient."
    );
  }

  return { id: data.id };
}

export async function updateOrganizerPatient(
  patientId: string,
  payload: OrganizerPatientPayload
): Promise<{ id: string }> {
  const context = await requireOrganizerContext();
  const normalized = normalizePatientPayload(payload);

  const { data, error } = await context.db
    .from("patients")
    .update({
      first_name: normalized.firstName,
      last_name: normalized.lastName,
      date_of_birth: normalized.dateOfBirth,
      sex: normalized.sex,
      email: normalized.email,
      phone: normalized.phone,
      preferred_channel: normalized.preferredChannel,
      city: normalized.city,
      state: normalized.state,
      zip_code: normalized.zipCode,
      consent_status: normalized.consentStatus
    })
    .eq("organization_id", context.organizationId)
    .eq("id", patientId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new OrganizerServiceError(
      500,
      error.message ?? "Unable to update the patient."
    );
  }

  if (!data?.id) {
    throw new OrganizerServiceError(404, "Patient not found.");
  }

  return { id: data.id };
}

export async function deleteOrganizerPatient(
  patientId: string
): Promise<{ id: string }> {
  const context = await requireOrganizerContext();

  const { data, error } = await context.db
    .from("patients")
    .delete()
    .eq("organization_id", context.organizationId)
    .eq("id", patientId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new OrganizerServiceError(
      500,
      error.message ?? "Unable to delete the patient."
    );
  }

  if (!data?.id) {
    throw new OrganizerServiceError(404, "Patient not found.");
  }

  return { id: data.id };
}

export async function getOrganizerMedicationsSnapshot(): Promise<OrganizerMedicationsSnapshot> {
  const context = await requireOrganizerContext();
  const [medicationsResult, prescriptionsResult] = await Promise.all([
    context.db.from("medications").select("*").order("name", { ascending: true }),
    context.db
      .from("prescriptions")
      .select("medication_id")
      .eq("organization_id", context.organizationId)
  ]);

  if (medicationsResult.error || prescriptionsResult.error) {
    throw new OrganizerServiceError(500, "Unable to load medications.");
  }

  const usageMap = new Map<string, number>();
  for (const row of prescriptionsResult.data ?? []) {
    const key = String(row.medication_id ?? "");
    if (key) {
      usageMap.set(key, (usageMap.get(key) ?? 0) + 1);
    }
  }

  const rows: OrganizerMedicationRecord[] = (medicationsResult.data ?? []).map(
    (row: any) => {
      const usageCount = usageMap.get(row.id) ?? 0;
      return {
        id: row.id,
        name: row.name,
        manufacturer: row.manufacturer ?? "Manufacturer pending",
        therapyArea: row.therapy_area ?? "General",
        supportProgram: row.support_program ?? "Program pending",
        requiresPriorAuth: Boolean(row.requires_prior_auth),
        requiresColdChain: Boolean(row.requires_cold_chain),
        active: Boolean(row.active),
        organizationUsageCount: usageCount,
        selectedForOrganization: usageCount > 0
      };
    }
  );

  return {
    selectionMode: "derived",
    note:
      "The current schema has no organization-medication mapping table, so organization selection is derived from medications already used in prescriptions.",
    rows
  };
}

export async function getOrganizerOfficesSnapshot(): Promise<OrganizerOfficesSnapshot> {
  const context = await requireOrganizerContext();
  const { data, error } = await context.db
    .from("providers")
    .select("id, practice_name, specialty, full_name, email, phone")
    .eq("organization_id", context.organizationId)
    .order("practice_name", { ascending: true });

  if (error) {
    throw new OrganizerServiceError(500, "Unable to load office data.");
  }

  const grouped = new Map<string, OrganizerOfficeRecord>();

  for (const row of data ?? []) {
    const practiceName = String(row.practice_name ?? "").trim() || "Unassigned practice";
    const key = practiceName.toLowerCase();
    const current =
      grouped.get(key) ??
      ({
        id: key,
        name: practiceName,
        providerCount: 0,
        specialties: [],
        contacts: []
      } satisfies OrganizerOfficeRecord);

    current.providerCount += 1;
    if (row.specialty && !current.specialties.includes(row.specialty)) {
      current.specialties.push(row.specialty);
    }

    const contact = row.email ?? row.phone ?? row.full_name;
    if (contact && !current.contacts.includes(contact)) {
      current.contacts.push(contact);
    }

    grouped.set(key, current);
  }

  return {
    mode: "derived",
    note:
      "The current schema does not expose an offices table, so this directory is derived from provider practice names and remains read-only until the data model changes.",
    rows: Array.from(grouped.values()).sort((left, right) =>
      left.name.localeCompare(right.name)
    )
  };
}

export async function getOrganizerReportsSnapshot(): Promise<OrganizerReportsSnapshot> {
  const context = await requireOrganizerContext();
  const baseSnapshot = await getReportsSnapshot();
  const { data, error } = await context.db
    .from("audit_logs")
    .select("id, action, created_at, metadata")
    .eq("organization_id", context.organizationId)
    .eq("entity_name", "report")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new OrganizerServiceError(500, "Unable to load generated reports.");
  }

  const logRows = (data ?? []).map((row: any) => {
    const metadata = row.metadata ?? {};
    return {
      id: row.id,
      type: String(metadata.reportType ?? "Operations export"),
      generatedAt: formatDate(row.created_at),
      source: String(metadata.actorName ?? context.profile.full_name ?? "Admin"),
      downloadUrl: "/reports/export"
    };
  });

  return {
    metrics: [
      {
        label: "Generated exports",
        value: String(logRows.length),
        note: "Audit log entries created from the admin reporting workflow."
      },
      ...baseSnapshot.metrics.slice(0, 2),
      {
        label: "Live export rows",
        value: String(baseSnapshot.rows.length),
        note: "Current organization-scoped rows ready for CSV export."
      }
    ],
    rows:
      logRows.length > 0
        ? logRows
        : [
            {
              id: "live-export",
              type: "Operations export",
              generatedAt: "Ready now",
              source: "Live data",
              downloadUrl: "/reports/export"
            }
          ]
  };
}

export async function generateOrganizerReport(reportType: string) {
  const context = await requireOrganizerContext();
  const normalizedType =
    String(reportType || "Operations export").trim() || "Operations export";

  const { error } = await context.db.from("audit_logs").insert({
    organization_id: context.organizationId,
    actor_id: context.userId,
    entity_name: "report",
    action: "generated",
    metadata: {
      reportType: normalizedType,
      actorName: context.profile.full_name ?? "Admin"
    }
  });

  if (error) {
    throw new OrganizerServiceError(500, "Unable to generate the report.");
  }

  return {
    message: "Report generated successfully.",
    downloadUrl: "/reports/export"
  };
}

export async function getOrganizerProfileSnapshot(): Promise<OrganizerProfileSnapshot> {
  const context = await requireOrganizerContext();

  return {
    id: context.userId,
    fullName: context.profile.full_name ?? "",
    email: context.profile.email ?? "",
    phone: context.profile.phone ?? "",
    title: context.profile.title ?? "Admin",
    organizationName: context.organizationName,
    roleLabel: "Admin"
  };
}

export async function updateOrganizerProfile(payload: {
  fullName: string;
  phone?: string | null;
  title?: string | null;
}) {
  const context = await requireOrganizerContext();
  const fullName = String(payload.fullName ?? "").trim();
  const phone = normalizeOptionalText(payload.phone);
  const title = normalizeOptionalText(payload.title);

  if (fullName.length < 2) {
    throw new OrganizerServiceError(400, "Full name must be at least 2 characters.");
  }

  const { data, error } = await context.db
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      title
    })
    .eq("id", context.userId)
    .eq("organization_id", context.organizationId)
    .select("id")
    .maybeSingle();

  if (error || !data?.id) {
    throw new OrganizerServiceError(
      500,
      error?.message ?? "Unable to update the admin profile."
    );
  }

  return { id: data.id };
}

export async function getOrganizerInsurancePage(options: {
  query?: string;
  page?: string | number;
}): Promise<AdminInsurancePage> {
  try {
    return await getAdminInsurancePage(options);
  } catch (error) {
    throw mapOrganizerInsuranceError(error);
  }
}

export async function getOrganizerInsuranceDetail(
  insuranceId: string
): Promise<AdminInsuranceDetail> {
  try {
    return await getInsuranceDetail(insuranceId);
  } catch (error) {
    throw mapOrganizerInsuranceError(error);
  }
}

export async function createOrganizerInsurancePolicy(payload: AdminInsurancePayload) {
  try {
    return await createInsurancePolicy(payload);
  } catch (error) {
    throw mapOrganizerInsuranceError(error);
  }
}

export async function updateOrganizerInsurancePolicy(
  insuranceId: string,
  payload: AdminInsurancePayload
) {
  try {
    return await updateInsurancePolicy(insuranceId, payload);
  } catch (error) {
    throw mapOrganizerInsuranceError(error);
  }
}

export async function deleteOrganizerInsurancePolicy(insuranceId: string) {
  try {
    return await deleteInsurancePolicy(insuranceId);
  } catch (error) {
    throw mapOrganizerInsuranceError(error);
  }
}

export async function getOrganizerPatientOptions(): Promise<AdminPatientOption[]> {
  try {
    return await getPatientOptions();
  } catch (error) {
    throw mapOrganizerInsuranceError(error);
  }
}

function normalizePatientPayload(payload: OrganizerPatientPayload) {
  const firstName = String(payload.firstName ?? "").trim();
  const lastName = String(payload.lastName ?? "").trim();

  if (firstName.length < 2 || lastName.length < 2) {
    throw new OrganizerServiceError(
      400,
      "First name and last name must both be at least 2 characters."
    );
  }

  const email = normalizeOptionalText(payload.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new OrganizerServiceError(400, "Enter a valid email address.");
  }

  return {
    firstName,
    lastName,
    dateOfBirth: normalizeOptionalText(payload.dateOfBirth),
    sex: payload.sex ?? "unknown",
    email,
    phone: normalizeOptionalText(payload.phone),
    preferredChannel: payload.preferredChannel ?? "sms",
    city: normalizeOptionalText(payload.city),
    state: normalizeOptionalText(payload.state),
    zipCode: normalizeOptionalText(payload.zipCode),
    consentStatus: payload.consentStatus ?? "pending"
  };
}

function normalizeOptionalText(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
}

function mapOrganizerInsuranceError(error: unknown) {
  if (error instanceof OrganizerServiceError) {
    return error;
  }

  if (error instanceof AdminWorkspaceError) {
    return new OrganizerServiceError(error.status, error.message);
  }

  return new OrganizerServiceError(500, "Unable to manage organizer insurance.");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Pending";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function createMonthlyBuckets(referenceDate: Date, months: number) {
  const buckets: Record<string, number> = {};

  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - index,
      1
    );
    buckets[formatMonthKey(date.toISOString())] = 0;
  }

  return buckets;
}

function formatMonthKey(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit"
  }).format(new Date(value));
}
