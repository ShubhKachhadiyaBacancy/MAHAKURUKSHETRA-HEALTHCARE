export type PatientClaimStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "approved"
  | "partially_approved"
  | "denied"
  | "paid";

export type PatientClaimType = "medical" | "pharmacy" | "reimbursement" | "support";

export type PatientMetric = {
  label: string;
  value: string;
  detail: string;
  tone: "default" | "warning" | "critical" | "accent";
};

export type PatientMedicationRecord = {
  id: string;
  medicationName: string;
  therapyArea: string;
  dosage: string;
  diagnosis: string;
  providerName: string;
  officeName: string;
  writtenAt: string;
};

export type PatientClaimRecord = {
  id: string;
  claimNumber: string;
  claimType: PatientClaimType;
  status: PatientClaimStatus;
  payerName: string;
  amount: string;
  amountValue: string;
  serviceDate: string;
  serviceDateValue: string;
  note: string;
  caseId: string | null;
  medicationName: string;
  officeName: string;
  createdAt: string;
};

export type PatientClaimCaseOption = {
  id: string;
  label: string;
};

export type PatientDashboardSnapshot = {
  sourceLabel: string;
  metrics: PatientMetric[];
  organizationName: string;
  officeName: string;
  careCoordinator: string;
  nextAction: string;
  medications: PatientMedicationRecord[];
  claims: PatientClaimRecord[];
};

export type PatientClaimsSnapshot = {
  metrics: Array<{
    label: string;
    value: string;
    note: string;
  }>;
  rows: PatientClaimRecord[];
  caseOptions: PatientClaimCaseOption[];
};

export type PatientProfileSnapshot = {
  fullName: string;
  email: string;
  phone: string;
  roleLabel: string;
  dateOfBirth: string;
  preferredChannel: "sms" | "email" | "call" | "portal";
  city: string;
  state: string;
  zipCode: string;
  organizationName: string;
  officeName: string;
  medications: PatientMedicationRecord[];
};

export type PatientClaimPayload = {
  amount?: string;
  caseId?: string | null;
  claimNumber?: string;
  claimType?: string;
  note?: string;
  payerName?: string;
  serviceDate?: string;
  status?: string;
};

export type PatientProfilePayload = {
  city?: string;
  dateOfBirth?: string;
  fullName?: string;
  phone?: string;
  preferredChannel?: string;
  state?: string;
  zipCode?: string;
};
