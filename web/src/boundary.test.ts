import { describe, expect, it } from "vitest";
import { parseBoundary } from "./boundary";
describe("recorded plot parsing", () => {
  it("parses a closed boundary", () =>
    expect(parseBoundary("86,25\n87,25\n87,26\n86,25")).toHaveLength(4));
  it.each([
    "86,25\n87,25\n87,26\n86,26",
    "86,25\n87,25",
    "x,25\n87,25\n87,26\nx,25",
    "181,25\n87,25\n87,26\n181,25",
    ",25\n87,25\n87,26\n,25",
  ])("rejects malformed or unclosed coordinates: %s", (boundary) =>
    expect(() => parseBoundary(boundary)).toThrow(),
  );
});
