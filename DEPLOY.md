# Kinmel Deployment — Vercel + Render + MongoDB Atlas

Free tier across all three. Total cost: $0.

## Order of operations
1. MongoDB Atlas (DB)
2. Polygon Amoy (chain + contract)
3. Render (backend Express)
4. Vercel (frontend Next.js)
5. CORS handshake

---

## 1. MongoDB Atlas

1. Sign up: https://cloud.mongodb.com
2. Build a Database → **M0 Free** → Provider: AWS → nearest region
3. **Database Access** → Add user → username `kinmel`, generate strong password → save it
4. **Network Access** → Add IP → `0.0.0.0/0` (allow all — Render IPs are dynamic)
5. Cluster → **Connect** → Drivers → copy connection string. Looks like:
   ```
   mongodb+srv://kinmel:<password>@cluster0.xxxxx.mongodb.net/kinmel?retryWrites=true&w=majority
   ```
6. Replace `<password>` with real password and append `/kinmel` as db name.
7. Save this string — used in step 3.

## 2. Polygon Amoy contract

Need: MetaMask wallet, some test MATIC.

1. Get free Amoy MATIC: https://faucet.polygon.technology (select Amoy)
2. Export wallet private key from MetaMask (Account → Account details → Show private key) — **never share, never commit**
3. Deploy:
   ```bash
   cd smart-contracts
   echo 'POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology' > .env
   echo 'DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY' >> .env
   npx hardhat run scripts/deploy.ts --network amoy
   ```
4. Copy printed `ReviewProof deployed to: 0x...` — save it.

## 3. Render — backend

1. Push repo to GitHub (if not already).
2. https://render.com → New + → **Web Service** → connect GitHub repo
3. Settings:
   - **Name**: `kinmel-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. **Environment** → add all of these:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<atlas string from step 1>
   JWT_ACCESS_SECRET=<openssl rand -hex 32>
   JWT_REFRESH_SECRET=<openssl rand -hex 32>
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d
   CLIENT_URL=https://kinmel.vercel.app
   GOOGLE_CLIENT_ID=<keep current or blank>
   GOOGLE_CLIENT_SECRET=<keep current or blank>
   PINATA_API_KEY=<keep current>
   PINATA_SECRET_KEY=<keep current>
   PINATA_GATEWAY=<keep current>
   BLOCKCHAIN_RPC_URL=https://rpc-amoy.polygon.technology
   REVIEW_CONTRACT_ADDRESS=<from step 2>
   DEPLOYER_PRIVATE_KEY=<same wallet pk from step 2>
   ```
5. Deploy. Wait ~5 min. URL will be `https://kinmel-api.onrender.com`.
6. Test: `curl https://kinmel-api.onrender.com/api/v1/products?limit=1` → should return JSON.
7. **Seed prod DB once**: Render → Shell tab → `npm run seed`.

Note: Free tier sleeps after 15min idle. First hit takes ~30s cold start. Acceptable for demo.

## 4. Vercel — frontend

1. https://vercel.com → Add New → Project → import same GitHub repo
2. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto)
   - **Build Command**: `npm run build`
   - **Output Directory**: leave default
3. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://kinmel-api.onrender.com/api/v1
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=<keep blank or paste>
   ```
4. Deploy. URL: `https://kinmel.vercel.app` (or whatever Vercel assigns).
5. Test: open URL → products should load.

## 5. CORS handshake

Once Vercel gives you the real URL, go back to Render → Environment → update:
```
CLIENT_URL=https://<your-actual-vercel-url>.vercel.app
```
Save → Render auto-redeploys.

## 6. Custom domain (optional)

If you want `kinmel.infinityfree.me` pointing at the Vercel site:
- InfinityFree dashboard does NOT allow CNAME for free subdomains. You can't repoint it to Vercel.
- Either buy a real domain (~$10/yr, Namecheap) and add CNAME → Vercel, OR just use the Vercel-provided URL.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Render shows 502 | Check Render logs. Usually `MONGODB_URI` wrong or `PORT` not 10000. |
| Frontend says "Connection error" | Hit `https://<render-url>/api/v1/products` directly. If fails, backend issue. If works, CORS — fix `CLIENT_URL` env. |
| Blockchain review fails | Check `BLOCKCHAIN_RPC_URL` reachable + contract deployed on Amoy + deployer wallet has MATIC. |
| Cold start slow | Render free sleeps. Use Render paid ($7/mo) OR set up an external pinger (cron-job.org hitting `/api/v1/health` every 10 min). |

## Quick commands

```bash
# Generate JWT secrets
openssl rand -hex 32
openssl rand -hex 32

# Test backend after deploy
curl https://kinmel-api.onrender.com/api/v1/health
curl https://kinmel-api.onrender.com/api/v1/products?limit=1

# Local: redeploy contract to Amoy
cd smart-contracts
npx hardhat run scripts/deploy.ts --network amoy
```
