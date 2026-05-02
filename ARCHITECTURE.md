# Kinmel — Product Architecture

> Blockchain-Verified Review E-Commerce Platform

---

## 1. Product Vision

Kinmel is a premium e-commerce platform where every product review is **cryptographically verified**. Only buyers with confirmed deliveries can leave reviews. Each review can be stored on **IPFS** (content-addressed, tamper-evident storage) and anchored to the **blockchain** (immutable proof of authenticity). The system is hybrid rather than fully decentralized: Kinmel still controls order eligibility and the anchoring workflow, while IPFS and the blockchain provide public verification layers.

---

## 2. User Roles & Permissions

| Role | Access Level | Capabilities |
|------|-------------|-------------|
| **Guest** | Public | Browse products, view reviews, verify review proofs, register |
| **Customer** | Authenticated | Everything Guest can do + cart, checkout, orders, delivery tracking, submit verified reviews, manage profile |
| **Admin** | Privileged | Everything Customer can do + product CRUD, order management, delivery status updates, user management, analytics dashboard |

### RBAC Matrix

| Resource | Guest | Customer | Admin |
|----------|-------|----------|-------|
| View products | ✓ | ✓ | ✓ |
| View reviews | ✓ | ✓ | ✓ |
| Verify review on-chain | ✓ | ✓ | ✓ |
| Register / Login | ✓ | — | — |
| Add to cart | — | ✓ | ✓ |
| Place order | — | ✓ | ✓ |
| Track delivery | — | ✓ (own) | ✓ (all) |
| Submit review | — | ✓ (verified buyers only) | — |
| Manage products | — | — | ✓ |
| Update order/delivery status | — | — | ✓ |
| Manage users | — | — | ✓ |
| View analytics | — | — | ✓ |

---

## 3. Complete Feature List

### 3.1 Authentication & Authorization
- Email/password registration with validation
- Login with JWT access token (15min) + refresh token (7d, httpOnly cookie)
- Silent token refresh on expiry
- Logout (invalidate refresh token)
- Role-based route protection (frontend + backend)
- Password hashing (bcrypt)
- Rate limiting on auth endpoints

### 3.2 Product Catalog
- Product listing with grid/list view toggle
- Category filtering and tag-based filtering
- Search with debounced input
- Sort by: price (asc/desc), newest, rating, popularity
- Pagination (cursor or offset)
- Product detail page with image gallery, specs, pricing
- "Compare at price" for sale indicators
- Stock availability display
- Related products section
- Review summary (average rating, count, distribution bar)

### 3.3 Shopping Cart
- Add/remove/update quantity
- Persistent cart (DB-backed for logged-in users)
- Guest cart via localStorage (merge on login)
- Real-time stock validation
- Cart summary with subtotal
- Empty cart state

### 3.4 Checkout & Payment
- Multi-step checkout: Shipping → Review → Confirm
- Shipping address form with validation
- Order summary review
- Payment method selection (simulated for academic scope)
- Order confirmation screen with order number
- Confirmation email (simulated/logged)

### 3.5 Order Management
- Order history list (customer)
- Order detail view with item breakdown
- Order status badge (pending → confirmed → processing → shipped → out_for_delivery → delivered)
- Cancel order (only if status = pending)
- All orders list with filters (admin)
- Update order status (admin)

### 3.6 Delivery Tracking
- Timeline-based delivery tracker UI
- Status updates with timestamps and optional location
- Estimated delivery date
- Admin can push delivery updates
- SDC (Shipment Delivery Confirmation) logic:
  - When admin marks order as "delivered"
  - System records `deliveredAt` timestamp
  - Customer's review eligibility is unlocked for that order's products
  - A delivery confirmation record is created

