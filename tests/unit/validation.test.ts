import { describe, expect, it } from "vitest";
import { onboardingSchema, registerSchema, resetPasswordSchema } from "@/lib/validation";

describe("input validation", () => {
  it("normalizes organization identifiers and warehouse codes", () => {
    const result = onboardingSchema.parse({
      organizationName: "  Acme Logística  ", organizationSlug: "acme-logistica",
      warehouseName: " Central ", warehouseCode: " cen_01 ", requestId: "5f650eac-585b-49e7-96bd-4b2b94fe9f07",
    });
    expect(result.organizationName).toBe("Acme Logística");
    expect(result.warehouseCode).toBe("CEN_01");
  });

  it("rejects unsafe slugs", () => {
    expect(onboardingSchema.safeParse({ organizationName: "Acme", organizationSlug: "Acme / SQL", warehouseName: "Central", warehouseCode: "CEN", requestId: crypto.randomUUID() }).success).toBe(false);
  });

  it("enforces strong matching passwords", () => {
    expect(registerSchema.safeParse({ fullName: "Ada Lovelace", email: "ada@example.com", password: "weak" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ password: "SecurePass123", confirmation: "Different123" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ password: "SecurePass123", confirmation: "SecurePass123" }).success).toBe(true);
  });
});
