import type { ProviderDashboardData } from "@/types/dashboard";
import type {
  CaseDetail,
  CaseListItem,
  ReportsSnapshot,
  SettingsSnapshot,
  ViewerContext
} from "@/types/workspace";

export const demoViewer: ViewerContext = {
  displayName: "Maya Chen",
  role: "case_manager",
  roleLabel: "Case manager",
  organizationName: "Northstar Specialty Care",
  mode: "demo",
  hasSession: false
};

export const demoDashboard: ProviderDashboardData = {
  sourceLabel: "Preview dataset",
  metrics: [
    {
      label: "Active access cases",
      value: "42",
      detail: "Enrollment, verification, and readiness cases currently moving through the access layer.",
      tone: "default"
    },
    {
      label: "Prior auth in flight",
      value: "11",
      detail: "Cases waiting on payer review or documentation before therapy can move forward.",
      tone: "warning"
    },
    {
      label: "Affordability opportunities",
      value: "8",
      detail: "Patients where financial support could reduce abandonment risk before first fill.",
      tone: "accent"
    },
    {
      label: "Critical blockers",
      value: "4",
      detail: "Cases that need an escalation, appeal, or missing clinical packet today.",
      tone: "critical"
    }
  ],
  cases: [
    {
      id: "case-ava-thompson",
      patientName: "Ava Thompson",
      therapy: "Dupixent",
      payer: "Blue Cross Blue Shield",
      status: "Prior auth review",
      nextAction: "Upload eosinophil lab panel and resubmit",
      priorityLabel: "Critical case",
      tone: "warning"
    },
    {
      id: "case-rafael-kim",
      patientName: "Rafael Kim",
      therapy: "Ocrevus",
      payer: "Aetna",
      status: "Financial screening",
      nextAction: "Verify bridge support and affordability threshold",
      priorityLabel: "Watch list",
      tone: "default"
    },
    {
      id: "case-leah-brooks",
      patientName: "Leah Brooks",
      therapy: "Tagrisso",
      payer: "UnitedHealthcare",
      status: "Coverage blocked",
      nextAction: "Prepare denial appeal with chart notes",
      priorityLabel: "Critical case",
      tone: "critical"
    },
    {
      id: "case-noah-bennett",
      patientName: "Noah Bennett",
      therapy: "Skyrizi",
      payer: "Cigna",
      status: "Ready for pharmacy",
      nextAction: "Coordinate shipment and patient outreach",
      priorityLabel: "Routine",
      tone: "default"
    }
  ],
  outreachQueue: [
    {
      recipient: "Ava Thompson",
      channel: "SMS",
      summary: "Remind patient to upload supporting labs before payer cutoff.",
      scheduledFor: "Today at 1:15 PM"
    },
    {
      recipient: "Leah Brooks",
      channel: "Call",
      summary: "Review denial appeal path and manufacturer support eligibility.",
      scheduledFor: "Today at 3:30 PM"
    },
    {
      recipient: "Dr. Shah office",
      channel: "Email",
      summary: "Request updated oncology chart notes and pathology report.",
      scheduledFor: "Tomorrow at 9:00 AM"
    }
  ],
  activityLog: [
    {
      title: "Benefits verified for Rafael Kim",
      description: "Case moved from intake into affordability review with bridge support recommended.",
      timestamp: "18 minutes ago"
    },
    {
      title: "New oncology intake created",
      description: "Leah Brooks referral entered from the digital enrollment portal.",
      timestamp: "49 minutes ago"
    },
    {
      title: "Payer denial returned",
      description: "Tagrisso case flagged for appeal with medical necessity follow-up.",
      timestamp: "1 hour ago"
    }
  ]
};

