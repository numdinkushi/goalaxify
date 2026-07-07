import {
  Connection,
  PublicKey,
  Transaction,
  type BlockhashWithExpiryBlockHeight,
} from "@solana/web3.js";

export async function prepareTransactionForSigning(
  connection: Connection,
  transaction: Transaction,
  feePayer: PublicKey,
): Promise<BlockhashWithExpiryBlockHeight> {
  const latest = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = latest.blockhash;
  transaction.feePayer = feePayer;
  return latest;
}

export async function confirmSignedTransaction(
  connection: Connection,
  signature: string,
  latest: BlockhashWithExpiryBlockHeight,
): Promise<void> {
  await connection.confirmTransaction(
    {
      signature,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight,
    },
    "confirmed",
  );
}
