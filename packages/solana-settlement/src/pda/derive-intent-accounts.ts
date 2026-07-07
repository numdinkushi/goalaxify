import { PublicKey } from "@solana/web3.js";

import type { IntentAccounts } from "../types";

function u64ToLeBuffer(value: bigint): Buffer {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(value);
  return buffer;
}

export function deriveOrderIntentPda(
  programId: PublicKey,
  maker: PublicKey,
  intentId: bigint,
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("order_intent"), maker.toBuffer(), u64ToLeBuffer(intentId)],
    programId,
  );
  return pda;
}

export function deriveIntentVaultPda(
  programId: PublicKey,
  orderIntent: PublicKey,
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("intent_vault"), orderIntent.toBuffer()],
    programId,
  );
  return pda;
}

export function deriveTokenTreasuryPda(programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_treasury_v2")],
    programId,
  );
  return pda;
}

export function deriveIntentAccounts(
  programId: PublicKey,
  maker: PublicKey,
  intentId: bigint,
): IntentAccounts {
  const orderIntent = deriveOrderIntentPda(programId, maker, intentId);
  const intentVault = deriveIntentVaultPda(programId, orderIntent);
  const tokenTreasuryPda = deriveTokenTreasuryPda(programId);

  return { orderIntent, intentVault, tokenTreasuryPda };
}
