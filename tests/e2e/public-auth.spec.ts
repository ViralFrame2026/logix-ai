import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("login is usable and has no serious accessibility violations", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Bienvenido de nuevo" })).toBeVisible();
  await expect(page.getByLabel("Email laboral")).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""))).toEqual([]);
  expect(runtimeErrors).toEqual([]);
});

test("private routes reject an anonymous session", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
});

test("mobile authentication layout stays within the viewport", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Creá tu cuenta" })).toBeVisible();
  const width = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(width).toBe(0);
});
