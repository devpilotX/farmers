import type { FarmInput } from "../types";
export const retentionMs = 7 * 24 * 60 * 60 * 1000;
export const queueLimit = 20;
export type DraftFields = Record<string, string>;
export type PendingRegistration = {
  id: string;
  savedAt: number;
  payload: FarmInput;
};
export type LocalSnapshot = {
  draft?: { savedAt: number; fields: DraftFields; revision: string };
  pending: PendingRegistration[];
  expired: number;
};
export const fieldLimits: Record<string, number> = {
  farmerName: 100,
  village: 100,
  district: 100,
  crop: 30,
  stage: 30,
  areaHectares: 20,
  assets: 500,
  boundary: 5000,
};
export function draftFields(form: FormData): DraftFields {
  return Object.fromEntries(
    Object.entries(fieldLimits).map(([name, limit]) => {
      const value = String(form.get(name) ?? "");
      if (value.length > limit)
        throw new Error("A draft field is too long. Shorten it before saving.");
      return [name, value];
    }),
  );
}
export function localCaptureAllowed(
  mode: string | undefined,
  hostname: string,
): boolean {
  return (
    mode === "local-demo" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(hostname)
  );
}
export function isExpired(savedAt: number, now: number): boolean {
  return (
    !Number.isFinite(savedAt) || savedAt > now || now - savedAt >= retentionMs
  );
}
