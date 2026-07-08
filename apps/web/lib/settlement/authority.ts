import { Keypair } from "@solana/web3.js";
import { resolvePoolAuthoritySecret, type TxlineNetwork } from "@goalaxify/config";

export function loadPoolAuthorityKeypair(network?: TxlineNetwork): Keypair | null {
  const secret = resolvePoolAuthoritySecret(process.env, network);
  if (!secret) {
    return null;
  }

  try {
    const parsed = JSON.parse(secret) as number[];
    if (Array.isArray(parsed)) {
      return Keypair.fromSecretKey(Uint8Array.from(parsed));
    }
  } catch {
    // fall through to base58 handling below
  }

  try {
    const decoded = decodeBase58(secret.trim());
    return Keypair.fromSecretKey(decoded);
  } catch {
    return null;
  }
}

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function decodeBase58(input: string): Uint8Array {
  const bytes: number[] = [0];

  for (const char of input) {
    const value = BASE58_ALPHABET.indexOf(char);
    if (value < 0) {
      throw new Error("Invalid base58 character");
    }

    let carry = value;
    for (let index = 0; index < bytes.length; index += 1) {
      carry += bytes[index] * 58;
      bytes[index] = carry & 0xff;
      carry >>= 8;
    }

    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  for (const char of input) {
    if (char === "1") {
      bytes.push(0);
    } else {
      break;
    }
  }

  return Uint8Array.from(bytes.reverse());
}