export const demoCases: CaseListItem[] = [
  {
    id: "case-ava-thompson",
    patientName: "Ava Thompson",
    therapy: "Dupixent",
    therapyArea: "Immunology",
    payer: "Blue Cross Blue Shield",
    status: "Prior auth",
    affordabilityStatus: "Copay support screening",
    nextAction: "Collect missing labs",
    owner: "Maya Chen",
    priority: "critical",
    updatedAt: "12 minutes ago"
  },
  {
    id: "case-rafael-kim",
    patientName: "Rafael Kim",
    therapy: "Ocrevus",
    therapyArea: "Neurology",
    payer: "Aetna",
    status: "Financial assistance",
    affordabilityStatus: "Bridge program eligible",
    nextAction: "Finalize bridge enrollment",
    owner: "Jordan Lee",
    priority: "watch",
    updatedAt: "28 minutes ago"
  },
  {
    id: "case-leah-brooks",
    patientName: "Leah Brooks",
    therapy: "Tagrisso",
    therapyArea: "Oncology",
    payer: "UnitedHealthcare",
    status: "Blocked",
    affordabilityStatus: "Foundation research pending",
    nextAction: "Build appeal packet",
    owner: "Maya Chen",
    priority: "critical",
    updatedAt: "41 minutes ago"
  },
  {
    id: "case-noah-bennett",
    patientName: "Noah Bennett",
    therapy: "Skyrizi",
    therapyArea: "Immunology",
    payer: "Cigna",
    status: "Ready to start",
    affordabilityStatus: "Savings confirmed",
    nextAction: "Coordinate shipment",
    owner: "Priya Rao",
    priority: "routine",
    updatedAt: "1 hour ago"
  }
];

export const demoCaseDetails: Record<string, CaseDetail> = {
  "case-ava-thompson": {
    id: "case-ava-thompson",
    patient: {
      fullName: "Ava Thompson",
      dob: "Apr 12, 1988",
      contact: "ava.thompson@example.com • (555) 010-1001",
      location: "Chicago, IL 60611",
      preferredChannel: "SMS"
    },
    provider: {
      name: "Dr. Priya Patel",
      specialty: "Pulmonology",
      npi: "1234567890",
      practice: "Lakeview Respiratory Partners"
    },
    therapy: {
      medication: "Dupixent",
      therapyArea: "Immunology",
      dosage: "300mg pen",
      diagnosis: "Severe eosinophilic asthma"
    },
    coverage: {
      payer: "Blue Cross Blue Shield",
      plan: "PPO Gold 3500",
      memberId: "BCBS-44391",
      status: "Verified",
      notes: "Prior auth required. Payer requested recent eosinophil lab values."
    },
    caseState: {
      status: "Prior auth",
      priority: "Critical",
      nextAction: "Collect lab panel and resubmit clinical packet",
      owner: "Maya Chen",
      dueAt: "Today, 4:00 PM",
      barrierSummary: "Clinical documentation incomplete for payer review."
    },
    priorAuthorization: [
      {
        id: "pa-001",
        status: "Pending",
        submittedAt: "Mar 12, 2026",
        dueAt: "Mar 15, 2026",
        summary: "Electronic PA submitted; payer requested missing clinicals."
      }
    ],
    financialAssistance: [
      {
        id: "fa-001",
        program: "Dupixent MyWay copay support",
        status: "Screening",
        savings: "$0 to $150 / month estimate"
      }
    ],
    communications: [
      {
        id: "comm-001",
        channel: "SMS",
        direction: "Outbound",
        summary: "Requested lab upload via patient portal link.",
        timestamp: "Today, 9:12 AM"
      },
      {
        id: "comm-002",
        channel: "Email",
        direction: "Outbound",
        summary: "Follow-up to provider office for updated chart notes.",
        timestamp: "Yesterday, 4:40 PM"
      }
    ],
    documents: [
      {
        id: "doc-001",
        title: "Pulmonology chart note",
        category: "Clinical",
        addedAt: "Mar 12, 2026"
      },
      {
        id: "doc-002",
        title: "Insurance card - front and back",
        category: "Insurance",
        addedAt: "Mar 12, 2026"
      }
    ]
  },
  "case-rafael-kim": {
    id: "case-rafael-kim",
    patient: {
      fullName: "Rafael Kim",
      dob: "Sep 19, 1977",
      contact: "rafael.kim@example.com • (555) 010-1002",
      location: "Austin, TX 78701",
      preferredChannel: "Email"
    },
    provider: {
      name: "Dr. Elena Morris",
      specialty: "Neurology",
      npi: "2234567890",
      practice: "Central Texas Neuro Clinic"
    },
    therapy: {
      medication: "Ocrevus",
      therapyArea: "Neurology",
      dosage: "600mg infusion",
      diagnosis: "Relapsing multiple sclerosis"
    },
    coverage: {
      payer: "Aetna",
      plan: "Open Choice PPO",
      memberId: "AET-19902",
      status: "Verified",
      notes: "Benefits verified. Patient cost exposure remains high without assistance."
    },
    caseState: {
      status: "Financial assistance",
      priority: "Watch",
      nextAction: "Confirm bridge enrollment eligibility",
      owner: "Jordan Lee",
      dueAt: "Tomorrow, 11:00 AM",
      barrierSummary: "High out-of-pocket exposure before infusion scheduling."
    },
    priorAuthorization: [
      {
        id: "pa-002",
        status: "Approved",
        submittedAt: "Mar 9, 2026",
        dueAt: "Mar 11, 2026",
        summary: "Electronic prior auth approved in 48 hours."
      }
    ],
    financialAssistance: [
      {
        id: "fa-002",
        program: "Bridge therapy support",
        status: "Active screening",
        savings: "$1,850 / infusion estimate"
      }
    ],
    communications: [
      {
        id: "comm-003",
        channel: "Email",
        direction: "Outbound",
        summary: "Sent bridge enrollment checklist to patient.",
        timestamp: "Today, 10:20 AM"
      }
    ],
    documents: [
      {
        id: "doc-003",
        title: "MRI summary",
        category: "Clinical",
        addedAt: "Mar 10, 2026"
      }
    ]
  }
};

