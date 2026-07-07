# Architecture

Goalaxify is an npm workspaces monorepo.

## Layers

1. **vendor/tx-on-chain** — official TxODDS IDL + types (no business logic)
2. **packages/config** — network constants
3. **packages/domain** — pure domain models
4. **packages/txline-sdk** — TxLINE auth, subscribe, API client
5. **apps/web** — UI only (thin), consumes packages
6. **convex/** — app persistence + webhooks (next block)

## SOLID boundaries

- UI never talks to Solana directly
- TxLINE HTTP logic lives only in `@goalaxify/txline-sdk`
- Domain types have zero side effects
- Settlement wrappers will live in `packages/solana-settlement` (next)

## Hackathon foundation

We start from TxODDS assets, not custom oracle contracts:

- Program ID (devnet): `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`
- Free tier subscribe + activate flow from official docs
