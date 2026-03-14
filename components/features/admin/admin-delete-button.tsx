"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type AdminDeleteButtonProps = {
  apiPath: string;
  confirmationMessage: string;
  redirectTo?: string;
};

export function AdminDeleteButton({
  apiPath,
  confirmationMessage,
  redirectTo
}: AdminDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function onDelete() {
    const confirmed = window.confirm(confirmationMessage);

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(apiPath, { method: "DELETE" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to delete record.");
      }

      if (redirectTo) {
        window.location.assign(redirectTo);
        return;
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete record.");
      setIsDeleting(false);
    }
  }

  return (
    <Button disabled={isDeleting} onClick={onDelete} type="button" variant="ghost">
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
