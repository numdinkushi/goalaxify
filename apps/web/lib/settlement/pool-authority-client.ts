import { TxlineNetwork } from "@goalaxify/config";
import { PublicKey } from "@solana/web3.js";

/**
 * Next.js only inlines NEXT_PUBLIC_* vars when they are referenced statically.
 * Network-scoped resolution via dynamic keys does not work in client bundles.
 */
const DEVNET_POOL_PUBKEY =
  process.env.NEXT_PUBLIC_POOL_AUTHORITY_PUBKEY_DEVNET ??
  process.env.NEXT_PUBLIC_POOL_AUTHORITY_PUBKEY;

const MAINNET_POOL_PUBKEY = process.env.NEXT_PUBLIC_POOL_AUTHORITY_PUBKEY_MAINNET;

function toPublicKey(value: string | undefined): PublicKey | null {
  if (!value) {
    return null;
  }

  try {
    return new PublicKey(value);
  } catch {
    return null;
  }
}

export function getPoolAuthorityPubkeyForClient(
  network: TxlineNetwork,
): PublicKey | null {
  const raw =
    network === TxlineNetwork.Mainnet ? MAINNET_POOL_PUBKEY : DEVNET_POOL_PUBKEY;

  return toPublicKey(raw);
}

export function isPoolAuthorityConfiguredForClient(
  network: TxlineNetwork,
): boolean {
  return getPoolAuthorityPubkeyForClient(network) !== null;
}
