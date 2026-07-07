import type { PredictionDraft, StakeMethod, StakeToken } from "@goalaxify/domain";
import type { PublicKey, TransactionSignature } from "@solana/web3.js";

export interface CreateIntentInput {
  draft: PredictionDraft;
  maker: PublicKey;
  intentId: bigint;
  expirationTs?: number;
  claimPeriodDays?: number;
}

export interface CreateIntentResult {
  txSig: TransactionSignature;
  intentId: string;
  termsHash: string;
  orderIntent: PublicKey;
  intentVault: PublicKey;
  depositBaseUnits: bigint;
  stakeMethod: StakeMethod;
}

export interface NativePoolStakeInput {
  draft: PredictionDraft;
  payer: PublicKey;
  poolAuthority: PublicKey;
}

export interface NativePoolStakeResult {
  txSig: TransactionSignature;
  depositBaseUnits: bigint;
  stakeMethod: StakeMethod;
}

export interface PayoutInput {
  recipient: PublicKey;
  amountBaseUnits: bigint;
  stakeToken: StakeToken;
  memo?: string;
}

export interface PayoutResult {
  txSig: TransactionSignature;
}

export interface IntentAccounts {
  orderIntent: PublicKey;
  intentVault: PublicKey;
  tokenTreasuryPda: PublicKey;
}
