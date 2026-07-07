import type { Adapter } from "@solana/wallet-adapter-base";
import {
  WalletConnectionError,
  WalletNotReadyError,
  WalletWindowClosedError,
  type WalletError,
} from "@solana/wallet-adapter-base";

const IGNORABLE_MESSAGE_PATTERNS = [
  /user rejected/i,
  /user denied/i,
  /user cancelled/i,
  /user canceled/i,
  /already pending/i,
  /request.*rejected/i,
  /connection rejected/i,
];

export function isIgnorableWalletError(error: WalletError): boolean {
  if (error instanceof WalletWindowClosedError) {
    return true;
  }

  const message = error.message ?? "";
  if (!message) {
    return error instanceof WalletConnectionError;
  }

  return IGNORABLE_MESSAGE_PATTERNS.some((pattern) => pattern.test(message));
}

export function handleWalletError(error: WalletError, _adapter?: Adapter): void {
  if (isIgnorableWalletError(error)) {
    return;
  }

  if (error instanceof WalletNotReadyError) {
    return;
  }

  console.warn("[wallet]", error.message);
}
