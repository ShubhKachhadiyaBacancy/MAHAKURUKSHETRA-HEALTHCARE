export function getPriorityLabel(priority: string) {
  if (priority === "critical") {
    return "Critical case";
  }

  if (priority === "watch") {
    return "Watch list";
  }

  return "Routine";
}

export function getStatusTone(status: string, priority: string) {
  if (priority === "critical" || status === "blocked" || status === "denied") {
    return "critical" as const;
  }

  if (status === "prior_auth" || status === "benefit_verification") {
    return "warning" as const;
  }

  return "default" as const;
}