### 3.7 Verified Reviews (Core Differentiator)
- Eligibility check: user must have a delivered order containing the product
- One review per product per order
- Review form: rating (1-5 stars), title, content
- Review content → hashed → stored on IPFS → IPFS hash + metadata → stored on blockchain
- Review displayed with "Blockchain Verified" badge
- Public verification page: anyone can check proof on-chain
- Review list on product page with filters (rating, verified, newest)

### 3.8 Admin Dashboard
- Overview: total orders, revenue, users, products (stat cards)
- Revenue chart (last 30 days)
- Recent orders table
- Product management (CRUD with image upload)
- Order management (view, update status, push delivery updates)
- User management (view, role change, deactivate)
- Review moderation (view all reviews, see blockchain proof)

---

## 4. Customer Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER JOURNEY                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. DISCOVERY                                                       │
│     │  Guest lands on homepage                                      │
│     │  Browses featured products / categories                       │
│     │  Searches for specific product                                │
│     │  Views product detail + reads verified reviews                │
│     ▼                                                               │
│  2. REGISTRATION                                                    │
│     │  Clicks "Add to Cart" → prompted to register/login            │
│     │  Creates account (name, email, password)                      │
│     │  Email verification (simulated)                               │
│     │  Redirected back to product                                   │
│     ▼                                                               │
│  3. SHOPPING                                                        │
│     │  Adds products to cart                                        │
│     │  Adjusts quantities                                           │
│     │  Views cart summary                                           │
│     ▼                                                               │
│  4. CHECKOUT                                                        │
│     │  Enters shipping address                                      │
│     │  Reviews order summary                                        │
│     │  Selects payment method (simulated)                           │
│     │  Confirms order                                               │
│     │  Sees order confirmation with order number                    │
│     ▼                                                               │
│  5. DELIVERY TRACKING                                               │
│     │  Views order in "My Orders"                                   │
│     │  Clicks into order detail                                     │
│     │  Sees real-time delivery timeline                             │
│     │  Receives status updates (pending → shipped → delivered)      │
│     ▼                                                               │
│  6. REVIEW                                                          │
│     │  Order marked as "delivered" by admin                         │
│     │  "Write a Review" button appears on delivered products        │
│     │  Submits rating + title + review content                      │
│     │  System stores content on IPFS                                │
│     │  System writes proof to blockchain                            │
│     │  Review appears with "Blockchain Verified ✓" badge            │
│     ▼                                                               │
│  7. VERIFICATION (optional)                                         │
│     │  Any user clicks "Verify on Blockchain" on a review           │
│     │  Verification page shows: IPFS hash, tx hash, block number   │
│     │  User can independently verify on block explorer              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Admin Journey

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ADMIN JOURNEY                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. LOGIN                                                           │
│     │  Admin logs in with admin credentials                         │
│     │  Redirected to /admin/dashboard                               │
│     ▼                                                               │
│  2. DASHBOARD OVERVIEW                                              │
│     │  Views stat cards: revenue, orders, users, products           │
│     │  Views revenue chart (30-day trend)                           │
│     │  Views recent orders table                                    │
│     ▼                                                               │
│  3. PRODUCT MANAGEMENT                                              │
│     │  /admin/products — list all products                          │
│     │  Create new product (name, description, price, images, etc.)  │
│     │  Edit existing product                                        │
│     │  Toggle product active/inactive                               │
│     │  Delete product (soft delete)                                 │
│     ▼                                                               │
│  4. ORDER MANAGEMENT                                                │
│     │  /admin/orders — list all orders with filters                 │
│     │  View order detail                                            │
│     │  Update order status through the pipeline:                    │
│     │    pending → confirmed → processing → shipped →               │
│     │    out_for_delivery → delivered                                │
│     │  Push delivery update with message + optional location        │
│     │  Mark as delivered → triggers SDC → unlocks review eligibility│
│     ▼                                                               │
│  5. USER MANAGEMENT                                                 │
│     │  /admin/users — list all users                                │
│     │  View user profile + order history                            │
│     │  Change user role                                             │
│     │  Deactivate user account                                      │
│     ▼                                                               │
│  6. REVIEW OVERSIGHT                                                │
│     │  /admin/reviews — list all reviews                            │
│     │  View blockchain proof for each review                        │
│     │  Flag/unflag reviews                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Page List

