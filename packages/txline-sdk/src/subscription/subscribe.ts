import * as anchor from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { getTxlineNetworkConfig, type TxlineNetwork } from "@goalaxify/config";
import txoracleDevnetIdl from "@tx-on-chain/idl/txoracle-devnet.json";
import txoracleMainnetIdl from "@tx-on-chain/idl/txoracle.json";
import type { Txoracle } from "@tx-on-chain/types/txoracle";

function getTxoracleIdl(network: TxlineNetwork): Txoracle {
  const idl =
    network === "devnet" ? txoracleDevnetIdl : txoracleMainnetIdl;
  return idl as Txoracle;
}

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

async function ensureUserTokenAccount(
  connection: Connection,
  payer: Keypair,
  tokenMint: PublicKey,
): Promise<PublicKey> {
  const userTokenAccount = getAssociatedTokenAddressSync(
    tokenMint,
    payer.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const accountInfo = await connection.getAccountInfo(userTokenAccount);
  if (accountInfo) {
    return userTokenAccount;
  }

  const transaction = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      payer.publicKey,
      userTokenAccount,
      payer.publicKey,
      tokenMint,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
  );

  await sendAndConfirmTransaction(connection, transaction, [payer], {
    commitment: "confirmed",
  });

  return userTokenAccount;
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
  const idl = getTxoracleIdl(network);

  if (idl.address !== config.programId) {
    throw new Error(
      `Loaded IDL program ${idl.address} does not match ${network} program ${config.programId}`,
    );
  }

  const program = new anchor.Program<Txoracle>(idl, provider);

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

  const userTokenAccount = await ensureUserTokenAccount(
    connection,
    input.payer,
    txlTokenMint,
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
