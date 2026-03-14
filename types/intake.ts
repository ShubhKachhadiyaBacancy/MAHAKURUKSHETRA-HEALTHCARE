export const supportNeedOptions = [
  "Benefits investigation",
  "Prior authorization",
  "Financial assistance",
  "Pharmacy coordination",
  "Patient education"
] as const;

export type IntakeActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  reference?: string;
};
