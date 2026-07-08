import { Keypair } from "@solana/web3.js";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  getNetworkScopedEnvKey,
  getTxlineNetworkFromEnv,
  TxlineNetwork,
} from "@goalaxify/config";

const root = resolve(import.meta.dirname, "..");
const envLocalPath = resolve(root, "apps/web/.env.local");
const network = getTxlineNetworkFromEnv();
const networkLabel = network === TxlineNetwork.Mainnet ? "mainnet" : "devnet";

const keypair = Keypair.generate();
const pubkey = keypair.publicKey.toBase58();
const secretJson = JSON.stringify(Array.from(keypair.secretKey));

console.log(`\nGoalaxify pool authority (${networkLabel})\n`);
console.log(`Public key:  ${pubkey}`);
console.log(`Secret JSON: ${secretJson.slice(0, 40)}…\n`);

const lines = [
  "",
  `# Pool authority — collects SOL stakes and pays winners (${networkLabel})`,
  `${getNetworkScopedEnvKey("NEXT_PUBLIC_POOL_AUTHORITY_PUBKEY", network)}=${pubkey}`,
  `${getNetworkScopedEnvKey("POOL_AUTHORITY_PUBKEY", network)}=${pubkey}`,
  `${getNetworkScopedEnvKey("POOL_AUTHORITY_SECRET", network)}=${secretJson}`,
  "",
];

if (existsSync(envLocalPath)) {
  const existing = readFileSync(envLocalPath, "utf8");
  if (existing.includes(getNetworkScopedEnvKey("NEXT_PUBLIC_POOL_AUTHORITY_PUBKEY", network))) {
    console.log(
      `apps/web/.env.local already has ${networkLabel} pool authority vars — update manually if needed.`,
    );
  } else {
    writeFileSync(envLocalPath, existing.trimEnd() + lines.join("\n") + "\n");
    console.log("Appended pool authority vars to apps/web/.env.local");
  }
} else {
  writeFileSync(envLocalPath, lines.join("\n"));
  console.log("Created apps/web/.env.local with pool authority vars");
}

console.log("\nNext steps:");
console.log("1. Restart `npm run dev`");
if (network === TxlineNetwork.Devnet) {
  console.log("2. Airdrop devnet SOL to the pool wallet:");
  console.log(`   solana airdrop 2 ${pubkey} --url devnet`);
} else {
  console.log("2. Fund the wallet with mainnet SOL before using payouts.");
}
console.log("3. Fund it before paying winners — it receives SOL stakes and pays claims.\n");
