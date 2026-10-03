import { parseBoundary } from "./boundary";
import type { CorrectionInput, Farm } from "./types";
export function correctionInput(
  form: FormData,
  farm: Farm,
  requestId: string,
): CorrectionInput {
  if (!Number.isInteger(farm.version) || farm.version < 1)
    throw new Error("Open a current record before making a correction.");
  const reason = String(form.get("reason") ?? "").trim();
  if (!reason) throw new Error("Give a short reason for this correction.");
  if (form.get("reviewed") !== "on")
    throw new Error("Review the corrected details before submitting.");
  return {
    requestId,
    expectedVersion: farm.version,
    reason,
    reviewed: true,
    crop: String(form.get("crop")),
    stage: String(form.get("stage")),
    areaHectares: Number(form.get("areaHectares")),
    assets: String(form.get("assets") ?? "").trim(),
    boundary: parseBoundary(String(form.get("boundary"))),
  };
}
export const fieldLabels: Record<string, string> = {
  crop: "Crop",
  stage: "Crop stage",
  areaHectares: "Reported area",
  assets: "Movable assets",
  boundary: "Recorded boundary",
};
export function boundaryText(farm: Farm) {
  return farm.boundary
    .map((point) => `${point.longitude}, ${point.latitude}`)
    .join("\n");
}
