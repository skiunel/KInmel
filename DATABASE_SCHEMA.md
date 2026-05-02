# Kinmel — MongoDB Schema Design

> Complete database blueprint. Every collection, field, index, and constraint.
> This is the source of truth before writing Mongoose models.

---

## Schema Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        12 COLLECTIONS                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CORE ENTITIES           TRANSACTIONAL            BLOCKCHAIN       │
│  ──────────────          ─────────────            ──────────       │
│  users                   carts                    reviews          │
│  products                orders                   blockchain_proofs│
│  categories              delivery_records                          │
│                          sdc_records              SYSTEM           │
│                                                   ──────           │
│                                                   audit_logs       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Relationship Map

```
users ──1:1──► carts
users ──1:N──► orders
users ──1:N──► reviews
users ──1:N──► audit_logs (admin actions)

products ──N:1──► categories
products ──1:N──► reviews

orders ──N:1──► users
orders ──1:N──► delivery_records
orders ──1:1──► sdc_records (created on delivery)

reviews ──N:1──► users
reviews ──N:1──► products
reviews ──N:1──► orders
reviews ──1:1──► blockchain_proofs
reviews ──1:1──► sdc_records (eligibility source)

carts ──1:1──► users
carts.items ──N:1──► products (live reference)
orders.items ──N:1──► products (snapshot, not live)
```

---

## Collection 1: `users`

### Purpose
Stores all user accounts — customers and admins. Handles authentication credentials and profile data.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | Auto | Primary key |
| `name` | String | Yes | — | Display name |
| `email` | String | Yes | — | Login identifier, unique |
| `password` | String | Yes | — | bcrypt hashed, never returned in queries |
| `role` | String | Yes | `"customer"` | RBAC role |
| `avatar` | String | No | `null` | Profile image URL |
| `phone` | String | No | `null` | Contact number |
| `isActive` | Boolean | Yes | `true` | Soft deactivation flag |
| `refreshToken` | String | No | `null` | Current valid JWT refresh token |
| `lastLoginAt` | Date | No | `null` | Updated on each login |
| `createdAt` | Date | Auto | Auto | Mongoose timestamps |
| `updatedAt` | Date | Auto | Auto | Mongoose timestamps |

### Enums

```
role: ["customer", "admin"]
```

### Validation Rules

```
name:
  - type: String
  - required: true
  - trim: true
  - minlength: 2
  - maxlength: 50

email:
  - type: String
  - required: true
  - unique: true
  - lowercase: true
  - trim: true
  - match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/

password:
  - type: String
  - required: true
  - minlength: 8
  - select: false (excluded from queries by default)

role:
  - type: String
  - enum: ["customer", "admin"]
  - default: "customer"

phone:
  - type: String
  - match: /^\+?[\d\s-]{7,15}$/ (optional, validated if provided)
```

### Indexes

```
{ email: 1 }                    unique: true       (login lookup)
{ role: 1, createdAt: -1 }                         (admin user listing)
{ isActive: 1 }                                    (active user filtering)
```

### Hooks

```
pre("save"):
  - If password field is modified → hash with bcrypt (12 rounds)
  - Prevents re-hashing on profile updates that don't change password
```

### Instance Methods

```
comparePassword(candidatePassword: string): Promise<boolean>
  → bcrypt.compare(candidate, this.password)

toPublicJSON(): IUserPublic
  → Returns { _id, name, email, role, avatar, createdAt }
  → Strips password, refreshToken, __v
```

### toJSON Transform

```
Remove: password, refreshToken, __v
Always applied when document is serialized to JSON
```

### Security Considerations

```
- password: select: false → never included in find() results unless explicitly requested
- refreshToken: select: false → same treatment
- email stored lowercase to prevent duplicate accounts with case variations
- bcrypt with 12 salt rounds (balance of security and speed)
- Never return raw MongoDB errors to client (could expose field names)
- Rate limit registration and login endpoints to prevent brute force
- isActive flag for soft deactivation (preserves order history, prevents login)
```

---

## Collection 2: `categories`

### Purpose
Normalized product categories. Separated from products for consistent naming, display ordering, and potential future metadata (icons, images, descriptions).

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | Auto | Primary key |
| `name` | String | Yes | — | Display name ("Electronics", "Clothing") |
| `slug` | String | Yes | — | URL-safe identifier ("electronics") |
| `description` | String | No | `""` | Category description |
| `image` | String | No | `null` | Category banner/thumbnail URL |
| `isActive` | Boolean | Yes | `true` | Show/hide category |
| `displayOrder` | Number | Yes | `0` | Sort order on frontend |
| `productCount` | Number | Yes | `0` | Denormalized count for display |
| `createdAt` | Date | Auto | Auto | |
| `updatedAt` | Date | Auto | Auto | |

### Validation Rules

