import * as anchor from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { getTxlineNetworkConfig, type TxlineNetwork } from "@goalaxify/config";
import txoracleIdl from "@tx-on-chain/idl/txoracle.json";
import type { Txoracle } from "@tx-on-chain/types/txoracle";

export interface SubscribeInput {
  network?: TxlineNetwork;
  payer: Keypair;
  serviceLevelId?: number;
  durationWeeks?: number;
}

export interface SubscribeResult {
  txSig: string;
  walletPublicKey: string;
}

export async function subscribeToFreeTier(
  input: SubscribeInput,
): Promise<SubscribeResult> {
  const network = input.network ?? "devnet";
  const config = getTxlineNetworkConfig(network);
  const serviceLevelId = input.serviceLevelId ?? 1;
  const durationWeeks = input.durationWeeks ?? 4;

  const connection = new Connection(config.rpcUrl, "confirmed");
  const wallet = new anchor.Wallet(input.payer);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const programId = new PublicKey(config.programId);
  const program = new anchor.Program<Txoracle>(
    txoracleIdl as Txoracle,
    provider,
  );

  if (!program.programId.equals(programId)) {
    throw new Error("Loaded IDL program does not match configured network");
  }

  const txlTokenMint = new PublicKey(config.txlTokenMint);

  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_treasury_v2")],
    program.programId,
  );

  const tokenTreasuryVault = getAssociatedTokenAddressSync(
    txlTokenMint,
    tokenTreasuryPda,
    true,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const [pricingMatrixPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("pricing_matrix")],
    program.programId,
  );

  const userTokenAccount = getAssociatedTokenAddressSync(
    txlTokenMint,
    provider.wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const txSig = await program.methods
    .subscribe(serviceLevelId, durationWeeks)
    .accounts({
      user: provider.wallet.publicKey,
      pricingMatrix: pricingMatrixPda,
      tokenMint: txlTokenMint,
      userTokenAccount,
      tokenTreasuryVault,
      tokenTreasuryPda,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return {
    txSig,
    walletPublicKey: provider.wallet.publicKey.toBase58(),
  };
}
