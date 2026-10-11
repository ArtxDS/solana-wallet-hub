import { describe, expect, it } from "vitest";
import { getSolanaErrorMessage } from "../errors";
import { getSolanaErrorUserMessage } from "../errorMessages";

describe("Solana error handling", () => {
  it("returns an English message for a wallet rejection", () => {
    const error = new Error("User rejected the request.");
    expect(getSolanaErrorMessage(error)).toBe(
      "Transaction was rejected by the wallet.",
    );
  });

  it("returns an English message for insufficient funds", () => {
    const error = new Error(
      "Transaction simulation failed: Error processing Instruction 0: custom program error: 0x1, insufficient lamports",
    );
    expect(getSolanaErrorMessage(error)).toBe(
      "Insufficient funds for the transaction (including fees).",
    );
  });

  it("returns an English message for rate limiting", () => {
    const error = new Error("429 Too Many Requests");
    expect(getSolanaErrorMessage(error)).toBe(
      "Request rate limit reached. Please try again later.",
    );
  });

  it("returns a default English message for unknown errors", () => {
    const error = new Error("Something went wrong");
    expect(getSolanaErrorMessage(error)).toBe(
      "Transaction error: Something went wrong",
    );
  });

  it("returns a Portuguese message for UI display", () => {
    const error = new Error("User rejected the request.");
    expect(getSolanaErrorUserMessage(error)).toBe(
      "Transação recusada pela carteira.",
    );
  });
});