```
name:
  - required: true
  - trim: true
  - minlength: 2
  - maxlength: 50
  - unique: true

slug:
  - required: true
  - unique: true
  - lowercase: true
  - match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/

displayOrder:
  - min: 0
  - default: 0

productCount:
  - min: 0
  - default: 0
```

### Indexes

```
{ slug: 1 }                     unique: true       (URL lookup)
{ isActive: 1, displayOrder: 1 }                   (frontend listing sort)
{ name: 1 }                     unique: true       (prevent duplicates)
```

### Security Considerations

```
- Only admins can create/update/delete categories
- productCount is denormalized — updated when products are created/deleted/change category
- slug auto-generated from name if not provided, sanitized for URL safety
```

---

## Collection 3: `products`

### Purpose
Product catalog. Contains all product information, pricing, inventory, and denormalized review stats.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | Auto | Primary key |
| `name` | String | Yes | — | Product title |
| `slug` | String | Yes | — | URL identifier, unique |
| `description` | String | Yes | — | Full product description |
| `shortDescription` | String | No | `""` | Brief tagline (product cards) |
| `price` | Number | Yes | — | Current selling price (in Rs.) |
| `compareAtPrice` | Number | No | `null` | Original price before discount |
| `images` | [String] | Yes | — | Array of image URLs, min 1 |
| `category` | ObjectId | Yes | — | Ref → categories |
| `tags` | [String] | No | `[]` | Searchable tags |
| `sku` | String | Yes | — | Stock keeping unit, unique |
| `stock` | Number | Yes | — | Available inventory count |
| `lowStockThreshold` | Number | No | `5` | Warn when stock drops below |
| `isActive` | Boolean | Yes | `true` | Published/draft toggle |
| `isFeatured` | Boolean | No | `false` | Show on homepage |
| `averageRating` | Number | No | `0` | Denormalized from reviews |
| `reviewCount` | Number | No | `0` | Denormalized from reviews |
| `createdAt` | Date | Auto | Auto | |
| `updatedAt` | Date | Auto | Auto | |

### Validation Rules

```
name:
  - required: true
  - trim: true
  - minlength: 3
  - maxlength: 150

slug:
  - required: true
  - unique: true
  - lowercase: true

description:
  - required: true
  - minlength: 10
  - maxlength: 5000

price:
  - required: true
  - min: 0
  - Custom: must be a finite number (no Infinity, no NaN)

compareAtPrice:
  - optional
  - min: 0
  - Custom validator: if provided, must be > price

images:
  - type: [String]
  - required: true
  - validate: array length >= 1
  - Each URL: match basic URL pattern

category:
  - type: ObjectId
  - ref: "Category"
  - required: true

sku:
  - required: true
  - unique: true
  - uppercase: true
  - trim: true

stock:
  - required: true
  - min: 0
  - validate: must be integer (no decimals)

averageRating:
  - min: 0
  - max: 5
  - default: 0

reviewCount:
  - min: 0
  - default: 0
```

### Indexes

```
{ slug: 1 }                                unique: true    (product page lookup)
{ sku: 1 }                                unique: true    (inventory lookup)
{ category: 1, isActive: 1 }                              (category filtering)
{ isActive: 1, createdAt: -1 }                             (default listing sort)
{ isActive: 1, price: 1 }                                 (price ascending sort)
{ isActive: 1, price: -1 }                                (price descending sort)
{ isActive: 1, averageRating: -1 }                        (rating sort)
{ isActive: 1, isFeatured: 1 }                            (homepage featured)
{ name: "text", description: "text", tags: "text" }       (full-text search)
```

### Virtuals

```
isOnSale:
  → Returns true if compareAtPrice exists AND compareAtPrice > price

discountPercentage:
  → If isOnSale: Math.round((1 - price/compareAtPrice) * 100)
  → Else: 0

isLowStock:
  → Returns stock > 0 && stock <= lowStockThreshold

isOutOfStock:
  → Returns stock === 0
```

### Security Considerations

```
- Only admins can create/update/delete
- Soft delete via isActive = false (preserves order history references)
- Stock can never go below 0 (min: 0 validation + atomic $inc operations)
- averageRating and reviewCount are denormalized — recalculated on review submit
  (not user-editable, computed from aggregation pipeline)
- compareAtPrice cannot be less than price (prevents showing negative discounts)
- Text index supports weighted search: name (weight: 10), tags (5), description (1)
```

---

## Collection 4: `carts`

### Purpose
Server-side shopping cart. One cart per authenticated user. Items reference live products.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | Auto | Primary key |
| `user` | ObjectId | Yes | — | Ref → users, unique (one cart per user) |
| `items` | [CartItem] | No | `[]` | Array of cart items (subdocument) |
| `totalAmount` | Number | Yes | `0` | Calculated sum of items |
| `itemCount` | Number | Yes | `0` | Total quantity across all items |
| `createdAt` | Date | Auto | Auto | |
| `updatedAt` | Date | Auto | Auto | |

