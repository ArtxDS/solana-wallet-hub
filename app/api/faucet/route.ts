import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import bs58 from "bs58";
import { NextResponse } from "next/server";

const COOLDOWN_SECONDS = 8 * 60 * 60;
const IP_RATE_LIMIT_WINDOW = "1 h";
const MAX_DESTINATION_BALANCE_LAMPORTS = 0.5 * LAMPORTS_PER_SOL;
const FAUCET_RESERVE_LAMPORTS = 0.05 * LAMPORTS_PER_SOL;

type FaucetConfig = {
  rpcUrl: string;
  secretKey: string;
  redisUrl: string;
  redisToken: string;
  amountSol: number;
  amountLamports: number;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function getFaucetConfig(): FaucetConfig {
  const rpcUrl = process.env.NEXT_PUBLIC_DEVNET_RPC_URL;
  const secretKey = process.env.FAUCET_SECRET_KEY;
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const amountSol = Number(process.env.FAUCET_AMOUNT_SOL ?? "0.08");
  const amountLamports = Math.round(amountSol * LAMPORTS_PER_SOL);

  if (
    !rpcUrl ||
    !secretKey ||
    !redisUrl ||
    !redisToken ||
    !Number.isFinite(amountSol) ||
    amountSol <= 0 ||
    amountLamports <= 0
  ) {
    throw new Error("Faucet configuration is incomplete.");
  }

  return {
    rpcUrl,
    secretKey,
    redisUrl,
    redisToken,
    amountSol,
    amountLamports,
  };
}

function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return (
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function parseRecipient(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    return new PublicKey(value.trim());
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let config: FaucetConfig;

  try {
    config = getFaucetConfig();
  } catch {
    return jsonError("Faucet indisponível no momento.", 500);
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Informe um endereço Solana válido.", 400);
  }

  const recipient = parseRecipient(
    typeof body === "object" && body !== null
      ? (body as { address?: unknown }).address
      : undefined,
  );

  if (!recipient) {
    return jsonError("Informe um endereço Solana válido.", 400);
  }

  let faucetKeypair: Keypair;
  let secret: Uint8Array;

  try {
    const raw = process.env.FAUCET_SECRET_KEY?.trim().replace(
      /^["']|["']$/g,
      "",
    );

    if (!raw) {
      throw new Error("FAUCET_SECRET_KEY is not defined.");
    }

    secret = bs58.decode(raw);

    faucetKeypair = Keypair.fromSecretKey(secret);
  } catch {
    return jsonError("Faucet indisponível no momento.", 500);
  }

  const redis = new Redis({
    url: config.redisUrl,
    token: config.redisToken,
  });
  const ipRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, IP_RATE_LIMIT_WINDOW),
    prefix: "solana-faucet:ip",
  });
  const cooldownKey = `solana-faucet:cooldown:${recipient.toBase58()}`;
  let cooldownReserved = false;

  const releaseCooldown = async () => {
    if (!cooldownReserved) return;

    cooldownReserved = false;
    await redis.del(cooldownKey);
  };

  try {
    const cooldownResult = await redis.set(
      cooldownKey,
      new Date().toISOString(),
      { ex: COOLDOWN_SECONDS, nx: true },
    );

    if (cooldownResult !== "OK") {
      return jsonError(
        "Você já solicitou SOL recentemente. Tente novamente em 8 horas.",
        429,
      );
    }

    cooldownReserved = true;

    const ipResult = await ipRateLimit.limit(getRequestIp(request));

    if (!ipResult.success) {
      await releaseCooldown();
      return jsonError("Muitas solicitações. Tente novamente mais tarde.", 429);
    }

    const connection = new Connection(config.rpcUrl, "confirmed");
    const recipientBalance = await connection.getBalance(
      recipient,
      "confirmed",
    );

    if (recipientBalance >= MAX_DESTINATION_BALANCE_LAMPORTS) {
      await releaseCooldown();
      return jsonError(
        "Esta carteira já possui saldo suficiente para o faucet.",
        400,
      );
    }

    const faucetBalance = await connection.getBalance(
      faucetKeypair.publicKey,
      "confirmed",
    );

    if (faucetBalance < config.amountLamports + FAUCET_RESERVE_LAMPORTS) {
      await releaseCooldown();
      return jsonError("Faucet sem fundos no momento.", 503);
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: faucetKeypair.publicKey,
        toPubkey: recipient,
        lamports: config.amountLamports,
      }),
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [faucetKeypair],
      { commitment: "confirmed" },
    );

    cooldownReserved = false;

    return NextResponse.json(
      { signature, amount: config.amountSol },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    try {
      await releaseCooldown();
    } catch {}

    return jsonError("Não foi possível enviar SOL agora.", 500);
  }
}
