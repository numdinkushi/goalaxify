import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export function getConvexHttpClient(): ConvexHttpClient | null {
  if (!convexUrl) {
    return null;
  }

  return new ConvexHttpClient(convexUrl);
}