### Subdocument: `CartItem`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product` | ObjectId | Yes | Ref → products |
| `quantity` | Number | Yes | Number of units |
| `price` | Number | Yes | Price per unit at time of add (refreshed on cart retrieval) |

### Validation Rules

```
user:
  - type: ObjectId
  - ref: "User"
  - required: true
  - unique: true (enforced by index)

items.product:
  - type: ObjectId
  - ref: "Product"
  - required: true

items.quantity:
  - required: true
  - min: 1
  - max: 10 (prevent hoarding — configurable)
  - validate: must be integer

items.price:
  - required: true
  - min: 0

totalAmount:
  - min: 0
  - default: 0

itemCount:
  - min: 0
  - default: 0
```

### Indexes

```
{ user: 1 }                     unique: true       (one cart per user, fast lookup)
```

### Cart Total Calculation (Service-Level, Not Hook)

```
RECALCULATE after every mutation (add, update, remove):

  totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

WHY NOT a pre-save hook:
  - Explicit is better than implicit
  - Easier to test
  - Avoids save() overhead when only reading
```

### Price Refresh Strategy

```
ON CART RETRIEVAL (getCart):
  1. Populate items.product
  2. For each item, compare item.price with product.price
  3. If different → update item.price to current product.price
  4. If product no longer exists or isActive = false → remove from cart
  5. Recalculate totals
  6. Save if any changes were made

WHY:
  - Cart prices must always reflect current product pricing
  - Stale carts don't cause checkout surprises
  - Deleted/deactivated products auto-clean from cart
```

### Security Considerations

```
- Users can only access their own cart (service checks user match)
- Cart is created lazily (on first addItem, not on registration)
- Quantity max (10) prevents inventory hoarding
- Stock validation on add: if product.stock < requestedQty → reject
- Cart cleared after successful order creation (atomically)
```

---

## Collection 5: `orders`

### Purpose
Completed purchase records. Items are snapshots (not live references) to preserve historical accuracy.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | Auto | Primary key |
| `orderNumber` | String | Yes | — | Human-readable ID ("KNM-LX7K2-4F9A") |
| `user` | ObjectId | Yes | — | Ref → users |
| `items` | [OrderItem] | Yes | — | Snapshot of purchased items |
| `shippingAddress` | ShippingAddress | Yes | — | Delivery destination (embedded) |
| `subtotal` | Number | Yes | — | Sum of (item.price × item.quantity) |
| `shippingCost` | Number | Yes | — | Rs. 100 or 0 if subtotal ≥ 2000 |
| `taxRate` | Number | Yes | `0.13` | Tax percentage applied |
| `taxAmount` | Number | Yes | — | subtotal × taxRate |
| `totalAmount` | Number | Yes | — | subtotal + shippingCost + taxAmount |
| `status` | String | Yes | `"pending"` | Current order status |
| `paymentStatus` | String | Yes | `"pending"` | Payment state |
| `paymentMethod` | String | Yes | — | How user chose to pay |
| `notes` | String | No | `""` | Customer notes (optional) |
| `cancelledAt` | Date | No | `null` | When order was cancelled |
| `cancelReason` | String | No | `null` | Why order was cancelled |
| `createdAt` | Date | Auto | Auto | |
| `updatedAt` | Date | Auto | Auto | |

### Subdocument: `OrderItem`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product` | ObjectId | Yes | Ref → products (for linking, not for data) |
| `name` | String | Yes | SNAPSHOT — product name at purchase time |
| `price` | Number | Yes | SNAPSHOT — price per unit at purchase time |
| `quantity` | Number | Yes | Number of units |
| `image` | String | Yes | SNAPSHOT — product image URL at purchase time |
| `sku` | String | Yes | SNAPSHOT — product SKU at purchase time |

### Subdocument: `ShippingAddress`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | String | Yes | Recipient name |
| `phone` | String | Yes | Contact number |
| `street` | String | Yes | Street address |
| `city` | String | Yes | City |
| `state` | String | Yes | State/province |
| `postalCode` | String | Yes | ZIP/postal code |
| `country` | String | Yes | Country |

### Enums

```
status: [
  "pending",            // Order placed, awaiting confirmation
  "confirmed",          // Admin confirmed the order
  "processing",         // Order being prepared/packed
  "shipped",            // Handed to courier
  "out_for_delivery",   // Last mile delivery
  "delivered",          // Successfully delivered
  "cancelled",          // Cancelled (by customer or admin)
  "returned"            // Returned after delivery
]

paymentStatus: [
  "pending",            // Awaiting payment (for COD: until delivery)
  "paid",               // Payment received
  "failed",             // Payment failed
  "refunded"            // Payment refunded
]

paymentMethod: [
  "cod",                // Cash on delivery
  "card"                // Card payment (simulated)
]
```

### Validation Rules

