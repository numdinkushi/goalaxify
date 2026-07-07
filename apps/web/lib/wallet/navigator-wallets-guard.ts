type WalletRegistryCallback = (api: { register: (...wallets: unknown[]) => unknown }) => void;

type NavigatorWalletsQueue =
  | WalletRegistryCallback[]
  | { push: (...callbacks: unknown[]) => void };

/**
 * Hero Wallet and other extensions sometimes populate `navigator.wallets`
 * with non-function values. Wallet Standard then throws when it iterates them.
 */
export function sanitizeNavigatorWallets(): void {
  if (typeof window === "undefined") {
    return;
  }

  const navigatorWithWallets = window.navigator as Navigator & {
    wallets?: NavigatorWalletsQueue;
  };

  const existing = navigatorWithWallets.wallets;
  if (!existing) {
    return;
  }

  if (Array.isArray(existing)) {
    const validCallbacks = existing.filter(
      (callback): callback is WalletRegistryCallback =>
        typeof callback === "function",
    );

    if (validCallbacks.length !== existing.length) {
      navigatorWithWallets.wallets = validCallbacks;
    }

    return;
  }

  if (
    typeof existing === "object" &&
    "push" in existing &&
    typeof existing.push === "function"
  ) {
    const queue = existing as { push: (...callbacks: unknown[]) => void };
    const originalPush = queue.push.bind(queue);

    queue.push = (...callbacks: unknown[]) => {
      originalPush(
        ...callbacks.filter(
          (callback): callback is WalletRegistryCallback =>
            typeof callback === "function",
        ),
      );
    };
  }
}
