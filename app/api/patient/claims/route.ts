import { NextResponse } from "next/server";
import {
  createPatientClaim,
  getPatientClaimsSnapshot,
  PatientServiceError
} from "@/services/patient";

export async function GET() {
  try {
    const snapshot = await getPatientClaimsSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    if (error instanceof PatientServiceError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "Unexpected patient claims API error." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createPatientClaim(body ?? {});
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PatientServiceError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "Unexpected patient claims API error." },
      { status: 500 }
    );
  }
}
