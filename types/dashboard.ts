export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  tone: "default" | "warning" | "critical" | "accent";
};

export type DashboardCase = {
  id: string;
  patientName: string;
  therapy: string;
  payer: string;
  status: string;
  nextAction: string;
  priorityLabel: string;
  tone: "default" | "warning" | "critical";
};

export type OutreachItem = {
  recipient: string;
  channel: string;
  summary: string;
  scheduledFor: string;
};

export type ActivityItem = {
  title: string;
  description: string;
  timestamp: string;
};

export type ProviderDashboardData = {
  sourceLabel: string;
  metrics: DashboardMetric[];
  cases: DashboardCase[];
  outreachQueue: OutreachItem[];
  activityLog: ActivityItem[];
};

export type DashboardTrend = {
  label: string;
  value: string;
  note: string;
};
