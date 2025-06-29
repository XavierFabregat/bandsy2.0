import { render, type RenderOptions } from "@testing-library/react";
import { type ReactElement } from "react";
import { ThemeProvider } from "@/providers/theme-provider";

// Custom render function that includes providers - JSX allowed in .tsx files
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing library
export * from "@testing-library/react";
export { renderWithProviders as render };
