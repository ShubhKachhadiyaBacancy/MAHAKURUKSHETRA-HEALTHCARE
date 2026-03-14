import { registerRoleDetails, type RegisterRole } from "@/lib/auth/register";

type ServiceClient = any;

type BootstrapRegisteredUserInput = {
  client: ServiceClient;
  email: string;
  fullName: string;
  organizationName: string;
  phone?: string;
  practiceName?: string;
  providerNpi?: string;
  role: RegisterRole;
  specialty?: string;
  userId: string;
};

type SeedContext = {
  caseManagerId: string;
  client: ServiceClient;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  ownerProfileId: string;
  providerId: string;
};

type MedicationTemplate = {
  name: string;
  manufacturer: string;
  requiresPriorAuth: boolean;
  supportProgram: string;
  therapyArea: string;
};

type PatientTemplate = {
  city: string;
  dateOfBirth: string;
  diagnosis: string;
  email: string;
  firstName: string;
  insuranceMemberId: string;
  lastName: string;
  medicationName: string;
  nextAction: string;
  payerName: string;
  phone: string;
  planName: string;
  priority: "critical" | "routine" | "watch";
  state: string;
  status:
    | "benefit_verification"
    | "blocked"
    | "financial_assistance"
    | "intake"
    | "on_therapy"
    | "pharmacy_coordination"
    | "prior_auth"
    | "ready_to_start";
  verificationNotes: string;
};

const medicationTemplates: MedicationTemplate[] = [
  {
    name: "Dupixent",
    manufacturer: "Sanofi / Regeneron",
    requiresPriorAuth: true,
    supportProgram: "Dupixent MyWay",
    therapyArea: "Immunology"
  },
  {
    name: "Ocrevus",
    manufacturer: "Genentech",
    requiresPriorAuth: true,
    supportProgram: "Bridge therapy support",
    therapyArea: "Neurology"
  },
  {
    name: "Tagrisso",
    manufacturer: "AstraZeneca",
    requiresPriorAuth: true,
    supportProgram: "Manufacturer affordability hub",
    therapyArea: "Oncology"
  }
];

export async function bootstrapRegisteredUser({
  client,
  email,
  fullName,
  organizationName,
  phone,
  practiceName,
  providerNpi,
  role,
  specialty,
  userId
}: BootstrapRegisteredUserInput) {
  const organization = await ensureOrganization(client, organizationName);
  const title = registerRoleDetails[role].defaultTitle;

  await upsertProfile(client, {
    email,
    fullName,
    organizationId: organization.id,
    phone,
    role,
    title,
    userId
  });

  const patientId =
    role === "patient"
      ? await ensureLinkedPatient(client, {
          email,
          fullName,
          organizationId: organization.id,
          phone,
          userId
        })
      : null;

  const providerId =
    role === "provider"
      ? await ensureLinkedProvider(client, {
          email,
          fullName,
          organizationId: organization.id,
          phone,
          practiceName,
          providerNpi,
          specialty
        })
      : await ensureSupportProvider(client, organization.id, organization.name);

  const caseManagerId =
    role === "case_manager"
      ? await ensureLinkedCaseManager(client, {
          email,
          fullName,
          organizationId: organization.id,
          phone,
          userId
        })
      : await ensureSupportCaseManager(client, organization.id, organization.name);

  await ensureWelcomeNotification(client, {
    organizationId: organization.id,
    profileId: userId,
    role
  });

  await ensureWorkspaceSeed({
    caseManagerId,
    client,
    organizationId: organization.id,
    organizationName: organization.name,
    organizationSlug: organization.slug,
    ownerProfileId: userId,
    providerId
  });

  if (patientId) {
    await ensureStarterClaim(client, {
      organizationId: organization.id,
      patientId
    });
  }

  await ensureRegistrationAuditLog(client, {
    organizationId: organization.id,
    role,
    userId
  });

  return organization;
}

