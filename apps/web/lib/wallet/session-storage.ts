const SESSION_STORAGE_KEY = "goalaxify.wallet.session";
export const WALLET_ADAPTER_STORAGE_KEY = "walletName";

export type WalletSessionSnapshot = {
  walletPubkey: string;
  walletName: string;
  updatedAt: number;
};

export function saveWalletSession(snapshot: {
  walletPubkey: string;
  walletName: string;
}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: WalletSessionSnapshot = {
    ...snapshot,
    updatedAt: Date.now(),
  };

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
}

export function readWalletSession(): WalletSessionSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as WalletSessionSnapshot;
    if (!parsed.walletPubkey || !parsed.walletName) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearWalletSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function hasStoredWalletSelection(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return !!localStorage.getItem(WALLET_ADAPTER_STORAGE_KEY);
}
