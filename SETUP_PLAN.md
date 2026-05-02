# Kinmel — Project Setup Plan

> Step-by-step setup instructions. Execute in exact order.
> Based on detected environment: Node v22.22.0, npm 9.2.0, MongoDB 7.0.14

---

## 1. Monorepo vs Split Repo

### Decision: Monorepo with npm Workspaces

```
Kinmel/                  ← Single git repo
├── client/              ← Next.js frontend      (workspace)
├── server/              ← Express backend        (workspace)
├── blockchain/          ← Hardhat + Solidity     (workspace)
└── shared/              ← Shared TypeScript types (workspace)
```

**Why monorepo**:
- Single `git clone` to get everything
- Shared types between frontend and backend without publishing to npm
- One PR = full feature (backend + frontend + contract)
- `npm run dev` starts everything
- Final-year project assessor clones one repo and runs one command

**Why npm workspaces** (not Turborepo/Nx/pnpm):
- Zero additional tooling — npm 9+ has native workspace support
- No learning curve for the assessor
- Good enough for 4 packages — Turborepo adds value at 10+
- `npm install` at root installs all workspace dependencies

**Why NOT split repos**:
- More repos to manage, clone, keep in sync
- Shared types require publishing or git submodules
- Harder to demo — assessor has to set up 3 repos

---

## 2. Folder Creation Order

Execute these steps in sequence. Each step builds on the previous.

### Step 1: Root Setup (ALREADY DONE ✅)

```
Already exists:
  ✅ package.json (root, workspaces configured)
  ✅ .gitignore
  ✅ shared/types/index.ts
  ✅ shared/package.json
  ✅ server/package.json
  ✅ server/tsconfig.json
  ✅ server/.env.example
  ✅ blockchain/package.json
  ✅ blockchain/hardhat.config.ts
```

### Step 2: Root Config Files (NEW)

```
CREATE:
  .nvmrc                          ← Pin Node version
  .editorconfig                   ← Editor consistency
  .prettierrc                     ← Formatting rules
  .prettierignore                 ← Formatting exclusions
  .eslintrc.json                  ← Root lint config (overridden per workspace)
```

### Step 3: Server Directory Structure (NEW)

```
CREATE directories:
  server/src/config/
  server/src/controllers/
  server/src/middleware/
  server/src/models/
  server/src/routes/
  server/src/services/
  server/src/utils/
  server/src/types/
  server/src/validators/
  server/scripts/

CREATE files:
  server/src/index.ts             ← Entry point
  server/src/app.ts               ← Express app setup
  server/src/config/env.ts        ← Zod env validation
  server/src/config/database.ts   ← MongoDB connection
  server/src/config/constants.ts  ← App constants
  server/src/middleware/error-handler.ts
  server/src/middleware/not-found.ts
  server/src/middleware/auth.ts
  server/src/middleware/validate.ts
  server/src/utils/api-error.ts
  server/src/utils/async-handler.ts
  server/src/utils/logger.ts
  server/src/utils/helpers.ts
  server/src/types/express.d.ts
  server/src/routes/index.ts
  server/.eslintrc.json           ← Server-specific lint
  server/.env                     ← Local env (NOT committed)
```

### Step 4: Client Setup (Next.js)

```
RUN:
  npx create-next-app@latest client --typescript --tailwind --eslint --app --src-dir --no-import-alias

THEN CREATE:
  client/components/ui/            ← shadcn primitives
  client/components/layout/
  client/components/shared/
  client/components/product/
  client/components/cart/
  client/components/checkout/
  client/components/order/
  client/components/review/
  client/components/admin/
  client/components/home/
  client/lib/api.ts
  client/lib/utils.ts
  client/lib/constants.ts
  client/lib/validators.ts
  client/hooks/
  client/stores/
  client/providers/
  client/types/
  client/.env.local                ← NEXT_PUBLIC_API_URL
```

### Step 5: Blockchain Setup

```
Already exists:
  ✅ blockchain/package.json
  ✅ blockchain/hardhat.config.ts

CREATE:
  blockchain/contracts/ReviewVerification.sol
  blockchain/scripts/deploy.ts
  blockchain/test/ReviewVerification.test.ts
```

---

## 3. Package Choices (With Justifications)

### Root Workspace

| Package | Version | Why |
|---------|---------|-----|
| `concurrently` | ^9.1.2 | Run server + client in one terminal |
| `typescript` | ^5.7.3 | Shared TS version across workspaces |
| `prettier` | ^3.5.3 | Code formatting |
| `eslint` | ^9.x | Already installed by Next.js, shared config |

