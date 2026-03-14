import {
  createServerSupabaseClient,
  createServiceSupabaseClient
} from "@/lib/supabase/server";
import { hasPublicSupabaseEnv, hasServiceRoleEnv } from "@/lib/env";
import { bootstrapRegisteredUser } from "@/services/auth/bootstrap";
import type {
  AdminDashboardSnapshot,
  AdminInsuranceDetail,
  AdminInsurancePage,
  AdminInsurancePayload,
  AdminMedicationDetail,
  AdminMedicationsPage,
  AdminMedicationPayload,
  AdminPatientOption,
  AdminUserDetail,
  AdminUserPayload,
  AdminUsersPage
} from "@/types/admin";
import type { Database } from "@/types/database";

const PAGE_SIZE = 10;

export class AdminWorkspaceError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AdminWorkspaceError";
    this.status = status;
  }
}

type AdminContext = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any;
  userId: string;
  organizationId: string;
  organizationName: string;
};

async function listScopedUserIds(context: AdminContext) {
  const [profileResult, patientResult] = await Promise.all([
    context.db
      .from("profiles")
      .select("id")
      .eq("organization_id", context.organizationId),
    context.db
      .from("patients")
      .select("profile_id")
      .eq("organization_id", context.organizationId)
      .not("profile_id", "is", null)
  ]);

  if (profileResult.error || patientResult.error) {
    throw new AdminWorkspaceError(500, "Unable to scope users for this organization.");
  }

  return Array.from(
    new Set([
      ...(profileResult.data ?? []).map((row: any) => row.id),
      ...(patientResult.data ?? []).map((row: any) => row.profile_id).filter(Boolean)
    ])
  );
}

async function assertUserInScope(context: AdminContext, userId: string) {
  const scopedUserIds = await listScopedUserIds(context);

  if (!scopedUserIds.includes(userId)) {
    throw new AdminWorkspaceError(404, "User not found.");
  }
}

async function getUserEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  userId: string
) {
  const { data } = await db
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  return data?.email ?? "";
}

async function requireAdminContext(): Promise<AdminContext> {
  if (!hasPublicSupabaseEnv() || !hasServiceRoleEnv()) {
    throw new AdminWorkspaceError(
      503,
      "Admin workspace requires public and service Supabase credentials."
    );
  }

  const sessionClient = await createServerSupabaseClient();
  const {
    data: { session }
  } = await sessionClient.auth.getSession();

  if (!session?.user) {
    throw new AdminWorkspaceError(401, "Authentication is required.");
  }

  // Supabase's generated table helpers are not resolving correctly in this service layer.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db: any = createServiceSupabaseClient();
  const { data: profile } = await db
    .from("profiles")
    .select("role, organization_id")
    .eq("id", session.user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin" || !profile.organization_id) {
    throw new AdminWorkspaceError(403, "Admin access is required.");
  }

  const { data: organization } = await db
    .from("organizations")
    .select("name")
    .eq("id", profile.organization_id)
    .maybeSingle();

  if (!organization?.name) {
    throw new AdminWorkspaceError(403, "Unable to resolve organization context.");
  }

  return {
    db,
    userId: session.user.id,
    organizationId: profile.organization_id,
    organizationName: organization.name
  };
}

export async function getAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  const context = await requireAdminContext();
  const [scopedUserIds, insuranceResult, medicationsResult] = await Promise.all([
    listScopedUserIds(context),
    context.db
      .from("insurance_policies")
      .select("id, payer_name, status, created_at, patients(first_name,last_name)")
      .eq("organization_id", context.organizationId)
      .order("created_at", { ascending: false }),
    context.db.from("medications").select("id", { count: "exact", head: true })
  ]);

  if (insuranceResult.error || medicationsResult.error) {
    throw new AdminWorkspaceError(500, "Unable to load the admin dashboard.");
  }

  const profilesResult =
    scopedUserIds.length > 0
      ? await context.db
          .from("profiles")
          .select("id, full_name, email, role, created_at")
          .in("id", scopedUserIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null };

  if (profilesResult.error) {
    throw new AdminWorkspaceError(500, "Unable to load the admin dashboard.");
  }

  const users = profilesResult.data ?? [];
  const insurance = insuranceResult.data ?? [];
  const roleCounts = new Map<string, number>();
  users.forEach((row: any) => {
    roleCounts.set(row.role, (roleCounts.get(row.role) ?? 0) + 1);
  });

  const totalUsers = users.length;

  return {
    summary: [
      {
        label: "Total users",
        value: String(totalUsers),
        detail: "All users in the current organization, including other admins."
      },
      {
        label: "Insurance policies",
        value: String(insurance.length),
        detail: "Coverage records currently managed by this organization."
      },
      {
        label: "Medication catalog",
        value: String(medicationsResult.count ?? 0),
        detail: "Global medication records available to the admin workspace."
      }
    ],
    roleDistribution: Array.from(roleCounts.entries()).map(([label, value]) => ({
      label: label.replaceAll("_", " "),
      value,
      share: totalUsers > 0 ? Math.round((value / totalUsers) * 100) : 0
    })),
    recentUsers: users.slice(0, 5).map((row: any) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email ?? "Email pending",
      role: row.role,
      createdAt: formatDate(row.created_at)
    })),
    recentInsurance: insurance.slice(0, 5).map((row: any) => ({
      id: row.id,
      patientName: `${row.patients?.first_name ?? ""} ${row.patients?.last_name ?? ""}`.trim(),
      payerName: row.payer_name,
      status: row.status,
      createdAt: formatDate(row.created_at)
    }))
  };
}

