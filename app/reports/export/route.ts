import { convertPatientReportsToCsv, getPatientReportsSnapshot } from "@/services/patient";
import { getReportsSnapshot, convertReportsToCsv } from "@/services/reports";
import { getViewerContext } from "@/services/viewer";

export async function GET() {
  const viewer = await getViewerContext();
  const csv =
    viewer.hasSession && viewer.role === "patient"
      ? convertPatientReportsToCsv(await getPatientReportsSnapshot())
      : convertReportsToCsv(await getReportsSnapshot());

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="specialtyrx-report.csv"'
    }
  });
}
