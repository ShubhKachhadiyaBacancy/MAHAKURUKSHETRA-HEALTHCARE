"use server";

import { env, hasContactMailEnv } from "@/lib/env";

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

type ResendErrorResponse = {
  error?: {
    message?: string;
  };
};

const initialState: ContactActionState = {
  status: "idle"
};

function normalizeValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function sendContactMessageAction(
  previousState: ContactActionState = initialState,
  formData: FormData
): Promise<ContactActionState> {
  void previousState;

  if (!hasContactMailEnv()) {
    return {
      status: "error",
      message: "Contact email is not configured yet. Set RESEND_API_KEY to enable delivery."
    };
  }

  const name = normalizeValue(formData.get("name"));
  const email = normalizeValue(formData.get("email"));
  const organization = normalizeValue(formData.get("organization"));
  const subject = normalizeValue(formData.get("subject"));
  const message = normalizeValue(formData.get("message"));
  const website = normalizeValue(formData.get("website"));

  if (website) {
    return {
      status: "success",
      message: "Message received."
    };
  }

  if (!name || !email || !subject || !message) {
    return {
      status: "error",
      message: "Name, email, subject, and message are required."
    };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return {
      status: "error",
      message: "Enter a valid email address."
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.contactFromEmail,
        to: [env.contactRecipientEmail],
        reply_to: email,
        subject: `[Contact Us] ${subject}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Organization: ${organization || "Not provided"}`,
          "",
          message
        ].join("\n")
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      let errorMessage = "Unable to send your message right now.";

      try {
        const data = (await response.json()) as ResendErrorResponse;
        errorMessage = data.error?.message ?? errorMessage;
      } catch {
        // Ignore response parsing failures and return the generic message.
      }

      return {
        status: "error",
        message: errorMessage
      };
    }
  } catch {
    return {
      status: "error",
      message: "Unable to send your message right now."
    };
  }

  return {
    status: "success",
    message: `Thanks. Your note was sent to ${env.contactRecipientEmail}.`
  };
}
