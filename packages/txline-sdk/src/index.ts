import { Keypair } from "@solana/web3.js";
import { TxlineNetwork } from "@goalaxify/config";
import nacl from "tweetnacl";
import {
  activateApiToken,
  buildActivationMessage,
} from "./auth/activate-token";
import { startGuestSession } from "./auth/guest-session";
import { TxlineClient } from "./client/txline-client";
import { subscribeToFreeTier } from "./subscription/subscribe";

export interface SetupTxlineAccessInput {
  payer?: Keypair;
  network?: TxlineNetwork;
  serviceLevelId?: number;
}

export interface SetupTxlineAccessResult {
  guestJwt: string;
  apiToken: string;
  txSig: string;
  walletPublicKey: string;
}

export async function setupTxlineAccess(
  input: SetupTxlineAccessInput = {},
): Promise<SetupTxlineAccessResult> {
  const payer = input.payer ?? Keypair.generate();
  const network = input.network ?? TxlineNetwork.Devnet;

  const guestJwt = await startGuestSession(network);
  const { txSig, walletPublicKey } = await subscribeToFreeTier({
    network,
    payer,
    serviceLevelId: input.serviceLevelId,
  });

  const message = buildActivationMessage(txSig, guestJwt, []);
  const signatureBytes = nacl.sign.detached(
    new TextEncoder().encode(message),
    payer.secretKey,
  );
  const walletSignature = Buffer.from(signatureBytes).toString("base64");

  const apiToken = await activateApiToken({
    network,
    guestJwt,
    txSig,
    walletSignature,
  });

  return {
    guestJwt,
    apiToken,
    txSig,
    walletPublicKey,
  };
}

export async function verifyTxlineAccess(
  guestJwt: string,
  apiToken: string,
  network: TxlineNetwork = TxlineNetwork.Devnet,
) {
  const client = new TxlineClient({
    network,
    credentials: { guestJwt, apiToken },
  });

  return client.listFixtures();
}

export {
  activateApiToken,
  buildActivationMessage,
  startGuestSession,
  subscribeToFreeTier,
  TxlineClient,
};
