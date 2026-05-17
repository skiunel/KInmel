# Kinmel — Technical Architecture

> This document defines every technical decision, structure, and strategy.
> Read this before writing any code.

---

## 1. Frontend Folder Structure

```
frontend/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── postcss.config.mjs
├── components.json                     # shadcn/ui config
│
├── public/
│   ├── fonts/
│   │   ├── inter-var.woff2
│   │   └── plus-jakarta-sans-var.woff2
│   ├── images/
│   │   ├── hero-bg.webp
│   │   ├── placeholder-product.webp
│   │   └── logo.svg
│   └── favicon.ico
│
├── app/                                # Next.js App Router
│   ├── layout.tsx                      # Root layout: providers, fonts, Toaster
│   ├── page.tsx                        # Homepage
│   ├── loading.tsx                     # Root loading state
│   ├── not-found.tsx                   # 404 page
│   ├── error.tsx                       # Root error boundary
│   ├── globals.css                     # Tailwind directives + custom CSS vars
│   │
│   ├── (auth)/                         # Auth group — shared centered layout
│   │   ├── layout.tsx                  # Centered card layout, mesh gradient bg
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   │
│   ├── (shop)/                         # Shop group — shared Navbar + Footer layout
│   │   ├── layout.tsx                  # Navbar + Footer wrapper
│   │   ├── products/
│   │   │   ├── page.tsx               # Product listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx           # Product detail
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx               # Order history
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx           # Order detail
│   │   │   │   └── review/
│   │   │   │       └── [productId]/
│   │   │   │           └── page.tsx   # Review form
│   │   │   └── confirmation/
│   │   │       └── [id]/
│   │   │           └── page.tsx       # Order confirmation
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── verify/
│   │       └── [reviewId]/
│   │           └── page.tsx           # Public verification
│   │
│   └── admin/                          # Admin section — own layout
│       ├── layout.tsx                  # AdminLayout (sidebar + topbar)
│       ├── page.tsx                    # Dashboard
│       ├── products/
│       │   ├── page.tsx               # Product list
│       │   ├── new/
│       │   │   └── page.tsx           # Create product
│       │   └── [id]/
│       │       └── edit/
│       │           └── page.tsx       # Edit product
│       ├── orders/
│       │   ├── page.tsx               # All orders
│       │   └── [id]/
│       │       └── page.tsx           # Order detail + status updater
│       ├── users/
│       │   └── page.tsx               # User management
│       └── reviews/
│           └── page.tsx               # Review oversight
│
├── components/                         # (see COMPONENT_SYSTEM.md for full tree)
│   ├── ui/                            # shadcn/ui primitives
│   ├── layout/                        # Navbar, Footer, Sidebar, etc.
│   ├── shared/                        # Cross-cutting reusables
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   ├── order/
│   ├── review/
│   ├── admin/
│   └── home/
│
├── lib/
│   ├── api.ts                         # Axios instance, interceptors, refresh logic
│   ├── utils.ts                       # cn() helper, formatters, helpers
│   ├── constants.ts                   # Routes, status maps, config values
│   └── validators.ts                  # Zod schemas for client-side validation
│
├── hooks/
│   ├── use-auth.ts                    # Auth state + login/logout/register mutations
│   ├── use-cart.ts                    # Cart queries + mutations
│   ├── use-products.ts               # Product list/detail queries
│   ├── use-orders.ts                 # Order queries + mutations
│   ├── use-reviews.ts                # Review queries + mutations
│   ├── use-admin.ts                  # Admin dashboard queries
│   └── use-debounce.ts               # Debounce utility hook
│
├── stores/
│   ├── auth-store.ts                  # Zustand: user, tokens, login/logout
│   └── cart-store.ts                  # Zustand: local cart for guests
│
├── providers/
│   ├── query-provider.tsx             # TanStack Query provider
│   ├── auth-provider.tsx              # Auth context: checks session on mount
│   └── toast-provider.tsx             # Toast/notification provider
│
└── types/
    └── index.ts                       # Re-exports from shared/types + client-specific types
```

### Frontend Architecture Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Router | App Router | Server components, layouts, loading/error states built-in |
| Data fetching | TanStack Query | Cache, refetch, mutations, optimistic updates, devtools |
| Forms | react-hook-form + Zod | Performant (no re-render per keystroke), type-safe validation |
| State | Zustand | Minimal boilerplate, no provider wrapping, persist middleware |
| HTTP | Axios | Interceptors for token refresh, cleaner API than fetch |
| Route groups | `(auth)`, `(shop)`, `admin` | Different layouts without nesting URLs |
| Components | shadcn/ui | Copy-paste ownership, Tailwind native, fully customizable |

### What runs server-side vs client-side

```
SERVER COMPONENTS (default in App Router):
  - Page shells (layout.tsx, page.tsx)
  - Static sections (Footer, HeroSection text)
  - Metadata generation

CLIENT COMPONENTS ("use client"):
  - All interactive components (forms, buttons, dropdowns)
  - Components using hooks (useAuth, useCart, useState)
  - Components with Framer Motion animations
  - Components using browser APIs (localStorage)

STRATEGY:
  - Keep page.tsx as server component where possible
  - Wrap interactive sections in client component boundaries
  - Never mark layout.tsx as "use client" — pass children through
  - Data fetching happens client-side via TanStack Query (not RSC fetch)
    because our data is dynamic and user-specific
```

---

