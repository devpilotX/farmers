import type { Point } from "./types";
export function parseBoundary(value: string): Point[] {
  const points = value
    .trim()
    .split("\n")
    .map((line) => {
      const parts = line.trim().split(",").map(Number);
      if (
        parts.length !== 2 ||
        parts.some((value) => !Number.isFinite(value)) ||
        line.split(",").some((value) => !value.trim())
      )
        throw new Error("Use one longitude, latitude pair per line.");
      return { longitude: parts[0], latitude: parts[1] };
    });
  if (points.length < 4 || points.length > 100)
    throw new Error(
      "Enter 4 to 100 boundary points, including the repeated first point.",
    );
  if (
    points.some(
      (point) =>
        Math.abs(point.longitude) > 180 || Math.abs(point.latitude) > 90,
    )
  )
    throw new Error(
      "Longitude must be within -180 to 180, and latitude within -90 to 90.",
    );
  if (
    points[0].longitude !== points.at(-1)?.longitude ||
    points[0].latitude !== points.at(-1)?.latitude
  )
    throw new Error("Repeat the first point at the end to close the boundary.");
  return points;
}