```
orderNumber:
  - required: true
  - unique: true
  - Format: "KNM-" + 5 alphanumeric + "-" + 4 alphanumeric

items:
  - type: [OrderItem]
  - validate: array length >= 1 (can't have empty order)

items.price:
  - min: 0

items.quantity:
  - min: 1
  - validate: integer

shippingAddress.fullName:
  - required: true
  - minlength: 2

shippingAddress.phone:
  - required: true
  - match: /^\+?[\d\s-]{7,15}$/

shippingAddress.postalCode:
  - required: true

subtotal, shippingCost, taxAmount, totalAmount:
  - min: 0

taxRate:
  - min: 0
  - max: 1
  - default: 0.13

status:
  - enum validation
  - default: "pending"

paymentStatus:
  - enum validation
  - default: "pending"
```

### Status Transition Rules (Enforced in Service Layer)

```
VALID TRANSITIONS:
  pending          → confirmed, cancelled
  confirmed        → processing, cancelled
  processing       → shipped
  shipped          → out_for_delivery
  out_for_delivery → delivered
  delivered        → returned
  cancelled        → (terminal state, no transitions)
  returned         → (terminal state, no transitions)

INVALID:
  - Any backward movement (shipped → processing ✗)
  - Skipping steps (pending → shipped ✗)
  - Transitioning from terminal states

IMPLEMENTATION:
  const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending:          ["confirmed", "cancelled"],
    confirmed:        ["processing", "cancelled"],
    processing:       ["shipped"],
    shipped:          ["out_for_delivery"],
    out_for_delivery: ["delivered"],
    delivered:        ["returned"],
    cancelled:        [],
    returned:         [],
  }
```

### Indexes

```
{ orderNumber: 1 }                  unique: true    (order lookup by number)
{ user: 1, createdAt: -1 }                          (customer order history)
{ status: 1, createdAt: -1 }                        (admin order filtering)
{ createdAt: -1 }                                    (admin default listing)
{ user: 1, status: 1 }                              (customer filter by status)
{ paymentStatus: 1 }                                (payment reconciliation)
```

### Order Number Generation

```
FORMAT:   KNM-{TIMESTAMP_BASE36}-{RANDOM_4}
EXAMPLE:  KNM-LX7K2-4F9A

LOGIC:
  const ts = Date.now().toString(36).toUpperCase().slice(-5)
  const rand = crypto.randomBytes(2).toString("hex").toUpperCase()
  return `KNM-${ts}-${rand}`

COLLISION:
  Extremely unlikely (36^5 × 16^4 = ~3.8 billion combinations)
  Unique index as safety net — retry with new random on collision
```

### Security Considerations

```
- Customers can only view their own orders (service enforces user match)
- Admin can view all orders
- Order items are SNAPSHOTS — price/name frozen at purchase time
  (prevents retroactive price changes affecting completed orders)
- Stock decrement uses atomic $inc: { stock: -qty } with min:0 validation
  (prevents negative stock in concurrent checkout scenarios)
- Cancel only allowed from "pending" status (customer) or "pending"/"confirmed" (admin)
- totalAmount recalculated server-side, never trusted from client
```

---

## Collection 6: `delivery_records`

### Purpose
Individual delivery tracking updates for an order. Separated from order document to allow unlimited updates without growing the order document excessively.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | Auto | Primary key |
| `order` | ObjectId | Yes | — | Ref → orders |
| `status` | String | Yes | — | Status at this point in time |
| `message` | String | Yes | — | Human-readable update message |
| `location` | String | No | `null` | Current location of package |
| `updatedBy` | ObjectId | Yes | — | Ref → users (admin who made update) |
| `timestamp` | Date | Yes | `Date.now` | When this update occurred |
| `createdAt` | Date | Auto | Auto | |

### Validation Rules

```
order:
  - type: ObjectId
  - ref: "Order"
  - required: true

status:
  - type: String
  - enum: same as OrderStatus
  - required: true

message:
  - required: true
  - minlength: 3
  - maxlength: 500
  - trim: true

location:
  - optional
  - maxlength: 200
  - trim: true

updatedBy:
  - type: ObjectId
  - ref: "User"
  - required: true
```

### Indexes

```
{ order: 1, timestamp: 1 }                          (timeline for an order, sorted)
{ updatedBy: 1, timestamp: -1 }                     (admin activity tracking)
```

### Auto-Created Records

```
The system automatically creates delivery_records at these points:

1. Order created → { status: "pending", message: "Order placed successfully" }
2. Admin updates status → { status: newStatus, message: admin's message }
3. Delivered → { status: "delivered", message: "Package delivered" }
4. Cancelled → { status: "cancelled", message: cancelReason }

Admin can ALSO push manual updates between status changes:
  e.g., "Package arrived at sorting facility in Kathmandu"
  These are informational updates that don't change order.status
```

### Security Considerations

```
- Only admins can create delivery records
- updatedBy tracks which admin made the update (accountability)
- Customers can read delivery records for their own orders only
- Records are append-only — never updated or deleted
```

