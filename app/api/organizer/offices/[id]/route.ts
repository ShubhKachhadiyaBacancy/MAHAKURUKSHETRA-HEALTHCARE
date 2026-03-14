import { NextRequest, NextResponse } from "next/server";
import {
  OrganizerServiceError,
  deleteOrganizerOffice,
  getOrganizerOfficeDetail,
  updateOrganizerOffice
} from "@/services/organizer";

type OrganizerOfficeRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: OrganizerOfficeRouteContext) {
  try {
    const { id } = await context.params;
    const result = await getOrganizerOfficeDetail(id);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: OrganizerOfficeRouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await updateOrganizerOffice(id, body ?? {});
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: OrganizerOfficeRouteContext) {
  try {
    const { id } = await context.params;
    const result = await deleteOrganizerOffice(id);
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
    { message: "Unexpected organizer office API error." },
    { status: 500 }
  );
}
