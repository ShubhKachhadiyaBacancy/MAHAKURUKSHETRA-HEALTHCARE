import { NextRequest, NextResponse } from "next/server";
import {
  OrganizerServiceError,
  generateOrganizerReport,
  getOrganizerReportsSnapshot
} from "@/services/organizer";

export async function GET() {
  try {
    const snapshot = await getOrganizerReportsSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await generateOrganizerReport(String(body.type ?? "Operations export"));
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof OrganizerServiceError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json({ message: "Unexpected admin report API error." }, { status: 500 });
}
