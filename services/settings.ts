import { demoSettings } from "@/services/demo-data";
import type { SettingsSnapshot } from "@/types/workspace";

export async function getSettingsSnapshot(): Promise<SettingsSnapshot> {
  return demoSettings;
}
