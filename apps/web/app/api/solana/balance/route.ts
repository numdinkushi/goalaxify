import { Connection, PublicKey } from "@solana/web3.js";
import { isSolanaNetwork, SolanaNetwork } from "@goalaxify/config";
import { NextResponse } from "next/server";

import { getSolanaRpcEndpointForNetwork } from "@/lib/solana/network-utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pubkey = searchParams.get("pubkey");
  const networkParam = searchParams.get("network");

  if (!pubkey) {
    return NextResponse.json(
      { ok: false, error: "pubkey is required" },
      { status: 400 },
    );
  }

  if (!networkParam || !isSolanaNetwork(networkParam)) {
    return NextResponse.json(
      { ok: false, error: "network must be devnet or mainnet-beta" },
      { status: 400 },
    );
  }

  let publicKey: PublicKey;
  try {
    publicKey = new PublicKey(pubkey);
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid pubkey" },
      { status: 400 },
    );
  }

  try {
    const rpcEndpoint = getSolanaRpcEndpointForNetwork(
      networkParam as SolanaNetwork,
    );
    const connection = new Connection(rpcEndpoint, "confirmed");
    const lamports = await connection.getBalance(publicKey);

    return NextResponse.json({ ok: true, lamports });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to load balance" },
      { status: 502 },
    );
  }
}