## 2. Backend Folder Structure

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── .env                                # NOT committed (in .gitignore)
│
├── src/
│   ├── index.ts                       # Entry: load env → connect DB → start server
│   ├── app.ts                         # Express app: middleware pipeline + route mounting
│   │
│   ├── config/
│   │   ├── env.ts                     # Zod-validated environment variables
│   │   ├── database.ts                # MongoDB connection with retry logic
│   │   └── constants.ts              # ORDER_STATUSES, ROLES, pagination defaults
│   │
│   ├── models/
│   │   ├── User.ts                    # User schema, password hashing hooks, methods
│   │   ├── Product.ts                 # Product schema, text index, virtuals
│   │   ├── Cart.ts                    # Cart schema, total calculation methods
│   │   ├── Order.ts                   # Order schema, status validation, delivery updates
│   │   └── Review.ts                  # Review schema, blockchain fields, uniqueness index
│   │
│   ├── routes/
│   │   ├── index.ts                   # Aggregates all routers under /api/v1
│   │   ├── auth.routes.ts             # /auth/*
│   │   ├── product.routes.ts          # /products/*
│   │   ├── cart.routes.ts             # /cart/*
│   │   ├── order.routes.ts            # /orders/*
│   │   ├── review.routes.ts           # /reviews/*
│   │   └── admin.routes.ts            # /admin/*
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── order.controller.ts
│   │   ├── review.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts            # Token generation, password ops, user lookup
│   │   ├── product.service.ts         # CRUD, search, filtering, pagination
│   │   ├── cart.service.ts            # Cart ops, stock validation, total calc
│   │   ├── order.service.ts           # Order creation, status machine, SDC
│   │   ├── review.service.ts          # Eligibility, review creation orchestration
│   │   ├── ipfs.service.ts            # Pinata upload and retrieval
│   │   ├── blockchain.service.ts      # Contract interaction via ethers.js
│   │   └── admin.service.ts           # Dashboard aggregation, user management
│   │
│   ├── middleware/
│   │   ├── auth.ts                    # authenticate (JWT verify) + authorize (role check)
│   │   ├── validate.ts                # Zod schema validation middleware factory
│   │   ├── error-handler.ts           # Global error handler (catches all)
│   │   └── not-found.ts               # 404 catch-all
│   │
│   ├── types/
│   │   └── express.d.ts               # Augment Express Request with user property
│   │
│   ├── utils/
│   │   ├── api-error.ts               # Custom error class with status code
│   │   ├── async-handler.ts           # Wraps async route handlers (catches throws)
│   │   ├── logger.ts                  # Structured logging utility
│   │   └── helpers.ts                # generateOrderNumber, slugify, etc.
│   │
│   └── validators/
│       ├── auth.validators.ts         # register, login schemas
│       ├── product.validators.ts      # create, update, query schemas
│       ├── cart.validators.ts         # addItem, updateItem schemas
│       ├── order.validators.ts        # createOrder, updateStatus schemas
│       └── review.validators.ts       # submitReview schema
│
├── scripts/
│   └── seed.ts                        # Database seeder: admin user + sample products
│
└── dist/                              # Compiled JS (not committed)
```

### Backend Architecture Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Runtime | Node.js + tsx (dev) | Fast reload, TypeScript without build step in dev |
| Framework | Express 4 | Mature, massive ecosystem, simple mental model |
| Validation | Zod | Same library as frontend, runtime type checking, great errors |
| ORM | Mongoose 8 | Schema-level validation, middleware hooks, populate, aggregation |
| Architecture | Controller → Service → Model | Testable, separates HTTP from business logic |
| Error handling | Custom ApiError + global handler | Consistent error responses, no try/catch in controllers |

### Layer Responsibilities

```
ROUTE          → Defines HTTP method + path + middleware chain + controller
CONTROLLER     → Extracts data from req → calls service → sends res
SERVICE        → Contains business logic → calls model/external service → returns data
MODEL          → Defines schema → provides data access methods
MIDDLEWARE     → Cross-cutting: auth, validation, error handling
VALIDATOR      → Zod schemas for request body/params/query
```

### Rule: What goes where

```
✗ NEVER in controller:  Database queries, business logic, external API calls
✓ Controller does:      req parsing, service call, res.json()

✗ NEVER in service:     req/res access, HTTP status codes, Express types
✓ Service does:         Business rules, model calls, orchestration, throws ApiError

✗ NEVER in model:       Business logic beyond schema (no order creation logic in Order model)
✓ Model does:           Schema definition, indexes, pre/post hooks, instance methods

✗ NEVER in route:       Logic of any kind
✓ Route does:           Wire method + path + [middleware] + controller
```

---

## 3. API Module Breakdown

### Module: Auth (`/api/v1/auth`)

```
POST   /register          Public       Create new customer account
POST   /login             Public       Login, return access token + set refresh cookie
POST   /logout            Auth         Clear refresh token from DB and cookie
POST   /refresh            Public       Exchange refresh cookie for new access token
GET    /me                Auth         Return current user profile
```

**Validators**:
```
register:  { name: min 2, email: valid email, password: min 8 + complexity }
login:     { email: valid email, password: string }
```

**Rate limiting**: 5 requests/minute on `/login` and `/register`

---

### Module: Products (`/api/v1/products`)

```
GET    /                  Public       List products (paginated, filterable, searchable)
GET    /:slug             Public       Get single product by slug
POST   /                  Admin        Create product
PUT    /:id               Admin        Update product
DELETE /:id               Admin        Soft-delete product (isActive = false)
GET    /categories        Public       List distinct categories
```

**Query params for listing**:
```
?page=1
&limit=12
&category=electronics
&search=wireless
&sort=price_asc | price_desc | newest | rating
&minPrice=100
&maxPrice=5000
```

**Validators**:
```
create/update: {
  name: min 3, description: min 10, price: positive number,
  compareAtPrice: optional positive, images: array of URLs min 1,
  category: string, stock: non-negative int, sku: string
}

