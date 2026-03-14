import { NextRequest, NextResponse } from "next/server";
import { WorkspaceAccessError, addProviderFeedback } from "@/services/provider";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: Context) {
  try {
    const body = await request.json();
    const { id } = await context.params;
    const result = await addProviderFeedback(id, body);
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
    { message: "Unexpected doctor feedback API error." },
    { status: 500 }
  );
}
