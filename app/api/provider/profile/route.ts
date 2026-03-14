import { NextRequest, NextResponse } from "next/server";
import {
  WorkspaceAccessError,
  getProviderProfileSnapshot,
  updateProviderProfile
} from "@/services/provider";

export async function GET() {
  try {
    const snapshot = await getProviderProfileSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await updateProviderProfile(body);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

function toErrorResponse(error: unknown) {
  if (error instanceof WorkspaceAccessError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json(
    { message: "Unexpected doctor profile API error." },
    { status: 500 }
  );
}
