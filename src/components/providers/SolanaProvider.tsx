"use client";

import {
  DEFAULT_SOLANA_NETWORK,
  getSolanaRpcUrl,
  isSolanaNetwork,
  NETWORK_LABELS,
  NETWORK_STORAGE_KEY,
  type SolanaNetwork,
} from "@/lib/solana/config";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SolanaNetworkContextValue = {
  network: SolanaNetwork;
  networkLabel: string;
  isMainnet: boolean;
  setNetwork: (network: SolanaNetwork) => void;
};

const SolanaNetworkContext = createContext<SolanaNetworkContextValue | null>(
  null,
);

export function useSolanaNetwork() {
  const context = useContext(SolanaNetworkContext);

  if (!context) {
    throw new Error("useSolanaNetwork must be used inside SolanaProvider");
  }

  return context;
}

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const wallets = useMemo(() => [], []);
  const [network, setNetworkState] = useState<SolanaNetwork>(
    DEFAULT_SOLANA_NETWORK,
  );

  useEffect(() => {
    const storedNetwork = window.localStorage.getItem(NETWORK_STORAGE_KEY);

    if (isSolanaNetwork(storedNetwork)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNetworkState(storedNetwork);
    }
  }, []);

  const setNetwork = useCallback((nextNetwork: SolanaNetwork) => {
    setNetworkState(nextNetwork);
    window.localStorage.setItem(NETWORK_STORAGE_KEY, nextNetwork);
  }, []);

  const networkContextValue = useMemo(
    () => ({
      network,
      networkLabel: NETWORK_LABELS[network],
      isMainnet: network === "mainnet-beta",
      setNetwork,
    }),
    [network, setNetwork],
  );
  const endpoint = useMemo(() => getSolanaRpcUrl(network), [network]);

  return (
    <SolanaNetworkContext.Provider value={networkContextValue}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          {children}
        </WalletProvider>
      </ConnectionProvider>
    </SolanaNetworkContext.Provider>
  );
}
