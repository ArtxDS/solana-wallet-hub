"use client";

import { SOL_MINT_ADDRESS } from "@/lib/consts";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

type JupiterPriceResponse = {
  [mintAddress: string]: {
    usdPrice?: number;
  };
};

const PRICE_ENDPOINT = `https://lite-api.jup.ag/price/v3?ids=${SOL_MINT_ADDRESS}`;

export function useSolPrice() {
  const [priceUsd, setPriceUsd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrice = useCallback(async () => {
    try {
      const response = await axios.get<JupiterPriceResponse>(PRICE_ENDPOINT);
      const nextPrice = response.data[SOL_MINT_ADDRESS]?.usdPrice;

      if (typeof nextPrice !== "number" || !Number.isFinite(nextPrice)) {
        throw new Error("SOL price was not returned");
      }

      setPriceUsd(nextPrice);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPrice();

    const intervalId = window.setInterval(fetchPrice, 60_000);
    return () => window.clearInterval(intervalId);
  }, [fetchPrice]);

  return { priceUsd, isLoading, refetch: fetchPrice };
}
