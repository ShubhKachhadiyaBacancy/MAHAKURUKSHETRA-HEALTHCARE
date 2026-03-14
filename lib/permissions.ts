import type { RegisterRole } from "@/lib/auth/register";

type ActionSet = {
  add?: boolean;
  edit?: boolean;
  delete?: boolean;
  view: boolean;
};

type RolePrivileges = Record<RegisterRole, ActionSet>;

export type ModulePermission = {
  id: string;
  module: string;
  description: string;
  privileges: RolePrivileges;
};

const fullAccess: ActionSet = { add: true, edit: true, delete: true, view: true };
const manageAccess: ActionSet = { add: true, edit: true, view: true };
const viewOnly: ActionSet = { view: true };

export const modulePermissions: ModulePermission[] = [
  {
    id: "user-management",
    module: "User Management",
    description: "Provision teams, roles, and auditing so people land in the right workspace slice.",
    privileges: {
      admin: fullAccess,
      organizer: viewOnly,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "patient-enrollment",
    module: "Patient Enrollment",
    description: "Collect enrollment paperwork and organization details for each therapy start.",
    privileges: {
      admin: fullAccess,
      organizer: fullAccess,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "patient-records",
    module: "Patient Records",
    description: "Centralize clinical, demographic, and payer data inside each patient card.",
    privileges: {
      admin: fullAccess,
      organizer: fullAccess,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "prescriptions",
    module: "Prescriptions",
    description: "Author therapies, attach medication details, and keep dosage history accurate.",
    privileges: {
      admin: fullAccess,
      organizer: manageAccess,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "prior-authorizations",
    module: "Prior Authorizations",
    description: "Submit, track, and respond to payer reviews inside the same workflow.",
    privileges: {
      admin: fullAccess,
      organizer: manageAccess,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "insurance-verification",
    module: "Insurance Verification",
    description: "Check policies, payer coverage, and member IDs before therapy moves forward.",
    privileges: {
      admin: fullAccess,
      organizer: fullAccess,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "financial-assistance",
    module: "Financial Assistance Programs",
    description: "Track copay, bridge, and foundations so savings are visible per case.",
    privileges: {
      admin: fullAccess,
      organizer: manageAccess,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "adherence-tracking",
    module: "Medication Adherence Tracking",
    description: "Document refills, missed doses, and patient feedback within each case.",
    privileges: {
      admin: fullAccess,
      organizer: viewOnly,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "side-effect-reporting",
    module: "Side Effect Reporting",
    description: "Capture adverse events with severity flags and follow-up tasks.",
    privileges: {
      admin: fullAccess,
      organizer: viewOnly,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "pharmacy-fulfillment",
    module: "Pharmacy Fulfillment",
    description: "Connect to specialty pharmacies to confirm shipment and pick-up.",
    privileges: {
      admin: fullAccess,
      organizer: viewOnly,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "communication-hub",
    module: "Communication Hub",
    description: "SMS, email, and outbound reminders live directly inside each case.",
    privileges: {
      admin: fullAccess,
      organizer: manageAccess,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "clinical-documentation",
    module: "Clinical Documentation",
    description: "Attach notes, structured fields, and audit tags before submission.",
    privileges: {
      admin: fullAccess,
      organizer: manageAccess,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "documents-upload",
    module: "Documents Upload / OCR",
    description: "Store PDFs, images, and OCR metadata for payer or manufacturer review.",
    privileges: {
      admin: fullAccess,
      organizer: manageAccess,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "workflow-automation",
    module: "Workflow Automation",
    description: "Automate notifications, reminders, and escalations without leaving the surface.",
    privileges: {
      admin: fullAccess,
      organizer: viewOnly,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "analytics-dashboard",
    module: "Analytics Dashboard",
    description: "Monitor throughput, blockers, and financial impact across the org.",
    privileges: {
      admin: fullAccess,
      organizer: viewOnly,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "audit-compliance",
    module: "Audit Logs / Compliance",
    description: "See who touched which case, what changed, and when.",
    privileges: {
      admin: fullAccess,
      organizer: viewOnly,
      patients: viewOnly,
      doctor: viewOnly
    }
  },
  {
    id: "ehr-integration",
    module: "EHR Integration",
    description: "Push and pull documents with connected EHR partners.",
    privileges: {
      admin: fullAccess,
      organizer: viewOnly,
      patients: viewOnly,
      doctor: viewOnly
    }
  }
];
