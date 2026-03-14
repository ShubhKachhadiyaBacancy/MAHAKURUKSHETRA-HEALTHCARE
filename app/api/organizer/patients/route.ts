import { NextRequest, NextResponse } from "next/server";
import {
  OrganizerServiceError,
  createOrganizerPatient,
  getOrganizerPatientsPage
} from "@/services/organizer";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const snapshot = await getOrganizerPatientsPage({
      query: searchParams.get("q") ?? "",
      page: searchParams.get("page") ?? "1",
      sort: searchParams.get("sort") ?? "created_at",
      direction: searchParams.get("direction") ?? "desc"
    });

    return NextResponse.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createOrganizerPatient(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof OrganizerServiceError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json(
    { message: "Unexpected organizer patient API error." },
    { status: 500 }
  );
}
