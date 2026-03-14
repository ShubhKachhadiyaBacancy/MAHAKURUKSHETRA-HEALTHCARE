import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type InsuranceRow = Database["public"]["Tables"]["insurance_policies"]["Row"];

export type AdminDashboardSnapshot = {
  summary: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  roleDistribution: Array<{
    label: string;
    value: number;
    share: number;
  }>;
  recentUsers: Array<{
    id: string;
    fullName: string;
    email: string;
    role: ProfileRow["role"];
    createdAt: string;
  }>;
  recentInsurance: Array<{
    id: string;
    patientName: string;
    payerName: string;
    status: InsuranceRow["status"];
    createdAt: string;
  }>;
  userCharts: Array<{
    id: string;
    fullName: string;
    email: string;
    role: ProfileRow["role"];
    title: string;
    createdAt: string;
    detail: string;
    metrics: Array<{
      label: string;
      value: number;
      tone: "sky" | "emerald" | "amber";
    }>;
  }>;
};

export type AdminUserListItem = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: ProfileRow["role"];
  title: string;
  createdAt: string;
};

export type AdminUsersPage = {
  rows: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
  role: ProfileRow["role"] | "all";
};

export type AdminUserPayload = {
  fullName: string;
  email: string;
  password?: string;
  phone?: string | null;
  title?: string | null;
  role: ProfileRow["role"];
  organizationName?: string | null;
  practiceName?: string | null;
  specialty?: string | null;
  providerNpi?: string | null;
};

export type AdminUserDetail = AdminUserPayload & {
  id: string;
  createdAt: string;
  linkedProvider: {
    id: string;
    practiceName: string;
    specialty: string;
    npi: string;
  } | null;
  linkedCaseManager: {
    id: string;
    active: boolean;
  } | null;
  linkedPatient: {
    id: string;
    organizationId: string;
  } | null;
};

export type AdminInsuranceListItem = {
  id: string;
  patientName: string;
  payerName: string;
  planName: string;
  memberId: string;
  status: InsuranceRow["status"];
  createdAt: string;
};

export type AdminInsurancePage = {
  rows: AdminInsuranceListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
};

export type AdminInsurancePayload = {
  patientId: string;
  payerName: string;
  planName?: string | null;
  memberId: string;
  groupNumber?: string | null;
  bin?: string | null;
  pcn?: string | null;
  status: InsuranceRow["status"];
  verificationNotes?: string | null;
};

export type AdminInsuranceDetail = AdminInsurancePayload & {
  id: string;
  patientName: string;
  createdAt: string;
};

export type AdminMedicationListItem = {
  id: string;
  name: string;
  manufacturer: string;
  therapyArea: string;
  supportProgram: string;
  requiresPriorAuth: boolean;
  requiresColdChain: boolean;
  active: boolean;
  createdAt: string;
};

export type AdminMedicationsPage = {
  rows: AdminMedicationListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
};

export type AdminMedicationPayload = {
  name: string;
  manufacturer?: string | null;
  therapyArea?: string | null;
  supportProgram?: string | null;
  requiresPriorAuth: boolean;
  requiresColdChain: boolean;
  active: boolean;
};

export type AdminMedicationDetail = AdminMedicationPayload & {
  id: string;
  createdAt: string;
};

export type AdminPatientOption = {
  id: string;
  label: string;
};
