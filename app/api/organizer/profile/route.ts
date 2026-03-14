import { NextRequest, NextResponse } from "next/server";
import {
  OrganizerServiceError,
  getOrganizerProfileSnapshot,
  updateOrganizerProfile
} from "@/services/organizer";

export async function GET() {
  try {
    const snapshot = await getOrganizerProfileSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await updateOrganizerProfile(body);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof OrganizerServiceError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json(
    { message: "Unexpected organizer profile API error." },
    { status: 500 }
  );
}
