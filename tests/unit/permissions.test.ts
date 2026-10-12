import { describe, expect, it } from "vitest";
import { can } from "@/lib/permissions";

describe("role permissions", () => {
  it("gives the owner full organization management", () => {
    expect(can("owner", "organization.manage")).toBe(true);
    expect(can("owner", "members.manage")).toBe(true);
  });

  it("does not let an admin change organization ownership", () => {
    expect(can("admin", "organization.manage")).toBe(false);
    expect(can("admin", "members.manage")).toBe(true);
  });

  it("keeps viewers read-only", () => {
    expect(can("viewer", "operations.read")).toBe(true);
    expect(can("viewer", "operations.write")).toBe(false);
    expect(can("viewer", "warehouse.manage")).toBe(false);
  });
});
