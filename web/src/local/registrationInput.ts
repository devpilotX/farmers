import { parseBoundary } from "../boundary";
import type { FarmInput } from "../types";
export function registrationInput(
  form: FormData,
  requestId: string,
): FarmInput {
  return {
    requestId,
    farmerName: String(form.get("farmerName")),
    village: String(form.get("village")),
    district: String(form.get("district")),
    crop: String(form.get("crop")),
    stage: String(form.get("stage")),
    areaHectares: Number(form.get("areaHectares")),
    assets: String(form.get("assets")),
    boundary: parseBoundary(String(form.get("boundary"))),
    consent: form.get("consent") === "on",
    consentVersion: "registry-v1-en",
  };
}