### 6.1 Public Pages (Guest + Authenticated)
| Page | Route | Description |
|------|-------|-------------|
| Homepage | `/` | Hero, featured products, categories, trust badges |
| Product Listing | `/products` | Filterable, searchable product grid |
| Product Detail | `/products/[slug]` | Images, info, reviews, add-to-cart |
| Review Verification | `/verify/[reviewId]` | On-chain proof verification |
| Login | `/login` | Email + password login form |
| Register | `/register` | Registration form |

### 6.2 Customer Pages (Authenticated)
| Page | Route | Description |
|------|-------|-------------|
| Cart | `/cart` | Cart items, quantities, subtotal |
| Checkout | `/checkout` | Multi-step: shipping → review → confirm |
| Order Confirmation | `/orders/[id]/confirmation` | Success screen post-checkout |
| My Orders | `/orders` | Order history list |
| Order Detail | `/orders/[id]` | Items, status, delivery timeline |
| Write Review | `/orders/[id]/review/[productId]` | Review form (eligible only) |
| Profile | `/profile` | User info, change password |

### 6.3 Admin Pages (Admin only)
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin` | Stats, charts, recent activity |
| Products List | `/admin/products` | Product table with actions |
| Product Create/Edit | `/admin/products/new` `/admin/products/[id]/edit` | Product form |
| Orders List | `/admin/orders` | All orders with filters |
| Order Detail | `/admin/orders/[id]` | Order info + status updater |
| Users List | `/admin/users` | User management table |
| Reviews List | `/admin/reviews` | All reviews with proof links |

---

## 7. Data Flow

### 7.1 High-Level System Architecture

```
┌──────────────┐     HTTPS/REST      ┌──────────────┐
│              │ ◄──────────────────► │              │
│   Next.js    │                      │   Express    │
│   Frontend   │                      │   Backend    │
│   (Client)   │                      │   (Server)   │
│              │                      │              │
└──────────────┘                      └──────┬───────┘
                                             │
                              ┌──────────────┼──────────────┐
                              │              │              │
                              ▼              ▼              ▼
                       ┌──────────┐   ┌──────────┐   ┌──────────┐
                       │ MongoDB  │   │   IPFS   │   │Blockchain│
                       │          │   │ (Pinata) │   │(Hardhat) │
                       │ Users    │   │          │   │          │
                       │ Products │   │ Review   │   │ Review   │
                       │ Orders   │   │ Content  │   │ Proofs   │
                       │ Reviews  │   │ Storage  │   │          │
                       │ Carts    │   │          │   │          │
                       └──────────┘   └──────────┘   └──────────┘
```

### 7.2 Request Flow

```
Client Request
    │
    ▼
Express Router (/api/v1/...)
    │
    ▼
Middleware Pipeline:
    │  1. helmet() — security headers
    │  2. cors() — origin validation
    │  3. rateLimiter — request throttling
    │  4. morgan — request logging
    │  5. cookieParser — parse refresh tokens
    │  6. express.json() — body parsing
    │
    ▼
Auth Middleware (protected routes):
    │  1. Extract Bearer token from header
    │  2. Verify JWT signature + expiry
    │  3. Attach user to req
    │  4. Check role permissions
    │
    ▼
Validation Middleware:
    │  Zod schema validation on req.body/params/query
    │
    ▼
Controller:
    │  Parse request → call Service → format response
    │
    ▼
Service Layer:
    │  Business logic → interact with Model / external services
    │
    ▼
Model Layer (Mongoose):
    │  Database operations
    │
    ▼
