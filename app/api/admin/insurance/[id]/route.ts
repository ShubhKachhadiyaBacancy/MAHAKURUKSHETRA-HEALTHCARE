import { NextRequest, NextResponse } from "next/server";
import {
  AdminWorkspaceError,
  deleteInsurancePolicy,
  getInsuranceDetail,
  updateInsurancePolicy
} from "@/services/admin-workspace";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    return NextResponse.json(await getInsuranceDetail(id));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    return NextResponse.json(await updateInsurancePolicy(id, body));
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    return NextResponse.json(await deleteInsurancePolicy(id));
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
