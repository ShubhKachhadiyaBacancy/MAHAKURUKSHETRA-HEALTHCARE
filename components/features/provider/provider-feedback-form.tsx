"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type ProviderFeedbackFormProps = {
  caseId: string;
  patientName: string;
};

export function ProviderFeedbackForm({
  caseId,
  patientName
}: ProviderFeedbackFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/provider/cases/${caseId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          feedback
        })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to submit feedback.");
      }

      setFeedback("");
      setMessage("Feedback sent to the care team.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit feedback.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="space-y-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow">Doctor feedback</span>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950 dark:text-white">
            Respond on {patientName}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Add a clinical update, blocker, or next-step note. Your feedback is recorded in the
            case communication timeline for the access team.
          </p>
        </div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="form-field">
          <label htmlFor="doctorFeedback">Feedback</label>
          <Textarea
            id="doctorFeedback"
            placeholder="Example: Updated chart notes were faxed today. Proceed with the prior auth appeal and call if additional documentation is needed."
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
          />
        </div>

        {message ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
            {message}
          </div>
        ) : null}

        <Button disabled={isSaving || feedback.trim().length < 8} type="submit">
          {isSaving ? "Sending..." : "Send feedback"}
        </Button>
      </form>
    </Card>
  );
}
