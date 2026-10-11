import { PublicKey } from "@solana/web3.js";

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function isDifferentAddress(
  sourceAddress: string,
  destinationAddress: string,
): boolean {
  return sourceAddress !== destinationAddress;
}
