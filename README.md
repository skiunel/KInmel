# Kinmel

E-commerce platform with blockchain-verified product reviews. Each customer review is hashed, pinned to IPFS, and anchored on Polygon Amoy so the record cannot be silently edited or deleted.

Live demo: https://k-inmel.vercel.app
API: https://kinmel-q453.onrender.com

---

## Project layout

```
kinmel/
├── frontend/         Next.js 15 (App Router) — React + Tailwind + React Query
├── backend/          Express + MongoDB (Mongoose) — REST API, JWT auth
├── smart-contracts/  Hardhat + Solidity 0.8.24 — ReviewProof contract
├── shared/           TypeScript types shared between client and server
├── DEPLOY.md         Vercel + Render + MongoDB Atlas deployment guide
└── FINAL_REPORT.md   Final project report
```

## Tech stack

| Layer       | Tech                                                                 |
|-------------|----------------------------------------------------------------------|
| Frontend    | Next.js 15, React 19, Tailwind, React Query, Framer Motion, GSAP     |
| Backend     | Express, Mongoose, Zod validators, JWT (access + refresh), Resend    |
| Database    | MongoDB Atlas                                                        |
| Storage     | Pinata IPFS (CID v1) with multi-gateway fallback                     |
| Blockchain  | Polygon Amoy testnet (chainId 80002), Ethers.js v6                   |
| Payments    | eSewa (UAT sandbox) + Cash on Delivery                               |
| Hosting     | Vercel (frontend), Render (backend), MongoDB Atlas (DB)              |

## How review verification works

1. Customer submits a review for a delivered order.
2. Server canonicalizes the payload (sorted keys) and SHA-256 hashes it → `contentHash`.
3. Document is pinned to IPFS via Pinata → `ipfsHash` (CID).
4. `anchorReview(reviewIdHash, contentHash, ipfsCidHash, productIdHash, orderIdHash, reviewerHash)` is called on `ReviewProof.sol` deployed at `0x707913DE41a28BAfFCc234F07513708604e53Dd4`.
5. `/verify/:reviewId` re-fetches the IPFS doc, re-hashes the on-screen content, and compares against the on-chain proof. Six independent checks render as the trust score.

If the anchor fails (e.g. wallet out of gas), the lazy-retry path in `backend/src/services/review.service.ts` re-attempts it on the next verify page hit — no separate cron.

## Local development

```bash
# Install (workspaces)
npm install

# Run frontend + backend together
npm run dev

# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Seed MongoDB with demo products
cd backend && npm run seed

# Deploy ReviewProof to Amoy
cd smart-contracts
npx hardhat run scripts/deploy.ts --network amoy
```

## Environment

Backend (`backend/.env`):
```
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLIENT_URL=https://k-inmel.vercel.app
PINATA_JWT=...
PINATA_GATEWAY=https://azure-kind-snail-918.mypinata.cloud
BLOCKCHAIN_RPC_URL=https://rpc-amoy.polygon.technology
REVIEW_CONTRACT_ADDRESS=0x707913DE41a28BAfFCc234F07513708604e53Dd4
DEPLOYER_PRIVATE_KEY=0x...
```

Frontend (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

## Key endpoints

| Method | Path                                | Purpose                          |
|--------|-------------------------------------|----------------------------------|
| GET    | `/api/v1/products`                  | List products                    |
| GET    | `/api/v1/products/:slug`            | Product detail                   |
| POST   | `/api/v1/auth/login`                | Email + password login           |
| POST   | `/api/v1/orders`                    | Place order                      |
| POST   | `/api/v1/reviews`                   | Submit review (pin + anchor)     |
| GET    | `/api/v1/reviews/:id/verify`        | Public verification snapshot     |
| GET    | `/api/v1/reviews/blockchain/status` | Live chain config diagnostic     |

## Deployment

See `DEPLOY.md` for the full Vercel + Render + Atlas walkthrough.

## License

MIT.
