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
  SignInButton: vi.fn(
    ({ children }: { children: React.ReactNode }) => children,
  ),
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

// Mock EventSource for SSE functionality
// @ts-expect-error - EventSource is not defined in the global scope
global.EventSource = vi.fn().mockImplementation(() => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
  readyState: 0,
  url: "",
  withCredentials: false,
  onopen: null,
  onmessage: null,
  onerror: null,
}));

// Add EventSource constants
Object.assign(global.EventSource, {
  CONNECTING: 0,
  OPEN: 1,
  CLOSED: 2,
});

// Mock fetch globally to handle relative URLs
global.fetch = vi.fn().mockImplementation((url: string) => {
  // Handle notifications API calls
  if (url.includes("/api/notifications")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          notifications: [],
          unreadCount: 0,
        }),
    });
  }

  // Default mock for other fetch calls
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

// Mock browser Notification API
// @ts-expect-error - Notification is not defined in the global scope
global.Notification = vi.fn().mockImplementation(() => ({}));
Object.assign(global.Notification, {
  permission: "default",
  requestPermission: vi.fn().mockResolvedValue("granted"),
});

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
