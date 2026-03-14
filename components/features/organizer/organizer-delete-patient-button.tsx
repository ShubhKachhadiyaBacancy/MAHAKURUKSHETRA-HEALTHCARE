"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type OrganizerDeletePatientButtonProps = {
  patientId: string;
  redirectTo?: string;
};

export function OrganizerDeletePatientButton({
  patientId,
  redirectTo
}: OrganizerDeletePatientButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function onDelete() {
    const isConfirmed = window.confirm(
      "Delete this patient? Related prescriptions, insurance policies, and cases will also be removed."
    );

    if (!isConfirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/organizer/patients/${patientId}`, {
        method: "DELETE"
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to delete patient.");
      }

      if (redirectTo) {
        window.location.assign(redirectTo);
        return;
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete patient.");
      setIsDeleting(false);
    }
  }

  return (
    <Button disabled={isDeleting} onClick={onDelete} type="button" variant="ghost">
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