Response → Client
```

---

## 8. Review Verification Flow (Core Feature)

This is the complete flow from purchase to verified review:

```
PHASE 1: PURCHASE & DELIVERY
═══════════════════════════════════════════════════════════════

Customer places order
        │
        ▼
Order created (status: "pending")
        │
        ▼
Admin updates status through pipeline:
  pending → confirmed → processing → shipped → out_for_delivery
        │
        ▼
Admin marks order as "delivered"
        │
        ▼
SDC (Shipment Delivery Confirmation):
  ├── order.status = "delivered"
  ├── order.deliveredAt = timestamp
  └── Review eligibility UNLOCKED for each product in this order


PHASE 2: REVIEW SUBMISSION
═══════════════════════════════════════════════════════════════

Customer navigates to delivered order
        │
        ▼
Clicks "Write a Review" on a product
        │
        ▼
Eligibility Check (backend):
  ├── Is user the order owner? ✓
  ├── Is order status "delivered"? ✓
  ├── Does order contain this product? ✓
  └── Has user already reviewed this product for this order? ✗ → ELIGIBLE
        │
        ▼
Customer submits: rating (1-5), title, review content
        │
        ▼
Backend receives review data


PHASE 3: IPFS STORAGE
═══════════════════════════════════════════════════════════════

Backend constructs review object:
  {
    reviewer: userId,
    product: productId,
    order: orderId,
    rating: 5,
    title: "Amazing quality",
    content: "This product exceeded my expectations...",
    timestamp: 1709913600
  }
        │
        ▼
JSON serialized → uploaded to IPFS via Pinata API
        │
        ▼
IPFS returns CID (Content Identifier):
  e.g., "QmX7b5jxn5fMKRqP..."
        │
        ▼
CID stored — content is now immutable and decentralized


PHASE 4: BLOCKCHAIN PROOF
═══════════════════════════════════════════════════════════════

Backend calls smart contract function:
  submitReviewProof(
    reviewerAddress,    // derived from userId
    productHash,        // keccak256(productId)
    orderHash,          // keccak256(orderId)
    ipfsCID,           // from Phase 3
    contentHash,       // keccak256(review content)
    timestamp          // block timestamp
  )
        │
        ▼
Transaction mined on blockchain
        │
        ▼
Backend receives:
  ├── txHash: "0xabc123..."
  ├── blockNumber: 42
  └── contractAddress: "0xdef456..."
        │
        ▼
Review record saved to MongoDB:
  {
    ...reviewData,
    ipfsHash: "QmX7b5jxn5fMKRqP...",
    blockchainTxHash: "0xabc123...",
    blockNumber: 42,
    contractAddress: "0xdef456...",
    isVerified: true
  }

Note: in the current implementation, review creation may return earlier with
`verificationStatus: "stored"` and no blockchain transaction yet. The review is
promoted to `verified` after asynchronous anchoring succeeds.


PHASE 5: VERIFICATION (by anyone)
═══════════════════════════════════════════════════════════════

User clicks "Verify on Blockchain" on any review
        │
        ▼
Verification page (/verify/[reviewId]) shows:
  ├── Review content (from DB)
  ├── IPFS Hash → link to IPFS gateway to view original
  ├── Content Hash → SHA-256 of current content
  ├── Transaction Hash → link to block explorer
  ├── Block Number
  └── Contract Address
        │
        ▼
Backend verification steps:
  1. Fetch review content from IPFS using CID
  2. Hash fetched content → compare with on-chain contentHash
  3. Query smart contract → verify proof exists
  4. Compare all fields match
        │
        ▼
Verification result:
  ├── CONTENT MATCH: IPFS content matches on-chain hash ✓
  ├── PROOF EXISTS: Smart contract confirms proof ✓
  ├── BUYER VERIFIED: Order delivery confirmed ✓
  └── TIMESTAMP VALID: Review posted after delivery ✓