query: {
  page: optional positive int, limit: optional 1-50,
  category: optional string, search: optional string,
  sort: optional enum, minPrice: optional, maxPrice: optional
}
```

---

### Module: Cart (`/api/v1/cart`)

```
GET    /                  Auth         Get user's cart with populated products
POST   /items             Auth         Add item to cart
PUT    /items/:productId  Auth         Update item quantity
DELETE /items/:productId  Auth         Remove item from cart
DELETE /                  Auth         Clear entire cart
```

**Validators**:
```
addItem:     { productId: valid ObjectId, quantity: positive int }
updateItem:  { quantity: positive int }
```

---

### Module: Orders (`/api/v1/orders`)

```
POST   /                  Auth         Create order from current cart
GET    /                  Auth         List user's orders (paginated)
GET    /:id               Auth         Get order detail (owner only)
PUT    /:id/cancel        Auth         Cancel order (only if pending)
```

**Validators**:
```
create: {
  shippingAddress: { fullName, phone, street, city, state, postalCode, country },
  paymentMethod: "cod" | "card"
}
```

---

### Module: Reviews (`/api/v1/reviews`)

```
GET    /product/:productId   Public    List reviews for a product
GET    /eligibility/:orderId Auth      Check which products user can review
POST   /                     Auth      Submit review (IPFS + blockchain)
GET    /:id/verify           Public    Verify review on-chain
```

**Validators**:
```
submit: {
  productId: valid ObjectId, orderId: valid ObjectId,
  rating: 1-5 int, title: min 3 max 100, content: min 10 max 2000
}
```

---

### Module: Admin (`/api/v1/admin`)

```
GET    /dashboard            Admin     Dashboard stats (aggregation)
GET    /orders               Admin     List all orders (paginated, filterable)
GET    /orders/:id           Admin     Get any order detail
PUT    /orders/:id/status    Admin     Update order status (next step only)
POST   /orders/:id/delivery  Admin     Push delivery update
GET    /users                Admin     List all users (paginated)
PUT    /users/:id/role       Admin     Change user role
PUT    /users/:id/deactivate Admin     Deactivate user
GET    /reviews              Admin     List all reviews
```

**Validators**:
```
updateStatus: { status: valid next status in pipeline }
deliveryUpdate: { message: string, location: optional string }
roleChange: { role: "customer" | "admin" }
```

---

## 4. Service Layer Plan

Each service is a plain TypeScript module exporting async functions. No classes. No singletons. Stateless.

### `auth.service.ts`

```
Functions:
  registerUser(data)         → Validate uniqueness → hash password → create user → generate tokens
  loginUser(email, password) → Find user → compare password → generate tokens → save refresh
  logoutUser(userId)         → Clear refresh token from DB
  refreshAccessToken(token)  → Verify refresh token → find user → generate new access token
  getCurrentUser(userId)     → Find user → return public fields

Internal helpers:
  generateAccessToken(payload)   → jwt.sign with access secret, 15min
  generateRefreshToken(payload)  → jwt.sign with refresh secret, 7d
  hashPassword(plain)            → bcrypt.hash, 12 rounds
  comparePassword(plain, hashed) → bcrypt.compare
```

### `product.service.ts`

```
Functions:
  listProducts(query)        → Build filter/sort/pagination → Product.find → return with pagination meta
  getProductBySlug(slug)     → Product.findOne → throw 404 if not found
  createProduct(data)        → Generate slug → Product.create
  updateProduct(id, data)    → Re-slug if name changed → Product.findByIdAndUpdate
  deleteProduct(id)          → Product.findByIdAndUpdate({ isActive: false })
  getCategories()            → Product.distinct("category", { isActive: true })

Slug generation:
  name "Wireless Headphones Pro" → slug "wireless-headphones-pro"
  If duplicate: append random 4-char suffix "wireless-headphones-pro-x7k2"
```

### `cart.service.ts`

```
Functions:
  getCart(userId)             → Cart.findOne.populate("items.product") → create empty if none
  addItem(userId, productId, qty)  → Check stock → upsert item → recalculate total
  updateItemQuantity(userId, productId, qty) → Check stock → update → recalculate
  removeItem(userId, productId)    → Pull item → recalculate
  clearCart(userId)           → Set items to [] → total to 0

Total calculation:
  items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  Run on every mutation via a helper, not a pre-save hook (explicit > magic)
```

### `order.service.ts`

```
Functions:
  createOrder(userId, shippingAddress, paymentMethod)
    → Get cart → validate not empty
    → Validate stock for each item
    → Snapshot items (copy name, price, image — don't reference)
    → Decrement stock for each product
    → Calculate subtotal + shipping (flat Rs. 100 or free over Rs. 2000) + tax (13%)
    → Create order with status "pending", paymentStatus "paid" (simulated)
    → Clear user's cart
    → Return order

  getUserOrders(userId, page, limit)
    → Order.find({ user: userId }).sort("-createdAt").paginate

  getOrderById(orderId, userId)
    → Find order → verify owner (or admin) → populate items

  cancelOrder(orderId, userId)
    → Find order → verify owner → verify status is "pending"
    → Set status to "cancelled"
    → Restore stock for each item

  updateOrderStatus(orderId, newStatus)      [ADMIN]
    → Find order → validate status transition → update
    → If newStatus === "delivered": set deliveredAt = now

  pushDeliveryUpdate(orderId, message, location)  [ADMIN]
    → Find order → push to deliveryUpdates array

Order number generation:
  "KNM" + timestamp(base36) + random(4 chars) → "KNM-LX7K2-4F9A"
```

### `review.service.ts`

```
Functions:
  checkEligibility(userId, orderId)
    → Find order → verify user owns it → verify status "delivered"
    → Find existing reviews by this user for this order
    → Return list of products with { productId, name, canReview, existingReview? }

  submitReview(userId, data: { productId, orderId, rating, title, content })
    → Verify eligibility (throws if not eligible)
    → Construct review JSON payload
    → Upload to IPFS → get CID
    → Hash content → submit proof to blockchain → get txHash, blockNumber
    → Create Review document in MongoDB
    → Update Product averageRating and reviewCount (recalculate)
    → Return review with proof data

  getProductReviews(productId, page, limit, sort)
    → Review.find.populate("user", "name avatar").sort.paginate

  verifyReview(reviewId)
    → Find review in DB
    → Fetch content from IPFS by CID
    → Hash fetched content → compare with stored contentHash
    → Query blockchain contract → verify proof exists
    → Return verification result with all checks

Rating recalculation:
  After new review: aggregate pipeline
    → $match product → $group avg rating, count → update Product
```

### `ipfs.service.ts`

```
Functions:
  uploadJSON(data: object)    → POST to Pinata pinJSONToIPFS → return CID (IpfsHash)
  fetchJSON(cid: string)      → GET from Pinata gateway → return parsed JSON
  hashContent(content: string) → SHA-256 hash → return hex string

Pinata API:
  Base URL: https://api.pinata.cloud
  Auth: API Key + Secret in headers
  Upload: POST /pinning/pinJSONToIPFS
  Fetch: GET https://gateway.pinata.cloud/ipfs/{CID}

Error handling:
  Wrap all Pinata calls in try/catch
  If upload fails → throw ApiError(502, "IPFS upload failed")
  If fetch fails → throw ApiError(502, "IPFS content unavailable")
```

### `blockchain.service.ts`

```
Functions:
  submitReviewProof(data)
    → Connect to contract via ethers.js
    → Call contract.submitProof(reviewId, reviewer, productHash, orderHash, ipfsCID, contentHash)
    → Wait for transaction receipt
    → Return { txHash, blockNumber, contractAddress }

  getReviewProof(reviewId)
    → Call contract.getProof(reviewId)
    → Return proof struct data

  verifyReviewProof(reviewId)
    → Call contract.verifyProof(reviewId)
    → Return boolean

Connection:
  Provider: new ethers.JsonRpcProvider(BLOCKCHAIN_RPC_URL)
  Signer: new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider)
  Contract: new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)

