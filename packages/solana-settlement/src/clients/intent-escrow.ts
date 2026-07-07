import * as anchor from "@coral-xyz/anchor";
import type { AnchorProvider } from "@coral-xyz/anchor";
import type { TxlineNetwork } from "@goalaxify/config";
import type { StakeToken } from "@goalaxify/domain";
import { Connection, PublicKey } from "@solana/web3.js";

import { getSettlementConfig } from "../config";
import { deriveIntentAccounts } from "../pda/derive-intent-accounts";
import { buildTermsHash } from "../terms/build-terms-hash";
import type { CreateIntentInput, CreateIntentResult } from "../types";
import {
  ensureAtaInstruction,
  getMintForToken,
  resolveTokenProgramId,
  toBaseUnits,
} from "../utils/token";
import { createTxoracleProgram } from "./txoracle-program";

export class IntentEscrowClient {
  constructor(
    private readonly connection: Connection,
    private readonly provider: AnchorProvider,
    private readonly network?: TxlineNetwork,
  ) {}

  static fromWallet(
    connection: Connection,
    wallet: anchor.Wallet,
    network?: TxlineNetwork,
  ) {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    return new IntentEscrowClient(connection, provider, network);
  }

  async createIntent(input: CreateIntentInput): Promise<CreateIntentResult> {
    const config = getSettlementConfig(this.network);
    const token: StakeToken = input.draft.stakeToken ?? "USDC";
    if (token === "SOL") {
      throw new Error("SOL stakes use the native pool escrow path");
    }

    const program = createTxoracleProgram(this.provider, config.network);
    const programId = new PublicKey(config.programId);
    const maker = input.maker;
    const depositBaseUnits = toBaseUnits(
      input.draft.stake,
      token,
      config,
    );

    const { hashBytes, hashHex } = await buildTermsHash(input.draft);
    const accounts = deriveIntentAccounts(programId, maker, input.intentId);

    const mint = getMintForToken(config, token);
    const tokenProgramId = await resolveTokenProgramId(this.connection, mint);

    const makerTokenAccount = (
      await ensureAtaInstruction(
        this.connection,
        maker,
        maker,
        mint,
        tokenProgramId,
      )
    ).ata;

    const expirationTs = BigInt(
      input.expirationTs ?? Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14,
    );
    const claimPeriodDays = input.claimPeriodDays ?? config.defaultClaimPeriodDays;

    // Devnet IDL includes create_intent; generated Txoracle types may lag upstream.
    const methods = program.methods as unknown as Record<
      string,
      (...args: unknown[]) => {
        accounts: (value: Record<string, unknown>) => { rpc: () => Promise<string> };
      }
    >;

    const txSig = await methods
      .createIntent(
        new anchor.BN(input.intentId.toString()),
        hashBytes,
        new anchor.BN(depositBaseUnits.toString()),
        new anchor.BN(expirationTs.toString()),
        claimPeriodDays,
        new anchor.BN(input.draft.fixtureId),
      )
      .accounts({
        maker,
        orderIntent: accounts.orderIntent,
        intentVault: accounts.intentVault,
        makerTokenAccount,
        tokenMint: mint,
        tokenTreasuryPda: accounts.tokenTreasuryPda,
        tokenProgram: tokenProgramId,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    return {
      txSig,
      intentId: input.intentId.toString(),
      termsHash: hashHex,
      orderIntent: accounts.orderIntent,
      intentVault: accounts.intentVault,
      depositBaseUnits,
      stakeMethod: "txoracle_intent",
    };
  }
}

export async function createPredictionIntent(
  connection: Connection,
  wallet: anchor.Wallet,
  input: CreateIntentInput,
  network?: TxlineNetwork,
): Promise<CreateIntentResult> {
  const client = IntentEscrowClient.fromWallet(connection, wallet, network);
  return client.createIntent(input);
}