async function ensureOrganization(client: ServiceClient, organizationName: string) {
  const normalizedName = organizationName.trim();
  const slug = slugify(normalizedName);

  const { data: existing, error: existingError } = await client
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return existing;
  }

  const { data, error } = await client
    .from("organizations")
    .insert({
      name: normalizedName,
      slug
    })
    .select("id, name, slug")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to create organization.");
  }

  return data;
}

async function upsertProfile(
  client: ServiceClient,
  {
    email,
    fullName,
    organizationId,
    phone,
    role,
    title,
    userId
  }: {
    email: string;
    fullName: string;
    organizationId: string | null;
    phone?: string;
    role: RegisterRole;
    title: string;
    userId: string;
  }
) {
  const { error } = await client.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: fullName,
      organization_id: organizationId,
      phone: phone ?? null,
      role,
      title
    },
    {
      onConflict: "id"
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function ensureLinkedProvider(
  client: ServiceClient,
  {
    email,
    fullName,
    organizationId,
    phone,
    practiceName,
    providerNpi,
    specialty
  }: {
    email: string;
    fullName: string;
    organizationId: string;
    phone?: string;
    practiceName?: string;
    providerNpi?: string;
    specialty?: string;
  }
) {
  const { data: existing, error: existingError } = await client
    .from("providers")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("email", email)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return existing.id;
  }

  const { data, error } = await client
    .from("providers")
    .insert({
      email,
      full_name: fullName,
      npi: providerNpi?.trim() || null,
      organization_id: organizationId,
      phone: phone ?? null,
      practice_name: practiceName?.trim() || "Independent referral network",
      specialty: specialty?.trim() || "Specialty therapy"
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to create provider record.");
  }

  return data.id;
}

async function ensureSupportProvider(
  client: ServiceClient,
  organizationId: string,
  organizationName: string
) {
  const supportEmail = `referrals@${slugify(organizationName)}.test`;

  const { data: existing, error: existingError } = await client
    .from("providers")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("email", supportEmail)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return existing.id;
  }

  const { data, error } = await client
    .from("providers")
    .insert({
      email: supportEmail,
      full_name: "Dr. Priya Patel",
      npi: "1234567890",
      organization_id: organizationId,
      practice_name: `${organizationName} Referral Partners`,
      specialty: "Pulmonology"
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to create supporting provider.");
  }

  return data.id;
}

async function ensureLinkedCaseManager(
  client: ServiceClient,
  {
    email,
    fullName,
    organizationId,
    phone,
    userId
  }: {
    email: string;
    fullName: string;
    organizationId: string;
    phone?: string;
    userId: string;
  }
) {
  const { data: existing, error: existingError } = await client
    .from("case_managers")
    .select("id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return existing.id;
  }

  const { data, error } = await client
    .from("case_managers")
    .insert({
      email,
      full_name: fullName,
      organization_id: organizationId,
      phone: phone ?? null,
      profile_id: userId
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to create case manager record.");
  }

  return data.id;
}

async function ensureSupportCaseManager(
  client: ServiceClient,
  organizationId: string,
  organizationName: string
) {
  const supportEmail = `queue@${slugify(organizationName)}.test`;

  const { data: existing, error: existingError } = await client
    .from("case_managers")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("email", supportEmail)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return existing.id;
  }

  const { data, error } = await client
    .from("case_managers")
    .insert({
      email: supportEmail,
      full_name: "Maya Chen",
      organization_id: organizationId,
      phone: "(555) 100-1001"
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to create supporting case manager.");
  }

  return data.id;
}

async function ensureWorkspaceSeed(context: SeedContext) {
  const { count, error } = await context.client
    .from("patient_cases")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", context.organizationId);

  if (error) {
    throw new Error(error.message);
  }

  if ((count ?? 0) > 0) {
    return;
  }

  const medicationMap = await ensureMedications(context.client);

  const templates: PatientTemplate[] = [
    {
      city: "Chicago",
      dateOfBirth: "1988-04-12",
      diagnosis: "Severe eosinophilic asthma",
      email: `elena.ruiz@${context.organizationSlug}.test`,
      firstName: "Elena",
      insuranceMemberId: `${context.organizationSlug.toUpperCase().slice(0, 6)}-4011`,
      lastName: "Ruiz",
      medicationName: "Dupixent",
      nextAction: "Collect updated eosinophil lab panel before payer cutoff.",
      payerName: "Blue Cross Blue Shield",
      phone: "(555) 010-2001",
      planName: "PPO Gold 3500",
      priority: "critical",
      state: "IL",
      status: "prior_auth",
      verificationNotes:
        "Benefits verified. Payer requested updated pulmonary chart notes and labs."
    },
    {
      city: "Austin",
      dateOfBirth: "1979-09-19",
      diagnosis: "Relapsing multiple sclerosis",
      email: `marcus.bell@${context.organizationSlug}.test`,
      firstName: "Marcus",
      insuranceMemberId: `${context.organizationSlug.toUpperCase().slice(0, 6)}-9021`,
      lastName: "Bell",
      medicationName: "Ocrevus",
      nextAction: "Confirm bridge eligibility and schedule infusion onboarding call.",
      payerName: "Aetna",
      phone: "(555) 010-2002",
      planName: "Open Choice PPO",
      priority: "watch",
      state: "TX",
      status: "financial_assistance",
      verificationNotes:
        "Benefits verified. Patient has high monthly cost exposure before infusion."
    }
  ];

  const firstPatient = await ensurePatientCaseBundle(context, templates[0], medicationMap);
  const secondPatient = await ensurePatientCaseBundle(context, templates[1], medicationMap);

  await ensurePriorAuthorization(context.client, {
    caseId: firstPatient.caseId,
    clinicalRequirements:
      "Recent eosinophil lab panel and updated pulmonology note",
    denialReason: null,
    notes: "Electronic PA submitted. Awaiting supplemental clinical documentation.",
    organizationId: context.organizationId,
    payerCaseId: "PA-BOOTSTRAP-001",
    status: "pending"
  });

  await ensureFinancialAssistance(context.client, {
    caseId: secondPatient.caseId,
    estimatedMonthlySavings: 1850,
    notes: "Bridge therapy support under review before infusion scheduling.",
    organizationId: context.organizationId,
    programName: "Bridge therapy support",
    programType: "bridge",
    status: "active"
  });

  await ensureCommunication(context.client, {
    caseId: firstPatient.caseId,
    channel: "sms",
    organizationId: context.organizationId,
    scheduledForHours: 2,
    summary: "Reminder to upload supporting lab results before payer cutoff."
  });

  await ensureCommunication(context.client, {
    caseId: secondPatient.caseId,
    channel: "call",
    organizationId: context.organizationId,
    scheduledForHours: 20,
    summary: "Outbound affordability review call scheduled with patient."
  });

  await ensureNotification(context.client, {
    actionUrl: `/patients/${firstPatient.caseId}`,
    body: "Two launch-ready cases were created so the team can review live queue behavior immediately.",
    caseId: firstPatient.caseId,
    organizationId: context.organizationId,
    priority: "watch",
    profileId: context.ownerProfileId,
    title: "Starter queue ready"
  });
}

async function ensureMedications(client: ServiceClient) {
  const medicationNames = medicationTemplates.map((entry) => entry.name);

  const { data: existingRows, error: existingError } = await client
    .from("medications")
    .select("id, name")
    .in("name", medicationNames);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingMap = new Map<string, string>(
    (existingRows ?? []).map((row: any) => [row.name, row.id])
  );
  const missingRows = medicationTemplates.filter((entry) => !existingMap.has(entry.name));

  if (missingRows.length > 0) {
    const { data: insertedRows, error: insertError } = await client
      .from("medications")
      .insert(
        missingRows.map((entry) => ({
          manufacturer: entry.manufacturer,
          name: entry.name,
          requires_prior_auth: entry.requiresPriorAuth,
          support_program: entry.supportProgram,
          therapy_area: entry.therapyArea
        }))
      )
      .select("id, name");

    if (insertError) {
      throw new Error(insertError.message);
    }

    (insertedRows ?? []).forEach((row: any) => {
      existingMap.set(row.name, row.id);
    });
  }

  return existingMap;
}

async function ensurePatientCaseBundle(
  context: SeedContext,
  template: PatientTemplate,
  medicationMap: Map<string, string>
) {
  const patientId = await ensurePatient(context.client, {
    city: template.city,
    dateOfBirth: template.dateOfBirth,
    email: template.email,
    firstName: template.firstName,
    lastName: template.lastName,
    organizationId: context.organizationId,
    phone: template.phone,
    state: template.state
  });

  const insuranceId = await ensureInsurancePolicy(context.client, {
    memberId: template.insuranceMemberId,
    organizationId: context.organizationId,
    patientId,
    payerName: template.payerName,
    planName: template.planName,
    verificationNotes: template.verificationNotes
  });

  const medicationId = medicationMap.get(template.medicationName);

  if (!medicationId) {
    throw new Error(`Missing medication seed for ${template.medicationName}.`);
  }

  const prescriptionId = await ensurePrescription(context.client, {
    clinicalNotes: template.verificationNotes,
    diagnosis: template.diagnosis,
    medicationId,
    organizationId: context.organizationId,
    patientId,
    providerId: context.providerId
  });

  const caseId = await ensurePatientCase(context.client, {
    barrierSummary: template.verificationNotes,
    caseManagerId: context.caseManagerId,
    insurancePolicyId: insuranceId,
    nextAction: template.nextAction,
    organizationId: context.organizationId,
    ownerProfileId: context.ownerProfileId,
    patientId,
    prescriptionId,
    priority: template.priority,
    providerId: context.providerId,
    status: template.status
  });

  return {
    caseId,
    patientId
  };
}

async function ensurePatient(
  client: ServiceClient,
  {
    city,
    dateOfBirth,
    email,
    firstName,
    lastName,
    organizationId,
    profileId,
    phone,
    state
  }: {
    city: string;
    dateOfBirth: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    profileId?: string;
    phone: string;
    state: string;
  }
) {
  const { data: existing, error: existingError } = await client
    .from("patients")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("email", email)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    if (profileId) {
      const { error: updateError } = await client
        .from("patients")
        .update({
          profile_id: profileId,
          phone
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    }

    return existing.id;
  }

  const { data, error } = await client
    .from("patients")
    .insert({
      city,
      consent_status: "received",
      date_of_birth: dateOfBirth,
      email,
      first_name: firstName,
      last_name: lastName,
      organization_id: organizationId,
      phone,
      preferred_channel: "sms",
      profile_id: profileId ?? null,
      sex: "unknown",
      state,
      zip_code: "00000"
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to create patient.");
  }

  return data.id;
}

async function ensureLinkedPatient(
  client: ServiceClient,
  {
    email,
    fullName,
    organizationId,
    phone,
    userId
  }: {
    email: string;
    fullName: string;
    organizationId: string;
    phone?: string;
    userId: string;
  }
) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/);
  const lastName = rest.join(" ") || "Patient";

  return ensurePatient(client, {
    city: "Pending",
    dateOfBirth: "1990-01-01",
    email,
    firstName: firstName || "Patient",
    lastName,
    organizationId,
    profileId: userId,
    phone: phone ?? "",
    state: "Pending"
  });
}

async function ensureStarterClaim(
  client: ServiceClient,
  {
    organizationId,
    patientId
  }: {
    organizationId: string;
    patientId: string;
  }
) {
  const { data: existing, error: existingError } = await client
    .from("claims")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("patient_id", patientId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return;
  }

  const { data: patientCase, error: caseError } = await client
    .from("patient_cases")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (caseError) {
    throw new Error(caseError.message);
  }

  const claimNumber = `CLM-${patientId.replaceAll("-", "").slice(0, 8).toUpperCase()}`;
  const { error } = await client.from("claims").insert({
    amount: 0,
    case_id: patientCase?.id ?? null,
    claim_number: claimNumber,
    claim_type: "medical",
    note: "Starter claim created during patient onboarding.",
    organization_id: organizationId,
    patient_id: patientId,
    payer_name: "Payer pending",
    service_date: new Date().toISOString().slice(0, 10),
    status: "draft"
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function ensureInsurancePolicy(
  client: ServiceClient,
  {
    memberId,
    organizationId,
    patientId,
    payerName,
    planName,
    verificationNotes
  }: {
    memberId: string;
    organizationId: string;
    patientId: string;
    payerName: string;
    planName: string;
    verificationNotes: string;
  }
) {
  const { data: existing, error: existingError } = await client
    .from("insurance_policies")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("member_id", memberId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return existing.id;
  }

  const { data, error } = await client
    .from("insurance_policies")
    .insert({
      member_id: memberId,
      organization_id: organizationId,
      patient_id: patientId,
      payer_name: payerName,
      plan_name: planName,
      status: "verified",
      verification_notes: verificationNotes
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to create insurance policy.");
  }

  return data.id;
}

async function ensurePrescription(
  client: ServiceClient,
  {
    clinicalNotes,
    diagnosis,
    medicationId,
    organizationId,
    patientId,
    providerId
  }: {
    clinicalNotes: string;
    diagnosis: string;
    medicationId: string;
    organizationId: string;
    patientId: string;
    providerId: string;
  }
) {
  const { data: existing, error: existingError } = await client
    .from("prescriptions")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("patient_id", patientId)
    .eq("medication_id", medicationId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return existing.id;
  }

  const { data, error } = await client
    .from("prescriptions")
    .insert({
      clinical_notes: clinicalNotes,
      diagnosis,
      dosage: "Starter regimen",
      medication_id: medicationId,
      organization_id: organizationId,
      patient_id: patientId,
      provider_id: providerId
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to create prescription.");
  }

  return data.id;
}

async function ensurePatientCase(
  client: ServiceClient,
  {
    barrierSummary,
    caseManagerId,
    insurancePolicyId,
    nextAction,
    organizationId,
    ownerProfileId,
    patientId,
    prescriptionId,
    priority,
    providerId,
    status
  }: {
    barrierSummary: string;
    caseManagerId: string;
    insurancePolicyId: string;
    nextAction: string;
    organizationId: string;
    ownerProfileId: string;
    patientId: string;
    prescriptionId: string;
    priority: "critical" | "routine" | "watch";
    providerId: string;
    status:
      | "benefit_verification"
      | "blocked"
      | "financial_assistance"
      | "intake"
      | "on_therapy"
      | "pharmacy_coordination"
      | "prior_auth"
      | "ready_to_start";
  }
) {
  const { data: existing, error: existingError } = await client
    .from("patient_cases")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("patient_id", patientId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return existing.id;
  }

  const dueAtHours = priority === "critical" ? 6 : 24;
  const { data, error } = await client
    .from("patient_cases")
    .insert({
      barrier_summary: barrierSummary,
      case_manager_id: caseManagerId,
      insurance_policy_id: insurancePolicyId,
      next_action: nextAction,
      next_action_due_at: new Date(Date.now() + dueAtHours * 60 * 60 * 1000).toISOString(),
      organization_id: organizationId,
      owner_profile_id: ownerProfileId,
      patient_id: patientId,
      prescription_id: prescriptionId,
      priority,
      provider_id: providerId,
      status
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to create patient case.");
  }

  return data.id;
}

async function ensurePriorAuthorization(
  client: ServiceClient,
  {
    caseId,
    clinicalRequirements,
    denialReason,
    notes,
    organizationId,
    payerCaseId,
    status
  }: {
    caseId: string;
    clinicalRequirements: string;
    denialReason: string | null;
    notes: string;
    organizationId: string;
    payerCaseId: string;
    status: "appeal" | "approved" | "denied" | "draft" | "pending" | "submitted";
  }
) {
  const { data: existing, error: existingError } = await client
    .from("prior_authorizations")
    .select("id")
    .eq("case_id", caseId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return;
  }

  const { error } = await client.from("prior_authorizations").insert({
    appeal_required: false,
    case_id: caseId,
    clinical_requirements: clinicalRequirements,
    decision_due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    denial_reason: denialReason,
    notes,
    organization_id: organizationId,
    payer_case_id: payerCaseId,
    status,
    submission_method: "electronic",
    submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function ensureFinancialAssistance(
  client: ServiceClient,
  {
    caseId,
    estimatedMonthlySavings,
    notes,
    organizationId,
    programName,
    programType,
    status
  }: {
    caseId: string;
    estimatedMonthlySavings: number;
    notes: string;
    organizationId: string;
    programName: string;
    programType: "bridge" | "copay" | "foundation" | "pap";
    status: "active" | "closed" | "denied" | "expired" | "screening" | "submitted";
  }
) {
  const { data: existing, error: existingError } = await client
    .from("financial_assistance_cases")
    .select("id")
    .eq("case_id", caseId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return;
  }

  const { error } = await client.from("financial_assistance_cases").insert({
    case_id: caseId,
    estimated_monthly_savings: estimatedMonthlySavings,
    household_income_band: "75k-100k",
    notes,
    organization_id: organizationId,
    program_name: programName,
    program_type: programType,
    status
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function ensureCommunication(
  client: ServiceClient,
  {
    caseId,
    channel,
    organizationId,
    scheduledForHours,
    summary
  }: {
    caseId: string;
    channel: "call" | "email" | "portal" | "sms";
    organizationId: string;
    scheduledForHours: number;
    summary: string;
  }
) {
  const { data: existing, error: existingError } = await client
    .from("communications")
    .select("id")
    .eq("case_id", caseId)
    .eq("summary", summary)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return;
  }

  const { error } = await client.from("communications").insert({
    case_id: caseId,
    channel,
    direction: "outbound",
    organization_id: organizationId,
    recipient_type: "patient",
    scheduled_for: new Date(Date.now() + scheduledForHours * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    summary
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function ensureWelcomeNotification(
  client: ServiceClient,
  {
    organizationId,
    profileId,
    role
  }: {
    organizationId: string;
    profileId: string;
    role: RegisterRole;
  }
) {
  const title = `${registerRoleDetails[role].label} workspace ready`;
  await ensureNotification(client, {
    actionUrl: "/dashboard",
    body: registerRoleDetails[role].description,
    organizationId,
    priority: "info",
    profileId,
    title
  });
}

async function ensureNotification(
  client: ServiceClient,
  {
    actionUrl,
    body,
    caseId,
    organizationId,
    priority,
    profileId,
    title
  }: {
    actionUrl: string;
    body: string;
    caseId?: string;
    organizationId: string;
    priority: "critical" | "info" | "watch";
    profileId: string;
    title: string;
  }
) {
  const { data: existing, error: existingError } = await client
    .from("notifications")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("profile_id", profileId)
    .eq("title", title)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return;
  }

  const { error } = await client.from("notifications").insert({
    action_url: actionUrl,
    body,
    case_id: caseId ?? null,
    organization_id: organizationId,
    priority,
    profile_id: profileId,
    title
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function ensureRegistrationAuditLog(
  client: ServiceClient,
  {
    organizationId,
    role,
    userId
  }: {
    organizationId: string;
    role: RegisterRole;
    userId: string;
  }
) {
  const { data: existing, error: existingError } = await client
    .from("audit_logs")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("actor_id", userId)
    .eq("action", "register_completed")
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return;
  }

  const { error } = await client.from("audit_logs").insert({
    action: "register_completed",
    actor_id: userId,
    entity_name: "profile",
    entity_id: userId,
    metadata: {
      role
    },
    organization_id: organizationId
  });

  if (error) {
    throw new Error(error.message);
  }
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "specialtyrx-org"
  );
}
