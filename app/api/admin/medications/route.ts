import { NextRequest, NextResponse } from "next/server";
import {
  AdminWorkspaceError,
  createMedication,
  getMedicationCatalog
} from "@/services/admin-workspace";

export async function GET(request: NextRequest) {
  try {
    const snapshot = await getMedicationCatalog({
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
    return NextResponse.json(await createMedication(body), { status: 201 });
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