Error handling:
  If contract call fails → throw ApiError(502, "Blockchain transaction failed")
  If contract not deployed → throw ApiError(503, "Blockchain service unavailable")
```

### `admin.service.ts`

```
Functions:
  getDashboardStats()
    → Parallel aggregation queries:
      - Order.countDocuments
      - Order.aggregate (sum totalAmount for revenue)
      - User.countDocuments
      - Product.countDocuments({ isActive: true })
      - Order.aggregate (last 30 days grouped by date for chart)
    → Return all stats

  getRecentOrders(limit: 7)
    → Order.find().sort("-createdAt").limit.populate("user", "name email")

  getAllUsers(page, limit)
    → User.find().sort("-createdAt").paginate

  changeUserRole(userId, newRole)
    → Find user → update role → return

  deactivateUser(userId)
    → Find user → set isVerified to false → return
```

---

## 5. Database Layer Plan

### Collections

```
┌──────────────────────────────────────────────────────────────┐
│  users                                                        │
├──────────────────────────────────────────────────────────────┤
│  _id            ObjectId     Primary key                      │
│  name           String       Required, min 2, max 50          │
│  email          String       Required, unique, lowercase       │
│  password       String       Required, min 8 (stored hashed)  │
│  role           String       "customer" | "admin", default "customer" │
│  avatar         String       Optional URL                     │
│  isVerified     Boolean      Default true (no email verify flow) │
│  refreshToken   String       Current valid refresh token      │
│  createdAt      Date         Auto (timestamps: true)          │
│  updatedAt      Date         Auto                             │
├──────────────────────────────────────────────────────────────┤
│  INDEXES:                                                     │
│    { email: 1 }              unique                           │
│  HOOKS:                                                       │
│    pre("save")               hash password if modified        │
│  METHODS:                                                     │
│    comparePassword(plain)    bcrypt compare                   │
│  TRANSFORM:                                                   │
│    toJSON: remove password, refreshToken, __v                 │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  products                                                     │
├──────────────────────────────────────────────────────────────┤
│  _id              ObjectId     Primary key                    │
│  name             String       Required, min 3                │
│  slug             String       Required, unique               │
│  description      String       Required, min 10               │
│  price            Number       Required, min 0                │
│  compareAtPrice   Number       Optional, must be > price      │
│  images           [String]     Required, min 1 URL            │
│  category         String       Required                       │
│  tags             [String]     Default []                     │
│  stock            Number       Required, min 0, integer       │
│  sku              String       Required, unique               │
│  isActive         Boolean      Default true                   │
│  averageRating    Number       Default 0, min 0, max 5        │
│  reviewCount      Number       Default 0                      │
│  createdAt        Date         Auto                           │
│  updatedAt        Date         Auto                           │
├──────────────────────────────────────────────────────────────┤
│  INDEXES:                                                     │
│    { slug: 1 }                unique                          │
│    { sku: 1 }                 unique                          │
│    { category: 1 }            for filtering                   │
│    { name: "text", description: "text" }  for search          │
│    { isActive: 1, createdAt: -1 }         for listing         │
│    { isActive: 1, price: 1 }              for price sort      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  carts                                                        │
├──────────────────────────────────────────────────────────────┤
│  _id            ObjectId     Primary key                      │
│  user            ObjectId     Ref → users, unique (one cart)   │
│  items           [{                                           │
│    product        ObjectId     Ref → products                  │
│    quantity       Number       min 1                           │
│    price          Number       Snapshot at time of add         │
│  }]                                                           │
│  totalAmount     Number       Calculated sum                  │
│  createdAt       Date         Auto                            │
│  updatedAt       Date         Auto                            │
├──────────────────────────────────────────────────────────────┤
│  INDEXES:                                                     │
│    { user: 1 }                unique (one cart per user)       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  orders                                                       │
├──────────────────────────────────────────────────────────────┤
│  _id               ObjectId     Primary key                   │
│  orderNumber       String       Unique, "KNM-XXXXX-XXXX"      │
│  user              ObjectId     Ref → users                    │
│  items             [{                                          │
│    product          ObjectId     Ref → products                │
│    name             String       Snapshot                      │
│    quantity         Number                                     │
│    price            Number       Snapshot                      │
│    image            String       Snapshot                      │
│  }]                                                           │
│  shippingAddress   {                                          │
│    fullName         String                                    │
│    phone            String                                    │
│    street           String                                    │
│    city             String                                    │
│    state            String                                    │
│    postalCode       String                                    │
│    country          String                                    │
│  }                                                            │
│  subtotal          Number                                     │
│  shippingCost      Number       Rs. 100 or 0 if over 2000     │
│  tax               Number       13% of subtotal               │
│  totalAmount       Number       subtotal + shipping + tax      │
│  status            String       Enum of OrderStatus            │
│  paymentStatus     String       Enum of PaymentStatus          │
│  paymentMethod     String       "cod" | "card"                 │
│  deliveryUpdates   [{                                         │
│    status           String                                    │
│    message          String                                    │
│    timestamp        Date                                      │
│    location         String       Optional                     │
│  }]                                                           │
│  estimatedDelivery Date          Optional                     │
│  deliveredAt       Date          Set when status → delivered   │
│  createdAt         Date          Auto                         │
│  updatedAt         Date          Auto                         │
├──────────────────────────────────────────────────────────────┤
│  INDEXES:                                                     │
│    { orderNumber: 1 }          unique                         │
│    { user: 1, createdAt: -1 }  for user's order history       │
│    { status: 1 }               for admin filtering            │
│    { createdAt: -1 }           for admin listing              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  reviews                                                      │
├──────────────────────────────────────────────────────────────┤
│  _id               ObjectId     Primary key                   │
│  user              ObjectId     Ref → users                    │
│  product           ObjectId     Ref → products                 │
│  order             ObjectId     Ref → orders                   │
│  rating            Number       1-5, integer                   │
│  title             String       min 3, max 100                 │
│  content           String       min 10, max 2000               │
│  ipfsHash          String       IPFS CID                       │
│  blockchainTxHash  String       Ethereum tx hash               │
│  blockNumber       Number       Block number of tx             │
│  contractAddress   String       Contract address               │
│  isVerified        Boolean      Default true (has blockchain proof) │
│  createdAt         Date         Auto                           │
│  updatedAt         Date         Auto                           │
├──────────────────────────────────────────────────────────────┤
│  INDEXES:                                                      │
│    { user: 1, product: 1, order: 1 }  unique (one review per)  │
│    { product: 1, createdAt: -1 }      for product reviews list │
│    { user: 1 }                        for user's reviews       │
└──────────────────────────────────────────────────────────────┘
```

### Relationship Map

```
User ──1:1──► Cart
User ──1:N──► Order
User ──1:N──► Review
Product ──1:N──► Review
Order ──1:N──► Review (through items)
Order ──N:1──► User
Order.items ──N:1──► Product (snapshot, not live ref)
Cart.items ──N:1──► Product (live ref, populated)
```

### Data Integrity Rules

```
1. Order items are SNAPSHOTS — copy name, price, image at creation time.
   If product price changes later, existing orders are unaffected.

