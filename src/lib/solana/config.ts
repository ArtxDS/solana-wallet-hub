import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export type SolanaNetwork =
  | WalletAdapterNetwork.Devnet
  | WalletAdapterNetwork.Mainnet;

export const DEFAULT_SOLANA_NETWORK: SolanaNetwork =
  process.env.NEXT_PUBLIC_NETWORK === WalletAdapterNetwork.Mainnet
    ? WalletAdapterNetwork.Mainnet
    : WalletAdapterNetwork.Devnet;

export const NETWORK_STORAGE_KEY = "solana-wallet-hub:network";

export const NETWORK_LABELS: Record<SolanaNetwork, string> = {
  [WalletAdapterNetwork.Devnet]: "Devnet",
  [WalletAdapterNetwork.Mainnet]: "Mainnet",
};

export function isSolanaNetwork(value: string | null): value is SolanaNetwork {
  return (
    value === WalletAdapterNetwork.Devnet ||
    value === WalletAdapterNetwork.Mainnet
  );
}

export function getSolanaRpcUrl(network: SolanaNetwork) {
  const configuredRpc =
    network === WalletAdapterNetwork.Mainnet
      ? process.env.NEXT_PUBLIC_RPC_URL
      : process.env.NEXT_PUBLIC_DEVNET_RPC_URL;

  return configuredRpc || "http://127.0.0.1:8899";
}

export function getExplorerUrl(
  type: "address" | "tx",
  value: string,
  network: SolanaNetwork,
) {
  const clusterQuery =
    network === WalletAdapterNetwork.Mainnet ? "" : `?cluster=${network}`;

  return `https://explorer.solana.com/${type}/${value}${clusterQuery}`;
}

export function getExplorerHomeUrl(network: SolanaNetwork) {
  return network === WalletAdapterNetwork.Mainnet
    ? "https://explorer.solana.com/"
    : `https://explorer.solana.com/?cluster=${network}`;
}