```

---

## 9. IPFS Flow Detail

```
┌─────────────┐     JSON payload      ┌─────────────┐
│   Backend   │ ───────────────────►   │   Pinata    │
│   Service   │                        │   IPFS API  │
│             │  ◄─────────────────    │             │
│             │     CID (hash)         │             │
└─────────────┘                        └──────┬──────┘
                                              │
                                     Pinned to IPFS network
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │  IPFS Network    │
                                    │                  │
                                    │  Content is:     │
                                    │  • Immutable     │
                                    │  • Decentralized │
                                    │  • Addressable   │
                                    │    by CID        │
                                    └─────────────────┘

Retrieval:
  GET https://gateway.pinata.cloud/ipfs/{CID}
  → Returns original JSON review object
```

**Why IPFS?**
- Content-addressed: the hash IS the address. Change one byte → completely different hash
- Decentralized: no single point of failure
- Immutable: once pinned, content cannot be altered
- Verifiable: anyone can fetch by CID and verify content matches

---

## 10. Blockchain Proof Flow Detail

### Smart Contract: `ReviewVerification.sol`

```
Storage (on-chain):
┌───────────────────────────────────────────────┐
│  mapping(bytes32 => ReviewProof) public proofs│
│                                               │
│  struct ReviewProof {                         │
│    address reviewer;                          │
│    bytes32 productHash;                       │
│    bytes32 orderHash;                         │
│    string  ipfsCID;                           │
│    bytes32 contentHash;                       │
│    uint256 timestamp;                         │
│    bool    exists;                            │
│  }                                            │
└───────────────────────────────────────────────┘

Functions:
  submitProof(...)  → stores proof, emits ReviewSubmitted event
  getProof(id)      → returns proof data
  verifyProof(id)   → returns bool (exists + data integrity)

Events:
  ReviewSubmitted(reviewId, reviewer, productHash, ipfsCID, timestamp)
```

### Interaction Flow

```
Backend                          Blockchain
  │                                  │
  │  submitProof(reviewData)         │
  │ ────────────────────────────►    │
  │                                  │ Store in mapping
  │                                  │ Emit event
  │  ◄──── txReceipt ───────────    │
  │  (txHash, blockNumber)           │
  │                                  │
  │                                  │
  │  verifyProof(reviewId)           │
  │ ────────────────────────────►    │
  │                                  │ Read from mapping
  │  ◄──── proofData ───────────    │
  │  (all fields + exists=true)      │
```

---

## 11. Backend Services Architecture

```
server/src/
├── index.ts                    # Entry point, server bootstrap
├── app.ts                      # Express app configuration
│
├── config/
│   ├── env.ts                  # Environment variable validation
│   ├── database.ts             # MongoDB connection
│   └── constants.ts            # App-wide constants
│
├── middleware/
│   ├── auth.ts                 # JWT verification + role check
│   ├── validate.ts             # Zod schema validation
│   ├── errorHandler.ts         # Global error handler
│   └── notFound.ts             # 404 handler
│
├── models/
│   ├── User.ts                 # User schema + methods
│   ├── Product.ts              # Product schema + virtuals
│   ├── Cart.ts                 # Cart schema
│   ├── Order.ts                # Order schema + status machine
│   └── Review.ts               # Review schema + blockchain fields
│
├── controllers/
│   ├── auth.controller.ts      # register, login, logout, refresh
│   ├── product.controller.ts   # CRUD + search + list
│   ├── cart.controller.ts      # add, remove, update, get
│   ├── order.controller.ts     # create, list, detail, cancel
│   ├── delivery.controller.ts  # update status, push tracking
│   ├── review.controller.ts    # submit, list, verify eligibility
│   └── admin.controller.ts     # dashboard stats, user management
│
├── services/
│   ├── auth.service.ts         # Token generation, password hashing
│   ├── product.service.ts      # Product business logic
│   ├── cart.service.ts         # Cart operations
│   ├── order.service.ts        # Order creation, status management
│   ├── delivery.service.ts     # SDC logic, delivery confirmation
│   ├── review.service.ts       # Eligibility, review creation
│   ├── ipfs.service.ts         # Pinata upload/fetch
│   ├── blockchain.service.ts   # Contract interaction (ethers.js)
│   └── admin.service.ts        # Aggregation queries, stats
│
├── routes/
│   ├── index.ts                # Route aggregator (/api/v1)
│   ├── auth.routes.ts
│   ├── product.routes.ts
│   ├── cart.routes.ts
│   ├── order.routes.ts
│   ├── delivery.routes.ts
│   ├── review.routes.ts
│   └── admin.routes.ts
│
├── types/
│   └── express.d.ts            # Express request augmentation
│
└── utils/
    ├── ApiError.ts             # Custom error class
    ├── asyncHandler.ts         # Async route wrapper
    ├── logger.ts               # Logging utility
    └── helpers.ts              # Misc helpers
