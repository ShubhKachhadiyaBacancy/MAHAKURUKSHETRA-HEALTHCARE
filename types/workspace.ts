import type { RegisterRole } from "@/lib/auth/register";

export type ViewerContext = {
  displayName: string;
  role: RegisterRole;
  roleLabel: string;
  organizationName: string;
  mode: "demo" | "live";
  hasSession: boolean;
};

export type CaseListItem = {
  id: string;
  patientName: string;
  therapy: string;
  therapyArea: string;
  payer: string;
  status: string;
  affordabilityStatus: string;
  nextAction: string;
  owner: string;
  priority: "routine" | "watch" | "critical";
  updatedAt: string;
};

export type CaseDetail = {
  id: string;
  patient: {
    fullName: string;
    dob: string;
    contact: string;
    location: string;
    preferredChannel: string;
  };
  provider: {
    name: string;
    specialty: string;
    npi: string;
    practice: string;
  };
  therapy: {
    medication: string;
    therapyArea: string;
    dosage: string;
    diagnosis: string;
  };
  coverage: {
    payer: string;
    plan: string;
    memberId: string;
    status: string;
    notes: string;
  };
  caseState: {
    status: string;
    priority: string;
    nextAction: string;
    owner: string;
    dueAt: string;
    barrierSummary: string;
  };
  priorAuthorization: Array<{
    id: string;
    status: string;
    submittedAt: string;
    dueAt: string;
    summary: string;
  }>;
  financialAssistance: Array<{
    id: string;
    program: string;
    status: string;
    savings: string;
  }>;
  communications: Array<{
    id: string;
    channel: string;
    direction: string;
    summary: string;
    timestamp: string;
  }>;
  documents: Array<{
    id: string;
    title: string;
    category: string;
    addedAt: string;
  }>;
};

export type ReportsSnapshot = {
  metrics: Array<{
    label: string;
    value: string;
    note: string;
  }>;
  rows: Array<{
    id: string;
    patientName: string;
    therapy: string;
    payer: string;
    status: string;
    createdAt: string;
    owner: string;
  }>;
};

export type SettingsSnapshot = {
  preferredPharmacy: string;
  specialtyProgram: string;
  notificationChannels: string[];
  dailyDigest: string;
  escalationRule: string;
};