---

## Collection 7: `sdc_records`

### Purpose
Shipment Delivery Confirmation. Created when an order is marked as "delivered". This record is the proof of delivery that unlocks review eligibility.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | Auto | Primary key |
| `order` | ObjectId | Yes | — | Ref → orders, unique (one SDC per order) |
| `user` | ObjectId | Yes | — | Ref → users (customer who placed order) |
| `products` | [ObjectId] | Yes | — | Refs → products (all products in this order) |
| `deliveredAt` | Date | Yes | — | Exact delivery timestamp |
| `confirmedBy` | ObjectId | Yes | — | Ref → users (admin who confirmed delivery) |
| `reviewsUnlocked` | Boolean | Yes | `true` | Whether reviews can be submitted |
| `reviewDeadline` | Date | No | — | Optional: deadline to submit review (30 days) |
| `createdAt` | Date | Auto | Auto | |

### Validation Rules

```
order:
  - type: ObjectId
  - ref: "Order"
  - required: true
  - unique: true (one SDC per order)

user:
  - type: ObjectId
  - ref: "User"
  - required: true

products:
  - type: [ObjectId]
  - ref: "Product"
  - validate: array length >= 1

deliveredAt:
  - type: Date
  - required: true
  - validate: cannot be in the future

confirmedBy:
  - type: ObjectId
  - ref: "User"
  - required: true

reviewDeadline:
  - type: Date
  - default: deliveredAt + 30 days
```

### Indexes

```
{ order: 1 }                     unique: true       (one SDC per order)
{ user: 1, createdAt: -1 }                          (user's eligible reviews lookup)
{ user: 1, products: 1 }                            (eligibility check: user + product)
```

### SDC Creation Logic (Service Layer)

```
TRIGGER:
  When admin updates order.status to "delivered"

STEPS:
  1. Find the order, verify status transition is valid
  2. Set order.status = "delivered"
  3. Set order.deliveredAt = new Date()
  4. Extract all product IDs from order.items
  5. Create sdc_record:
     {
       order: order._id,
       user: order.user,
       products: [order.items.map(i => i.product)],
       deliveredAt: new Date(),
       confirmedBy: adminUserId,
       reviewsUnlocked: true,
       reviewDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
     }
  6. Create delivery_record for the "delivered" status update

ALL IN ONE TRANSACTION (if possible, or sequential with error handling)
```

### Review Eligibility Check (Using SDC)

```
QUERY: Can user X review product Y?

  const sdcRecord = await SDCRecord.findOne({
    user: userId,
    products: productId,
    reviewsUnlocked: true,
    reviewDeadline: { $gte: new Date() }  // Optional: enforce deadline
  })

  if (!sdcRecord) → NOT ELIGIBLE

  const existingReview = await Review.findOne({
    user: userId,
    product: productId,
    order: sdcRecord.order
  })

  if (existingReview) → ALREADY REVIEWED

  → ELIGIBLE (return sdcRecord.order for linking)
```

### Security Considerations

```
- SDC records are system-created only (no user/admin manual creation endpoint)
- Created atomically with order status update
- reviewsUnlocked can be set to false by admin (revoke review eligibility)
- reviewDeadline prevents reviews months after purchase (configurable)
- Products array stores all products from order — each can be reviewed independently
```

---

## Collection 8: `reviews`

### Purpose
Product reviews submitted by verified buyers. Contains review content and links to IPFS and blockchain proof.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | Auto | Primary key |
| `user` | ObjectId | Yes | — | Ref → users (reviewer) |
| `product` | ObjectId | Yes | — | Ref → products (reviewed product) |
| `order` | ObjectId | Yes | — | Ref → orders (purchase proof) |
| `sdcRecord` | ObjectId | Yes | — | Ref → sdc_records (delivery proof) |
| `rating` | Number | Yes | — | 1-5 star rating |
| `title` | String | Yes | — | Review headline |
| `content` | String | Yes | — | Review body text |
| `ipfsHash` | String | No | `null` | IPFS CID of stored review content |
| `blockchainTxHash` | String | No | `null` | Ethereum transaction hash |
| `blockNumber` | Number | No | `null` | Block number of proof transaction |
| `contractAddress` | String | No | `null` | Smart contract address |
| `contentHash` | String | No | `null` | SHA-256 hash of review content |
| `isVerified` | Boolean | Yes | `false` | Has blockchain proof |
| `verificationStatus` | String | Yes | `"pending"` | Verification pipeline status |
| `isFlagged` | Boolean | No | `false` | Admin moderation flag |
| `flagReason` | String | No | `null` | Why admin flagged it |
| `createdAt` | Date | Auto | Auto | |
| `updatedAt` | Date | Auto | Auto | |

### Enums

```
verificationStatus: [
  "pending",       // Review submitted, IPFS/blockchain in progress
  "stored",        // Stored on IPFS, blockchain pending
  "verified",      // Both IPFS and blockchain confirmed
  "failed"         // IPFS or blockchain storage failed
]
```

