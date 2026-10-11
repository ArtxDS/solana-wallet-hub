import { describe, expect, it } from "vitest";
import { isDifferentAddress, isValidSolanaAddress } from "../validation";

describe("Validation utilities", () => {
  describe("isValidSolanaAddress", () => {
    it("returns true for a valid address", () => {
      expect(isValidSolanaAddress("11111111111111111111111111111111")).toBe(
        true,
      );
    });

    it("returns false for an invalid address", () => {
      expect(isValidSolanaAddress("not-an-address")).toBe(false);
      expect(isValidSolanaAddress("")).toBe(false);
    });
  });

  describe("isDifferentAddress", () => {
    it("returns true when the addresses differ", () => {
      expect(isDifferentAddress("A", "B")).toBe(true);
    });

    it("returns false when the addresses are equal", () => {
      expect(isDifferentAddress("A", "A")).toBe(false);
    });
  });
});
