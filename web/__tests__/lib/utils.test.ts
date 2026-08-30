import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class strings and resolves conflicting Tailwind utilities", () => {
    expect(cn("p-2 text-sm", "p-4 text-base")).toBe("p-4 text-base");
  });

  it("supports conditional, falsy, and array inputs", () => {
    expect(
      cn(
        "flex",
        false && "hidden",
        null,
        undefined,
        ["items-center", 0, "gap-2"],
        { "text-muted": true, "text-red-500": false }
      )
    ).toBe("flex items-center gap-2 text-muted");
  });
});
