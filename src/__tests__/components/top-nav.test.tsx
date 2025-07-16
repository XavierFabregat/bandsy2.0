import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../utils/test-helpers";
import { TopNav } from "@/components/top-nav";

// Mock the mode toggle component
vi.mock("@/app/_components/mode-toggle", () => ({
  ModeToggle: () => <button data-testid="mode-toggle">Toggle Theme</button>,
}));

// Mock the notification bell component to avoid act warnings
vi.mock("@/components/notifications/notification-bell", () => ({
  NotificationBell: () => <div data-testid="notification-bell">Notifications</div>,
}));

describe("TopNav", () => {
  it("renders navigation links", () => {
    render(<TopNav />);

    expect(screen.getByText("Bandsy")).toBeDefined();
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("Groups")).toBeDefined();
    expect(screen.getByText("Browse")).toBeDefined();
    expect(screen.getByText("Invites")).toBeDefined();
    expect(screen.getByText("Matches")).toBeDefined();
    expect(screen.getByText("Profile")).toBeDefined();
    expect(screen.getByText("Samples")).toBeDefined();
  });

  it("renders user button and theme toggle", () => {
    render(<TopNav />);

    expect(screen.getByTestId("mode-toggle")).toBeDefined();
  });

  it("has correct navigation links", () => {
    render(<TopNav />);

    // Test direct navigation links
    const homeLink = screen.getByRole("link", { name: "Home" });
    const homeLinkHref = homeLink.getAttribute("href");
    expect(homeLinkHref).toBe("/");

    const groupsLink = screen.getByRole("link", { name: "Groups" });
    const groupsLinkHref = groupsLink.getAttribute("href");
    expect(groupsLinkHref).toBe("/groups");

    const invitesLink = screen.getByRole("link", { name: "Invites" });
    const invitesLinkHref = invitesLink.getAttribute("href");
    expect(invitesLinkHref).toBe("/invites");

    const matchesLink = screen.getByRole("link", { name: "Matches" });
    const matchesLinkHref = matchesLink.getAttribute("href");
    expect(matchesLinkHref).toBe("/matches");

    // Test dropdown buttons
    const browseDropdown = screen.getByRole("button", { name: "Browse" });
    const profileDropdown = screen.getByRole("button", { name: "Profile" });
    const samplesDropdown = screen.getByRole("button", { name: "Samples" });

    const browseLinkHref = browseDropdown.getAttribute("data-state");
    const profileLinkHref = profileDropdown.getAttribute("data-state");
    const samplesLinkHref = samplesDropdown.getAttribute("data-state");

    expect(browseLinkHref).toBe("closed");
    expect(profileLinkHref).toBe("closed");
    expect(samplesLinkHref).toBe("closed");
  });
});
