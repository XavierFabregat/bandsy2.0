"use client";
import dynamic from "next/dynamic";

export const ProfileGuardClientComponent = dynamic(
  () =>
    import("./profile-guard-client").then((mod) => ({
      default: mod.ProfileGuardClient,
    })),
  {
    ssr: false,
  },
);

export const ProfileGuardClient = ProfileGuardClientComponent;
