import * as anchor from "@coral-xyz/anchor";
import type { AnchorProvider } from "@coral-xyz/anchor";
import type { TxlineNetwork } from "@goalaxify/config";
import { Connection, PublicKey } from "@solana/web3.js";
import txoracleDevnetIdl from "@tx-on-chain/idl/txoracle-devnet.json";
import txoracleMainnetIdl from "@tx-on-chain/idl/txoracle.json";
import type { Txoracle } from "@tx-on-chain/types/txoracle";

import { getSettlementConfig } from "../config";

function getTxoracleIdl(network: TxlineNetwork): Txoracle {
  return (network === "devnet" ? txoracleDevnetIdl : txoracleMainnetIdl) as Txoracle;
}

export function createTxoracleProgram(
  provider: AnchorProvider,
  network?: TxlineNetwork,
) {
  const config = getSettlementConfig(network);
  const idl = getTxoracleIdl(config.network);

  if (idl.address !== config.programId) {
    throw new Error(
      `IDL program ${idl.address} does not match ${config.network} program ${config.programId}`,
    );
  }

  return new anchor.Program<Txoracle>(idl, provider);
}

export function createReadonlyProvider(
  connection: Connection,
  network?: TxlineNetwork,
): AnchorProvider {
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error("Readonly provider cannot sign");
    },
    signAllTransactions: async () => {
      throw new Error("Readonly provider cannot sign");
    },
  };

  return new anchor.AnchorProvider(connection, dummyWallet as unknown as anchor.Wallet, {
    commitment: "confirmed",
  });
}

export function createAnchorProvider(
  connection: Connection,
  wallet: anchor.Wallet,
): AnchorProvider {
  return new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });
}
