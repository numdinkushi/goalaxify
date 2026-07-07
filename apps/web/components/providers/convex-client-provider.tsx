"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const DEFAULT_CONVEX_URL = "https://watchful-marten-993.convex.cloud";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || DEFAULT_CONVEX_URL;
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
