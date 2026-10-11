# Solana Wallet Hub

Web application to connect a Solana wallet, track balance and transaction history, and switch between Devnet and Mainnet. Portfolio project.

## Features

- Solana wallet connection
  SOL transfers between wallets
- SOL balance for the connected wallet
- Transaction history
- Network switching between Devnet and Mainnet
- Built-in Devnet SOL faucet (`POST /api/faucet`), with a 24h cooldown per address, a limit of 3 requests per hour per IP, and 0.08 SOL sent per request

## Stack

- Next.js (App Router) and TypeScript
- Solana Web3.js
- Helius (RPC)
- Upstash Redis and Upstash Ratelimit
- Vitest with jsdom and @vitejs/plugin-react (unit tests)

## Setup

Copy `.env.example` to `.env.local`, fill in the variables, then run `npm install` and `npm run dev`.
