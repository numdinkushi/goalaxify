#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Keypair } from "@solana/web3.js";
import {
  getNetworkScopedEnvKey,
  getTxlineNetworkFromEnv,
  resolveTxlineWalletSecret,
  TxlineNetwork,
  type TxlineNetwork as TxlineNetworkType,
} from "@goalaxify/config";
import { setupTxlineAccess, verifyTxlineAccess } from "../src/index";

const ROOT_ENV = resolve(process.cwd(), "../../.env");
const WEB_ENV = resolve(process.cwd(), "../../apps/web/.env.local");

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;

  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!key || process.env[key]) continue;
    process.env[key] = rest.join("=");
  }
}

function upsertEnvFile(path: string, updates: Record<string, string>) {
  const lines = existsSync(path)
    ? readFileSync(path, "utf8").split("\n")
    : [];

  for (const [key, value] of Object.entries(updates)) {
    const index = lines.findIndex((line) => line.startsWith(`${key}=`));
    const nextLine = `${key}=${value}`;

    if (index >= 0) {
      lines[index] = nextLine;
    } else {
      lines.push(nextLine);
    }
  }

  writeFileSync(path, `${lines.filter((line, index, all) => {
    const isTrailingBlank =
      index === all.length - 1 && line.trim() === "";
    return !isTrailingBlank;
  }).join("\n")}\n`);
}

function loadPayerKeypair(): Keypair | undefined {
  const secret = resolveTxlineWalletSecret();
  if (!secret) return undefined;

  const bytes = Uint8Array.from(JSON.parse(secret) as number[]);
  return Keypair.fromSecretKey(bytes);
}

function getNetworkLabel(network: TxlineNetworkType): string {
  return network === TxlineNetwork.Mainnet ? "mainnet" : "devnet";
}

async function main() {
  loadEnvFile(ROOT_ENV);
  loadEnvFile(WEB_ENV);

  const network = getTxlineNetworkFromEnv();
  const networkLabel = getNetworkLabel(network);
  let payer = loadPayerKeypair();
  let generatedSecret: string | null = null;

  if (!payer) {
    payer = Keypair.generate();
    generatedSecret = JSON.stringify(Array.from(payer.secretKey));
    console.log(
      `No wallet secret found for ${networkLabel} — generated a ${networkLabel} wallet.`,
    );
    console.log(`Fund this address with ${networkLabel} SOL: ${payer.publicKey.toBase58()}`);
    if (network === TxlineNetwork.Devnet) {
      console.log("https://faucet.solana.com/\n");
    } else {
      console.log();
    }

    const walletEnvUpdates: Record<string, string> = {
      [getNetworkScopedEnvKey("SOLANA_WALLET_SECRET", network)]: generatedSecret,
    };
    upsertEnvFile(ROOT_ENV, walletEnvUpdates);
    upsertEnvFile(WEB_ENV, walletEnvUpdates);
    console.log(`Saved ${getNetworkScopedEnvKey("SOLANA_WALLET_SECRET", network)} to env files.\n`);
  }

  console.log(`Setting up TxLINE World Cup free tier on ${networkLabel}...`);
  const access = await setupTxlineAccess({
    payer,
    network,
    serviceLevelId: 1,
  });

  const envUpdates: Record<string, string> = {
    [getNetworkScopedEnvKey("TXLINE_GUEST_JWT", network)]: access.guestJwt,
    [getNetworkScopedEnvKey("TXLINE_API_TOKEN", network)]: access.apiToken,
    [getNetworkScopedEnvKey("TXLINE_SUBSCRIPTION_TX_SIG", network)]: access.txSig,
    TXLINE_GUEST_JWT: access.guestJwt,
    TXLINE_API_TOKEN: access.apiToken,
    TXLINE_SUBSCRIPTION_TX_SIG: access.txSig,
    NEXT_PUBLIC_DATA_SOURCE: "txline",
  };

  if (generatedSecret) {
    envUpdates[getNetworkScopedEnvKey("SOLANA_WALLET_SECRET", network)] =
      generatedSecret;
    if (network === TxlineNetwork.Devnet) {
      envUpdates.SOLANA_DEVNET_WALLET_SECRET = generatedSecret;
    }
  }

  upsertEnvFile(ROOT_ENV, envUpdates);
  upsertEnvFile(WEB_ENV, envUpdates);

  console.log("\nTxLINE access ready:");
  console.log(`  wallet: ${access.walletPublicKey}`);
  console.log(`  txSig:  ${access.txSig}`);
  console.log(`  apiToken: ${access.apiToken.slice(0, 12)}...`);
  console.log("\nWrote credentials to:");
  console.log(`  ${ROOT_ENV}`);
  console.log(`  ${WEB_ENV}`);

  console.log("\nVerifying fixtures endpoint...");
  const fixtures = await verifyTxlineAccess(
    access.guestJwt,
    access.apiToken,
    network,
  );

  const fixtureList = Array.isArray(fixtures) ? fixtures : [];
  const fixtureCount = fixtureList.length;
  console.log(`Retrieved ${fixtureCount} fixtures from TxLINE.`);

  if (fixtureCount > 0) {
    console.log("Sample fixture:");
    console.log(JSON.stringify(fixtureList[0], null, 2).slice(0, 800));
  }

  console.log(`\nRestart the dev server after switching to ${networkLabel}: npm run dev`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