```

### Service Dependency Map

```
auth.service
  └── User model, JWT, bcrypt

product.service
  └── Product model

cart.service
  └── Cart model, Product model (stock check)

order.service
  └── Order model, Cart model, Product model (stock decrement)

delivery.service
  └── Order model (status update, SDC trigger)

review.service
  ├── Order model (eligibility check)
  ├── Review model
  ├── ipfs.service (content storage)
  └── blockchain.service (proof submission)

ipfs.service
  └── Pinata SDK / API

blockchain.service
  └── ethers.js + contract ABI
```

---

## 12. Frontend Sections & Component Architecture

```
client/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (providers, navbar, footer)
│   ├── page.tsx                      # Homepage
│   ├── loading.tsx                   # Global loading
│   │
│   ├── (auth)/                       # Auth group layout (centered card)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── products/
│   │   ├── page.tsx                  # Product listing
│   │   └── [slug]/page.tsx           # Product detail
│   │
│   ├── cart/page.tsx                 # Shopping cart
│   │
│   ├── checkout/page.tsx             # Multi-step checkout
│   │
│   ├── orders/
│   │   ├── page.tsx                  # Order history
│   │   ├── [id]/page.tsx             # Order detail + delivery tracking
│   │   └── [id]/review/[productId]/page.tsx  # Review form
│   │
│   ├── verify/[reviewId]/page.tsx    # Public verification page
│   │
│   ├── profile/page.tsx              # User profile
│   │
│   └── admin/                        # Admin section
│       ├── layout.tsx                # Admin sidebar layout
│       ├── page.tsx                  # Dashboard
│       ├── products/
│       │   ├── page.tsx              # Product list
│       │   ├── new/page.tsx          # Create product
│       │   └── [id]/edit/page.tsx    # Edit product
│       ├── orders/
│       │   ├── page.tsx              # All orders
│       │   └── [id]/page.tsx         # Order detail + status update
│       ├── users/page.tsx            # User management
│       └── reviews/page.tsx          # Review oversight
│
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   ├── layout/
│   │   ├── Navbar.tsx                # Main navigation
│   │   ├── Footer.tsx                # Site footer
│   │   ├── Sidebar.tsx               # Admin sidebar
│   │   └── MobileNav.tsx             # Mobile hamburger menu
│   ├── products/
│   │   ├── ProductCard.tsx           # Grid card with hover effects
│   │   ├── ProductGrid.tsx           # Responsive product grid
│   │   ├── ProductGallery.tsx        # Image carousel/gallery
│   │   ├── ProductInfo.tsx           # Price, stock, add-to-cart
│   │   └── ProductFilters.tsx        # Sidebar filters
│   ├── cart/
│   │   ├── CartItem.tsx              # Single cart item row
│   │   ├── CartSummary.tsx           # Subtotal, checkout button
│   │   └── CartEmpty.tsx             # Empty state
│   ├── checkout/
│   │   ├── ShippingForm.tsx          # Address form
│   │   ├── OrderReview.tsx           # Pre-confirm summary
│   │   └── CheckoutSteps.tsx         # Step indicator
│   ├── orders/
│   │   ├── OrderCard.tsx             # Order list item
│   │   ├── OrderTimeline.tsx         # Delivery tracking timeline
│   │   └── OrderItems.tsx            # Items in order
│   ├── reviews/
│   │   ├── ReviewCard.tsx            # Single review with verified badge
│   │   ├── ReviewForm.tsx            # Star rating + text input
│   │   ├── ReviewList.tsx            # Reviews list with filters
│   │   ├── VerifiedBadge.tsx         # "Blockchain Verified" badge
│   │   └── VerificationProof.tsx     # On-chain proof display
│   ├── admin/
│   │   ├── StatCard.tsx              # Dashboard metric card
│   │   ├── RevenueChart.tsx          # 30-day revenue chart
│   │   ├── DataTable.tsx             # Reusable admin table
│   │   └── StatusUpdater.tsx         # Order status dropdown
│   └── shared/
│       ├── StarRating.tsx            # Star rating display/input
│       ├── Badge.tsx                 # Status badges
│       ├── EmptyState.tsx            # Generic empty state
│       ├── LoadingSpinner.tsx        # Loading indicator
│       └── Pagination.tsx            # Page navigation
│
├── lib/
│   ├── api.ts                        # Axios instance with interceptors
│   ├── auth.ts                       # Auth context + hooks
│   └── utils.ts                      # Utility functions
│
├── hooks/
│   ├── useAuth.ts                    # Auth state management
│   ├── useCart.ts                    # Cart operations
│   ├── useProducts.ts               # Product fetching
│   └── useOrders.ts                 # Order fetching
│
└── stores/
    ├── authStore.ts                  # Zustand auth store
    └── cartStore.ts                  # Zustand cart store
