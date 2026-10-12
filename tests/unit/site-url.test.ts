import { describe, expect, it } from "vitest";
import { getSiteUrl } from "@/lib/site-url";

describe("getSiteUrl", () => {
  it("uses the generated Vercel URL for previews instead of localhost", () => {
    expect(getSiteUrl({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      VERCEL_URL: "logix-ai-preview.vercel.app",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    })).toBe("https://logix-ai-preview.vercel.app");
  });

  it("accepts an explicit HTTPS site origin", () => {
    expect(getSiteUrl({
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://staging.logix.example/auth/callback",
    })).toBe("https://staging.logix.example");
  });

  it("never uses localhost in a production runtime", () => {
    expect(getSiteUrl({
      NODE_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    })).toBeNull();
  });

  it("keeps localhost available for local development", () => {
    expect(getSiteUrl({ NODE_ENV: "development" })).toBe("http://localhost:3000");
  });
});
