"use server";

import { randomUUID } from "node:crypto";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient
} from "@/lib/supabase/server";
import { hasPublicSupabaseEnv, hasServiceRoleEnv } from "@/lib/env";
import type { IntakeActionState } from "@/types/intake";

function readValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function submitPatientRegistrationAction(
  _previousState: IntakeActionState,
  formData: FormData
): Promise<IntakeActionState> {
  if (!hasPublicSupabaseEnv() || !hasServiceRoleEnv()) {
    return {
      status: "error",
      message: "Patient registration requires public and service Supabase credentials."
    };
  }

  const patientFullName = readValue(formData, "patientFullName");
  const medicationName = readValue(formData, "medicationName");
  const therapyArea = readValue(formData, "therapyArea");
  const payerName = readValue(formData, "payerName");
  const providerName = readValue(formData, "providerName");
  const priority = (readValue(formData, "priority") || "watch") as
    | "critical"
    | "watch"
    | "routine";
  const notes = readValue(formData, "notes");

  if (!patientFullName || !medicationName || !providerName || !payerName) {
    return {
      status: "error",
      message:
        "Patient name, medication, provider, and payer name are required for registration."
    };
  }

  const supabase = await createServerSupabaseClient();
  // Supabase's generated types do not flow cleanly through this server action path.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db: any = createServiceSupabaseClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return {
      status: "error",
      message: "Please sign in to continue patient registration."
    };
  }

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("organization_id")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profileError) {
    return {
      status: "error",
      message: profileError.message ?? "Unable to resolve your profile."
    };
  }

  if (!profile?.organization_id) {
    return {
      status: "error",
      message:
        "Your profile is not mapped to an organization. Contact support before registering patients."
    };
  }

  const organizationId = profile.organization_id;
  const [firstName, ...rest] = patientFullName.split(" ");
  const lastName = rest.join(" ") || "Patient";

  try {
    const { data: patient, error: patientError } = await db
      .from("patients")
      .insert({
        organization_id: organizationId,
        first_name: firstName,
        last_name: lastName,
        phone: readValue(formData, "phone") || null,
        email: readValue(formData, "email") || null,
        preferred_channel: "sms",
        sex: "unknown",
        date_of_birth: readValue(formData, "dateOfBirth") || null,
        zip_code: readValue(formData, "zipCode") || null
      })
      .select("id")
      .single();

    if (patientError || !patient?.id) {
      return {
        status: "error",
        message: patientError?.message ?? "Unable to create patient."
      };
    }

    const providerResult = await db
      .from("providers")
      .insert({
        organization_id: organizationId,
        full_name: providerName,
        specialty: therapyArea || null,
        practice_name: readValue(formData, "practiceName") || null,
        npi: readValue(formData, "providerNpi") || null
      })
      .select("id")
      .single();

    if (!providerResult.data?.id) {
      return {
        status: "error",
        message: "Unable to create provider record."
      };
    }

    const medicationId = await ensureMedication(db, medicationName, therapyArea);

    const { data: prescription, error: prescriptionError } = await db
      .from("prescriptions")
      .insert({
        organization_id: organizationId,
        patient_id: patient.id,
        provider_id: providerResult.data.id,
        medication_id: medicationId,
        dosage: readValue(formData, "dosage") || "Standard regimen",
        diagnosis: readValue(formData, "diagnosis") || null,
        clinical_notes: notes || null
      })
      .select("id")
      .single();

    if (prescriptionError || !prescription?.id) {
      return {
        status: "error",
        message: prescriptionError?.message ?? "Unable to create prescription."
      };
    }

    const { data: insurance, error: insuranceError } = await db
      .from("insurance_policies")
      .insert({
        organization_id: organizationId,
        patient_id: patient.id,
        payer_name: payerName,
        plan_name: readValue(formData, "planName") || null,
        member_id: readValue(formData, "memberId") || randomUUID().slice(0, 12),
        verification_notes: "Registered via workspace intake."
      })
      .select("id")
      .single();

    if (insuranceError || !insurance?.id) {
      return {
        status: "error",
        message: insuranceError?.message ?? "Unable to create insurance policy."
      };
    }

    const { data: patientCase, error: caseError } = await db
      .from("patient_cases")
      .insert({
        organization_id: organizationId,
        patient_id: patient.id,
        provider_id: providerResult.data.id,
        prescription_id: prescription.id,
        insurance_policy_id: insurance.id,
        owner_profile_id: session.user.id,
        status: "intake",
        priority,
        next_action: "Run benefits investigation",
        next_action_due_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        barrier_summary: notes || null
      })
      .select("id")
      .single();

    if (caseError || !patientCase?.id) {
      return {
        status: "error",
        message: caseError?.message ?? "Unable to create patient case."
      };
    }

    return {
      status: "success",
      message: "Patient queued and visible to your workspace immediately.",
      reference: patientCase.id
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to register patient right now."
    };
  }
}

async function ensureMedication(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  name: string,
  therapyArea?: string
) {
  const normalizedName = name.trim();
  const { data: existing } = await supabase
    .from("medications")
    .select("id")
    .ilike("name", normalizedName)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  const { data: inserted, error } = await supabase
    .from("medications")
    .insert({
      name: normalizedName,
      therapy_area: therapyArea || null,
      requires_prior_auth: true
    })
    .select("id")
    .single();

  if (error || !inserted?.id) {
    throw new Error(error?.message ?? "Unable to create medication.");
  }

  return inserted.id;
}