### Server (`server/`)

**Dependencies** (runtime):

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.21.2 | HTTP framework |
| `mongoose` | ^8.10.1 | MongoDB ODM |
| `bcryptjs` | ^2.4.3 | Password hashing (pure JS, no native compilation) |
| `jsonwebtoken` | ^9.0.2 | JWT sign/verify |
| `cookie-parser` | ^1.4.7 | Parse cookies (refresh tokens) |
| `cors` | ^2.8.5 | Cross-origin requests |
| `helmet` | ^8.0.0 | Security headers |
| `morgan` | ^1.10.0 | HTTP request logging |
| `express-rate-limit` | ^7.5.0 | Rate limiting |
| `zod` | ^3.24.2 | Runtime validation |
| `dotenv` | ^16.4.7 | Load .env files |
| `ethers` | ^6.13.5 | Blockchain interaction |
| `axios` | ^1.7.9 | HTTP client for Pinata API |

**DevDependencies**:

| Package | Version | Purpose |
|---------|---------|---------|
| `tsx` | ^4.19.3 | Run TypeScript directly (dev mode) |
| `typescript` | ^5.7.3 | Compiler |
| `@types/express` | ^5.0.0 | Express types |
| `@types/bcryptjs` | ^2.4.6 | bcrypt types |
| `@types/jsonwebtoken` | ^9.0.7 | JWT types |
| `@types/cookie-parser` | ^1.4.8 | Cookie parser types |
| `@types/cors` | ^2.8.17 | CORS types |
| `@types/morgan` | ^1.9.9 | Morgan types |
| `@types/node` | ^22.13.5 | Node.js types |
| `jest` | ^29.7.0 | Test runner |
| `ts-jest` | ^29.2.5 | Jest + TypeScript |
| `@types/jest` | ^29.5.14 | Jest types |
| `supertest` | ^7.0.0 | HTTP integration testing |
| `@types/supertest` | ^6.0.2 | Supertest types |
| `eslint` | ^9.x | Linting |
| `@typescript-eslint/parser` | ^8.x | TS lint parser |
| `@typescript-eslint/eslint-plugin` | ^8.x | TS lint rules |

### Client (`client/`)

**Dependencies** (runtime):

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | ^15.x | React framework (installed by create-next-app) |
| `react` | ^19.x | UI library |
| `react-dom` | ^19.x | React DOM |
| `tailwindcss` | ^4.x | Utility CSS (installed by create-next-app) |
| `framer-motion` | ^12.x | Animations |
| `axios` | ^1.7.9 | HTTP client |
| `zustand` | ^5.0.3 | Client state management |
| `@tanstack/react-query` | ^5.67.2 | Server state management |
| `react-hook-form` | ^7.54.2 | Form management |
| `@hookform/resolvers` | ^4.1.3 | Zod integration for forms |
| `zod` | ^3.24.2 | Validation (same as server) |
| `lucide-react` | ^0.474.0 | Icons (included with shadcn) |
| `recharts` | ^2.15.1 | Admin dashboard charts |
| `date-fns` | ^4.1.0 | Date formatting |

**DevDependencies** (mostly via create-next-app):

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.7.3 | |
| `@types/react` | ^19.x | |
| `@types/node` | ^22.x | |
| `eslint-config-next` | ^15.x | Next.js ESLint config |

### Blockchain (`blockchain/`)

| Package | Version | Purpose |
|---------|---------|---------|
| `hardhat` | ^2.22.18 | Ethereum dev environment |
| `@nomicfoundation/hardhat-toolbox` | ^5.0.0 | Compile, test, deploy, verify |

**Note**: hardhat-toolbox includes: ethers, chai, mocha, solidity-coverage, typechain, hardhat-ethers.

### Shared (`shared/`)

No dependencies — just TypeScript type definitions exported as source.

---

## 4. Environment Variables

### `server/.env` (Create from .env.example)

```bash
# ──── Server ────
NODE_ENV=development
PORT=5000

# ──── MongoDB ────
MONGODB_URI=mongodb://localhost:27017/kinmel

# ──── JWT ────
# Generate secrets: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=<generate-64-byte-hex>
JWT_REFRESH_SECRET=<generate-64-byte-hex-DIFFERENT>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ──── CORS ────
CLIENT_URL=http://localhost:3000

# ──── IPFS (Pinata) — Optional until Module 8 ────
PINATA_API_KEY=
PINATA_SECRET_KEY=
PINATA_GATEWAY=gateway.pinata.cloud

# ──── Blockchain — Optional until Module 8 ────
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
REVIEW_CONTRACT_ADDRESS=
DEPLOYER_PRIVATE_KEY=
```