export async function getAdminUsersPage(options: {
  query?: string;
  page?: string | number;
  role?: string;
}): Promise<AdminUsersPage> {
  const context = await requireAdminContext();
  const scopedUserIds = await listScopedUserIds(context);
  const query = String(options.query ?? "").trim();
  const page = Math.max(1, Number(options.page ?? 1) || 1);
  const role = (String(options.role ?? "all").trim() ||
    "all") as Database["public"]["Tables"]["profiles"]["Row"]["role"] | "all";
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  if (scopedUserIds.length === 0) {
    return {
      rows: [],
      total: 0,
      page,
      pageSize: PAGE_SIZE,
      totalPages: 1,
      query,
      role
    };
  }

  let builder = context.db
    .from("profiles")
    .select("id, full_name, email, phone, role, title, created_at", { count: "exact" })
    .in("id", scopedUserIds)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    builder = builder.or(
      `full_name.ilike.%${query}%,email.ilike.%${query}%,title.ilike.%${query}%`
    );
  }

  if (role !== "all") {
    builder = builder.eq("role", role);
  }

  const { data, error, count } = await builder;

  if (error) {
    throw new AdminWorkspaceError(500, "Unable to load users.");
  }

  const total = count ?? 0;

  return {
    rows: (data ?? []).map((row: any) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email ?? "Email pending",
      phone: row.phone ?? "Phone pending",
      role: row.role,
      title: row.title ?? "Title pending",
      createdAt: formatDate(row.created_at)
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    query,
    role
  };
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail> {
  const context = await requireAdminContext();
  const normalizedUserId = userId.trim();
  await assertUserInScope(context, normalizedUserId);

  const [userEmail, profileResult, caseManagerResult, patientResult] = await Promise.all([
    getUserEmail(context.db, normalizedUserId),
    context.db
      .from("profiles")
      .select("*")
      .eq("id", normalizedUserId)
      .maybeSingle(),
    context.db
      .from("case_managers")
      .select("id, active")
      .eq("organization_id", context.organizationId)
      .eq("profile_id", normalizedUserId)
      .maybeSingle(),
    context.db
      .from("patients")
      .select("id, organization_id")
      .eq("organization_id", context.organizationId)
      .eq("profile_id", normalizedUserId)
      .maybeSingle()
  ]);

  const providerResult = userEmail
    ? await context.db
        .from("providers")
        .select("id, practice_name, specialty, npi")
        .eq("organization_id", context.organizationId)
        .eq("email", userEmail)
        .maybeSingle()
    : { data: null };

  if (!profileResult.data) {
    throw new AdminWorkspaceError(404, "User not found.");
  }

  return {
    id: profileResult.data.id,
    fullName: profileResult.data.full_name,
    email: profileResult.data.email ?? "",
    phone: profileResult.data.phone ?? "",
    title: profileResult.data.title ?? "",
    role: profileResult.data.role,
    password: "",
    practiceName: providerResult.data?.practice_name ?? "",
    specialty: providerResult.data?.specialty ?? "",
    providerNpi: providerResult.data?.npi ?? "",
    createdAt: formatDate(profileResult.data.created_at),
    linkedProvider: providerResult.data
      ? {
          id: providerResult.data.id,
          practiceName: providerResult.data.practice_name ?? "",
          specialty: providerResult.data.specialty ?? "",
          npi: providerResult.data.npi ?? ""
        }
      : null,
    linkedCaseManager: caseManagerResult.data
      ? {
          id: caseManagerResult.data.id,
          active: caseManagerResult.data.active
        }
      : null,
    linkedPatient: patientResult.data
      ? {
          id: patientResult.data.id,
          organizationId: patientResult.data.organization_id
        }
      : null
  };
}

export async function createAdminUser(payload: AdminUserPayload) {
  const context = await requireAdminContext();
  const normalized = normalizeUserPayload(payload, true);

  const { data, error } = await context.db.auth.admin.createUser({
    email: normalized.email,
    email_confirm: true,
    password: normalized.password!,
    user_metadata: {
      full_name: normalized.fullName,
      role: normalized.role
    }
  });

  if (error || !data.user?.id) {
    throw new AdminWorkspaceError(500, error?.message ?? "Unable to create user.");
  }

  try {
    await bootstrapRegisteredUser({
      client: context.db,
      email: normalized.email,
      fullName: normalized.fullName,
      organizationName: context.organizationName,
      phone: normalized.phone ?? undefined,
      practiceName: normalized.practiceName ?? undefined,
      providerNpi: normalized.providerNpi ?? undefined,
      role: normalized.role,
      specialty: normalized.specialty ?? undefined,
      userId: data.user.id
    });
  } catch (error) {
    await context.db.auth.admin.deleteUser(data.user.id);
    throw error;
  }

  return { id: data.user.id };
}

export async function updateAdminUser(userId: string, payload: AdminUserPayload) {
  const context = await requireAdminContext();
  await assertUserInScope(context, userId);
  const normalized = normalizeUserPayload(payload, false);

  const authUpdate: {
    email: string;
    password?: string;
    user_metadata: {
      full_name: string;
      role: Database["public"]["Tables"]["profiles"]["Row"]["role"];
    };
  } = {
    email: normalized.email,
    user_metadata: {
      full_name: normalized.fullName,
      role: normalized.role
    }
  };

  if (normalized.password) {
    authUpdate.password = normalized.password;
  }

  const { error } = await context.db.auth.admin.updateUserById(userId, authUpdate);

  if (error) {
    throw new AdminWorkspaceError(500, error.message);
  }

  await bootstrapRegisteredUser({
    client: context.db,
    email: normalized.email,
    fullName: normalized.fullName,
    organizationName: context.organizationName,
    phone: normalized.phone ?? undefined,
    practiceName: normalized.practiceName ?? undefined,
    providerNpi: normalized.providerNpi ?? undefined,
    role: normalized.role,
    specialty: normalized.specialty ?? undefined,
    userId
  });

  return { id: userId };
}

export async function deleteAdminUser(userId: string) {
  const context = await requireAdminContext();

  if (userId === context.userId) {
    throw new AdminWorkspaceError(400, "You cannot delete your own admin account.");
  }

  await assertUserInScope(context, userId);

  const { error } = await context.db.auth.admin.deleteUser(userId);

  if (error) {
    throw new AdminWorkspaceError(500, error.message);
  }

  return { id: userId };
}

export async function getAdminInsurancePage(options: {
  query?: string;
  page?: string | number;
}): Promise<AdminInsurancePage> {
  const context = await requireAdminContext();
  const query = String(options.query ?? "").trim();
  const page = Math.max(1, Number(options.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let builder = context.db
    .from("insurance_policies")
    .select(
      "id, payer_name, plan_name, member_id, status, created_at, patients(first_name,last_name)",
      { count: "exact" }
    )
    .eq("organization_id", context.organizationId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    builder = builder.or(
      `payer_name.ilike.%${query}%,plan_name.ilike.%${query}%,member_id.ilike.%${query}%`
    );
  }

  const { data, error, count } = await builder;

  if (error) {
    throw new AdminWorkspaceError(500, "Unable to load insurance policies.");
  }

  const total = count ?? 0;

  return {
    rows: (data ?? []).map((row: any) => ({
      id: row.id,
      patientName: `${row.patients?.first_name ?? ""} ${row.patients?.last_name ?? ""}`.trim(),
      payerName: row.payer_name,
      planName: row.plan_name ?? "Plan pending",
      memberId: row.member_id,
      status: row.status,
      createdAt: formatDate(row.created_at)
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    query
  };
}

export async function getInsuranceDetail(insuranceId: string): Promise<AdminInsuranceDetail> {
  const context = await requireAdminContext();
  const { data } = await context.db
    .from("insurance_policies")
    .select(
      "id, patient_id, payer_name, plan_name, member_id, group_number, bin, pcn, status, verification_notes, created_at, patients(first_name,last_name)"
    )
    .eq("organization_id", context.organizationId)
    .eq("id", insuranceId)
    .maybeSingle();

  if (!data) {
    throw new AdminWorkspaceError(404, "Insurance policy not found.");
  }

  return {
    id: data.id,
    patientId: data.patient_id,
    patientName: `${data.patients?.first_name ?? ""} ${data.patients?.last_name ?? ""}`.trim(),
    payerName: data.payer_name,
    planName: data.plan_name ?? "",
    memberId: data.member_id,
    groupNumber: data.group_number ?? "",
    bin: data.bin ?? "",
    pcn: data.pcn ?? "",
    status: data.status,
    verificationNotes: data.verification_notes ?? "",
    createdAt: formatDate(data.created_at)
  };
}

export async function createInsurancePolicy(payload: AdminInsurancePayload) {
  const context = await requireAdminContext();
  const normalized = normalizeInsurancePayload(payload);

  const { data, error } = await context.db
    .from("insurance_policies")
    .insert({
      organization_id: context.organizationId,
      patient_id: normalized.patientId,
      payer_name: normalized.payerName,
      plan_name: normalized.planName,
      member_id: normalized.memberId,
      group_number: normalized.groupNumber,
      bin: normalized.bin,
      pcn: normalized.pcn,
      status: normalized.status,
      verification_notes: normalized.verificationNotes
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new AdminWorkspaceError(500, error?.message ?? "Unable to create insurance.");
  }

  return { id: data.id };
}

export async function updateInsurancePolicy(
  insuranceId: string,
  payload: AdminInsurancePayload
) {
  const context = await requireAdminContext();
  const normalized = normalizeInsurancePayload(payload);

  const { data, error } = await context.db
    .from("insurance_policies")
    .update({
      patient_id: normalized.patientId,
      payer_name: normalized.payerName,
      plan_name: normalized.planName,
      member_id: normalized.memberId,
      group_number: normalized.groupNumber,
      bin: normalized.bin,
      pcn: normalized.pcn,
      status: normalized.status,
      verification_notes: normalized.verificationNotes
    })
    .eq("organization_id", context.organizationId)
    .eq("id", insuranceId)
    .select("id")
    .maybeSingle();

  if (error || !data?.id) {
    throw new AdminWorkspaceError(500, error?.message ?? "Unable to update insurance.");
  }

  return { id: data.id };
}

export async function deleteInsurancePolicy(insuranceId: string) {
  const context = await requireAdminContext();
  const { data, error } = await context.db
    .from("insurance_policies")
    .delete()
    .eq("organization_id", context.organizationId)
    .eq("id", insuranceId)
    .select("id")
    .maybeSingle();

  if (error || !data?.id) {
    throw new AdminWorkspaceError(500, error?.message ?? "Unable to delete insurance.");
  }

  return { id: data.id };
}

export async function getMedicationCatalog(options: {
  query?: string;
  page?: string | number;
}): Promise<AdminMedicationsPage> {
  const _context = await requireAdminContext();
  const query = String(options.query ?? "").trim();
  const page = Math.max(1, Number(options.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let builder = _context.db
    .from("medications")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (query) {
    builder = builder.or(
      `name.ilike.%${query}%,therapy_area.ilike.%${query}%,manufacturer.ilike.%${query}%`
    );
  }

  const { data, error, count } = await builder;

  if (error) {
    throw new AdminWorkspaceError(500, "Unable to load medications.");
  }

  const total = count ?? 0;

  return {
    rows: (data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
      manufacturer: row.manufacturer ?? "Manufacturer pending",
      therapyArea: row.therapy_area ?? "General",
      supportProgram: row.support_program ?? "Program pending",
      requiresPriorAuth: Boolean(row.requires_prior_auth),
      requiresColdChain: Boolean(row.requires_cold_chain),
      active: Boolean(row.active),
      createdAt: formatDate(row.created_at)
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    query
  };
}

export async function getMedicationDetail(medicationId: string): Promise<AdminMedicationDetail> {
  const context = await requireAdminContext();
  const { data } = await context.db
    .from("medications")
    .select("*")
    .eq("id", medicationId)
    .maybeSingle();

  if (!data) {
    throw new AdminWorkspaceError(404, "Medication not found.");
  }

  return {
    id: data.id,
    name: data.name,
    manufacturer: data.manufacturer ?? "",
    therapyArea: data.therapy_area ?? "",
    supportProgram: data.support_program ?? "",
    requiresPriorAuth: Boolean(data.requires_prior_auth),
    requiresColdChain: Boolean(data.requires_cold_chain),
    active: Boolean(data.active),
    createdAt: formatDate(data.created_at)
  };
}

export async function createMedication(payload: AdminMedicationPayload) {
  const _context = await requireAdminContext();
  const normalized = normalizeMedicationPayload(payload);

  const { data, error } = await _context.db
    .from("medications")
    .insert({
      name: normalized.name,
      manufacturer: normalized.manufacturer,
      therapy_area: normalized.therapyArea,
      support_program: normalized.supportProgram,
      requires_prior_auth: normalized.requiresPriorAuth,
      requires_cold_chain: normalized.requiresColdChain,
      active: normalized.active
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new AdminWorkspaceError(500, error?.message ?? "Unable to create medication.");
  }

  return { id: data.id };
}

export async function updateMedication(
  medicationId: string,
  payload: AdminMedicationPayload
) {
  const _context = await requireAdminContext();
  const normalized = normalizeMedicationPayload(payload);

  const { data, error } = await _context.db
    .from("medications")
    .update({
      name: normalized.name,
      manufacturer: normalized.manufacturer,
      therapy_area: normalized.therapyArea,
      support_program: normalized.supportProgram,
      requires_prior_auth: normalized.requiresPriorAuth,
      requires_cold_chain: normalized.requiresColdChain,
      active: normalized.active
    })
    .eq("id", medicationId)
    .select("id")
    .maybeSingle();

  if (error || !data?.id) {
    throw new AdminWorkspaceError(500, error?.message ?? "Unable to update medication.");
  }

  return { id: data.id };
}

export async function deleteMedication(medicationId: string) {
  const _context = await requireAdminContext();
  const { data, error } = await _context.db
    .from("medications")
    .delete()
    .eq("id", medicationId)
    .select("id")
    .maybeSingle();

  if (error || !data?.id) {
    throw new AdminWorkspaceError(500, error?.message ?? "Unable to delete medication.");
  }

  return { id: data.id };
}

export async function getPatientOptions(): Promise<AdminPatientOption[]> {
  const context = await requireAdminContext();
  const { data, error } = await context.db
    .from("patients")
    .select("id, first_name, last_name")
    .eq("organization_id", context.organizationId)
    .order("first_name", { ascending: true });

  if (error) {
    throw new AdminWorkspaceError(500, "Unable to load patient options.");
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    label: `${row.first_name} ${row.last_name}`.trim()
  }));
}

function normalizeUserPayload(payload: AdminUserPayload, requirePassword: boolean) {
  const fullName = String(payload.fullName ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "").trim();

  if (fullName.length < 2) {
    throw new AdminWorkspaceError(400, "Full name must be at least 2 characters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AdminWorkspaceError(400, "Enter a valid email address.");
  }

  if (requirePassword && password.length < 8) {
    throw new AdminWorkspaceError(400, "Password must be at least 8 characters.");
  }

  return {
    fullName,
    email,
    password: password || undefined,
    phone: normalizeOptionalText(payload.phone),
    title: normalizeOptionalText(payload.title),
    role: payload.role,
    practiceName: normalizeOptionalText(payload.practiceName),
    specialty: normalizeOptionalText(payload.specialty),
    providerNpi: normalizeOptionalText(payload.providerNpi)
  };
}

function normalizeInsurancePayload(payload: AdminInsurancePayload) {
  const patientId = String(payload.patientId ?? "").trim();
  const payerName = String(payload.payerName ?? "").trim();
  const memberId = String(payload.memberId ?? "").trim();

  if (!patientId || !payerName || !memberId) {
    throw new AdminWorkspaceError(
      400,
      "Patient, payer name, and member ID are required."
    );
  }

  return {
    patientId,
    payerName,
    memberId,
    planName: normalizeOptionalText(payload.planName),
    groupNumber: normalizeOptionalText(payload.groupNumber),
    bin: normalizeOptionalText(payload.bin),
    pcn: normalizeOptionalText(payload.pcn),
    status: payload.status,
    verificationNotes: normalizeOptionalText(payload.verificationNotes)
  };
}

function normalizeMedicationPayload(payload: AdminMedicationPayload) {
  const name = String(payload.name ?? "").trim();

  if (name.length < 2) {
    throw new AdminWorkspaceError(400, "Medication name must be at least 2 characters.");
  }

  return {
    name,
    manufacturer: normalizeOptionalText(payload.manufacturer),
    therapyArea: normalizeOptionalText(payload.therapyArea),
    supportProgram: normalizeOptionalText(payload.supportProgram),
    requiresPriorAuth: Boolean(payload.requiresPriorAuth),
    requiresColdChain: Boolean(payload.requiresColdChain),
    active: Boolean(payload.active)
  };
}

function normalizeOptionalText(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
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
