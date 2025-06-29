import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../utils/test-helpers";
import { TopNav } from "@/components/top-nav";

// Mock the mode toggle component
vi.mock("@/app/_components/mode-toggle", () => ({
  ModeToggle: () => <button data-testid="mode-toggle">Toggle Theme</button>,
}));

describe("TopNav", () => {
  it("renders navigation links", () => {
    render(<TopNav />);

    expect(screen.getByText("Bandsy")).toBeDefined();
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Browse")).toBeDefined();
    expect(screen.getByText("Profile")).toBeDefined();
    expect(screen.getByText("Samples")).toBeDefined();
  });

  it("renders user button and theme toggle", () => {
    render(<TopNav />);

    expect(screen.getByTestId("mode-toggle")).toBeDefined();
  });

  it("has correct navigation links", () => {
    render(<TopNav />);

    const homeLink = screen.getByRole("link", { name: "Home" });
    const homeLinkHref = homeLink.getAttribute("href");
    expect(homeLinkHref).toBe("/");

    const browseDropdown = screen.getByRole("button", { name: "Browse" });
    const discoverDropdown = screen.getByRole("button", { name: "Profile" });
    const samplesDropdown = screen.getByRole("button", { name: "Samples" });

    const browseLinkHref = browseDropdown.getAttribute("data-state");
    const discoverLinkHref = discoverDropdown.getAttribute("data-state");
    const samplesLinkHref = samplesDropdown.getAttribute("data-state");

    expect(browseLinkHref).toBe("closed");
    expect(discoverLinkHref).toBe("closed");
    expect(samplesLinkHref).toBe("closed");
  });
});
