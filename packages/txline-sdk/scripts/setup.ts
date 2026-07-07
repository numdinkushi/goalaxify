#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { Keypair } from "@solana/web3.js";
import {
  setupTxlineAccess,
  verifyTxlineAccess,
} from "../src/index";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), "../../.env");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!key || process.env[key]) continue;
    process.env[key] = rest.join("=");
  }
}

function loadPayerKeypair(): Keypair | undefined {
  const secret = process.env.SOLANA_DEVNET_WALLET_SECRET;
  if (!secret) return undefined;

  const bytes = Uint8Array.from(JSON.parse(secret) as number[]);
  return Keypair.fromSecretKey(bytes);
}

async function main() {
  loadEnvFile();

  const payer = loadPayerKeypair();
  if (!payer) {
    console.log("No SOLANA_DEVNET_WALLET_SECRET found — generating ephemeral wallet.");
    console.log("Fund this wallet with devnet SOL before subscribing on-chain.");
  }

  console.log("Setting up TxLINE World Cup free tier on devnet...");
  const access = await setupTxlineAccess({
    payer,
    network: "devnet",
    serviceLevelId: 1,
  });

  console.log("\nTxLINE access ready:");
  console.log(`  wallet: ${access.walletPublicKey}`);
  console.log(`  txSig:  ${access.txSig}`);
  console.log(`  apiToken: ${access.apiToken.slice(0, 12)}...`);

  console.log("\nVerifying fixtures endpoint...");
  const fixtures = await verifyTxlineAccess(
    access.guestJwt,
    access.apiToken,
    "devnet",
  );

  console.log("Fixtures response sample:");
  console.log(JSON.stringify(fixtures, null, 2).slice(0, 1200));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
