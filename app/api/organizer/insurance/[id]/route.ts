import { NextRequest, NextResponse } from "next/server";
import {
  OrganizerServiceError,
  deleteOrganizerInsurancePolicy,
  getOrganizerInsuranceDetail,
  updateOrganizerInsurancePolicy
} from "@/services/organizer";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    return NextResponse.json(await getOrganizerInsuranceDetail(id));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    return NextResponse.json(await updateOrganizerInsurancePolicy(id, body));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    return NextResponse.json(await deleteOrganizerInsurancePolicy(id));
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
