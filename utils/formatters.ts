export function formatScheduledAt(value: string | null) {
  if (!value) {
    return "Pending schedule";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function humanizeSnakeCase(value: string) {
  return value.replaceAll("_", " ");
}
