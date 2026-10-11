export type SolanaErrorCode =
  | "unknown"
  | "wallet_rejected"
  | "wallet_not_connected"
  | "insufficient_funds"
  | "blockhash_expired"
  | "rate_limited"
  | "network_unavailable"
  | "invalid_account_data"
  | "transaction_failed";

function getRawErrorMessage(error: unknown): string {
  if (!error) return "Unknown error";
  return error instanceof Error ? error.message : String(error);
}

export function getSolanaErrorCode(error: unknown): SolanaErrorCode {
  const message = getRawErrorMessage(error).toLowerCase();

  if (
    message.includes("user rejected the request") ||
    message.includes("transaction was rejected by the wallet")
  ) {
    return "wallet_rejected";
  }

  if (
    message.includes("wallet not connected") ||
    message.includes("wallet is not connected")
  ) {
    return "wallet_not_connected";
  }

  if (
    message.includes("insufficient lamports") ||
    message.includes("insufficient funds")
  ) {
    return "insufficient_funds";
  }

  if (
    message.includes("blockhash not found") ||
    message.includes("transactionexpiredblockheightexceedederror") ||
    message.includes("the blockhash expired")
  ) {
    return "blockhash_expired";
  }

  if (message.includes("too many requests") || message.includes("429")) {
    return "rate_limited";
  }

  if (
    message.includes("network request failed") ||
    message.includes("failed to fetch") ||
    message.includes("network is unavailable")
  ) {
    return "network_unavailable";
  }

  if (message.includes("invalid account data")) {
    return "invalid_account_data";
  }

  return error ? "transaction_failed" : "unknown";
}

export function getSolanaErrorMessage(error: unknown): string {
  const code = getSolanaErrorCode(error);

  switch (code) {
    case "wallet_rejected":
      return "Transaction was rejected by the wallet.";
    case "wallet_not_connected":
      return "Wallet is not connected.";
    case "insufficient_funds":
      return "Insufficient funds for the transaction (including fees).";
    case "blockhash_expired":
      return "The blockhash expired. Please try the transaction again.";
    case "rate_limited":
      return "Request rate limit reached. Please try again later.";
    case "network_unavailable":
      return "The Solana network is unavailable or there is a connection problem.";
    case "invalid_account_data":
      return "Invalid account data. Check that the address is correct.";
    case "unknown":
      return "An unknown error occurred.";
    case "transaction_failed":
      return `Transaction error: ${getRawErrorMessage(error)}`;
  }
}