### Validation Rules

```
rating:
  - type: Number
  - required: true
  - min: 1
  - max: 5
  - validate: must be integer

title:
  - type: String
  - required: true
  - trim: true
  - minlength: 3
  - maxlength: 100

content:
  - type: String
  - required: true
  - trim: true
  - minlength: 10
  - maxlength: 2000

ipfsHash:
  - type: String
  - match: /^Qm[a-zA-Z0-9]{44}$|^bafy[a-zA-Z0-9]+$/  (CIDv0 or CIDv1)

blockchainTxHash:
  - type: String
  - match: /^0x[a-fA-F0-9]{64}$/  (Ethereum tx hash format)

contentHash:
  - type: String
  - match: /^[a-f0-9]{64}$/  (SHA-256 hex)
```

### Indexes

```
{ user: 1, product: 1, order: 1 }    unique: true    (one review per product per order)
{ product: 1, createdAt: -1 }                         (product reviews listing)
{ user: 1, createdAt: -1 }                            (user's reviews)
{ product: 1, rating: -1 }                            (sort by rating)
{ isVerified: 1 }                                     (filter verified reviews)
{ verificationStatus: 1 }                             (find pending verifications)
{ isFlagged: 1 }                                      (admin moderation queue)
```

### Review Creation Pipeline (Service Layer)

```
STEP 1: ELIGIBILITY
  → Check SDC record exists for (user, product)
  → Check no existing review for (user, product, order)
  → If fail → throw ApiError(403, "Not eligible to review")

STEP 2: SAVE REVIEW (status: "pending")
  → Create review document with content, rating, title
  → verificationStatus = "pending", isVerified = false
  → This ensures the review is saved even if IPFS/blockchain fails

STEP 3: IPFS UPLOAD
  → Construct JSON payload
  → Upload to Pinata → get CID
  → Update review: ipfsHash = CID, contentHash = sha256, verificationStatus = "stored"
  → If fails → verificationStatus = "failed", log error, continue (review still exists in DB)

STEP 4: BLOCKCHAIN PROOF
  → Submit proof to smart contract (reviewId hash, ipfsCID, contentHash, etc.)
  → Wait for transaction receipt
  → Update review: blockchainTxHash, blockNumber, contractAddress, isVerified = true, verificationStatus = "verified"
  → If fails → verificationStatus = "stored" (IPFS succeeded, chain failed), log error

STEP 5: UPDATE PRODUCT STATS
  → Aggregate pipeline: recalculate averageRating and reviewCount for the product
  → Update product document

RETURN review document (with whatever verification status it reached)
```

### Security Considerations

```
- Compound unique index prevents duplicate reviews (database-level enforcement)
- Eligibility checked against SDC records (not just order status)
- Content is immutable after blockchain proof (no edit endpoint)
- Admin can flag reviews but cannot delete them (blockchain proof is permanent)
- verificationStatus tracks pipeline progress — partial failures are recoverable
- contentHash computed server-side, never from client input
- Review saved to DB first, then IPFS/blockchain — ensures no data loss on external failure
```

---

## Collection 9: `blockchain_proofs`

### Purpose
Detailed log of every blockchain transaction related to review verification. Separate from reviews for audit purposes and to support re-verification.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | Auto | Primary key |
| `review` | ObjectId | Yes | — | Ref → reviews |
| `reviewIdHash` | String | Yes | — | keccak256(review._id) sent to contract |
| `reviewer` | ObjectId | Yes | — | Ref → users |
| `reviewerAddress` | String | Yes | — | Ethereum address used in contract |
| `product` | ObjectId | Yes | — | Ref → products |
| `productHash` | String | Yes | — | keccak256(productId) on-chain |
| `order` | ObjectId | Yes | — | Ref → orders |
| `orderHash` | String | Yes | — | keccak256(orderId) on-chain |
| `ipfsCID` | String | Yes | — | IPFS content identifier |
| `contentHash` | String | Yes | — | SHA-256 of review content |
| `txHash` | String | Yes | — | Blockchain transaction hash |
| `blockNumber` | Number | Yes | — | Block number |
| `blockTimestamp` | Number | Yes | — | Block timestamp (unix) |
| `contractAddress` | String | Yes | — | Contract that stored the proof |
| `gasUsed` | Number | No | — | Gas consumed by transaction |
| `networkId` | Number | Yes | — | Chain ID (31337 for Hardhat) |
| `status` | String | Yes | `"confirmed"` | Transaction status |
| `createdAt` | Date | Auto | Auto | |

### Enums

```
status: [
  "pending",       // Transaction sent, awaiting confirmation
  "confirmed",     // Transaction mined and confirmed
  "failed"         // Transaction reverted
]
```

### Validation Rules

