import { NextRequest, NextResponse } from "next/server";
import {
  OrganizerServiceError,
  createOrganizerInsurancePolicy,
  getOrganizerInsurancePage
} from "@/services/organizer";

export async function GET(request: NextRequest) {
  try {
    const snapshot = await getOrganizerInsurancePage({
      query: request.nextUrl.searchParams.get("q") ?? "",
      page: request.nextUrl.searchParams.get("page") ?? "1"
    });
    return NextResponse.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json(await createOrganizerInsurancePolicy(body), {
      status: 201
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof OrganizerServiceError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json(
    { message: "Unexpected organizer insurance API error." },
    { status: 500 }
  );
}
