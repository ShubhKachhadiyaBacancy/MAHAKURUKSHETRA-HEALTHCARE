import type { Database } from "@/types/database";

type PatientRow = Database["public"]["Tables"]["patients"]["Row"];

export type OrganizerDashboardSnapshot = {
  organizationName: string;
  sourceLabel: string;
  summary: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  growth: Array<{
    label: string;
    value: number;
  }>;
  distribution: Array<{
    label: string;
    value: number;
    share: number;
  }>;
  recentPatients: Array<{
    id: string;
    name: string;
    location: string;
    consentStatus: PatientRow["consent_status"];
    createdAt: string;
  }>;
};

export type OrganizerPatientSortField = "created_at" | "last_name" | "first_name";
export type OrganizerSortDirection = "asc" | "desc";

export type OrganizerPatientListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  preferredChannel: PatientRow["preferred_channel"];
  consentStatus: PatientRow["consent_status"];
  createdAt: string;
};

export type OrganizerPatientsPage = {
  rows: OrganizerPatientListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
  sort: OrganizerPatientSortField;
  direction: OrganizerSortDirection;
};

export type OrganizerPatientPayload = {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  sex: PatientRow["sex"];
  email: string | null;
  phone: string | null;
  preferredChannel: PatientRow["preferred_channel"];
  city: string | null;
  state: string | null;
  zipCode: string | null;
  consentStatus: PatientRow["consent_status"];
};

export type OrganizerPatientDetail = OrganizerPatientPayload & {
  id: string;
  createdAt: string;
  updatedAt: string;
  relatedPrescriptions: Array<{
    id: string;
    medication: string;
    therapyArea: string;
    dosage: string;
    diagnosis: string;
  }>;
  relatedCases: Array<{
    id: string;
    status: string;
    priority: string;
    lastActivityAt: string;
  }>;
  insurancePolicies: Array<{
    id: string;
    payerName: string;
    planName: string;
    memberId: string;
    status: string;
  }>;
};

export type OrganizerMedicationRecord = {
  id: string;
  name: string;
  manufacturer: string;
  therapyArea: string;
  supportProgram: string;
  requiresPriorAuth: boolean;
  requiresColdChain: boolean;
  active: boolean;
  organizationUsageCount: number;
  selectedForOrganization: boolean;
};

export type OrganizerMedicationsSnapshot = {
  selectionMode: "derived";
  note: string;
  rows: OrganizerMedicationRecord[];
};

export type OrganizerOfficeRecord = {
  id: string;
  name: string;
  providerCount: number;
  specialties: string[];
  contacts: string[];
};

export type OrganizerOfficesSnapshot = {
  mode: "derived";
  note: string;
  rows: OrganizerOfficeRecord[];
};

export type OrganizerReportsSnapshot = {
  metrics: Array<{
    label: string;
    value: string;
    note: string;
  }>;
  rows: Array<{
    id: string;
    type: string;
    generatedAt: string;
    source: string;
    downloadUrl: string;
  }>;
};

export type OrganizerProfileSnapshot = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  title: string;
  organizationName: string;
  roleLabel: string;
};
