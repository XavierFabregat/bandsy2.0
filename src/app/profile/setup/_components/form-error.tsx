"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export function FormError() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      try {
        const parsedError = JSON.parse(
          decodeURIComponent(errorParam),
        ) as unknown;
        if (typeof parsedError === "string") {
          setError(parsedError);
        } else if (typeof parsedError === "object" && parsedError !== null) {
          // Handle validation errors object
          const errorObj = parsedError as Record<string, unknown>;
          const errorMessages = Object.values(errorObj).join(", ");
          setError(errorMessages);
        }
      } catch {
        setError(errorParam);
      }
    }
  }, [searchParams]);

  if (!error) return null;

  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  );
}
