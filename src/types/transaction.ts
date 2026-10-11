export type TransactionStatus = "confirmed" | "pending" | "failed";
export type TransactionType = "sent" | "received";

export type TransactionRecord = {
  id: string;
  type: TransactionType;
  value: string;
  counterparty: string;
  date: string;
  status: TransactionStatus;
  signature: string;
  explorerUrl: string;
};
