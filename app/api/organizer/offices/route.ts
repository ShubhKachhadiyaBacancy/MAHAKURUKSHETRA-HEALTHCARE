import { NextResponse } from "next/server";
import {
  OrganizerServiceError,
  getOrganizerOfficesSnapshot
} from "@/services/organizer";

export async function GET() {
  try {
    const snapshot = await getOrganizerOfficesSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST() {
  return NextResponse.json(
    {
      message:
        "Office writes are unavailable because the current schema does not contain an offices table."
    },
    { status: 409 }
  );
}

function toErrorResponse(error: unknown) {
  if (error instanceof OrganizerServiceError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json(
    { message: "Unexpected organizer office API error." },
    { status: 500 }
  );
}
