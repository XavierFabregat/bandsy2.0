import "@testing-library/jest-dom";
import { beforeAll, afterAll, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Next.js router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  pathname: "/",
  route: "/",
  query: {},
  asPath: "/",
  basePath: "",
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  isFallback: false,
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
};

vi.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Clerk - return proper mock functions without JSX
vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    user: {
      id: "test-user-id",
      username: "testuser",
      emailAddresses: [{ emailAddress: "test@example.com" }],
      imageUrl: "https://example.com/avatar.jpg",
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    userId: "test-user-id",
    sessionId: "test-session-id",
    isLoaded: true,
    isSignedIn: true,
  }),
  SignedIn: vi.fn(({ children }: { children: React.ReactNode }) => children),
  SignedOut: vi.fn(({ children }: { children: React.ReactNode }) => children),
  UserButton: vi.fn(() => "UserButton"),
  ClerkProvider: vi.fn(
    ({ children }: { children: React.ReactNode }) => children,
  ),
}));

// Mock UploadThing
vi.mock("@uploadthing/react", () => ({
  useUploadThing: () => ({
    startUpload: vi.fn(),
    isUploading: false,
    permittedFileInfo: {
      config: {
        image: {
          maxFileSize: "4MB",
          maxFileCount: 1,
        },
      },
    },
  }),
  generateUploadButton: () => vi.fn(() => "UploadButton"),
  generateUploadDropzone: () => vi.fn(() => "UploadDropzone"),
}));

// Mock environment variables
vi.mock("@/env.js", () => ({
  env: {
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    UPLOADTHING_SECRET: "test-secret",
    UPLOADTHING_APP_ID: "test-app-id",
    CLERK_SECRET_KEY: "test-clerk-secret",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "test-clerk-publishable",
  },
}));

// Global test setup
beforeAll(() => {
  // Setup any global test state
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  // Cleanup any global test state
});
