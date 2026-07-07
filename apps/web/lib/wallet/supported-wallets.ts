import type { WalletName } from "@solana/wallet-adapter-base";

export const DEFAULT_WALLET_NAME = "Phantom" as WalletName;

export const SUPPORTED_WALLET_NAMES = new Set<WalletName>([
  DEFAULT_WALLET_NAME,
  "Solflare" as WalletName,
]);

const WALLET_PRIORITY: WalletName[] = [
  DEFAULT_WALLET_NAME,
  "Solflare" as WalletName,
];

export function isSupportedWalletName(name: WalletName): boolean {
  return SUPPORTED_WALLET_NAMES.has(name);
}

export function sortSupportedWallets<T extends { adapter: { name: WalletName } }>(
  wallets: T[],
): T[] {
  return [...wallets].sort((left, right) => {
    const leftIndex = WALLET_PRIORITY.indexOf(left.adapter.name);
    const rightIndex = WALLET_PRIORITY.indexOf(right.adapter.name);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.adapter.name.localeCompare(right.adapter.name);
    }
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
}
