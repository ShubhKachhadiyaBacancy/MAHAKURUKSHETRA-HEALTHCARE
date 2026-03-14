export const registerRoleDetails = {
  admin: {
    label: "Admin",
    defaultTitle: "Administrator",
    description:
      "Creates the organization shell, receives oversight notifications, and starts with a seeded admin control center."
  },
  patient: {
    label: "Patient",
    defaultTitle: "Patient",
    description:
      "Views a personal dashboard, manages claims, and tracks assigned medications, organization, and office details."
  },
  provider: {
    label: "Doctor",
    defaultTitle: "Referring doctor",
    description:
      "Creates a linked doctor record and seeds active therapy starts tied to clinical work."
  },
  case_manager: {
    label: "Case manager",
    defaultTitle: "Access case manager",
    description:
      "Creates an operational queue owner and seeds outreach, affordability, and prior-auth follow-up."
  },
  staff: {
    label: "Staff",
    defaultTitle: "Operations coordinator",
    description:
      "Creates a general workspace operator account with launch notifications and shared queue visibility."
  }
} as const;

export type RegisterRole = keyof typeof registerRoleDetails;

export const registerRoleOptions = Object.entries(registerRoleDetails).map(
  ([value, detail]) => ({
    value: value as RegisterRole,
    ...detail
  })
);

export function isRegisterRole(value: string): value is RegisterRole {
  return value in registerRoleDetails;
}
