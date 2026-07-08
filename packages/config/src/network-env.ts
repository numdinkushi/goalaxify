type EnvSource = Record<string, string | undefined>;

function getDefaultEnv(): EnvSource {
  return (
    (globalThis as { process?: { env?: EnvSource } }).process?.env ?? {}
  );
}

export enum SolanaNetwork {
  Devnet = "devnet",
  MainnetBeta = "mainnet-beta",
}

export enum TxlineNetwork {
  Devnet = "devnet",
  Mainnet = "mainnet",
}

export const ACTIVE_SOLANA_NETWORK_ENV_KEY = "NEXT_PUBLIC_SOLANA_NETWORK";
export const SOLANA_NETWORK_COOKIE = "goalaxify-solana-network";

export function isSolanaNetwork(
  value: string | null | undefined,
): value is SolanaNetwork {
  return value === SolanaNetwork.Devnet || value === SolanaNetwork.MainnetBeta;
}

export function getSolanaNetworkFromEnv(
  env: EnvSource = getDefaultEnv(),
): SolanaNetwork {
  return env[ACTIVE_SOLANA_NETWORK_ENV_KEY] === SolanaNetwork.MainnetBeta
    ? SolanaNetwork.MainnetBeta
    : SolanaNetwork.Devnet;
}

export function resolveSolanaNetwork(options?: {
  env?: EnvSource;
  preference?: string | null;
}): SolanaNetwork {
  const preference = options?.preference;
  if (preference !== null && preference !== undefined && isSolanaNetwork(preference)) {
    return preference;
  }

  return getSolanaNetworkFromEnv(options?.env);
}

export function toTxlineNetwork(
  network: SolanaNetwork | TxlineNetwork,
): TxlineNetwork {
  return network === SolanaNetwork.MainnetBeta || network === TxlineNetwork.Mainnet
    ? TxlineNetwork.Mainnet
    : TxlineNetwork.Devnet;
}

export function getTxlineNetworkFromEnv(
  env: EnvSource = getDefaultEnv(),
): TxlineNetwork {
  return toTxlineNetwork(getSolanaNetworkFromEnv(env));
}

export function getNetworkEnvSuffix(
  network: SolanaNetwork | TxlineNetwork,
): string {
  return network === SolanaNetwork.MainnetBeta || network === TxlineNetwork.Mainnet
    ? "MAINNET"
    : "DEVNET";
}

export function getNetworkScopedEnvKey(
  baseKey: string,
  network: SolanaNetwork | TxlineNetwork,
): string {
  return `${baseKey}_${getNetworkEnvSuffix(network)}`;
}

export function resolveNetworkScopedEnvValue(
  env: EnvSource,
  baseKey: string,
  network: SolanaNetwork | TxlineNetwork,
  options?: { allowGenericFallback?: boolean },
): string | undefined {
  const scopedKey = getNetworkScopedEnvKey(baseKey, network);
  if (env[scopedKey]) {
    return env[scopedKey];
  }

  const allowGenericFallback =
    options?.allowGenericFallback ??
    (network === SolanaNetwork.Devnet || network === TxlineNetwork.Devnet);

  return allowGenericFallback ? env[baseKey] : undefined;
}

export function resolveSolanaRpcUrl(
  env: EnvSource = getDefaultEnv(),
  network?: SolanaNetwork,
): string | undefined {
  const resolvedNetwork = network ?? getSolanaNetworkFromEnv(env);
  return resolveNetworkScopedEnvValue(
    env,
    "NEXT_PUBLIC_SOLANA_RPC_URL",
    resolvedNetwork,
  );
}

export function resolveSolanaProgramId(
  env: EnvSource = getDefaultEnv(),
  network?: SolanaNetwork,
): string | undefined {
  const resolvedNetwork = network ?? getSolanaNetworkFromEnv(env);
  return resolveNetworkScopedEnvValue(
    env,
    "NEXT_PUBLIC_SOLANA_PROGRAM_ID",
    resolvedNetwork,
  );
}

export function resolvePoolAuthorityPubkey(
  env: EnvSource = getDefaultEnv(),
  network?: TxlineNetwork,
): string | undefined {
  const resolvedNetwork = network ?? getTxlineNetworkFromEnv(env);
  return resolveNetworkScopedEnvValue(
    env,
    "NEXT_PUBLIC_POOL_AUTHORITY_PUBKEY",
    resolvedNetwork,
  ) ?? resolveNetworkScopedEnvValue(env, "POOL_AUTHORITY_PUBKEY", resolvedNetwork);
}

export function resolvePoolAuthoritySecret(
  env: EnvSource = getDefaultEnv(),
  network?: TxlineNetwork,
): string | undefined {
  const resolvedNetwork = network ?? getTxlineNetworkFromEnv(env);
  return resolveNetworkScopedEnvValue(
    env,
    "POOL_AUTHORITY_SECRET",
    resolvedNetwork,
  );
}

export function resolveTxlineGuestJwt(
  env: EnvSource = getDefaultEnv(),
  network = getTxlineNetworkFromEnv(env),
): string | undefined {
  return resolveNetworkScopedEnvValue(env, "TXLINE_GUEST_JWT", network);
}

export function resolveTxlineApiToken(
  env: EnvSource = getDefaultEnv(),
  network = getTxlineNetworkFromEnv(env),
): string | undefined {
  return resolveNetworkScopedEnvValue(env, "TXLINE_API_TOKEN", network);
}

export function resolveTxlineSubscriptionTxSig(
  env: EnvSource = getDefaultEnv(),
  network = getTxlineNetworkFromEnv(env),
): string | undefined {
  return resolveNetworkScopedEnvValue(
    env,
    "TXLINE_SUBSCRIPTION_TX_SIG",
    network,
  );
}

export function resolveTxlineWalletSecret(
  env: EnvSource = getDefaultEnv(),
  network = getTxlineNetworkFromEnv(env),
): string | undefined {
  return resolveNetworkScopedEnvValue(env, "SOLANA_WALLET_SECRET", network)
    ?? resolveNetworkScopedEnvValue(env, "SOLANA_DEVNET_WALLET_SECRET", network);
}

export function getSolanaNetworkLabel(
  network: SolanaNetwork = getSolanaNetworkFromEnv(),
): string {
  return network === SolanaNetwork.MainnetBeta ? "Mainnet" : "Devnet";
}

export function getSolanaBalanceLabel(
  network: SolanaNetwork = getSolanaNetworkFromEnv(),
): string {
  return `${getSolanaNetworkLabel(network)} balance`;
}
