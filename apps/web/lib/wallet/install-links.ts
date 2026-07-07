import type { WalletName } from "@solana/wallet-adapter-base";

export type WalletInstallInfo = {
  extensionUrl: string;
  webWalletUrl?: string;
  headline: string;
  description: string;
};

export const WALLET_INSTALL_INFO: Record<string, WalletInstallInfo> = {
  Phantom: {
    extensionUrl: "https://phantom.app/download",
    headline: "Install Phantom",
    description:
      "Phantom is the recommended Solana wallet for Goalaxify. Install the browser extension, then come back here to connect.",
  },
  Solflare: {
    extensionUrl: "https://solflare.com/download",
    webWalletUrl: "https://solflare.com/access-wallet",
    headline: "Install Solflare",
    description:
      "Get the Solflare extension for the best experience, or use the web wallet if you prefer not to install anything.",
  },
};

export function getWalletInstallInfo(
  walletName: WalletName,
  fallbackUrl?: string,
): WalletInstallInfo {
  const known = WALLET_INSTALL_INFO[walletName];
  if (known) {
    return known;
  }

  return {
    extensionUrl: fallbackUrl ?? "https://phantom.app/download",
    headline: `Install ${walletName}`,
    description: `Install ${walletName}, then return here to connect your wallet.`,
  };
}

export function openWalletInstallLink(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
