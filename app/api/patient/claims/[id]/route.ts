import { NextResponse } from "next/server";
import {
  deletePatientClaim,
  PatientServiceError,
  updatePatientClaim
} from "@/services/patient";

type PatientClaimRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: PatientClaimRouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const result = await updatePatientClaim(id, body ?? {});
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PatientServiceError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "Unexpected patient claim API error." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: PatientClaimRouteContext) {
  try {
    const { id } = await context.params;
    const result = await deletePatientClaim(id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PatientServiceError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "Unexpected patient claim API error." },
      { status: 500 }
    );
  }
}
