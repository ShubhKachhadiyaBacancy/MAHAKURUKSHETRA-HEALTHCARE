import { NextResponse } from "next/server";
import { PatientServiceError, updatePatientProfile } from "@/services/patient";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const result = await updatePatientProfile(body ?? {});
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PatientServiceError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "Unexpected patient profile API error." },
      { status: 500 }
    );
  }
}
