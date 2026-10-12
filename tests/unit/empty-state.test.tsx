import { render, screen } from "@testing-library/react";
import { Package } from "lucide-react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "@/components/common/empty-state";

describe("EmptyState", () => {
  it("explains unavailable data without inventing records", () => {
    render(<EmptyState icon={Package} title="Sin productos" description="El catálogo está vacío." />);
    expect(screen.getByRole("heading", { name: "Sin productos" })).toBeInTheDocument();
    expect(screen.getByText("El catálogo está vacío.")).toBeInTheDocument();
  });
});
