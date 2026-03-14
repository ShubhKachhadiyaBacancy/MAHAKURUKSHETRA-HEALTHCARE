import { convertPatientReportsToCsv, getPatientReportsSnapshot } from "@/services/patient";
import { getReportsSnapshot, convertReportsToCsv } from "@/services/reports";
import { getAdminReportsSnapshot } from "@/services/admin-workspace";
import { getViewerContext } from "@/services/viewer";

export async function GET() {
  const viewer = await getViewerContext();
  const csv =
    viewer.hasSession && viewer.role === "patients"
      ? convertPatientReportsToCsv(await getPatientReportsSnapshot())
      : viewer.hasSession && viewer.role === "admin"
        ? convertReportsToCsv(await getAdminReportsSnapshot())
        : convertReportsToCsv(await getReportsSnapshot());

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="specialtyrx-report.csv"'
    }
  });
}
