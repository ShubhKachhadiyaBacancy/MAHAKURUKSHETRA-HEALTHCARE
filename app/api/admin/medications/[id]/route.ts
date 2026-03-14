import { NextRequest, NextResponse } from "next/server";
import {
  AdminWorkspaceError,
  deleteMedication,
  getMedicationDetail,
  updateMedication
} from "@/services/admin-workspace";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    return NextResponse.json(await getMedicationDetail(id));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    return NextResponse.json(await updateMedication(id, body));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    return NextResponse.json(await deleteMedication(id));
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof AdminWorkspaceError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json({ message: "Unexpected admin API error." }, { status: 500 });
}
