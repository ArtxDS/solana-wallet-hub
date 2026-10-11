import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { ParsedTransactionWithMeta } from "@solana/web3.js";
import { useCallback, useEffect, useRef, useState } from "react";

export interface HistoryItem {
  signature: string;
  blockTime: number | null;
  status: string;
  details: ParsedTransactionWithMeta;
}

export function useTransactionHistory() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  const fetchHistory = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!publicKey) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const signatures = await connection.getSignaturesForAddress(publicKey, {
        limit: 10,
      });

      if (requestId !== requestIdRef.current) return;

      if (signatures.length === 0) {
        setHistory([]);
        return;
      }

      const transactions = await connection.getParsedTransactions(
        signatures.map((s) => s.signature),
        { maxSupportedTransactionVersion: 0 },
      );

      const formattedHistory: HistoryItem[] = signatures
        .map((sigInfo, index) => {
          const tx = transactions[index];
          return {
            signature: sigInfo.signature,
            blockTime: sigInfo.blockTime ?? null,
            status: sigInfo.err ? "failed" : "success",
            details: tx as ParsedTransactionWithMeta,
          };
        })
        .filter((h) => h.details !== null);

      if (requestId !== requestIdRef.current) return;

      setHistory(formattedHistory);
    } catch {
      if (requestId !== requestIdRef.current) return;
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory([]);
    fetchHistory();
  }, [fetchHistory]);

  return { history, isLoading, refetch: fetchHistory };
}