```

---

## 13. API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/auth/register` | Public | Register new user |
| POST | `/api/v1/auth/login` | Public | Login, returns tokens |
| POST | `/api/v1/auth/logout` | Auth | Invalidate refresh token |
| POST | `/api/v1/auth/refresh` | Public | Refresh access token |
| GET | `/api/v1/auth/me` | Auth | Get current user |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/products` | Public | List products (paginated) |
| GET | `/api/v1/products/:slug` | Public | Get product by slug |
| POST | `/api/v1/products` | Admin | Create product |
| PUT | `/api/v1/products/:id` | Admin | Update product |
| DELETE | `/api/v1/products/:id` | Admin | Delete product |

### Cart
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/cart` | Auth | Get user cart |
| POST | `/api/v1/cart/items` | Auth | Add item to cart |
| PUT | `/api/v1/cart/items/:productId` | Auth | Update item quantity |
| DELETE | `/api/v1/cart/items/:productId` | Auth | Remove item |
| DELETE | `/api/v1/cart` | Auth | Clear cart |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/v1/orders` | Auth | Create order from cart |
| GET | `/api/v1/orders` | Auth | List user orders |
| GET | `/api/v1/orders/:id` | Auth | Get order detail |
| PUT | `/api/v1/orders/:id/cancel` | Auth | Cancel order |
| GET | `/api/v1/admin/orders` | Admin | List all orders |
| PUT | `/api/v1/admin/orders/:id/status` | Admin | Update order status |
| POST | `/api/v1/admin/orders/:id/delivery` | Admin | Push delivery update |

### Reviews
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/products/:productId/reviews` | Public | List product reviews |
| POST | `/api/v1/reviews` | Auth | Submit review |
| GET | `/api/v1/reviews/:id/verify` | Public | Verify review on-chain |
| GET | `/api/v1/reviews/eligibility/:orderId` | Auth | Check review eligibility |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/v1/admin/dashboard` | Admin | Dashboard stats |
| GET | `/api/v1/admin/users` | Admin | List users |
| PUT | `/api/v1/admin/users/:id/role` | Admin | Update user role |
| PUT | `/api/v1/admin/users/:id/deactivate` | Admin | Deactivate user |

---

## 14. Phased Roadmap

### Phase 1 — Foundation (Modules 1-2)
> **Goal:** Running server with database connection

- [x] Monorepo scaffold, configs, shared types
- [ ] Express server with middleware pipeline
- [ ] MongoDB connection with health check
- [ ] Global error handling + custom ApiError
- [ ] Environment config validation
- [ ] Request logging

### Phase 2 — Auth & Frontend Shell (Modules 3-4)
> **Goal:** Users can register, login, see a polished UI

- [ ] User model with password hashing
- [ ] JWT access + refresh token system
- [ ] Auth routes + middleware
- [ ] Rate limiting on auth endpoints
- [ ] Next.js project with Tailwind + shadcn/ui
- [ ] Layout: Navbar, Footer, MobileNav
- [ ] Auth pages: Login, Register
- [ ] Auth context/store + route protection
- [ ] Homepage with hero section

### Phase 3 — Product Catalog (Module 5)
> **Goal:** Browsable, searchable product listings

- [ ] Product model + admin CRUD endpoints
- [ ] Product listing with filters, search, sort, pagination
- [ ] Product detail page with image gallery
- [ ] Category system
- [ ] Admin product management page
- [ ] Seed script with sample products

### Phase 4 — Cart & Checkout (Module 6)
> **Goal:** Complete purchase flow

- [ ] Cart model + API endpoints
- [ ] Cart page with quantity management
- [ ] Multi-step checkout flow
- [ ] Order creation from cart
- [ ] Order confirmation page
- [ ] Stock validation and decrement

### Phase 5 — Orders & Delivery (Module 7)
> **Goal:** Order tracking with delivery timeline

- [ ] Order history page (customer)
- [ ] Order detail with delivery timeline
- [ ] Admin order management
- [ ] Status update pipeline
- [ ] SDC (delivery confirmation) logic
- [ ] Review eligibility unlocking

### Phase 6 — Blockchain Reviews (Modules 8-9)
> **Goal:** The core differentiator — verified reviews

- [ ] ReviewVerification smart contract
- [ ] Contract tests + deployment script
- [ ] IPFS service (Pinata integration)
- [ ] Blockchain service (ethers.js + contract)
- [ ] Review submission flow (eligibility → IPFS → blockchain → DB)
- [ ] Review display with verified badges
- [ ] Public verification page
- [ ] Admin review oversight

### Phase 7 — Admin Dashboard (Module 10)
> **Goal:** Full admin control panel

- [ ] Dashboard with stat cards + charts
- [ ] Product management UI (full CRUD)
- [ ] Order management UI
- [ ] User management UI
- [ ] Admin layout with sidebar navigation

### Phase 8 — Polish & Ship (Modules 11-12)
> **Goal:** Production-ready quality

- [ ] Unit tests (services, utilities)
- [ ] Integration tests (API endpoints)
- [ ] E2E tests (critical flows)
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Final documentation
- [ ] Deployment guide

---

## 15. Design System Notes

| Element | Specification |
|---------|--------------|
| **Font** | Inter (body), Plus Jakarta Sans (headings) |
| **Primary** | Deep indigo / rich blue (#4F46E5 → #3730A3) |
| **Accent** | Amber/gold for verified badges (#F59E0B) |
| **Surfaces** | White cards with subtle shadows, glass-morphism on hero |
| **Spacing** | 8px grid system |
| **Radius** | Rounded-lg (8px) for cards, rounded-full for badges |
| **Animations** | Framer Motion: fade-up on scroll, scale on hover, spring transitions |
| **Dark mode** | Not in v1 scope (can add later) |

---

*This architecture document serves as the single source of truth for the Kinmel project. All modules should reference this for consistency.*