```
txHash:
  - required: true
  - unique: true
  - match: /^0x[a-fA-F0-9]{64}$/

reviewIdHash:
  - required: true
  - match: /^0x[a-fA-F0-9]{64}$/

productHash, orderHash:
  - required: true
  - match: /^0x[a-fA-F0-9]{64}$/

reviewerAddress:
  - required: true
  - match: /^0x[a-fA-F0-9]{40}$/  (Ethereum address)

ipfsCID:
  - required: true

contentHash:
  - required: true
  - match: /^[a-f0-9]{64}$/

contractAddress:
  - required: true
  - match: /^0x[a-fA-F0-9]{40}$/

networkId:
  - required: true
  - default: 31337 (Hardhat)
```

### Indexes

```
{ review: 1 }                    unique: true       (one proof per review)
{ txHash: 1 }                    unique: true       (transaction lookup)
{ reviewer: 1, createdAt: -1 }                      (user's proofs)
{ product: 1 }                                      (product's proofs)
{ contractAddress: 1 }                               (contract-specific queries)
{ status: 1 }                                        (find pending/failed)
```

### Why Separate From Reviews?

```
1. AUDIT TRAIL:  Full transaction details preserved even if review is flagged
2. RE-VERIFY:    Can re-check blockchain state without touching review document
3. ANALYTICS:    Gas usage, transaction patterns, contract history
4. DEBUGGING:    If blockchain proof fails, the proof log shows exactly what was attempted
5. IMMUTABILITY: Proof record never modified after creation — pure append-only log
```

### Security Considerations

```
- Append-only: no update or delete endpoints
- Created exclusively by blockchain.service (not by API endpoints)
- txHash uniqueness prevents duplicate proof claims
- All hash fields validated with regex patterns
- networkId prevents cross-network confusion in future
```

---

## Collection 10: `audit_logs`

### Purpose
Records all significant admin actions for accountability and debugging. Append-only log — never modified or deleted.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | Auto | Primary key |
| `actor` | ObjectId | Yes | — | Ref → users (admin who performed action) |
| `action` | String | Yes | — | What was done |
| `resource` | String | Yes | — | What type of entity was affected |
| `resourceId` | ObjectId | No | — | ID of affected entity |
| `details` | Mixed | No | `{}` | Additional context (before/after values) |
| `ipAddress` | String | No | — | Request IP address |
| `userAgent` | String | No | — | Request user agent |
| `timestamp` | Date | Yes | `Date.now` | When action occurred |
| `createdAt` | Date | Auto | Auto | |

### Enums

```
action: [
  // Product actions
  "product.create",
  "product.update",
  "product.delete",
  "product.toggle_active",

  // Order actions
  "order.update_status",
  "order.cancel",
  "order.push_delivery_update",

  // User actions
  "user.change_role",
  "user.deactivate",
  "user.reactivate",

  // Review actions
  "review.flag",
  "review.unflag",

  // Category actions
  "category.create",
  "category.update",
  "category.delete"
]

resource: [
  "product",
  "order",
  "user",
  "review",
  "category"
]
```

### Details Field Examples

```json
// product.update
{
  "before": { "price": 999, "stock": 50 },
  "after":  { "price": 899, "stock": 45 }
}

// order.update_status
{
  "from": "processing",
  "to": "shipped",
  "message": "Handed to courier"
}

// user.change_role
{
  "from": "customer",
  "to": "admin"
}
```

### Indexes

```
{ actor: 1, timestamp: -1 }                         (admin's action history)
{ resource: 1, resourceId: 1, timestamp: -1 }       (entity audit trail)
{ action: 1, timestamp: -1 }                        (filter by action type)
{ timestamp: -1 }                                    (chronological listing)
```

### Creation Strategy

```
WHERE:
  Audit logs are created in service layer functions, not middleware.
  Each admin service function calls auditLog.create() after the action.

PATTERN:
  async function updateOrderStatus(orderId, newStatus, adminId, req) {
    // ... perform the status update ...

    await AuditLog.create({
      actor: adminId,
      action: "order.update_status",
      resource: "order",
      resourceId: orderId,
      details: { from: oldStatus, to: newStatus },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    })
  }

FAILURE POLICY:
  If audit log creation fails → log error but DON'T roll back the action
  Audit logging is best-effort, not transactional
  The action itself is more important than recording it
```

### Security Considerations

```
- Append-only: absolutely no update or delete operations
- No admin endpoint to modify audit logs
- actor is always the authenticated admin (from JWT, not request body)
- ipAddress and userAgent captured for forensics
- details field uses Mixed type — validated per action type in service layer
- TTL index possible for auto-cleanup after 90 days (optional, not in v1)
- Not exposed to customers — admin-only read access
```

---

## Cross-Collection Data Integrity Rules

### 1. Order Item Snapshots

