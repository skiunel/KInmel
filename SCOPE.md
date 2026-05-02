# Kinmel — Locked Project Scope (v1)

> Final-year project scope. Production quality, academic practicality.
> This document is the single authority on what gets built and what does not.

---

## Scope Philosophy

This project must demonstrate:
1. **Full-stack engineering competence** — clean architecture, typed code, proper auth, real CRUD
2. **Blockchain integration skill** — not a toy demo, but a meaningful on-chain verification system
3. **Product thinking** — a UI/UX that feels like a real startup product, not a student form-page
4. **Security awareness** — JWT refresh flow, RBAC, input validation, rate limiting

What this project is NOT:
- Not a real payment processor (payments are simulated)
- Not a production blockchain deployment (local Hardhat network)
- Not a scalable distributed system (single server, single DB)
- Not a mobile app (responsive web only)

These constraints are **intentional and acceptable** for a final-year project.

---

## 1. MoSCoW Feature Classification

### MUST HAVE (v1 Launch — Non-Negotiable)

These ship or the project is incomplete.

#### Authentication & Authorization
- [x] Email/password registration with Zod validation
- [x] Login returning JWT access token (15min) + refresh token (7d httpOnly cookie)
- [x] Silent token refresh via `/auth/refresh`
- [x] Logout (invalidate refresh token server-side)
- [x] RBAC middleware: `customer` and `admin` roles
- [x] Protected routes on both frontend and backend
- [x] Password hashing with bcrypt (12 rounds)

#### Product Catalog
- [x] Product model: name, slug, description, price, images[], category, stock, SKU, isActive
- [x] Admin CRUD: create, read, update, soft-delete products
- [x] Public listing: paginated, filterable by category, sortable (price, newest)
- [x] Search: text search on name + description
- [x] Product detail page: image gallery, price, stock status, reviews section
- [x] Seed script with 15-20 realistic sample products

