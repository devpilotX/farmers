import { describe, expect, it } from "vitest";
import { correctionInput } from "./correction";
import type { Farm } from "./types";
const farm = { version: 3 } as Farm;
function form() {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    crop: "Maize",
    stage: "Growing",
    areaHectares: "1.25",
    assets: " One pump ",
    boundary: "86,25\n87,25\n87,26\n86,25",
    reason: " Reviewed crop ",
    reviewed: "on",
  }))
    data.set(key, value);
  return data;
}
describe("reviewed correction payload", () => {
  it("keeps the reviewed version and exact request identity without identity fields", () => {
    expect(correctionInput(form(), farm, "fixed-request")).toEqual({
      requestId: "fixed-request",
      expectedVersion: 3,
      reason: "Reviewed crop",
      reviewed: true,
      crop: "Maize",
      stage: "Growing",
      areaHectares: 1.25,
      assets: "One pump",
      boundary: [
        { longitude: 86, latitude: 25 },
        { longitude: 87, latitude: 25 },
        { longitude: 87, latitude: 26 },
        { longitude: 86, latitude: 25 },
      ],
    });
  });
  it("rejects missing review", () => {
    const data = form();
    data.delete("reviewed");
    expect(() => correctionInput(data, farm, "request")).toThrow(
      "Review the corrected details",
    );
  });
  it("rejects a blank reason", () => {
    const data = form();
    data.set("reason", " ");
    expect(() => correctionInput(data, farm, "request")).toThrow(
      "Give a short reason",
    );
  });
  it("rejects a record without a current version", () => {
    expect(() =>
      correctionInput(
        form(),
        { version: undefined } as unknown as Farm,
        "request",
      ),
    ).toThrow("Open a current record");
  });
});
