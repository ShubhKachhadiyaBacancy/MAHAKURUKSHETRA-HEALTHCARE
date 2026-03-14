import { NextRequest, NextResponse } from "next/server";
import {
  OrganizerServiceError,
  deleteOrganizerPatient,
  getOrganizerPatientDetail,
  updateOrganizerPatient
} from "@/services/organizer";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const snapshot = await getOrganizerPatientDetail(id);
    return NextResponse.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await updateOrganizerPatient(id, body);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteOrganizerPatient(id);
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
    { message: "Unexpected organizer patient API error." },
    { status: 500 }
  );
}
