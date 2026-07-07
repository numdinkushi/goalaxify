"use client";

import dynamic from "next/dynamic";

const PwaInstaller = dynamic(
  () =>
    import("@/components/pwa/pwa-installer").then((mod) => ({
      default: mod.PwaInstaller,
    })),
  { ssr: false, loading: () => null },
);

export function PwaComponents() {
  return <PwaInstaller />;
}