### `client/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Secret Generation Command

```bash
# Run twice — once for each secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 5. Scripts

### Root `package.json` Scripts

```json
{
  "scripts": {
    "dev": "concurrently -n server,client -c blue,green \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "npm run dev --workspace=server",
    "dev:client": "npm run dev --workspace=client",
    "dev:chain": "npm run node --workspace=blockchain",
    "build": "npm run build --workspace=server && npm run build --workspace=client",
    "build:server": "npm run build --workspace=server",
    "build:client": "npm run build --workspace=client",
    "lint": "npm run lint --workspaces --if-present",
    "format": "prettier --write \"**/*.{ts,tsx,json,md,css}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md,css}\"",
    "test": "npm run test --workspaces --if-present",
    "test:server": "npm run test --workspace=server",
    "test:chain": "npm run test --workspace=blockchain",
    "deploy:chain": "npm run deploy:local --workspace=blockchain",
    "seed": "npm run seed --workspace=server",
    "clean": "rm -rf node_modules server/node_modules client/node_modules blockchain/node_modules server/dist client/.next"
  }
}
```

### Server `package.json` Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src/ --ext .ts",
    "test": "jest --runInBand --forceExit",
    "test:watch": "jest --watch --runInBand",
    "test:coverage": "jest --coverage --runInBand --forceExit",
    "seed": "tsx scripts/seed.ts",
    "typecheck": "tsc --noEmit"
  }
}
```

### Client `package.json` Scripts (generated by create-next-app, extended)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

### Blockchain `package.json` Scripts

```json
{
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy:local": "hardhat run scripts/deploy.ts --network localhost",
    "node": "hardhat node",
    "clean": "hardhat clean"
  }
}
```

---

## 6. Linting

### Strategy: ESLint per workspace with shared principles

Each workspace has its own lint config because:
- Server uses Node/Express patterns (no React rules)
- Client uses Next.js ESLint plugin (React + import rules)
- Blockchain uses Hardhat's config (Solidity + Mocha globals)

### Root `.eslintrc.json`

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/consistent-type-imports": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  },
  "ignorePatterns": ["dist/", ".next/", "node_modules/", "coverage/", "artifacts/", "cache/", "typechain-types/"]
}
```

### Server `server/.eslintrc.json`

```json
{
  "extends": ["../.eslintrc.json"],
  "env": {
    "node": true,
    "es2022": true
  },
  "rules": {
    "no-console": "off"
  }
}
```

**Why `no-console: off` for server**: Server uses console for logging. morgan and our logger both output to console. Disabling this rule prevents false warnings.

### Client

Uses `eslint-config-next` (auto-configured by create-next-app). No custom config needed beyond what Next.js provides.

---

## 7. Formatting

### Prettier Config `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": []
}
```

### `.prettierignore`

```
node_modules/
dist/
.next/
out/
coverage/
blockchain/artifacts/
blockchain/cache/
blockchain/typechain-types/
*.sol
package-lock.json
```

**Why ignore `.sol`**: Solidity has its own formatting conventions. Prettier's Solidity plugin exists but adds complexity we don't need.

### Editor Config `.editorconfig`

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[*.sol]
indent_size = 4
```

---

## 8. TypeScript Configuration

### Root Principle: No root tsconfig. Each workspace owns its config.

**Why no root tsconfig**:
- Server targets CommonJS (Node.js)
- Client targets ESNext (Next.js bundler)
- Blockchain uses Hardhat's TS resolution
- A shared root config would need so many overrides it's useless

### Server `server/tsconfig.json` (EXISTS — needs updates)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@shared/*": ["../shared/*"]
    },
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Changes from current**:
- Added `"types": ["node", "jest"]` for test support
- Added `"**/*.test.ts"` to exclude (tests compiled separately by ts-jest)

