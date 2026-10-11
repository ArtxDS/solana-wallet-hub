import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSolanaBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const requestIdRef = useRef(0);

  const fetchBalance = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!publicKey) {
      setBalance(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const lamports = await connection.getBalance(publicKey, "confirmed");

      if (requestId !== requestIdRef.current) return;

      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);

      if (requestId !== requestIdRef.current) return;

      setBalance(null);
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBalance(null);
    fetchBalance();

    if (!publicKey) return;

    const subscriptionId = connection.onAccountChange(
      publicKey,
      (accountInfo) => {
        setBalance(accountInfo.lamports / LAMPORTS_PER_SOL);
      },
      { commitment: "confirmed" },
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [fetchBalance, connection, publicKey]);

  return { balance, isLoading, refetch: fetchBalance };
}