2. Cart items reference live products — price shown is always current.
   Cart.items.price is updated on each cart retrieval if product price changed.

3. Reviews enforce uniqueness: one review per (user, product, order) combo.
   This is a compound unique index, not application-level check only.

4. Stock is decremented atomically on order creation using $inc: { stock: -qty }.
   If stock goes below 0, Mongoose validation rejects (min: 0).

5. Order status transitions are validated:
   pending → confirmed → processing → shipped → out_for_delivery → delivered
   pending → cancelled (only from pending)
   No backwards movement. No skipping steps (except cancel).
```

---

## 6. Auth Strategy

### Flow

```
REGISTRATION:
  Client → POST /auth/register { name, email, password }
  Server → hash password → create user → generate tokens → set refresh cookie → return access token + user

LOGIN:
  Client → POST /auth/login { email, password }
  Server → find user → compare password → generate tokens → set refresh cookie → return access token + user

AUTHENTICATED REQUEST:
  Client → GET /orders (Authorization: Bearer <accessToken>)
  Server → verify JWT → attach user to req → proceed to controller

TOKEN REFRESH:
  Client access token expires (15min) →
  Axios interceptor catches 401 →
  POST /auth/refresh (refresh token sent automatically via httpOnly cookie) →
  Server verifies refresh token → finds user → generates new access token →
  Returns new access token → original request retried

LOGOUT:
  Client → POST /auth/logout
  Server → clear refreshToken in DB → clear refresh cookie
  Client → clear access token from memory → redirect to login
```

### Why this design

```
ACCESS TOKEN (short-lived, 15 minutes):
  - Stored in memory (Zustand store), NOT localStorage
  - Sent in Authorization header
  - Stateless verification (no DB lookup needed)
  - Short expiry limits damage if stolen

REFRESH TOKEN (long-lived, 7 days):
  - Stored in httpOnly, Secure, SameSite=Strict cookie
  - Also stored in user document in DB (for invalidation)
  - NOT accessible from JavaScript (XSS-proof)
  - Used only for one purpose: getting a new access token
  - Server-side validation: compare cookie token with DB stored token

WHY NOT localStorage for access token:
  - XSS can read localStorage → token theft
  - Memory is cleared on page close → forces re-auth or refresh

WHY refresh token in DB:
  - Allows server-side invalidation (logout kills the token)
  - Allows single-device enforcement if needed
  - If refresh token is stolen, user can log out to kill it
```

---

## 7. Token Strategy

### JWT Payload

```typescript
// Access Token Payload
{
  userId: string       // MongoDB ObjectId as string
  role: "customer" | "admin"
  iat: number          // Issued at (auto)
  exp: number          // Expires at (auto)
}

// Refresh Token Payload
{
  userId: string
  iat: number
  exp: number
}
```

### Token Configuration

```
ACCESS TOKEN:
  Secret:     JWT_ACCESS_SECRET (env, min 64 chars)
  Expiry:     15 minutes
  Algorithm:  HS256 (default)
  Storage:    Client memory (Zustand)
  Transport:  Authorization: Bearer <token>