### Client `client/tsconfig.json` (Generated by create-next-app, then tweaked)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Blockchain `blockchain/tsconfig.json` (Create new)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "sourceMap": true
  },
  "include": ["./scripts", "./test", "./hardhat.config.ts"],
  "exclude": ["node_modules", "artifacts", "cache"]
}
```

---

## 9. Path Aliases

### Server Aliases

```
@/*         → server/src/*           import { env } from '@/config/env'
@shared/*   → shared/*              import type { IUser } from '@shared/types'
```

**Runtime resolution**: `tsx` handles path aliases natively in dev mode. For production (`node dist/`), we use `tsc-alias` or `module-alias` as a postbuild step.

Add to server `package.json`:
```json
{
  "dependencies": {
    "module-alias": "^2.2.3"
  },
  "_moduleAliases": {
    "@": "dist",
    "@shared": "../shared"
  }
}
```

And at the top of `server/src/index.ts`:
```typescript
import 'module-alias/register';
```

**Note**: Only needed for `npm run start` (production). `tsx` handles aliases in dev.

### Client Aliases

```
@/*         → client/src/*          import { Button } from '@/components/ui/button'
@shared/*   → shared/*             import type { IProduct } from '@shared/types'
```

**Runtime resolution**: Next.js reads `paths` from `tsconfig.json` natively. No extra plugin needed.

### Blockchain

No aliases needed — flat structure, few files.

---

## 10. Docker Recommendation

### Decision: No Docker for v1

**Why not**:
- Adds deployment complexity to a local-only project
- MongoDB runs locally fine (already installed)
- Hardhat is local-only by design
- Assessor would need Docker Desktop installed
- One more thing to debug during demo

**What to do instead**:
- MongoDB runs as a system service (`mongod`)
- Server runs via `tsx` (dev) or `node` (prod)
- Client runs via `next dev`
- Blockchain runs via `hardhat node`
- All orchestrated by root `npm run dev`

### If Docker is needed later (post-assessment)

```yaml
# docker-compose.yml (NOT BUILT NOW — reference only)
services:
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo-data:/data/db]

  server:
    build: ./server
    ports: ["5000:5000"]
    depends_on: [mongodb]
    env_file: ./server/.env

  client:
    build: ./client
    ports: ["3000:3000"]
    depends_on: [server]

volumes:
  mongo-data:
```

---

## 11. Local Development Workflow

### First-Time Setup (Clone to Running)

```bash
# Step 1: Clone
git clone <repo-url> Kinmel
cd Kinmel

# Step 2: Install ALL dependencies (root + all workspaces)
npm install

# Step 3: Create server env file
cp server/.env.example server/.env
# Edit server/.env — add JWT secrets:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Paste output into JWT_ACCESS_SECRET
# Run again, paste into JWT_REFRESH_SECRET

# Step 4: Create client env file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1" > client/.env.local

# Step 5: Ensure MongoDB is running
sudo systemctl start mongod
# Verify: mongod --eval "db.runCommand({ connectionStatus: 1 })"

# Step 6: Seed database (after Module 5 when seed script exists)
npm run seed

# Step 7: Start development
npm run dev
# This runs server (port 5000) + client (port 3000) concurrently
```

### Daily Development

```bash
# Terminal 1: Start everything
npm run dev

# Terminal 2 (when working on blockchain — Module 8+):
npm run dev:chain            # Starts Hardhat node on port 8545
npm run deploy:chain         # Deploy contracts to local node

# Run server tests
npm run test:server

# Type check without building
npm run typecheck --workspace=server
npm run typecheck --workspace=client

# Format code
npm run format

# Lint
npm run lint
```

### Terminal Layout During Development

```
┌──────────────────────────────────┬──────────────────────────────────┐
│                                  │                                  │
│  Terminal 1                      │  Terminal 2                      │
│  npm run dev                     │  Code editor                     │
│                                  │                                  │
│  Shows:                          │                                  │
│  [server] Listening on :5000     │                                  │
│  [server] MongoDB connected      │                                  │
│  [client] Ready on :3000         │                                  │
│                                  │                                  │
├──────────────────────────────────┤                                  │
│                                  │                                  │
│  Terminal 3 (Module 8+)          │                                  │
│  npm run dev:chain               │                                  │
│                                  │                                  │
│  Shows:                          │                                  │
│  Hardhat node on :8545           │                                  │
│  Account #0: 0x...               │                                  │
│                                  │                                  │
└──────────────────────────────────┴──────────────────────────────────┘
```

### Port Assignments

```
3000    Next.js client (frontend)
5000    Express server (backend API)
8545    Hardhat node (local blockchain)
27017   MongoDB (database)
```

### Git Workflow

```
Branch naming:
  main                          ← Always working, demo-ready
  module/2-backend-foundation   ← Feature branch per module
  module/3-authentication
  module/4-frontend-foundation
  ...

Commit style:
  feat: add user authentication with JWT
  fix: resolve cart total calculation bug
  refactor: extract validation middleware
  docs: update API contract with new endpoints
  test: add auth service unit tests
  chore: update dependencies

Merge strategy:
  Develop on module branch → merge to main when module is complete
  Each module is a self-contained increment
```

---

## 12. Install Commands (Exact Sequence)

### Phase 1: Root + Server (Module 2)

```bash
cd "/home/samir/Documents/Block chain/Kinmel"

# Root dev dependencies
npm install -D prettier

# Server dependencies (some already in package.json)
cd server
npm install ethers@^6.13.5 axios@^1.7.9 module-alias@^2.2.3
npm install -D jest@^29.7.0 ts-jest@^29.2.5 @types/jest@^29.5.14 supertest@^7.0.0 @types/supertest@^6.0.2 @typescript-eslint/parser@^8.0.0 @typescript-eslint/eslint-plugin@^8.0.0 eslint@^9.0.0
cd ..

# Install all workspaces from root
npm install
```

### Phase 2: Client (Module 4)

```bash
# Create Next.js app (from project root)
npx create-next-app@latest client \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias \
  --use-npm

# Install client dependencies
cd client
npx shadcn@latest init
npm install framer-motion axios zustand @tanstack/react-query react-hook-form @hookform/resolvers zod recharts date-fns
cd ..

# Re-link workspaces
npm install
```

### Phase 3: Blockchain (Module 8)

```bash
cd blockchain
npm install
npx hardhat compile
cd ..
```

### Phase 4: shadcn/ui Components (During Module 4)

```bash
cd client
npx shadcn@latest add button input label badge card dialog \
  dropdown-menu select textarea toast separator skeleton \
  avatar sheet tooltip tabs checkbox radio-group table \
  popover slider
cd ..
```

---

## 13. Verification Checklist

After complete setup, verify:

```bash
# 1. All packages installed
npm ls --workspaces --depth=0

# 2. Server compiles
npm run typecheck --workspace=server

# 3. Server starts
npm run dev:server
# Expected: "Server running on port 5000" + "MongoDB connected"

# 4. Client starts
npm run dev:client
# Expected: "Ready on http://localhost:3000"

# 5. Both together
npm run dev
# Expected: Both outputs interleaved with [server] and [client] prefixes

# 6. Server tests run (after writing tests)
npm run test:server

# 7. Formatting works
npm run format:check

# 8. Linting works
npm run lint

# 9. Blockchain compiles (after writing contract)
npm run compile --workspace=blockchain

# 10. Health check responds
curl http://localhost:5000/api/v1/health
# Expected: { "success": true, "data": { "status": "healthy" } }
```

---

## 14. Files Created in This Setup (Summary)

```
NEW files to create:
  .nvmrc
  .editorconfig
  .prettierrc
  .prettierignore
  .eslintrc.json
  server/.eslintrc.json
  server/src/index.ts
  server/src/app.ts
  server/src/config/env.ts
  server/src/config/database.ts
  server/src/config/constants.ts
  server/src/middleware/error-handler.ts
  server/src/middleware/not-found.ts
  server/src/middleware/auth.ts
  server/src/middleware/validate.ts
  server/src/utils/api-error.ts
  server/src/utils/async-handler.ts
  server/src/utils/logger.ts
  server/src/utils/helpers.ts
  server/src/types/express.d.ts
  server/src/routes/index.ts
  server/.env
  blockchain/tsconfig.json
  client/.env.local
  client/  (entire directory via create-next-app)

UPDATED files:
  package.json              (add prettier, format scripts)
  server/package.json       (add ethers, axios, jest, test scripts)
  server/tsconfig.json      (add jest types, test excludes)
  .gitignore                (add .env.local)

TOTAL: ~25 new files + 4 updated files
```

---

## 15. What NOT to Do During Setup

```
✗ Don't install all packages at once — install per phase as modules are built
✗ Don't create empty placeholder files in every directory — create files when the module needs them
✗ Don't configure Pinata/blockchain env vars yet — optional until Module 8
✗ Don't set up CI/CD — out of scope (SCOPE.md: WON'T HAVE)
✗ Don't add Docker — out of scope for v1
✗ Don't install testing libraries until Module 11 — avoid early complexity
✗ Don't add pre-commit hooks (husky/lint-staged) — nice but not essential for final-year project
✗ Don't configure path aliases in jest.config until tests are needed
```

---

*This setup plan is ready for execution. Module 2 (Backend Foundation) creates the server files. Module 4 (Frontend Foundation) creates the client via create-next-app. Follow the install sequence exactly.*
