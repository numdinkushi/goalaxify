"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { Id } from "@goalaxify/convex/_generated/dataModel";
import * as anchor from "@coral-xyz/anchor";
import { useMutation } from "convex/react";
import type { PredictionDraft } from "@goalaxify/domain";
import {
  createPredictionIntent,
  generateIntentId,
  getSettlementConfig,
  PoolEscrowClient,
  toBaseUnits,
} from "@goalaxify/solana-settlement";

import { api } from "@goalaxify/convex/_generated/api";
import {
  getPoolAuthorityPubkeyForClient,
  isPoolAuthorityConfiguredForClient,
} from "@/lib/settlement/pool-authority-client";
import { useSolanaNetwork } from "@/components/providers/solana-network-provider";
import { fetchWalletBalanceLamports } from "@/lib/solana/fetch-balance";
import { appToast } from "@/lib/toast";
import {
  isBlockhashFresh,
  promptWalletTransaction,
  type PreparedBlockhash,
} from "@/lib/wallet/send-transaction";
import {
  parseStakeTransactionError,
  resolveAffordableStakeSol,
} from "@/lib/wallet/stake-balance";

type PreparedBlockhashRef = PreparedBlockhash | null;

export function usePredictionStake() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const createPrediction = useMutation(api.predictions.create);
  const [isStaking, setIsStaking] = useState(false);
  const [isBlockhashReady, setIsBlockhashReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preparedBlockhashRef = useRef<PreparedBlockhashRef>(null);

  const { network: solanaNetwork, settlementNetwork: network } =
    useSolanaNetwork();
  const settlementConfig = useMemo(
    () => getSettlementConfig(network),
    [network],
  );

  const anchorWallet = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return null;
    }

    return {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction.bind(wallet),
      signAllTransactions: wallet.signAllTransactions?.bind(wallet),
    } as anchor.Wallet;
  }, [wallet]);

  const prepareStakeBlockhash = useCallback(async () => {
    setIsBlockhashReady(false);
    try {
      const latest = await connection.getLatestBlockhash("confirmed");
      preparedBlockhashRef.current = {
        latest,
        fetchedAt: Date.now(),
      };
      setIsBlockhashReady(true);
    } catch {
      preparedBlockhashRef.current = null;
      setIsBlockhashReady(false);
    }
  }, [connection]);

  const submitStake = useCallback(
    async (
      draft: PredictionDraft,
      options?: { supersedesPredictionId?: Id<"predictions"> },
    ) => {
      if (!wallet.publicKey) {
        throw new Error("Connect your wallet before staking");
      }

      if (draft.kickoffAt) {
        const kickoffMs = Date.parse(draft.kickoffAt);
        if (Number.isFinite(kickoffMs) && kickoffMs <= Date.now()) {
          throw new Error("Betting is closed — this match has already kicked off");
        }
      }

      if (!wallet.sendTransaction) {
        throw new Error(
          "Your wallet cannot send transactions. Reconnect Phantom and try again.",
        );
      }

      setIsStaking(true);
      setError(null);

      try {
        const stakeToken = draft.stakeToken ?? "SOL";
        const walletPubkey = wallet.publicKey.toBase58();
        let intentTxSig: string | undefined;
        let intentId: string | undefined;
        let termsHash: string | undefined;
        let stakeMethod: "txoracle_intent" | "native_pool" = "native_pool";
        let stakeBaseUnits = toBaseUnits(
          draft.stake,
          stakeToken,
          settlementConfig,
        ).toString();

        let finalStakeAmount = draft.stake;

        if (stakeToken === "USDC") {
          if (!anchorWallet) {
            throw new Error("Connect your wallet before staking");
          }

          const intentSeed = generateIntentId(
            `${walletPubkey}-${draft.fixtureId}-${Date.now()}`,
          );
          const result = await createPredictionIntent(
            connection,
            anchorWallet,
            {
              draft: { ...draft, stakeToken },
              maker: wallet.publicKey,
              intentId: intentSeed,
            },
            network,
          );

          intentTxSig = result.txSig;
          intentId = result.intentId;
          termsHash = result.termsHash;
          stakeMethod = result.stakeMethod;
          stakeBaseUnits = result.depositBaseUnits.toString();
          finalStakeAmount = draft.stake;
        } else {
          const poolAuthority = getPoolAuthorityPubkeyForClient(network);
          if (!poolAuthority) {
            throw new Error(
              `SOL pool escrow is not configured for ${network}. Configure the pool authority in your env file.`,
            );
          }

          const balanceLamports = await fetchWalletBalanceLamports(
            walletPubkey,
            solanaNetwork,
          );
          const { stakeSol } = resolveAffordableStakeSol(
            draft.stake,
            balanceLamports,
          );
          const solDraft = { ...draft, stake: stakeSol, stakeToken: "SOL" as const };

          if (!isBlockhashFresh(preparedBlockhashRef.current)) {
            const latest = await connection.getLatestBlockhash("confirmed");
            preparedBlockhashRef.current = {
              latest,
              fetchedAt: Date.now(),
            };
          }

          const prepared = preparedBlockhashRef.current;
          if (!prepared) {
            throw new Error(
              "Transaction preparation failed. Wait a moment, then try again.",
            );
          }

          const poolClient = new PoolEscrowClient(connection, network);
          const sendTransaction = wallet.sendTransaction.bind(wallet);

          const result = await poolClient.stakeNativeSol(
            {
              draft: solDraft,
              payer: wallet.publicKey,
              poolAuthority,
            },
            {
              latestBlockhash: prepared.latest,
              sendTransaction: (transaction) =>
                promptWalletTransaction(
                  (tx) => sendTransaction(tx, connection),
                  transaction,
                ),
            },
          );

          preparedBlockhashRef.current = null;
          intentTxSig = result.txSig;
          stakeMethod = result.stakeMethod;
          stakeBaseUnits = result.depositBaseUnits.toString();
          finalStakeAmount = solDraft.stake;
        }

        await createPrediction({
          walletPubkey,
          fixtureId: draft.fixtureId,
          homeTeam: draft.homeTeam ?? "",
          awayTeam: draft.awayTeam ?? "",
          kickoffAt: draft.kickoffAt,
          round: draft.round,
          market: draft.market,
          selection: draft.selection,
          stakeToken,
          stakeAmount: finalStakeAmount,
          stakeBaseUnits,
          stakeMethod,
          intentId,
          intentTxSig,
          termsHash,
          estimatedReturn: draft.estimatedReturn,
          vapiCallId: draft.vapiCallId,
          supersedesPredictionId: options?.supersedesPredictionId,
        });

        appToast.genericSuccess("Prediction staked on-chain");
        return intentTxSig;
      } catch (cause) {
        const message = parseStakeTransactionError(cause, {
          intendedStakeSol: draft.stake,
        });
        setError(message);
        appToast.genericError(message);
        throw new Error(message);
      } finally {
        setIsStaking(false);
      }
    },
    [
      anchorWallet,
      connection,
      createPrediction,
      network,
      settlementConfig,
      solanaNetwork,
      wallet,
    ],
  );

  return {
    submitStake,
    prepareStakeBlockhash,
    isBlockhashReady,
    isStaking,
    error,
    canStakeSol: isPoolAuthorityConfiguredForClient(network),
    canStakeUsdc: true,
  };
}
