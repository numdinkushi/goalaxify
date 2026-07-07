export {
  getSettlementConfig,
  getStakeMint,
  resolveSettlementNetwork,
  type SettlementConfig,
} from "./config";

export { IntentEscrowClient, createPredictionIntent } from "./clients/intent-escrow";
export { PoolEscrowClient, getPoolAuthorityPubkey } from "./clients/pool-escrow";
export {
  createAnchorProvider,
  createReadonlyProvider,
  createTxoracleProgram,
} from "./clients/txoracle-program";

export { buildMarketIntentPayload } from "./terms/build-market-intent";
export { buildTermsHash } from "./terms/build-terms-hash";

export {
  deriveIntentAccounts,
  deriveIntentVaultPda,
  deriveOrderIntentPda,
  deriveTokenTreasuryPda,
} from "./pda/derive-intent-accounts";

export {
  ensureAtaInstruction,
  fromBaseUnits,
  getAssociatedTokenAddressForMint,
  getMintForToken,
  resolveTokenProgramId,
  toBaseUnits,
} from "./utils/token";

export type {
  CreateIntentInput,
  CreateIntentResult,
  IntentAccounts,
  NativePoolStakeInput,
  NativePoolStakeResult,
  PayoutInput,
  PayoutResult,
} from "./types";

export { generateIntentId } from "./utils/intent-id";
