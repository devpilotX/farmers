import { describe, expect, it } from "vitest";
import {
  draftFields,
  isExpired,
  localCaptureAllowed,
  retentionMs,
} from "./records";
describe("local sample capture", () => {
  it("requires both verified demo mode and a loopback host", () => {
    expect(localCaptureAllowed("local-demo", "127.0.0.1")).toBe(true);
    expect(localCaptureAllowed("local-demo", "localhost")).toBe(true);
    expect(localCaptureAllowed("local-demo", "[::1]")).toBe(true);
    expect(localCaptureAllowed("authenticated", "localhost")).toBe(false);
    expect(localCaptureAllowed(undefined, "localhost")).toBe(false);
    expect(localCaptureAllowed("local-demo", "farms.example")).toBe(false);
  });
  it("drops permission and unknown fields from a draft", () => {
    const form = new FormData();
    form.set("farmerName", "Sample farmer");
    form.set("consent", "on");
    form.set("token", "private");
    expect(draftFields(form).farmerName).toBe("Sample farmer");
    expect(draftFields(form)).not.toHaveProperty("consent");
    expect(draftFields(form)).not.toHaveProperty("token");
  });
  it("rejects oversized fields without truncating silently", () => {
    const form = new FormData();
    form.set("farmerName", "a".repeat(101));
    expect(() => draftFields(form)).toThrow("too long");
  });
  it("expires at seven days but not one millisecond earlier", () => {
    expect(isExpired(1000, 1000 + retentionMs - 1)).toBe(false);
    expect(isExpired(1000, 1000 + retentionMs)).toBe(true);
  });
  it("rejects future and invalid timestamps", () => {
    expect(isExpired(2000, 1000)).toBe(true);
    expect(isExpired(NaN, 1000)).toBe(true);
  });
});
