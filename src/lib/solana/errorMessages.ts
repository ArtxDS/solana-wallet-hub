import {
  getSolanaErrorCode,
  type SolanaErrorCode,
} from "@/lib/solana/errors";

const userMessages: Partial<Record<SolanaErrorCode, string>> = {
  wallet_rejected: "Transação recusada pela carteira.",
  wallet_not_connected: "Carteira não conectada.",
  insufficient_funds: "Saldo insuficiente para a transação (incluindo taxas).",
  blockhash_expired: "O blockhash expirou. Tente a transação novamente.",
  rate_limited: "Limite de requisições atingido. Tente novamente mais tarde.",
  network_unavailable:
    "A rede Solana está indisponível ou há um problema de conexão.",
  invalid_account_data:
    "Dados de conta inválidos. Verifique se o endereço está correto.",
  unknown: "Ocorreu um erro desconhecido.",
  transaction_failed: "Ocorreu um erro na transação. Tente novamente.",
};

export function getSolanaErrorUserMessage(error: unknown): string {
  const code = getSolanaErrorCode(error);
  return userMessages[code] ?? userMessages.transaction_failed!;
}
