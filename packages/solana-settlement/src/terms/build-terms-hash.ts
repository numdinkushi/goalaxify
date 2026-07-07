import type { PredictionDraft } from "@goalaxify/domain";

import { buildMarketIntentPayload } from "./build-market-intent";

function toBytes32(hashBuffer: ArrayBuffer): number[] {
  return Array.from(new Uint8Array(hashBuffer));
}

async function sha256(data: Uint8Array): Promise<ArrayBuffer> {
  if (globalThis.crypto?.subtle) {
    const copy = new Uint8Array(data);
    return globalThis.crypto.subtle.digest("SHA-256", copy);
  }

  const { createHash } = await import("node:crypto");
  const digest = createHash("sha256").update(data).digest();
  return digest.buffer.slice(
    digest.byteOffset,
    digest.byteOffset + digest.byteLength,
  );
}

export async function buildTermsHash(
  draft: PredictionDraft,
): Promise<{ hashBytes: number[]; hashHex: string }> {
  const payload = buildMarketIntentPayload(draft);
  const canonical = JSON.stringify(payload);
  const encoded = new TextEncoder().encode(canonical);
  const digest = await sha256(encoded);
  const hashBytes = toBytes32(digest);
  const hashHex = hashBytes.map((b) => b.toString(16).padStart(2, "0")).join("");

  return { hashBytes, hashHex };
}