```
RULE: Order items copy product data at purchase time.
WHY:  Product prices/names can change. Orders must reflect what was actually purchased.

FIELDS COPIED:  name, price, image, sku
FIELDS LINKED:  product (ObjectId, for navigation only)

IF PRODUCT IS DELETED:
  Order data is preserved (snapshot fields still exist)
  product ObjectId will not populate, but that's OK — snapshot has all display data
```

### 2. Stock Management

```
RULE: Stock changes are atomic operations using $inc.

ON ORDER CREATE:
  Product.updateOne({ _id: productId, stock: { $gte: qty } }, { $inc: { stock: -qty } })
  If updateOne matches 0 → insufficient stock → abort order

ON ORDER CANCEL:
  Product.updateOne({ _id: productId }, { $inc: { stock: +qty } })
  Restores stock for each cancelled item

RACE CONDITION PREVENTION:
  The { stock: { $gte: qty } } filter in the query ensures that even concurrent
  checkouts can't oversell. If two users try to buy the last item simultaneously,
  only one $inc operation will match.
```

### 3. Review Statistics Denormalization

```
RULE: Product.averageRating and Product.reviewCount are computed, not user-set.

ON REVIEW CREATE:
  const stats = await Review.aggregate([
    { $match: { product: productId, isVerified: true } },
    { $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 }
    }}
  ])
  await Product.updateOne({ _id: productId }, {
    averageRating: Math.round(stats.averageRating * 10) / 10,
    reviewCount: stats.reviewCount
  })

WHY AGGREGATE instead of $inc:
  More accurate (handles edge cases like deleted reviews)
  Single source of truth from actual review data
  Slightly slower but runs infrequently (only on review submit)
```

### 4. Category Product Count

```
RULE: Category.productCount is denormalized.

UPDATED WHEN:
  - Product created → increment category count
  - Product deleted/deactivated → decrement category count
  - Product changes category → decrement old, increment new

RECALCULATION (admin utility, not v1):
  For each category: count products where { category: catId, isActive: true }
```

### 5. Cascade Behavior

```
USER DEACTIVATED:
  - Set user.isActive = false
  - DO NOT delete orders, reviews, cart (preserve history)
  - User cannot login (auth service checks isActive)
  - User's reviews remain visible (blockchain proofs are permanent)

PRODUCT SOFT-DELETED (isActive = false):
  - Product hidden from listings
  - Existing orders unaffected (snapshot data)
  - Existing reviews remain visible on verification page
  - Removed from carts on next cart retrieval

CATEGORY DELETED:
  - Set category.isActive = false
  - Products in category: leave as-is (orphaned but still accessible by slug)
  - Admin should reassign products before deleting category
```

---

## Query Pattern Reference

### Most Common Queries (Optimized by Indexes)

```
1. Product listing (public):
   Product.find({ isActive: true, category: catId })
     .sort({ createdAt: -1 })
     .skip(page * limit).limit(limit)
   → Uses: { isActive: 1, createdAt: -1 } compound index

2. Product search (public):
   Product.find({ $text: { $search: "wireless headphones" }, isActive: true })
     .sort({ score: { $meta: "textScore" } })
   → Uses: text index on name, description, tags

3. User's orders:
   Order.find({ user: userId }).sort({ createdAt: -1 })
   → Uses: { user: 1, createdAt: -1 } compound index

4. Admin order filtering:
   Order.find({ status: "shipped" }).sort({ createdAt: -1 })
   → Uses: { status: 1, createdAt: -1 } compound index

5. Review eligibility check:
   SDCRecord.findOne({ user: userId, products: productId, reviewsUnlocked: true })
   → Uses: { user: 1, products: 1 } compound index

6. Product reviews:
   Review.find({ product: productId }).sort({ createdAt: -1 }).populate("user", "name avatar")
   → Uses: { product: 1, createdAt: -1 } compound index

7. Cart retrieval:
   Cart.findOne({ user: userId }).populate("items.product")
   → Uses: { user: 1 } unique index

8. Delivery timeline:
   DeliveryRecord.find({ order: orderId }).sort({ timestamp: 1 })
   → Uses: { order: 1, timestamp: 1 } compound index
```

---

## Seed Data Plan

### Admin User (Auto-Created)

```json
{
  "name": "Kinmel Admin",
  "email": "admin@kinmel.com",
  "password": "Admin@123456",
  "role": "admin"
}
```

### Categories (6)

```
Electronics, Clothing, Home & Kitchen, Books, Sports, Accessories
```

### Products (18 — 3 per category)

```
Each product seeded with:
  - Realistic name, description, pricing
  - 2-3 Unsplash image URLs
  - Randomized stock (10-100)
  - Unique SKU pattern: CAT-001, CAT-002, ...
  - Some with compareAtPrice (sale items)
  - 3-4 marked as isFeatured
```

### Test Customer

```json
{
  "name": "Test Customer",
  "email": "customer@kinmel.com",
  "password": "Customer@123",
  "role": "customer"
}
```

---

*This schema design is final. Every Mongoose model should be built to match these specifications exactly.*
