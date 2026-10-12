import { AppShell } from "@/components/layout/app-shell";
import { requireMembership } from "@/data/auth";

export const dynamic = "force-dynamic";

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const membership = await requireMembership();
  return <AppShell membership={membership}>{children}</AppShell>;
}
