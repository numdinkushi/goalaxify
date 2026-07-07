const U64_MODULUS = BigInt("18446744073709551616");

/** Deterministic-enough intent id for on-chain create_intent (u64). */
export function generateIntentId(seed?: string): bigint {
  const basis = seed ?? `${Date.now()}-${Math.random()}`;
  let hash = BigInt(0);

  for (let index = 0; index < basis.length; index += 1) {
    hash =
      (hash * BigInt(131) + BigInt(basis.charCodeAt(index))) % U64_MODULUS;
  }

  if (hash === BigInt(0)) {
    return BigInt(1);
  }

  return hash;
}
