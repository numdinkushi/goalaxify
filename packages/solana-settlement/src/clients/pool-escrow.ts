import type { StakeToken } from "@goalaxify/domain";
import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  type Connection,
} from "@solana/web3.js";

import { getSettlementConfig } from "../config";
import type { NativePoolStakeInput, NativePoolStakeResult, PayoutInput, PayoutResult } from "../types";
import {
  buildNativeTransferTransaction,
  buildSplTransferInstructions,
  ensureAtaInstruction,
  getMintForToken,
  resolveTokenProgramId,
  toBaseUnits,
} from "../utils/token";
import {
  confirmSignedTransaction,
  prepareTransactionForSigning,
} from "../utils/transaction";
import type { BlockhashWithExpiryBlockHeight, Transaction } from "@solana/web3.js";

/** Lamports the pool authority keeps aside to pay Solana fees on outbound refunds/payouts. */
const POOL_PAYOUT_FEE_BUFFER_LAMPORTS = BigInt(10_000);

export type SendTransactionFn = (transaction: Transaction) => Promise<string>;

export type StakeNativeSolOptions = {
  sendTransaction: SendTransactionFn;
  latestBlockhash?: BlockhashWithExpiryBlockHeight;
};

export class PoolEscrowClient {
  constructor(
    private readonly connection: Connection,
    private readonly network?: Parameters<typeof getSettlementConfig>[0],
  ) {}

  async stakeNativeSol(
    input: NativePoolStakeInput,
    options: StakeNativeSolOptions,
  ): Promise<NativePoolStakeResult> {
    const config = getSettlementConfig(this.network);
    const depositBaseUnits = toBaseUnits(input.draft.stake, "SOL", config);

    const transaction = buildNativeTransferTransaction({
      payer: input.payer,
      recipient: input.poolAuthority,
      lamports: depositBaseUnits,
    });

    const latest =
      options.latestBlockhash ??
      (await prepareTransactionForSigning(
        this.connection,
        transaction,
        input.payer,
      ));

    if (options.latestBlockhash) {
      transaction.recentBlockhash = latest.blockhash;
      transaction.feePayer = input.payer;
    }

    const txSig = await options.sendTransaction(transaction);
    await confirmSignedTransaction(this.connection, txSig, latest);

    return {
      txSig,
      depositBaseUnits,
      stakeMethod: "native_pool",
    };
  }

  async payoutFromAuthority(
    authority: Keypair,
    input: PayoutInput,
  ): Promise<PayoutResult> {
    const config = getSettlementConfig(this.network);

    if (input.stakeToken === "SOL") {
      const balance = BigInt(
        await this.connection.getBalance(authority.publicKey),
      );
      const requested = input.amountBaseUnits;

      if (balance <= POOL_PAYOUT_FEE_BUFFER_LAMPORTS) {
        throw new Error(
          "Settlement pool cannot cover this refund — pool authority needs SOL for network fees.",
        );
      }

      let payoutLamports = requested;
      const requiredLamports = requested + POOL_PAYOUT_FEE_BUFFER_LAMPORTS;
      if (balance < requiredLamports) {
        payoutLamports = balance - POOL_PAYOUT_FEE_BUFFER_LAMPORTS;
      }

      if (payoutLamports <= BigInt(0)) {
        throw new Error(
          "Settlement pool cannot cover this refund — pool authority needs SOL for network fees.",
        );
      }

      const transaction = buildNativeTransferTransaction({
        payer: authority.publicKey,
        recipient: input.recipient,
        lamports: payoutLamports,
      });

      await prepareTransactionForSigning(
        this.connection,
        transaction,
        authority.publicKey,
      );

      const txSig = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [authority],
        { commitment: "confirmed" },
      );

      return { txSig, paidBaseUnits: payoutLamports };
    }

    const mint = getMintForToken(config, input.stakeToken);
    const tokenProgramId = await resolveTokenProgramId(this.connection, mint);

    const source = (
      await ensureAtaInstruction(
        this.connection,
        authority.publicKey,
        authority.publicKey,
        mint,
        tokenProgramId,
      )
    ).ata;

    const destination = (
      await ensureAtaInstruction(
        this.connection,
        authority.publicKey,
        input.recipient,
        mint,
        tokenProgramId,
      )
    );

    const transaction = buildSplTransferInstructions({
      payer: authority.publicKey,
      source,
      destination: destination.ata,
      mint,
      tokenProgramId,
      amount: input.amountBaseUnits,
    });

    if (destination.instruction) {
      transaction.instructions.unshift(destination.instruction);
    }

    const txSig = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [authority],
      { commitment: "confirmed" },
    );

    return { txSig, paidBaseUnits: input.amountBaseUnits };
  }
}

export function getPoolAuthorityPubkey(network?: Parameters<typeof getSettlementConfig>[0]): PublicKey | null {
  return getSettlementConfig(network).poolAuthority;
}
