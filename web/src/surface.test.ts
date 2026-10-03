import { describe, expect, it } from "vitest";
import { surfaceForLocation } from "./surface";
describe("public and operational entry points", () => {
  it.each([
    ["/", "", "homepage"],
    ["/", "#how-it-works", "homepage"],
    ["/", "#questions", "homepage"],
    ["/index.html", "", "homepage"],
    ["/workspace", "", "workspace"],
    ["/workspace/", "#summary?farm=example", "workspace"],
    ["/", "#overview", "workspace"],
    ["/", "#register", "workspace"],
    ["/", "#summary?farm=example", "workspace"],
    ["/missing", "", "not-found"],
    ["/workspace-archive", "", "not-found"],
    ["/missing", "#register", "not-found"],
  ])("routes %s%s to %s", (pathname, hash, expected) =>
    expect(surfaceForLocation(pathname, hash)).toBe(expected),
  );
});
