# Goalaxify

Voice-native World Cup prediction booth built on TxLINE, Solana, Convex, and Vapi.

## Stack

- **apps/web** — Next.js + shadcn UI
- **packages/txline-sdk** — TxODDS TxLINE integration (official IDL + flows)
- **packages/config** — shared network constants
- **packages/domain** — pure business types
- **vendor/tx-on-chain** — vendored assets from [txodds/tx-on-chain](https://github.com/txodds/tx-on-chain)

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

## TxLINE setup (Block 1)

1. Create/fund a devnet wallet
2. Put the secret key array in `.env` as `SOLANA_DEVNET_WALLET_SECRET`
3. Run:

```bash
npm run txline:setup
```

This will:

- start a guest JWT session
- subscribe to free World Cup tier on devnet
- activate your API token
- fetch fixtures to verify access

## Workspaces

```bash
npm run dev          # start apps/web
npm run typecheck    # typecheck all packages
npm run txline:setup # TxLINE foundation check
```

## Deployment

- **Vercel** → `apps/web`
- **Convex Cloud** → `/convex` (next block)
- **Solana** → devnet `txoracle` program (TxODDS official)