#### Shopping Cart
- [x] Server-side cart (MongoDB) for logged-in users
- [x] Add item, update quantity, remove item, clear cart
- [x] Stock validation on add (can't exceed available stock)
- [x] Cart page with item list, quantity controls, subtotal

#### Checkout & Orders
- [x] Multi-step checkout: Shipping Address → Order Review → Confirm
- [x] Shipping address form with field validation
- [x] Order creation: snapshot cart items, calculate subtotal + shipping + tax
- [x] Stock decrement on order placement
- [x] Order confirmation page with order number
- [x] Payment method selection (simulated — "Cash on Delivery" / "Card" label only)
- [x] Order history page for customers
- [x] Order detail page with item breakdown

#### Delivery Tracking
- [x] Order status pipeline: `pending → confirmed → processing → shipped → out_for_delivery → delivered`
- [x] Admin can update order status step-by-step
- [x] Admin can push delivery updates (message + timestamp + optional location)
- [x] Customer sees delivery timeline on order detail page
- [x] SDC logic: when status = `delivered`, set `deliveredAt` timestamp
- [x] SDC triggers review eligibility for products in that order

#### Verified Reviews (Blockchain)
- [x] Eligibility check: user owns the order + order is delivered + product is in order + no duplicate review
- [x] Review form: 1-5 star rating, title, text content
- [x] IPFS storage: review JSON uploaded to Pinata, CID returned
- [x] Blockchain proof: call `submitReviewProof()` on Solidity contract
- [x] Review saved to MongoDB with: ipfsHash, txHash, blockNumber, contractAddress
- [x] Reviews displayed on product page with "Blockchain Verified" badge
- [x] Public verification page (`/verify/[reviewId]`): shows IPFS hash, tx hash, block number
- [x] Backend verification: fetch from IPFS, compare content hash with on-chain hash
- [x] Smart contract: `submitProof()`, `getProof()`, `verifyProof()`, `ReviewSubmitted` event
- [x] One review per product per order (enforced server-side)

#### Admin Dashboard
- [x] Dashboard page: stat cards (total orders, revenue, users, products)
- [x] Recent orders table on dashboard
- [x] Product management: list, create, edit, toggle active, delete
- [x] Order management: list all orders, filter by status, update status, push delivery updates
- [x] User management: list users, view details
- [x] Admin sidebar navigation layout

#### UI/UX Quality
- [x] Responsive design (mobile, tablet, desktop)
- [x] Consistent component library (shadcn/ui)
- [x] Loading states (skeletons or spinners)
- [x] Empty states for lists
- [x] Toast notifications for actions (success, error)
- [x] Form validation with inline error messages
- [x] Smooth page transitions (Framer Motion fade-up)
- [x] Professional typography and spacing

#### Infrastructure
- [x] Express server with helmet, CORS, rate limiting, morgan logging
- [x] MongoDB with Mongoose (indexed queries)
- [x] Global error handler with consistent API response format
- [x] Environment config validation on startup
- [x] Hardhat local blockchain node
- [x] Project runs with single `npm run dev` command

---

### SHOULD HAVE (v1 Launch — Strong Additions)

These make the project significantly better and should be included if time allows.

- [ ] Compare-at-price (sale/discount display on products)
- [ ] Product tags for secondary filtering
- [ ] Related products section on product detail (same category)
- [ ] Guest cart in localStorage that merges on login
- [ ] Order cancellation (only if status = `pending`)
- [ ] Revenue chart on admin dashboard (last 30 days, using Recharts)
- [ ] Admin can change user roles
- [ ] Admin can deactivate user accounts
- [ ] Review rating distribution bar on product page (5-star breakdown)
- [ ] Average rating + review count on product cards
- [ ] Estimated delivery date on order detail
- [ ] Hover animations on product cards (scale, shadow lift)
- [ ] Mobile hamburger menu with slide-out drawer
- [ ] 404 and error pages with branded design
- [ ] Profile page: view info, change password

---

### COULD HAVE (Nice-to-Have — Only If Time Permits)

These add polish but are not critical for assessment.

- [ ] Product image upload (Cloudinary or local multer)
- [ ] Wishlist / saved products
- [ ] Order invoice PDF generation
- [ ] Email notifications (simulated with console log or Mailtrap)
- [ ] Bulk product import via CSV
- [ ] Admin review moderation (flag/unflag)
- [ ] Product variant support (size, color)
- [ ] Infinite scroll on product listing
- [ ] Breadcrumb navigation

---

### WON'T HAVE (v1 — Explicitly Out of Scope)

These are not built. No exceptions. No feature creep.

- ✗ Real payment gateway (Stripe, PayPal, Khalti)
- ✗ Real email sending (SendGrid, SES)
- ✗ Social login (Google, Facebook OAuth)
- ✗ Dark mode toggle
- ✗ Multi-language / i18n
- ✗ Real-time notifications (WebSocket)
- ✗ Chat or messaging system
- ✗ Product recommendations engine (ML)
- ✗ Multi-vendor / marketplace model
- ✗ Mobile app (React Native)
- ✗ Mainnet blockchain deployment
- ✗ CI/CD pipeline
- ✗ Docker containerization
- ✗ CDN or caching layer (Redis)
- ✗ Analytics tracking (GA, Mixpanel)
- ✗ SEO optimization (meta tags, sitemap)
- ✗ PWA / offline support
- ✗ A/B testing
- ✗ Rate review helpfulness ("Was this review helpful?")

---

## 2. v1 Launch Boundaries

### What "done" looks like

```
A user can:
  1. Register and login
  2. Browse and search products
  3. Add products to cart
  4. Complete checkout with shipping address
  5. View order history and track delivery status
  6. Write a review ONLY for delivered products
  7. See their review stored on IPFS and proven on blockchain
  8. Verify any review's blockchain proof on a public page

An admin can:
  1. Login and see a dashboard with key metrics
  2. Create, edit, and manage products
  3. View and manage all orders
  4. Update order statuses through the delivery pipeline
  5. Push delivery tracking updates
  6. View all users
  7. See all reviews with their blockchain proof data

The system guarantees:
  1. Only verified buyers with delivered orders can review
  2. Review content is immutable on IPFS
  3. Review proof is verifiable on blockchain
  4. No duplicate reviews per product per order
  5. Auth tokens are secure (httpOnly, short-lived, refreshable)
  6. All inputs are validated (Zod on backend, form validation on frontend)
```

### What "not done" looks like
- If any MUST HAVE item is missing → project is incomplete
- If SHOULD HAVE items are missing → project is acceptable but not excellent
- If COULD HAVE items are missing → no impact on grade

---

## 3. Customer Feature Scope (Final)

| Feature | Pages | API Endpoints | Priority |
|---------|-------|---------------|----------|
| Auth | Login, Register | 5 endpoints | MUST |
| Browse Products | Listing, Detail | 2 endpoints | MUST |
| Cart | Cart page | 5 endpoints | MUST |
| Checkout | Checkout (multi-step) | 1 endpoint | MUST |
| Orders | History, Detail, Confirmation | 3 endpoints | MUST |
| Delivery Tracking | Timeline on Order Detail | (part of order detail) | MUST |
| Submit Review | Review form page | 2 endpoints | MUST |
| Verify Review | Verification page | 1 endpoint | MUST |
| Profile | Profile page | 1 endpoint | SHOULD |
| Cancel Order | Button on Order Detail | 1 endpoint | SHOULD |

**Total customer pages: 10**
**Total customer-facing endpoints: ~21**

---

## 4. Admin Feature Scope (Final)

| Feature | Pages | API Endpoints | Priority |
|---------|-------|---------------|----------|
| Dashboard | Dashboard | 1 endpoint | MUST |
| Product CRUD | List, Create, Edit | 3 endpoints | MUST |
| Order Management | List, Detail + Status Update | 3 endpoints | MUST |
| Delivery Updates | (Part of Order Detail) | 1 endpoint | MUST |
| User Management | User List | 1 endpoint | MUST |
| User Role Change | (Part of User List) | 1 endpoint | SHOULD |
| User Deactivation | (Part of User List) | 1 endpoint | SHOULD |
| Revenue Chart | (Part of Dashboard) | (part of stats) | SHOULD |
| Review Oversight | Reviews List | 1 endpoint | SHOULD |

**Total admin pages: 7**
**Total admin endpoints: ~12**

---

## 5. Blockchain Review Scope (Final)

### What is on-chain
- Review proof struct: reviewer address, product hash, order hash, IPFS CID, content hash, timestamp
- `submitProof()` function — stores proof, emits event
- `getProof()` function — reads proof by review ID
- `verifyProof()` function — confirms proof exists and returns data
- `ReviewSubmitted` event — emitted on each submission

### What is on IPFS
- Full review JSON: reviewer ID, product ID, order ID, rating, title, content, timestamp
- Pinned via Pinata API
- Retrievable via IPFS gateway URL

### What is in MongoDB
- Full review document including: rating, title, content, ipfsHash, blockchainTxHash, blockNumber, contractAddress, isVerified flag

### What is NOT on-chain
- Review text content (too expensive for on-chain storage)
- User personal data
- Product data
- Order data

### Network
- Local Hardhat node (`http://127.0.0.1:8545`)
- No testnet, no mainnet
- Hardhat provides 20 funded accounts for testing
- Contract redeployed on each `hardhat node` restart (acceptable for demo)

### Verification flow for assessment demo
1. Place an order as customer
2. Admin marks order as delivered
3. Customer writes review on delivered product
4. System stores on IPFS → writes proof to blockchain → saves to DB
5. Navigate to `/verify/[reviewId]`
6. Page shows: IPFS hash, content match status, tx hash, block number, contract address
7. Verification confirms: content integrity ✓, proof exists ✓, buyer verified ✓

---

## 6. Testing Scope (Final)

### MUST test (minimum viable test coverage)
| Area | Type | What | Tool |
|------|------|------|------|
| Auth service | Unit | Token generation, password hashing, validation | Jest |
| Review eligibility | Unit | Eligibility logic (all pass/fail scenarios) | Jest |
| Auth endpoints | Integration | Register, login, logout, refresh, protected routes | Supertest |
| Product endpoints | Integration | CRUD operations, search, pagination | Supertest |
| Order flow | Integration | Create order, status updates, delivery | Supertest |
| Review flow | Integration | Eligibility check, submit, verify | Supertest |
| Smart contract | Unit | submitProof, getProof, verifyProof, access control | Hardhat/Chai |

### SHOULD test
| Area | Type | What | Tool |
|------|------|------|------|
| Cart endpoints | Integration | Add, update, remove, clear, stock validation | Supertest |
| IPFS service | Unit | Upload mock, CID handling | Jest (mocked) |
| Blockchain service | Unit | Contract interaction, tx handling | Jest (mocked) |
| API error handling | Integration | 400, 401, 403, 404, 500 responses | Supertest |

### WON'T test
- E2E browser tests (Cypress/Playwright) — too much setup for scope
- Performance/load testing
- Visual regression testing
- Frontend component unit tests (React Testing Library)

### Target metrics
- **Minimum**: 20-25 test cases covering critical paths
- **Target**: 35-45 test cases with edge cases
- Backend-only testing (no frontend test framework)

---

## 7. Documentation Scope (Final)

### MUST deliver
| Document | Format | Content |
|----------|--------|---------|
| README.md | Markdown | Project overview, tech stack, setup instructions, env vars, run commands |
| ARCHITECTURE.md | Markdown | System design, data flow, component structure (already written) |
| SCOPE.md | Markdown | This document |
| API Documentation | Markdown or Postman | All endpoints with request/response examples |
| Smart Contract Docs | In-code + Markdown | Contract functions, events, deployment instructions |
| Setup Guide | Section in README | Step-by-step: clone → install → env → seed → run |

### SHOULD deliver
| Document | Format | Content |
|----------|--------|---------|
| Database Schema Docs | Markdown | All models with field descriptions |
| Postman Collection | JSON export | Importable collection with all endpoints |
| Demo Script | Markdown | Step-by-step walkthrough for assessment presentation |

### WON'T deliver
- JSDoc on every function (only on complex/non-obvious logic)
- Swagger/OpenAPI auto-generated docs
- User manual
- Deployment guide for cloud hosting
- Contributing guidelines

---

## 8. Build Order (Final — Locked)

This is the order modules are built. No skipping. No reordering.

```
Module 1:  Project Scaffold .......................... ✅ DONE
Module 2:  Backend Foundation (Express + MongoDB) ..... NEXT
Module 3:  Authentication (JWT + RBAC)
Module 4:  Frontend Foundation (Next.js + UI Shell)
Module 5:  Product Catalog (Backend + Frontend)
Module 6:  Cart & Checkout
Module 7:  Orders & Delivery Tracking
Module 8:  Verified Reviews (IPFS + Blockchain)
Module 9:  Review Verification Page
Module 10: Admin Dashboard
Module 11: Testing
Module 12: Documentation & Polish
```

Each module is built, tested manually, and committed before moving to the next.

---

## 9. Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| IPFS/Pinata API issues | Review storage fails | Graceful fallback: store content in DB, mark as "pending IPFS upload" |
| Hardhat node restart loses contracts | Blockchain proofs lost | Re-deploy script + re-seed script for demos |
| Scope creep from "one more feature" | Delays completion | This document is the scope. If it's in WON'T HAVE, it doesn't get built |
| Complex blockchain integration | Time sink | Contract is deliberately simple (one struct, three functions) |
| MongoDB connection issues | App unusable | Health check endpoint, clear error messages, connection retry |
| JWT token edge cases | Auth bugs | Comprehensive integration tests on auth flow |

---

## 10. Definition of Done (per Module)

A module is considered DONE when:
1. All MUST HAVE features for that module are implemented
2. Backend endpoints return correct responses for success and error cases
3. Frontend pages render correctly on desktop and mobile
4. No TypeScript errors (`tsc --noEmit` passes)
5. No console errors in browser
6. Manual testing confirms the happy path works
7. Code is committed with a descriptive message

---

*This scope is now LOCKED. Any additions must replace an existing feature, not add to the total.*
