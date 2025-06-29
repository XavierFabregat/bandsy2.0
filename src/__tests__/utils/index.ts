import { render, type RenderOptions } from "@testing-library/react";
import { type ReactElement } from "react";

// Export all testing library functions
export * from "@testing-library/react";

// Common test utilities
export const mockUser = {
  id: "test-user-id",
  username: "testuser",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  imageUrl: "https://example.com/avatar.jpg",
};

export const mockInstrument = {
  id: 1,
  name: "Guitar",
  category: "String" as const,
};

export const mockGenre = {
  id: 1,
  name: "Rock",
};

export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

// Helper function to create a custom render without JSX in this file
export const createCustomRender = () => {
  // This function will be used in .tsx test files where JSX is allowed
  return (ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) => {
    return render(ui, options);
  };
};