REFRESH TOKEN:
  Secret:     JWT_REFRESH_SECRET (env, different from access, min 64 chars)
  Expiry:     7 days
  Algorithm:  HS256
  Storage:    httpOnly cookie + user.refreshToken in MongoDB
  Transport:  Cookie (automatic)

COOKIE CONFIG:
  Name:       kinmel_refresh
  httpOnly:   true
  secure:     true (in production), false (in development)
  sameSite:   "strict"
  maxAge:     7 * 24 * 60 * 60 * 1000 (7 days in ms)
  path:       "/api/v1/auth" (only sent to auth endpoints)
```

### Refresh Flow (Axios Interceptor)

```
1. Request fails with 401
2. Check: is a refresh already in progress? (prevent race condition)
   - If yes: queue this request, resolve when refresh completes
   - If no: set refreshing flag
3. POST /auth/refresh (cookie sent automatically)
4. Receive new access token
5. Update Zustand store with new token
6. Retry original request with new token
7. Resolve any queued requests
8. If refresh fails (refresh token expired): clear auth state → redirect to /login
```

---

## 8. File Upload / Storage Strategy

### v1 Approach: URL-Based Images

```
WHY:
  - File upload adds complexity (multer, cloud storage, presigned URLs)
  - For a final-year project, URL-based images are practical
  - Products use publicly available image URLs (Unsplash, placeholder services)
  - Keeps the scope manageable while maintaining visual quality

HOW:
  - Product.images is an array of URL strings
  - Admin enters image URLs in product form
  - Frontend renders URLs via next/image with proper domains in next.config
  - Seed script uses curated Unsplash URLs for realistic products

NEXT.CONFIG DOMAINS:
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "plus.unsplash.com" },
      { hostname: "via.placeholder.com" }
    ]
  }
```

### Future Enhancement (Not v1)

```
If file upload is added later:
  - Use multer middleware for multipart/form-data
  - Upload to Cloudinary (free tier: 25GB)
  - Store returned Cloudinary URL in product.images
  - Add image optimization transforms in Cloudinary URL params
```

---

## 9. IPFS Integration Strategy

### Provider: Pinata

```
WHY PINATA:
  - Managed IPFS pinning service
  - Free tier: 500 uploads, 1GB storage
  - Simple REST API (no running an IPFS node)
  - Reliable gateway for retrieval
  - Well-documented

ALTERNATIVE CONSIDERED:
  - Self-hosted IPFS node → too complex for scope
  - NFT.Storage → shutting down free tier
  - Web3.Storage → API changes frequently
```

### Integration Architecture

```
┌─────────────┐                    ┌──────────────┐
│ review      │  1. Upload JSON    │              │
│ .service.ts │ ─────────────────► │   Pinata     │
│             │                    │   API        │
│             │  2. Return CID     │              │
│             │ ◄───────────────── │              │
└──────┬──────┘                    └──────────────┘
       │
       │  3. CID stored in
       │     Review document
       ▼
┌──────────────┐
│  MongoDB     │
│  reviews     │
│  .ipfsHash   │
└──────────────┘
```

### What gets stored on IPFS

```json
{
  "version": "1.0",
  "platform": "kinmel",
  "reviewer": "user_id_string",
  "product": "product_id_string",
  "order": "order_id_string",
  "rating": 5,
  "title": "Amazing quality",
  "content": "This product exceeded my expectations...",
  "timestamp": 1709913600,
  "contentHash": "sha256_of_title_and_content"
}
```

### IPFS Service API

```
UPLOAD:
  POST https://api.pinata.cloud/pinning/pinJSONToIPFS
  Headers:
    pinata_api_key: PINATA_API_KEY
    pinata_secret_api_key: PINATA_SECRET_KEY
    Content-Type: application/json
  Body:
    {
      pinataContent: { ...review JSON },
      pinataMetadata: { name: "kinmel-review-{reviewId}" }
    }
  Response:
    { IpfsHash: "Qm...", PinSize: 234, Timestamp: "..." }

FETCH:
  GET https://{PINATA_GATEWAY}/ipfs/{CID}
  Returns: original JSON

ERROR HANDLING:
  - 401: Invalid API keys → throw config error
  - 429: Rate limited → retry with exponential backoff (max 3 retries)
  - 500: Pinata down → throw ApiError(502, "IPFS service unavailable")
  - Timeout (10s): throw ApiError(504, "IPFS upload timed out")
```

### Content Hashing

```
WHAT:    SHA-256 hash of the review title + content concatenated
WHY:     Allows verification that IPFS content hasn't been tampered with
HOW:     crypto.createHash("sha256").update(title + content).digest("hex")
WHERE:   Computed before upload, stored on IPFS AND on blockchain
VERIFY:  Fetch from IPFS → recompute hash → compare with on-chain hash
```

---

## 10. Blockchain Integration Strategy

### Network: Hardhat Local

```
WHY LOCAL:
  - No gas costs
  - Instant transactions (no waiting for blocks)
  - 20 pre-funded accounts
  - Deterministic environment for demos
  - No testnet faucet issues

LIMITATION:
  - State resets on node restart
  - Must redeploy contract each time
  - Solution: deploy script + seed script for demos
```

### Smart Contract: `ReviewVerification.sol`

```
LANGUAGE:     Solidity 0.8.24
COMPILER:     Hardhat with optimizer (200 runs)
SIZE:         ~80 lines (deliberately simple)

STORAGE:
  mapping(bytes32 => ReviewProof) public proofs;
  uint256 public reviewCount;

STRUCT:
  struct ReviewProof {
    address reviewer;        // Wallet address representing the reviewer
    bytes32 productHash;     // keccak256(productId)
    bytes32 orderHash;       // keccak256(orderId)
    string  ipfsCID;         // IPFS content identifier
    bytes32 contentHash;     // SHA-256 of review content
    uint256 timestamp;       // Block timestamp when submitted
    bool    exists;          // Existence flag for verification
  }