export const demoReports: ReportsSnapshot = {
  metrics: [
    {
      label: "New enrollments this week",
      value: "17",
      note: "Digital intake submissions across oncology, immunology, and neurology."
    },
    {
      label: "Median time to auth decision",
      value: "2.8 days",
      note: "Measured from intake completion to prior authorization outcome."
    },
    {
      label: "Affordability cases created",
      value: "8",
      note: "Patients routed to copay, PAP, bridge, or foundation support."
    }
  ],
  rows: demoCases.map((entry) => ({
    id: entry.id,
    patientName: entry.patientName,
    therapy: entry.therapy,
    payer: entry.payer,
    status: entry.status,
    createdAt: entry.updatedAt,
    owner: entry.owner
  }))
};

export const demoSettings: SettingsSnapshot = {
  preferredPharmacy: "Northstar Specialty Pharmacy",
  specialtyProgram: "Immunology high-touch workflow",
  notificationChannels: ["Email digest", "Critical SMS alerts", "In-app notifications"],
  dailyDigest: "Weekdays at 7:30 AM",
  escalationRule: "Critical blockers escalate to case manager after 4 business hours"
};

export const helpTopics = [
  {
    title: "Enrollment and onboarding",
    items: [
      "How to create a patient intake from the enrollment portal",
      "What fields are required before benefits investigation begins",
      "How to route urgent referrals for same-day review"
    ]
  },
  {
    title: "Prior authorization",
    items: [
      "What documents belong in the initial payer packet",
      "How to capture denial reasons and prepare appeals",
      "How to view the latest status without leaving the case"
    ]
  },
  {
    title: "Affordability and support",
    items: [
      "When to create a financial assistance case",
      "How bridge programs differ from copay and PAP support",
      "How to document estimated patient savings"
    ]
  }
];
