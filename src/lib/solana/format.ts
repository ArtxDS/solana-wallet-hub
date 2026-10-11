/** Shorten a Solana address for display. Example: 7XwU...8y2P. */
export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/** Format lamports as SOL with a fixed decimal precision. */
export function formatLamportsToSol(lamports: number, decimals = 4): string {
  const sol = lamports / 1_000_000_000;
  return sol.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/** Parse pt-BR or en-US input into a numeric SOL amount. */
export function parseSolAmount(value: string): number | null {
  const normalizedValue = value
    .trim()
    .replace(/\s*SOL\s*$/i, "")
    .replace(/\s/g, "");

  if (!normalizedValue) return null;

  const normalized = normalizedValue.includes(",")
    ? normalizedValue.replace(/\./g, "").replace(",", ".")
    : normalizedValue;
  const amount = Number(normalized);

  return Number.isFinite(amount) ? amount : null;
}
