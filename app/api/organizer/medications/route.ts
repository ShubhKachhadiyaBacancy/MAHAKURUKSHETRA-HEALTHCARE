import { NextResponse } from "next/server";
import {
  OrganizerServiceError,
  getOrganizerMedicationsSnapshot
} from "@/services/organizer";

export async function GET() {
  try {
    const snapshot = await getOrganizerMedicationsSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST() {
  return NextResponse.json(
    {
      message:
        "Medication selection cannot be persisted because the current schema has no organization-medication mapping table."
    },
    { status: 409 }
  );
}

function toErrorResponse(error: unknown) {
  if (error instanceof OrganizerServiceError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json(
    { message: "Unexpected organizer medication API error." },
    { status: 500 }
  );
}
