import { NextResponse } from "next/server";
import {
  OrganizerServiceError,
  getOrganizerDashboardSnapshot
} from "@/services/organizer";

export async function GET() {
  try {
    const snapshot = await getOrganizerDashboardSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof OrganizerServiceError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json(
    { message: "Unexpected organizer API error." },
    { status: 500 }
  );
}
