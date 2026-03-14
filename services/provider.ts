import { WorkspaceAccessError, requireProviderActor } from "@/services/workspace-access";
import type { ProviderProfileSnapshot } from "@/types/provider";

export { WorkspaceAccessError } from "@/services/workspace-access";

export async function getProviderProfileSnapshot(): Promise<ProviderProfileSnapshot> {
  const actor = await requireProviderActor();

  return {
    id: actor.userId,
    fullName: actor.profile.full_name ?? "",
    email: actor.profile.email ?? "",
    phone: actor.profile.phone ?? "",
    title: actor.profile.title ?? "Doctor",
    organizationName: actor.organizationName,
    roleLabel: "Doctor",
    practiceName: actor.provider?.practice_name ?? "",
    specialty: actor.provider?.specialty ?? "",
    npi: actor.provider?.npi ?? ""
  };
}

export async function updateProviderProfile(payload: {
  fullName: string;
  phone?: string | null;
  title?: string | null;
  practiceName?: string | null;
  specialty?: string | null;
  npi?: string | null;
}) {
  const actor = await requireProviderActor();
  const fullName = String(payload.fullName ?? "").trim();
  const phone = normalizeOptionalText(payload.phone);
  const title = normalizeOptionalText(payload.title);
  const practiceName = normalizeOptionalText(payload.practiceName);
  const specialty = normalizeOptionalText(payload.specialty);
  const npi = normalizeOptionalText(payload.npi);

  if (fullName.length < 2) {
    throw new WorkspaceAccessError(400, "Full name must be at least 2 characters.");
  }

  const profileUpdatePromise = actor.db
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      title
    })
    .eq("id", actor.userId)
    .eq("organization_id", actor.organizationId)
    .select("id")
    .maybeSingle();

  const providerMutation = actor.provider?.id
    ? actor.db
        .from("providers")
        .update({
          full_name: fullName,
          email: actor.profile.email,
          phone,
          practice_name: practiceName,
          specialty,
          npi
        })
        .eq("id", actor.provider.id)
        .eq("organization_id", actor.organizationId)
        .select("id")
        .maybeSingle()
    : actor.db
        .from("providers")
        .insert({
          organization_id: actor.organizationId,
          full_name: fullName,
          email: actor.profile.email,
          phone,
          practice_name: practiceName,
          specialty,
          npi
        })
        .select("id")
        .single();

  const [profileResult, providerResult] = await Promise.all([
    profileUpdatePromise,
    providerMutation
  ]);

  if (profileResult.error || !profileResult.data?.id) {
    throw new WorkspaceAccessError(
      500,
      profileResult.error?.message ?? "Unable to update the doctor profile."
    );
  }

  const providerId = providerResult.data?.id;
  if (providerResult.error || !providerId) {
    throw new WorkspaceAccessError(
      500,
      providerResult.error?.message ?? "Unable to update the linked doctor record."
    );
  }

  return {
    id: profileResult.data.id,
    providerId
  };
}

export async function addProviderFeedback(
  caseId: string,
  payload: {
    feedback: string;
  }
) {
  const actor = await requireProviderActor();

  if (!actor.provider?.id) {
    throw new WorkspaceAccessError(
      403,
      "Your doctor account is not linked to a provider record yet."
    );
  }

  const feedback = String(payload.feedback ?? "").trim();
  if (feedback.length < 8) {
    throw new WorkspaceAccessError(
      400,
      "Feedback must be at least 8 characters so the team gets actionable context."
    );
  }

  const { data: existingCase, error: caseError } = await actor.db
    .from("patient_cases")
    .select("id")
    .eq("organization_id", actor.organizationId)
    .eq("id", caseId)
    .eq("provider_id", actor.provider.id)
    .maybeSingle();

  if (caseError) {
    throw new WorkspaceAccessError(500, caseError.message);
  }

  if (!existingCase?.id) {
    throw new WorkspaceAccessError(
      404,
      "Assigned patient case not found for this doctor."
    );
  }

  const [feedbackResult, caseUpdateResult] = await Promise.all([
    actor.db
      .from("communications")
      .insert({
        organization_id: actor.organizationId,
        case_id: caseId,
        recipient_type: "provider",
        direction: "inbound",
        channel: "portal",
        status: "received",
        summary: feedback,
        created_by: actor.userId
      })
      .select("id")
      .single(),
    actor.db
      .from("patient_cases")
      .update({
        last_activity_at: new Date().toISOString()
      })
      .eq("organization_id", actor.organizationId)
      .eq("id", caseId)
      .eq("provider_id", actor.provider.id)
      .select("id")
      .maybeSingle()
  ]);

  if (feedbackResult.error || !feedbackResult.data?.id) {
    throw new WorkspaceAccessError(
      500,
      feedbackResult.error?.message ?? "Unable to save doctor feedback."
    );
  }

  if (caseUpdateResult.error || !caseUpdateResult.data?.id) {
    throw new WorkspaceAccessError(
      500,
      caseUpdateResult.error?.message ?? "Unable to refresh case activity."
    );
  }

  return {
    id: feedbackResult.data.id
  };
}

function normalizeOptionalText(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
}
