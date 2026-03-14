export const registerRoleDetails = {
  admin: {
    label: "Admin",
    defaultTitle: "Administrator",
    description:
      "Controls system-wide administration, user provisioning, and organization-wide configuration."
  },
  organizer: {
    label: "Organizer",
    defaultTitle: "Organizer",
    description:
      "Creates the organization shell, receives oversight notifications, and starts with a seeded organizer control center."
  },
  patients: {
    label: "Patients",
    defaultTitle: "Patient",
    description:
      "Views a personal dashboard, manages claims, and tracks assigned medications, organization, and office details."
  },
  doctor: {
    label: "Doctor",
    defaultTitle: "Doctor",
    description:
      "Creates a linked doctor record and seeds active therapy starts tied to clinical work."
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
