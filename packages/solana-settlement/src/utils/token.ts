import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import type { SettlementConfig } from "../config";
import { getStakeMint } from "../config";
import type { StakeToken } from "@goalaxify/domain";

export function toBaseUnits(amount: number, token: StakeToken, config: SettlementConfig): bigint {
  if (token === "SOL") {
    return BigInt(Math.round(amount * LAMPORTS_PER_SOL));
  }

  const factor = 10 ** config.usdcDecimals;
  return BigInt(Math.round(amount * factor));
}

export function fromBaseUnits(baseUnits: bigint, token: StakeToken, config: SettlementConfig): number {
  if (token === "SOL") {
    return Number(baseUnits) / LAMPORTS_PER_SOL;
  }

  const factor = 10 ** config.usdcDecimals;
  return Number(baseUnits) / factor;
}

export async function resolveTokenProgramId(
  connection: Connection,
  mint: PublicKey,
): Promise<PublicKey> {
  const account = await connection.getAccountInfo(mint);
  if (!account) {
    return TOKEN_PROGRAM_ID;
  }

  if (account.owner.equals(TOKEN_2022_PROGRAM_ID)) {
    return TOKEN_2022_PROGRAM_ID;
  }

  return TOKEN_PROGRAM_ID;
}

export function getAssociatedTokenAddressForMint(
  mint: PublicKey,
  owner: PublicKey,
  tokenProgramId: PublicKey,
): PublicKey {
  return getAssociatedTokenAddressSync(
    mint,
    owner,
    true,
    tokenProgramId,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
}

export async function ensureAtaInstruction(
  connection: Connection,
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  tokenProgramId: PublicKey,
): Promise<{ ata: PublicKey; instruction: ReturnType<typeof createAssociatedTokenAccountInstruction> | null }> {
  const ata = getAssociatedTokenAddressForMint(mint, owner, tokenProgramId);
  const info = await connection.getAccountInfo(ata);

  if (info) {
    return { ata, instruction: null };
  }

  return {
    ata,
    instruction: createAssociatedTokenAccountInstruction(
      payer,
      ata,
      owner,
      mint,
      tokenProgramId,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
  };
}

export function buildSplTransferInstructions(input: {
  payer: PublicKey;
  source: PublicKey;
  destination: PublicKey;
  mint: PublicKey;
  tokenProgramId: PublicKey;
  amount: bigint;
}): Transaction {
  const transaction = new Transaction().add(
    createTransferInstruction(
      input.source,
      input.destination,
      input.payer,
      input.amount,
      [],
      input.tokenProgramId,
    ),
  );

  return transaction;
}

export function buildNativeTransferTransaction(input: {
  payer: PublicKey;
  recipient: PublicKey;
  lamports: bigint;
}): Transaction {
  return new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: input.payer,
      toPubkey: input.recipient,
      lamports: Number(input.lamports),
    }),
  );
}

export function getMintForToken(config: SettlementConfig, token: StakeToken): PublicKey {
  return getStakeMint(config, token);
}