FUNCTIONS:
  submitProof(
    bytes32 _reviewId,
    address _reviewer,
    bytes32 _productHash,
    bytes32 _orderHash,
    string  _ipfsCID,
    bytes32 _contentHash
  ) external onlyOwner
    → Store proof → increment count → emit event

  getProof(bytes32 _reviewId) external view
    → Return proof struct

  verifyProof(bytes32 _reviewId) external view returns (bool)
    → Return proofs[_reviewId].exists

EVENTS:
  event ReviewSubmitted(
    bytes32 indexed reviewId,
    address indexed reviewer,
    bytes32 productHash,
    string  ipfsCID,
    uint256 timestamp
  );

ACCESS CONTROL:
  onlyOwner modifier on submitProof
  → Only the backend (deployer wallet) can submit proofs
  → Prevents unauthorized proof submission
  → Read functions (getProof, verifyProof) are public
```

### Backend Integration via ethers.js

```
LIBRARY:      ethers v6
CONNECTION:   JsonRpcProvider → Wallet (signer) → Contract instance

FLOW:
  1. On server start: initialize provider, signer, contract
  2. On review submit: call contract.submitProof(...)
  3. Wait for tx.wait() → get receipt
  4. Extract txHash, blockNumber from receipt
  5. Store in Review document

KEY CONSIDERATIONS:
  - reviewId for contract: keccak256(MongoDB ObjectId) → bytes32
  - productHash: keccak256(productId string) → bytes32
  - orderHash: keccak256(orderId string) → bytes32
  - These hashes prevent exposing MongoDB IDs on-chain

GAS:
  - Not a concern on local Hardhat (unlimited gas)
  - submitProof estimated: ~80,000 gas per call
```

### Contract Deployment

```
SCRIPT: smart-contracts/scripts/deploy.ts

Steps:
  1. Get deployer account (first Hardhat account)
  2. Deploy ReviewVerification contract
  3. Log contract address
  4. Save address to backend/.env or a config file

Commands:
  Terminal 1: cd blockchain && npx hardhat node
  Terminal 2: cd blockchain && npx hardhat run scripts/deploy.ts --network localhost
```

---

## 11. Logging Strategy

### Approach: Structured Console Logging

```
WHY NOT Winston/Pino:
  - Overhead for a project that doesn't need log rotation or file output
  - Console output is sufficient for development and demo
  - Can upgrade later if needed

WHAT WE USE:
  - morgan: HTTP request logging (method, URL, status, response time)
  - Custom logger utility: structured app-level logging
```

### Logger Utility (`utils/logger.ts`)

```
LEVELS:
  info     → Normal operations (server start, DB connected, order created)
  warn     → Recoverable issues (rate limit hit, stock low, retry)
  error    → Failures (DB error, IPFS failed, unhandled exception)
  debug    → Dev-only details (query params, token payload)

FORMAT:
  [TIMESTAMP] [LEVEL] [CONTEXT] message { optional data }

EXAMPLES:
  [2026-03-09T14:30:00Z] [INFO]  [AUTH]     User registered: user@email.com
  [2026-03-09T14:30:01Z] [INFO]  [ORDER]    Order created: KNM-LX7K2-4F9A
  [2026-03-09T14:30:02Z] [INFO]  [IPFS]     Review uploaded: QmX7b5jx...
  [2026-03-09T14:30:03Z] [INFO]  [CHAIN]    Proof submitted: 0xabc123... (block 42)
  [2026-03-09T14:30:05Z] [ERROR] [IPFS]     Upload failed: timeout after 10s { reviewId: "..." }
  [2026-03-09T14:30:10Z] [WARN]  [STOCK]    Low stock: "Wireless Headphones" (3 remaining)

RULES:
  - Never log passwords, tokens, or full credit card numbers
  - Always log: user actions, order events, blockchain transactions, errors
  - Debug level disabled in production (NODE_ENV check)
  - morgan format: "dev" in development, "combined" in production
```

### Morgan Configuration

```
Development:  morgan("dev")
              → :method :url :status :response-time ms

Production:   morgan("combined")
              → Standard Apache combined log format

Skip:         Health check endpoint (/api/v1/health) excluded from logging
```

---

## 12. Error Handling Strategy

### Custom Error Class

```
ApiError extends Error:
  statusCode: number     (400, 401, 403, 404, 409, 422, 500, 502, 503)
  message: string        (human-readable)
  errors?: object[]      (validation error details)
  isOperational: boolean (true = expected error, false = bug)

Factory methods:
  ApiError.badRequest(message)         → 400
  ApiError.unauthorized(message)       → 401
  ApiError.forbidden(message)          → 403
  ApiError.notFound(resource)          → 404
  ApiError.conflict(message)           → 409
  ApiError.validationError(errors)     → 422
  ApiError.internal(message)           → 500
```

### Error Response Format

```json
{
  "success": false,
  "message": "Product not found",
  "error": "NOT_FOUND",
  "statusCode": 404
}

// Validation errors include field details:
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "statusCode": 422,
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

### Error Flow

```
1. Service throws ApiError (or any Error)
         │
         ▼
2. asyncHandler catches it (no try/catch needed in controller)
         │
         ▼
3. Global error-handler middleware receives it
         │
         ├── Is ApiError? → send { success: false, message, statusCode }
         │
         ├── Is Mongoose ValidationError? → transform to 422 with field errors
         │
         ├── Is Mongoose CastError? → transform to 400 "Invalid ID format"
         │
         ├── Is JWT Error? → transform to 401 "Invalid or expired token"
         │
         ├── Is duplicate key (code 11000)? → transform to 409 "Already exists"
         │
         └── Unknown error? → log full stack → send 500 "Internal server error"
                              (never expose stack trace to client)
```

### asyncHandler Pattern

