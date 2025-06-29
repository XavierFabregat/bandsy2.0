import { describe, it, expect, vi } from "vitest";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

const { mockSetState, mockUseState, mockUseEffect } = vi.hoisted(() => {
  const mockSetState = vi.fn();
  const mockUseState = vi.fn(() => [false, mockSetState]);
  const mockUseEffect = vi.fn((callback: () => void) => {
    callback();
  });

  return { mockSetState, mockUseState, mockUseEffect };
});

vi.mock("react", () => ({
  useEffect: mockUseEffect,
  useState: mockUseState,
}));

describe("useMediaQuery", () => {
  it("should return true if the media query matches", () => {
    const matches = useMediaQuery("(min-width: 768px)");
    expect(matches).toBe(false);
  });

  it("should call setState when media query changes", () => {
    // Mock window.matchMedia
    const mockMediaQueryList = {
      matches: true,
      addEventListener: vi.fn(
        (_event: string, handler: (event: MediaQueryListEvent) => void) => {
          handler({ matches: true } as MediaQueryListEvent);
        },
      ),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(window, "matchMedia", {
      value: vi.fn(() => mockMediaQueryList),
    });

    useMediaQuery("(min-width: 768px)");

    // Verify that setState was called
    expect(mockSetState).toHaveBeenCalledWith(true);
  });
});