```
PURPOSE:
  Wraps async controller functions so thrown errors automatically
  pass to Express error middleware via next(error).

  Without it: every controller needs try/catch.
  With it: controllers just throw, errors are caught automatically.

USAGE:
  router.get("/products", asyncHandler(productController.list))

  // Controller can just throw:
  const list = async (req, res) => {
    const products = await productService.list(req.query)
    res.json({ success: true, data: products })
    // If productService.list throws, asyncHandler catches it
  }
```

---

## 13. Environment Configuration Strategy

### Environment Variables

```
# ──── Server ────
NODE_ENV=development              # development | production | test
PORT=5000                         # Server port

# ──── MongoDB ────
MONGODB_URI=mongodb://localhost:27017/kinmel

# ──── JWT ────
JWT_ACCESS_SECRET=                # Min 64 chars, random
JWT_REFRESH_SECRET=               # Min 64 chars, random, DIFFERENT from access
JWT_ACCESS_EXPIRY=15m             # Access token lifetime
JWT_REFRESH_EXPIRY=7d             # Refresh token lifetime

# ──── CORS ────
CLIENT_URL=http://localhost:3000  # Allowed origin

# ──── IPFS (Pinata) ────
PINATA_API_KEY=                   # From Pinata dashboard
PINATA_SECRET_KEY=                # From Pinata dashboard
PINATA_GATEWAY=gateway.pinata.cloud  # Or custom gateway

# ──── Blockchain ────
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545  # Hardhat node
REVIEW_CONTRACT_ADDRESS=          # Set after deployment
DEPLOYER_PRIVATE_KEY=             # First Hardhat account private key
```

### Validation on Startup (`config/env.ts`)

```
STRATEGY:
  Use Zod to parse and validate ALL env vars on server start.
  If any required var is missing or invalid → crash immediately with clear error.
  Don't let the server start in a broken state.

SCHEMA:
  NODE_ENV:               z.enum(["development", "production", "test"])
  PORT:                   z.coerce.number().default(5000)
  MONGODB_URI:            z.string().url()
  JWT_ACCESS_SECRET:      z.string().min(32)
  JWT_REFRESH_SECRET:     z.string().min(32)
  JWT_ACCESS_EXPIRY:      z.string().default("15m")
  JWT_REFRESH_EXPIRY:     z.string().default("7d")
  CLIENT_URL:             z.string().url()
  PINATA_API_KEY:         z.string().optional()     # Optional: reviews work without it
  PINATA_SECRET_KEY:      z.string().optional()
  PINATA_GATEWAY:         z.string().default("gateway.pinata.cloud")
  BLOCKCHAIN_RPC_URL:     z.string().default("http://127.0.0.1:8545")
  REVIEW_CONTRACT_ADDRESS: z.string().optional()    # Optional until contract deployed
  DEPLOYER_PRIVATE_KEY:   z.string().optional()

RESULT:
  Export typed `env` object used everywhere:
    import { env } from "@/config/env"
    env.PORT          // number, guaranteed valid
    env.MONGODB_URI   // string, guaranteed valid URL

WHY OPTIONAL for IPFS/Blockchain:
  Server should start even without blockchain config.
  Reviews module gracefully degrades: "Blockchain service not configured"
  This allows building modules 1-7 without Pinata/Hardhat setup.
```

### File Hierarchy

```
.env.example     → Committed. Template with all vars, no real values.
.env             → NOT committed. Local development values.
config/env.ts    → Committed. Zod schema + validation + typed export.
```

### Frontend Environment

```
frontend/.env.local (NOT committed):
  NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

Usage:
  Referenced via a constants file, not directly:
    lib/constants.ts → export const API_URL = process.env.NEXT_PUBLIC_API_URL

WHY:
  - Single place to change API URL
  - TypeScript can verify the constant exists
  - No process.env scattered across components
```

---

## Summary: Architecture at a Glance

```
┌──────────────────────────────────────────────────────────────────────┐
│                           KINMEL STACK                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CLIENT (Next.js 14, App Router)                                     │
│  ├── UI: shadcn/ui + Tailwind CSS + Framer Motion                    │
│  ├── State: Zustand (auth, cart) + TanStack Query (server state)     │
│  ├── Forms: react-hook-form + Zod                                    │
│  ├── HTTP: Axios with interceptors (auto token refresh)              │
│  └── Routing: App Router with (auth), (shop), admin groups           │
│                                                                      │
│  ──── HTTPS / REST API ────                                          │
│                                                                      │
│  SERVER (Express 4, TypeScript)                                      │
│  ├── Architecture: Route → Controller → Service → Model              │
│  ├── Auth: JWT access (memory) + refresh (httpOnly cookie) + RBAC    │
│  ├── Validation: Zod middleware on every mutating endpoint            │
│  ├── Errors: ApiError class + global handler + asyncHandler           │
│  ├── Logging: morgan (HTTP) + custom logger (app events)             │
│  └── Security: helmet, CORS, rate limiting, input validation         │
│                                                                      │
│  ──── DATA LAYER ────                                                │
│                                                                      │
│  MongoDB (Mongoose 8)                                                │
│  ├── Collections: users, products, carts, orders, reviews            │
│  ├── Indexes: compound, text search, unique constraints              │
│  └── Integrity: snapshots for orders, atomic stock updates           │
│                                                                      │
│  IPFS (Pinata)                                                       │
│  ├── Stores: review content as immutable JSON                        │
│  ├── Returns: CID (content identifier) for retrieval                 │
│  └── Verifies: content hasn't changed since submission               │
│                                                                      │
│  Blockchain (Hardhat Local)                                          │
│  ├── Contract: ReviewVerification.sol (~80 lines)                    │
│  ├── Stores: proof struct (hashes, CID, timestamp)                   │
│  ├── Verifies: proof exists and data matches                         │
│  └── Integration: ethers.js v6 from backend service                  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

*This technical architecture is the implementation blueprint. Every file, every pattern, every strategy is defined. Build exactly this.*
