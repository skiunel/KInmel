# Kinmel — REST API Contract

> Every endpoint. Every field. Every error. No ambiguity.
> Base URL: `http://localhost:5000/api/v1`

---

## Global Conventions

### Response Envelope

Every response follows this structure:

```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}

// Success with pagination
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 148,
    "pages": 13,
    "hasNext": true,
    "hasPrev": false
  }
}

// Error
{
  "success": false,
  "message": "Human-readable error message",
  "error": "ERROR_CODE",
  "statusCode": 400
}

// Validation Error
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "statusCode": 422,
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Must be at least 8 characters" }
  ]
}
```

### Auth Headers

```
Public endpoints:       No header required
Authenticated:          Authorization: Bearer <accessToken>
Refresh:                Cookie: kinmel_refresh=<refreshToken> (httpOnly, automatic)
```

### Common Error Codes

```
400  BAD_REQUEST          Invalid input or parameters
401  UNAUTHORIZED         Missing or invalid token
403  FORBIDDEN            Valid token but insufficient role/ownership
404  NOT_FOUND            Resource doesn't exist
409  CONFLICT             Duplicate resource (email, SKU, review)
422  VALIDATION_ERROR     Request body fails Zod validation
429  RATE_LIMITED          Too many requests
500  INTERNAL_ERROR       Server error (details logged, not exposed)
502  EXTERNAL_SERVICE_ERROR  IPFS or blockchain service failed
503  SERVICE_UNAVAILABLE  IPFS or blockchain not configured
```

### Pagination Query Params (All List Endpoints)

```
?page=1          Page number (default: 1, min: 1)
&limit=12        Items per page (default: 12, min: 1, max: 50)
```

---

## MODULE 1: AUTH

### `POST /auth/register`

**Purpose**: Create a new customer account.

**Auth**: Public
**Role**: None
**Rate Limit**: 5 requests/minute per IP

**Request Body**:
```json
{
  "name": "Samir Dangol",
  "email": "samir@example.com",
  "password": "SecurePass@123"
}
```

**Validation**:
```
name:      required, string, trim, min 2, max 50
email:     required, string, valid email format, lowercase
password:  required, string, min 8, must contain:
           - at least 1 uppercase letter
           - at least 1 lowercase letter
           - at least 1 number
           - at least 1 special character (@$!%*?&#)
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Samir Dangol",
      "email": "samir@example.com",
      "role": "customer",
      "avatar": null,
      "createdAt": "2026-03-09T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Set-Cookie Header**:
```
Set-Cookie: kinmel_refresh=eyJhbGci...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 409 | EMAIL_EXISTS | Email already registered |
| 422 | VALIDATION_ERROR | Any field fails validation |
| 429 | RATE_LIMITED | Too many registration attempts |

---

### `POST /auth/login`

**Purpose**: Authenticate user and issue tokens.

**Auth**: Public
**Role**: None
**Rate Limit**: 5 requests/minute per IP

**Request Body**:
```json
{
  "email": "samir@example.com",
  "password": "SecurePass@123"
}
```

**Validation**:
```
email:     required, string, valid email format
password:  required, string
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Samir Dangol",
      "email": "samir@example.com",
      "role": "customer",
      "avatar": null,
      "lastLoginAt": "2026-03-09T10:30:00.000Z",
      "createdAt": "2026-03-01T08:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Set-Cookie**: Same refresh token cookie as register.

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 401 | INVALID_CREDENTIALS | Email not found or password wrong (same message for both — security) |
| 403 | ACCOUNT_DEACTIVATED | User account is deactivated (isActive = false) |
| 422 | VALIDATION_ERROR | Missing email or password |
| 429 | RATE_LIMITED | Too many login attempts |

---

### `POST /auth/logout`

**Purpose**: Invalidate refresh token, clear cookie.

**Auth**: Authenticated
**Role**: Any

**Request Body**: None

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Clear-Cookie Header**:
```
Set-Cookie: kinmel_refresh=; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=0
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 401 | UNAUTHORIZED | No valid access token |

---

### `POST /auth/refresh`

**Purpose**: Exchange valid refresh token for new access token.

**Auth**: Public (uses refresh cookie, not Bearer token)
**Role**: None

**Request Body**: None (refresh token in cookie)

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 401 | INVALID_REFRESH_TOKEN | Cookie missing, token expired, token doesn't match DB |
| 403 | ACCOUNT_DEACTIVATED | User deactivated since token was issued |

---

### `GET /auth/me`

**Purpose**: Get current authenticated user's profile.

**Auth**: Authenticated
**Role**: Any

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Samir Dangol",
    "email": "samir@example.com",
    "role": "customer",
    "avatar": null,
    "phone": "+977-9841234567",
    "lastLoginAt": "2026-03-09T10:30:00.000Z",
    "createdAt": "2026-03-01T08:00:00.000Z"
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 401 | UNAUTHORIZED | Invalid or expired access token |

---

## MODULE 2: USERS

### `PUT /users/profile`

**Purpose**: Update current user's profile information.

**Auth**: Authenticated
**Role**: Any

**Request Body**:
```json
{
  "name": "Samir D.",
  "phone": "+977-9841234567",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Validation**:
```
name:    optional, string, trim, min 2, max 50
phone:   optional, string, match /^\+?[\d\s-]{7,15}$/
avatar:  optional, string, valid URL
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Samir D.",
    "email": "samir@example.com",
    "role": "customer",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "+977-9841234567",
    "createdAt": "2026-03-01T08:00:00.000Z"
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 401 | UNAUTHORIZED | Not logged in |
| 422 | VALIDATION_ERROR | Invalid field values |

---

### `PUT /users/password`

**Purpose**: Change current user's password.

**Auth**: Authenticated
**Role**: Any

**Request Body**:
```json
{
  "currentPassword": "OldPass@123",
  "newPassword": "NewSecure@456"
}
```

**Validation**:
```
currentPassword:  required, string
newPassword:      required, string, min 8, same complexity rules as register,
                  must be different from currentPassword
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 400 | SAME_PASSWORD | New password matches current |
| 401 | INVALID_CREDENTIALS | Current password is wrong |
| 422 | VALIDATION_ERROR | New password doesn't meet requirements |

---

## MODULE 3: PRODUCTS

### `GET /products`

**Purpose**: List products with filtering, search, and sorting.

**Auth**: Public
**Role**: None

**Query Parameters**:
```
?page=1                           Pagination page (default: 1)
&limit=12                         Items per page (default: 12, max: 50)
&category=65f1a2b3c4d5e6f7a8b9   Category ObjectId
&search=wireless headphones       Text search on name, description, tags
&sort=price_asc                   Sort order (see below)
&minPrice=500                     Minimum price filter
&maxPrice=5000                    Maximum price filter
&featured=true                    Only featured products
```

**Sort Options**:
```
newest       → { createdAt: -1 }         (default)
price_asc    → { price: 1 }
price_desc   → { price: -1 }
rating       → { averageRating: -1 }
name_asc     → { name: 1 }
name_desc    → { name: -1 }
```

**Validation**:
```
page:       optional, integer, min 1
limit:      optional, integer, min 1, max 50
category:   optional, valid ObjectId
search:     optional, string, max 100
sort:       optional, enum of sort options
minPrice:   optional, number, min 0
maxPrice:   optional, number, min 0, must be >= minPrice if both provided
featured:   optional, boolean
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
      "name": "Wireless Noise-Cancelling Headphones",
      "slug": "wireless-noise-cancelling-headphones",
      "description": "Premium wireless headphones with active noise cancellation...",
      "shortDescription": "Premium ANC headphones",
      "price": 4999,
      "compareAtPrice": 6999,
      "images": [
        "https://images.unsplash.com/photo-xxx",
        "https://images.unsplash.com/photo-yyy"
      ],
      "category": {
        "_id": "65f1a2b3c4d5e6f7a8b9c0e1",
        "name": "Electronics",
        "slug": "electronics"
      },
      "tags": ["wireless", "noise-cancelling", "bluetooth"],
      "stock": 24,
      "sku": "ELEC-001",
      "isActive": true,
      "isFeatured": true,
      "averageRating": 4.5,
      "reviewCount": 12,
      "createdAt": "2026-02-15T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 48,
    "pages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 422 | VALIDATION_ERROR | Invalid query params (e.g., negative page) |

---

### `GET /products/:slug`

**Purpose**: Get single product by URL slug.

**Auth**: Public
**Role**: None

**URL Params**: `slug` — product URL slug string

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Wireless Noise-Cancelling Headphones",
    "slug": "wireless-noise-cancelling-headphones",
    "description": "Premium wireless headphones with active noise cancellation. Features 30-hour battery life, premium drivers, and comfortable over-ear design.",
    "shortDescription": "Premium ANC headphones",
    "price": 4999,
    "compareAtPrice": 6999,
    "images": [
      "https://images.unsplash.com/photo-xxx",
      "https://images.unsplash.com/photo-yyy",
      "https://images.unsplash.com/photo-zzz"
    ],
    "category": {
      "_id": "65f1a2b3c4d5e6f7a8b9c0e1",
      "name": "Electronics",
      "slug": "electronics"
    },
    "tags": ["wireless", "noise-cancelling", "bluetooth"],
    "stock": 24,
    "sku": "ELEC-001",
    "isActive": true,
    "isFeatured": true,
    "averageRating": 4.5,
    "reviewCount": 12,
    "createdAt": "2026-02-15T08:00:00.000Z",
    "updatedAt": "2026-03-01T10:00:00.000Z"
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 404 | PRODUCT_NOT_FOUND | Slug doesn't match any active product |

---

### `POST /products`

**Purpose**: Create a new product.

**Auth**: Authenticated
**Role**: Admin

**Request Body**:
```json
{
  "name": "Wireless Noise-Cancelling Headphones",
  "description": "Premium wireless headphones with active noise cancellation...",
  "shortDescription": "Premium ANC headphones",
  "price": 4999,
  "compareAtPrice": 6999,
  "images": [
    "https://images.unsplash.com/photo-xxx",
    "https://images.unsplash.com/photo-yyy"
  ],
  "category": "65f1a2b3c4d5e6f7a8b9c0e1",
  "tags": ["wireless", "noise-cancelling"],
  "stock": 50,
  "sku": "ELEC-001",
  "isFeatured": false
}
```

**Validation**:
```
name:             required, string, trim, min 3, max 150
description:      required, string, min 10, max 5000
shortDescription: optional, string, max 200
price:            required, number, min 0
compareAtPrice:   optional, number, must be > price if provided
images:           required, array of strings (URLs), min 1, max 10
category:         required, valid ObjectId, must reference existing active category
tags:             optional, array of strings, max 10 tags, each max 30 chars
stock:            required, integer, min 0
sku:              required, string, uppercase, trim, min 3, max 20
isFeatured:       optional, boolean, default false
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "message": "Product created",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Wireless Noise-Cancelling Headphones",
    "slug": "wireless-noise-cancelling-headphones",
    "...all fields..."
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 401 | UNAUTHORIZED | Not logged in |
| 403 | FORBIDDEN | Not admin role |
| 404 | CATEGORY_NOT_FOUND | Category ObjectId doesn't exist |
| 409 | SKU_EXISTS | SKU already in use |
| 409 | SLUG_EXISTS | Generated slug collides (auto-retry with suffix) |
| 422 | VALIDATION_ERROR | Any field fails validation |

---

### `PUT /products/:id`

**Purpose**: Update an existing product.

**Auth**: Authenticated
**Role**: Admin

**URL Params**: `id` — product ObjectId

**Request Body**: Same fields as create, all optional (partial update).
```json
{
  "price": 3999,
  "stock": 30,
  "isFeatured": true
}
```

**Validation**: Same rules as create, but all fields optional. Only provided fields are validated and updated.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Product updated",
  "data": { "...updated product..." }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 400 | INVALID_ID | ID is not a valid ObjectId format |
| 401 | UNAUTHORIZED | Not logged in |
| 403 | FORBIDDEN | Not admin |
| 404 | PRODUCT_NOT_FOUND | Product doesn't exist |
| 409 | SKU_EXISTS | New SKU collides with another product |
| 422 | VALIDATION_ERROR | Invalid field values |

---

### `DELETE /products/:id`

**Purpose**: Soft-delete a product (set isActive = false).

**Auth**: Authenticated
**Role**: Admin

**URL Params**: `id` — product ObjectId

**Request Body**: None

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Product deactivated"
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 401 | UNAUTHORIZED | Not logged in |
| 403 | FORBIDDEN | Not admin |
| 404 | PRODUCT_NOT_FOUND | Product doesn't exist or already deactivated |

---

## MODULE 4: CATEGORIES

### `GET /categories`

**Purpose**: List all active categories.

**Auth**: Public
**Role**: None

**Query Parameters**:
```
?includeCount=true               Include product count per category
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0e1",
      "name": "Electronics",
      "slug": "electronics",
      "description": "Gadgets, audio, and tech accessories",
      "image": "https://images.unsplash.com/photo-xxx",
      "displayOrder": 1,
      "productCount": 12
    },
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0e2",
      "name": "Clothing",
      "slug": "clothing",
      "description": "Apparel and fashion",
      "image": "https://images.unsplash.com/photo-yyy",
      "displayOrder": 2,
      "productCount": 8
    }
  ]
}
```

---

### `POST /categories`

**Purpose**: Create a new category.

**Auth**: Authenticated
**Role**: Admin

**Request Body**:
```json
{
  "name": "Electronics",
  "description": "Gadgets, audio, and tech accessories",
  "image": "https://images.unsplash.com/photo-xxx",
  "displayOrder": 1
}
```

**Validation**:
```
name:          required, string, trim, min 2, max 50, unique
description:   optional, string, max 300
image:         optional, string, valid URL
displayOrder:  optional, integer, min 0, default 0
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "message": "Category created",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0e1",
    "name": "Electronics",
    "slug": "electronics",
    "description": "Gadgets, audio, and tech accessories",
    "image": "https://images.unsplash.com/photo-xxx",
    "isActive": true,
    "displayOrder": 1,
    "productCount": 0,
    "createdAt": "2026-03-09T10:30:00.000Z"
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 403 | FORBIDDEN | Not admin |
| 409 | CATEGORY_EXISTS | Category name already exists |
| 422 | VALIDATION_ERROR | Invalid fields |

---

### `PUT /categories/:id`

**Purpose**: Update a category.

**Auth**: Authenticated
**Role**: Admin

**Request Body**: Same as create, all optional.

**Success Response** `200 OK`: Updated category object.

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 403 | FORBIDDEN | Not admin |
| 404 | CATEGORY_NOT_FOUND | Category doesn't exist |
| 409 | CATEGORY_EXISTS | New name collides |
| 422 | VALIDATION_ERROR | Invalid fields |

---

### `DELETE /categories/:id`

**Purpose**: Soft-delete a category.

**Auth**: Authenticated
**Role**: Admin

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Category deactivated"
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 400 | CATEGORY_HAS_PRODUCTS | Category still has active products (must reassign first) |
| 403 | FORBIDDEN | Not admin |
| 404 | CATEGORY_NOT_FOUND | Doesn't exist |

---

## MODULE 5: CART

### `GET /cart`

**Purpose**: Get current user's cart with populated product details.

**Auth**: Authenticated
**Role**: Any

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0f1",
    "user": "65f1a2b3c4d5e6f7a8b9c0d1",
    "items": [
      {
        "product": {
          "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
          "name": "Wireless Headphones",
          "slug": "wireless-headphones",
          "price": 4999,
          "images": ["https://..."],
          "stock": 24,
          "isActive": true
        },
        "quantity": 2,
        "price": 4999
      }
    ],
    "totalAmount": 9998,
    "itemCount": 2
  }
}
```

**Note**: On retrieval, service auto-removes items where product is deleted/inactive and refreshes prices if changed.

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 401 | UNAUTHORIZED | Not logged in |

---

### `POST /cart/items`

**Purpose**: Add a product to cart (or increment quantity if already in cart).

**Auth**: Authenticated
**Role**: Any

**Request Body**:
```json
{
  "productId": "65f1a2b3c4d5e6f7a8b9c0d2",
  "quantity": 1
}
```

**Validation**:
```
productId:  required, valid ObjectId
quantity:   required, integer, min 1, max 10
```

**Business Rules**:
```
- If product already in cart: new quantity = existing + requested
- Total quantity per product capped at 10
- Cannot exceed product.stock
- Product must be active (isActive = true)
- Product must have stock > 0
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": { "...full cart object..." }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 400 | INSUFFICIENT_STOCK | Requested quantity > available stock |
| 400 | QUANTITY_LIMIT | Total quantity would exceed 10 |
| 401 | UNAUTHORIZED | Not logged in |
| 404 | PRODUCT_NOT_FOUND | Product doesn't exist or inactive |
| 422 | VALIDATION_ERROR | Invalid productId or quantity |

---

### `PUT /cart/items/:productId`

**Purpose**: Update quantity of a specific item in cart.

**Auth**: Authenticated
**Role**: Any

**URL Params**: `productId` — ObjectId of the product

**Request Body**:
```json
{
  "quantity": 3
}
```

**Validation**:
```
quantity:  required, integer, min 1, max 10
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Cart updated",
  "data": { "...full cart object..." }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 400 | INSUFFICIENT_STOCK | Quantity > available stock |
| 401 | UNAUTHORIZED | Not logged in |
| 404 | ITEM_NOT_IN_CART | Product not found in user's cart |
| 422 | VALIDATION_ERROR | Invalid quantity |

---

### `DELETE /cart/items/:productId`

**Purpose**: Remove a specific item from cart.

**Auth**: Authenticated
**Role**: Any

**URL Params**: `productId` — ObjectId

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": { "...full cart object..." }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 401 | UNAUTHORIZED | Not logged in |
| 404 | ITEM_NOT_IN_CART | Product not in cart |

---

### `DELETE /cart`

**Purpose**: Clear entire cart.

**Auth**: Authenticated
**Role**: Any

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Cart cleared",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0f1",
    "user": "65f1a2b3c4d5e6f7a8b9c0d1",
    "items": [],
    "totalAmount": 0,
    "itemCount": 0
  }
}
```

---

## MODULE 6: CHECKOUT

### `POST /checkout`

**Purpose**: Create an order from the current cart contents.

**Auth**: Authenticated
**Role**: Customer

**Request Body**:
```json
{
  "shippingAddress": {
    "fullName": "Samir Dangol",
    "phone": "+977-9841234567",
    "street": "123 Durbar Marg",
    "city": "Kathmandu",
    "state": "Bagmati",
    "postalCode": "44600",
    "country": "Nepal"
  },
  "paymentMethod": "cod",
  "notes": "Please deliver in the evening"
}
```

**Validation**:
```
shippingAddress:
  fullName:    required, string, trim, min 2, max 100
  phone:       required, string, match /^\+?[\d\s-]{7,15}$/
  street:      required, string, trim, min 5, max 200
  city:        required, string, trim, min 2, max 100
  state:       required, string, trim, min 2, max 100
  postalCode:  required, string, trim, min 3, max 10
  country:     required, string, trim, min 2, max 100

paymentMethod: required, enum ["cod", "card"]
notes:         optional, string, max 500
```

**Business Rules**:
```
1. Cart must not be empty
2. All items must still be active products
3. All items must have sufficient stock
4. Stock is decremented atomically for each product
5. Cart prices refreshed to current product prices before calculation
6. Calculations:
   - subtotal = sum(item.price × item.quantity)
   - shippingCost = subtotal >= 2000 ? 0 : 100
   - taxAmount = subtotal × 0.13
   - totalAmount = subtotal + shippingCost + taxAmount
7. Order items are SNAPSHOTS (name, price, image copied from product)
8. Cart cleared after successful order creation
9. Payment status set to "paid" (simulated)
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0g1",
    "orderNumber": "KNM-LX7K2-4F9A",
    "user": "65f1a2b3c4d5e6f7a8b9c0d1",
    "items": [
      {
        "product": "65f1a2b3c4d5e6f7a8b9c0d2",
        "name": "Wireless Headphones",
        "price": 4999,
        "quantity": 2,
        "image": "https://images.unsplash.com/photo-xxx",
        "sku": "ELEC-001"
      }
    ],
    "shippingAddress": {
      "fullName": "Samir Dangol",
      "phone": "+977-9841234567",
      "street": "123 Durbar Marg",
      "city": "Kathmandu",
      "state": "Bagmati",
      "postalCode": "44600",
      "country": "Nepal"
    },
    "subtotal": 9998,
    "shippingCost": 0,
    "taxRate": 0.13,
    "taxAmount": 1299.74,
    "totalAmount": 11297.74,
    "status": "pending",
    "paymentStatus": "paid",
    "paymentMethod": "cod",
    "notes": "Please deliver in the evening",
    "createdAt": "2026-03-09T11:00:00.000Z"
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 400 | CART_EMPTY | No items in cart |
| 400 | INSUFFICIENT_STOCK | One or more products don't have enough stock |
| 400 | PRODUCT_UNAVAILABLE | Product was deactivated since it was added to cart |
| 401 | UNAUTHORIZED | Not logged in |
| 422 | VALIDATION_ERROR | Invalid shipping address or payment method |

---

## MODULE 7: ORDERS

### `GET /orders`

**Purpose**: List current user's orders.

**Auth**: Authenticated
**Role**: Customer

**Query Parameters**:
```
?page=1
&limit=10
&status=delivered              Filter by order status (optional)
```

**Validation**:
```
status:  optional, enum of OrderStatus values
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0g1",
      "orderNumber": "KNM-LX7K2-4F9A",
      "items": [
        {
          "product": "65f1a2b3c4d5e6f7a8b9c0d2",
          "name": "Wireless Headphones",
          "price": 4999,
          "quantity": 2,
          "image": "https://..."
        }
      ],
      "totalAmount": 11297.74,
      "status": "delivered",
      "paymentStatus": "paid",
      "createdAt": "2026-03-09T11:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 5, "pages": 1, "hasNext": false, "hasPrev": false }
}
```

---

### `GET /orders/:id`

**Purpose**: Get detailed order information including delivery timeline.

**Auth**: Authenticated
**Role**: Customer (own orders only)

**URL Params**: `id` — order ObjectId

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0g1",
    "orderNumber": "KNM-LX7K2-4F9A",
    "user": {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Samir Dangol",
      "email": "samir@example.com"
    },
    "items": [ "...full item snapshots..." ],
    "shippingAddress": { "...full address..." },
    "subtotal": 9998,
    "shippingCost": 0,
    "taxRate": 0.13,
    "taxAmount": 1299.74,
    "totalAmount": 11297.74,
    "status": "shipped",
    "paymentStatus": "paid",
    "paymentMethod": "cod",
    "notes": "Please deliver in the evening",
    "deliveryUpdates": [
      {
        "_id": "...",
        "status": "pending",
        "message": "Order placed successfully",
        "timestamp": "2026-03-09T11:00:00.000Z"
      },
      {
        "_id": "...",
        "status": "confirmed",
        "message": "Order confirmed by seller",
        "timestamp": "2026-03-09T14:00:00.000Z"
      },
      {
        "_id": "...",
        "status": "shipped",
        "message": "Package shipped via courier",
        "location": "Kathmandu Sorting Center",
        "timestamp": "2026-03-10T09:00:00.000Z"
      }
    ],
    "estimatedDelivery": "2026-03-14T00:00:00.000Z",
    "createdAt": "2026-03-09T11:00:00.000Z",
    "updatedAt": "2026-03-10T09:00:00.000Z"
  }
}
```

**Note**: `deliveryUpdates` are fetched from the `delivery_records` collection and injected into the response.

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 400 | INVALID_ID | ID not a valid ObjectId |
| 401 | UNAUTHORIZED | Not logged in |
| 403 | FORBIDDEN | Order belongs to a different user |
| 404 | ORDER_NOT_FOUND | Order doesn't exist |

---

### `PUT /orders/:id/cancel`

**Purpose**: Cancel a pending order.

**Auth**: Authenticated
**Role**: Customer (own orders only)

**URL Params**: `id` — order ObjectId

**Request Body**:
```json
{
  "reason": "Changed my mind"
}
```

**Validation**:
```
reason:  optional, string, max 500
```

**Business Rules**:
```
- Only orders with status "pending" can be cancelled by customer
- Stock is restored for each item
- Order status → "cancelled"
- Payment status → "refunded" (simulated)
- cancelledAt timestamp set
- Delivery record created: "Order cancelled by customer"
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Order cancelled",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0g1",
    "orderNumber": "KNM-LX7K2-4F9A",
    "status": "cancelled",
    "paymentStatus": "refunded",
    "cancelledAt": "2026-03-09T12:00:00.000Z",
    "cancelReason": "Changed my mind"
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 400 | CANNOT_CANCEL | Order status is not "pending" |
| 401 | UNAUTHORIZED | Not logged in |
| 403 | FORBIDDEN | Not the order owner |
| 404 | ORDER_NOT_FOUND | Order doesn't exist |

---

## MODULE 8: DELIVERY

### `GET /orders/:id/delivery`

**Purpose**: Get delivery timeline for a specific order.

**Auth**: Authenticated
**Role**: Customer (own orders) or Admin (any order)

**URL Params**: `id` — order ObjectId

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "orderId": "65f1a2b3c4d5e6f7a8b9c0g1",
    "orderNumber": "KNM-LX7K2-4F9A",
    "currentStatus": "shipped",
    "estimatedDelivery": "2026-03-14T00:00:00.000Z",
    "timeline": [
      {
        "_id": "...",
        "status": "pending",
        "message": "Order placed successfully",
        "location": null,
        "updatedBy": null,
        "timestamp": "2026-03-09T11:00:00.000Z"
      },
      {
        "_id": "...",
        "status": "confirmed",
        "message": "Order confirmed by seller",
        "location": null,
        "updatedBy": { "_id": "...", "name": "Kinmel Admin" },
        "timestamp": "2026-03-09T14:00:00.000Z"
      },
      {
        "_id": "...",
        "status": "shipped",
        "message": "Package shipped via courier",
        "location": "Kathmandu Sorting Center",
        "updatedBy": { "_id": "...", "name": "Kinmel Admin" },
        "timestamp": "2026-03-10T09:00:00.000Z"
      }
    ]
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 401 | UNAUTHORIZED | Not logged in |
| 403 | FORBIDDEN | Customer trying to view another user's order |
| 404 | ORDER_NOT_FOUND | Order doesn't exist |

---

## MODULE 9: REVIEW ELIGIBILITY

### `GET /reviews/eligibility/:orderId`

**Purpose**: Check which products from a specific order the user can review.

**Auth**: Authenticated
**Role**: Customer

**URL Params**: `orderId` — ObjectId

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "orderId": "65f1a2b3c4d5e6f7a8b9c0g1",
    "orderNumber": "KNM-LX7K2-4F9A",
    "orderStatus": "delivered",
    "deliveredAt": "2026-03-12T15:00:00.000Z",
    "reviewDeadline": "2026-04-11T15:00:00.000Z",
    "products": [
      {
        "productId": "65f1a2b3c4d5e6f7a8b9c0d2",
        "name": "Wireless Headphones",
        "image": "https://...",
        "eligible": true,
        "reason": "Eligible for review"
      },
      {
        "productId": "65f1a2b3c4d5e6f7a8b9c0d3",
        "name": "Phone Case",
        "image": "https://...",
        "eligible": false,
        "reason": "Already reviewed",
        "existingReview": {
          "_id": "65f1a2b3c4d5e6f7a8b9c0h1",
          "rating": 5,
          "title": "Great case"
        }
      }
    ]
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 401 | UNAUTHORIZED | Not logged in |
| 403 | FORBIDDEN | Order belongs to different user |
| 404 | ORDER_NOT_FOUND | Order doesn't exist |
| 400 | ORDER_NOT_DELIVERED | Order status is not "delivered" |
| 400 | NO_SDC_RECORD | SDC record doesn't exist (delivery not confirmed) |
| 400 | REVIEW_DEADLINE_PASSED | Past 30-day review window |

---

### `GET /reviews/eligibility`

**Purpose**: List ALL orders/products that the current user can review.

**Auth**: Authenticated
**Role**: Customer

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "orderId": "65f1a2b3c4d5e6f7a8b9c0g1",
      "orderNumber": "KNM-LX7K2-4F9A",
      "deliveredAt": "2026-03-12T15:00:00.000Z",
      "reviewableProducts": [
        {
          "productId": "65f1a2b3c4d5e6f7a8b9c0d2",
          "name": "Wireless Headphones",
          "image": "https://..."
        }
      ]
    }
  ]
}
```

---

## MODULE 10: REVIEWS

### `GET /reviews/product/:productId`

**Purpose**: List reviews for a specific product.

**Auth**: Public
**Role**: None

**URL Params**: `productId` — ObjectId

**Query Parameters**:
```
?page=1
&limit=10
&sort=newest                    newest | highest | lowest
&rating=5                       Filter by specific star rating (optional)
&verified=true                  Only blockchain-verified reviews (optional)
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "summary": {
      "averageRating": 4.5,
      "totalReviews": 12,
      "distribution": {
        "5": 6,
        "4": 3,
        "3": 2,
        "2": 1,
        "1": 0
      },
      "verifiedCount": 10
    },
    "reviews": [
      {
        "_id": "65f1a2b3c4d5e6f7a8b9c0h1",
        "user": {
          "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
          "name": "Samir D.",
          "avatar": null
        },
        "rating": 5,
        "title": "Excellent sound quality",
        "content": "These headphones exceeded my expectations. The noise cancellation is superb and battery life is amazing.",
        "isVerified": true,
        "verificationStatus": "verified",
        "ipfsHash": "QmX7b5jxn5fMKRqP...",
        "blockchainTxHash": "0xabc123...",
        "createdAt": "2026-03-13T10:00:00.000Z"
      }
    ]
  },
  "pagination": { "page": 1, "limit": 10, "total": 12, "pages": 2, "hasNext": true, "hasPrev": false }
}
```

---

### `POST /reviews`

**Purpose**: Submit a verified review for a delivered product.

**Auth**: Authenticated
**Role**: Customer

**Request Body**:
```json
{
  "productId": "65f1a2b3c4d5e6f7a8b9c0d2",
  "orderId": "65f1a2b3c4d5e6f7a8b9c0g1",
  "rating": 5,
  "title": "Excellent sound quality",
  "content": "These headphones exceeded my expectations. The noise cancellation is superb and the battery life lasts well over 30 hours."
}
```

**Validation**:
```
productId:  required, valid ObjectId
orderId:    required, valid ObjectId
rating:     required, integer, min 1, max 5
title:      required, string, trim, min 3, max 100
content:    required, string, trim, min 10, max 2000
```

**Business Rules (Eligibility Pipeline)**:
```
1. Find SDC record for (userId, orderId) → must exist
2. SDC.products must include productId → product was in this order
3. SDC.reviewsUnlocked must be true → reviews allowed
4. SDC.reviewDeadline must be in the future → within 30-day window
5. No existing review for (userId, productId, orderId) → no duplicates
```

**Processing Pipeline**:
```
Step 1: Validate eligibility (above checks)
Step 2: Save review to MongoDB (verificationStatus: "pending")
Step 3: Upload review JSON to IPFS → get CID
Step 4: Submit proof to blockchain → get txHash, blockNumber
Step 5: Update review with IPFS + blockchain data (verificationStatus: "verified")
Step 6: Recalculate product averageRating and reviewCount
Step 7: Return complete review
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "message": "Review submitted and verified on blockchain",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0h1",
    "user": "65f1a2b3c4d5e6f7a8b9c0d1",
    "product": "65f1a2b3c4d5e6f7a8b9c0d2",
    "order": "65f1a2b3c4d5e6f7a8b9c0g1",
    "rating": 5,
    "title": "Excellent sound quality",
    "content": "These headphones exceeded my expectations...",
    "ipfsHash": "QmX7b5jxn5fMKRqP4Z8c...",
    "contentHash": "a1b2c3d4e5f6...",
    "blockchainTxHash": "0xabc123def456...",
    "blockNumber": 42,
    "contractAddress": "0xdef789...",
    "isVerified": true,
    "verificationStatus": "verified",
    "createdAt": "2026-03-13T10:00:00.000Z"
  }
}
```

**Partial Success Response** (IPFS ok, blockchain failed) `201 Created`:
```json
{
  "success": true,
  "message": "Review submitted. IPFS stored. Blockchain proof pending.",
  "data": {
    "...same fields...",
    "ipfsHash": "QmX7b5jxn5fMKRqP4Z8c...",
    "blockchainTxHash": null,
    "blockNumber": null,
    "isVerified": false,
    "verificationStatus": "stored"
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 401 | UNAUTHORIZED | Not logged in |
| 403 | NOT_ELIGIBLE | Failed any eligibility check (with specific reason) |
| 403 | REVIEW_DEADLINE_PASSED | Past 30-day window |
| 409 | ALREADY_REVIEWED | Review already exists for this user + product + order |
| 422 | VALIDATION_ERROR | Invalid fields |
| 502 | IPFS_UPLOAD_FAILED | Pinata API error (review still saved, status: "pending") |
| 502 | BLOCKCHAIN_PROOF_FAILED | Contract call failed (review saved, status: "stored") |
| 503 | IPFS_NOT_CONFIGURED | Pinata env vars missing |
| 503 | BLOCKCHAIN_NOT_CONFIGURED | Contract/RPC env vars missing |

---

### `GET /reviews/:id`

**Purpose**: Get a single review with full details.

**Auth**: Public
**Role**: None

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0h1",
    "user": { "_id": "...", "name": "Samir D.", "avatar": null },
    "product": { "_id": "...", "name": "Wireless Headphones", "slug": "wireless-headphones" },
    "order": "65f1a2b3c4d5e6f7a8b9c0g1",
    "rating": 5,
    "title": "Excellent sound quality",
    "content": "These headphones exceeded my expectations...",
    "ipfsHash": "QmX7b5jxn5fMKRqP...",
    "contentHash": "a1b2c3d4e5f6...",
    "blockchainTxHash": "0xabc123...",
    "blockNumber": 42,
    "contractAddress": "0xdef789...",
    "isVerified": true,
    "verificationStatus": "verified",
    "createdAt": "2026-03-13T10:00:00.000Z"
  }
}
```

---

## MODULE 11: IPFS VERIFICATION

### `GET /reviews/:id/ipfs`

**Purpose**: Fetch review content directly from IPFS and compare with database record.

**Auth**: Public
**Role**: None

**URL Params**: `id` — review ObjectId

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "reviewId": "65f1a2b3c4d5e6f7a8b9c0h1",
    "ipfsHash": "QmX7b5jxn5fMKRqP4Z8c...",
    "ipfsGatewayUrl": "https://gateway.pinata.cloud/ipfs/QmX7b5jxn5fMKRqP4Z8c...",
    "ipfsContent": {
      "version": "1.0",
      "platform": "kinmel",
      "reviewer": "65f1a2b3c4d5e6f7a8b9c0d1",
      "product": "65f1a2b3c4d5e6f7a8b9c0d2",
      "order": "65f1a2b3c4d5e6f7a8b9c0g1",
      "rating": 5,
      "title": "Excellent sound quality",
      "content": "These headphones exceeded my expectations...",
      "timestamp": 1741860000,
      "contentHash": "a1b2c3d4e5f6..."
    },
    "databaseContent": {
      "rating": 5,
      "title": "Excellent sound quality",
      "content": "These headphones exceeded my expectations..."
    },
    "verification": {
      "contentMatch": true,
      "hashMatch": true,
      "message": "IPFS content matches database record"
    }
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 404 | REVIEW_NOT_FOUND | Review doesn't exist |
| 400 | NO_IPFS_HASH | Review doesn't have IPFS hash (verification pending/failed) |
| 502 | IPFS_FETCH_FAILED | Could not retrieve from IPFS gateway |

---

## MODULE 12: BLOCKCHAIN PROOF VERIFICATION

### `GET /reviews/:id/verify`

**Purpose**: Full verification — checks IPFS content, blockchain proof, and cross-references everything.

**Auth**: Public
**Role**: None

**URL Params**: `id` — review ObjectId

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "reviewId": "65f1a2b3c4d5e6f7a8b9c0h1",
    "review": {
      "rating": 5,
      "title": "Excellent sound quality",
      "content": "These headphones exceeded my expectations...",
      "createdAt": "2026-03-13T10:00:00.000Z",
      "user": { "name": "Samir D." },
      "product": { "name": "Wireless Headphones", "slug": "wireless-headphones" }
    },
    "ipfs": {
      "hash": "QmX7b5jxn5fMKRqP4Z8c...",
      "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmX7b5jxn5fMKRqP4Z8c...",
      "contentAvailable": true,
      "contentMatch": true
    },
    "blockchain": {
      "txHash": "0xabc123def456...",
      "blockNumber": 42,
      "contractAddress": "0xdef789...",
      "networkId": 31337,
      "proofExists": true,
      "onChainData": {
        "reviewer": "0x1234567890abcdef...",
        "productHash": "0xaaa...",
        "orderHash": "0xbbb...",
        "ipfsCID": "QmX7b5jxn5fMKRqP4Z8c...",
        "contentHash": "0xccc...",
        "timestamp": 1741860000
      }
    },
    "checks": {
      "contentIntegrity": {
        "passed": true,
        "description": "Review content matches IPFS stored content"
      },
      "hashIntegrity": {
        "passed": true,
        "description": "Content hash matches on-chain record"
      },
      "proofExists": {
        "passed": true,
        "description": "Blockchain proof exists and is valid"
      },
      "buyerVerified": {
        "passed": true,
        "description": "Reviewer has a confirmed delivery for this product"
      },
      "timestampValid": {
        "passed": true,
        "description": "Review was submitted after order delivery"
      }
    },
    "overallVerified": true,
    "checksPassedCount": 5,
    "checksTotalCount": 5
  }
}
```

**Verification Checks Explained**:
```
1. contentIntegrity:
   - Fetch review content from IPFS by CID
   - Compare with database content (title + content)
   - PASS if identical

2. hashIntegrity:
   - Compute SHA-256 of (title + content) from IPFS
   - Compare with contentHash stored on blockchain
   - PASS if hashes match

3. proofExists:
   - Call contract.verifyProof(reviewIdHash)
   - PASS if returns true

4. buyerVerified:
   - Check SDC record exists for reviewer + product
   - PASS if SDC record found

5. timestampValid:
   - Compare review.createdAt with SDC.deliveredAt
   - PASS if review was created after delivery
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 404 | REVIEW_NOT_FOUND | Review doesn't exist |
| 400 | NOT_VERIFIED | Review has no blockchain proof yet |
| 502 | IPFS_UNAVAILABLE | Cannot fetch IPFS content (partial verification returned) |
| 502 | BLOCKCHAIN_UNAVAILABLE | Cannot reach blockchain (partial verification returned) |

**Partial Verification** (when external services are down):
```json
{
  "success": true,
  "data": {
    "...same structure...",
    "checks": {
      "contentIntegrity": { "passed": null, "description": "IPFS unavailable — could not verify" },
      "hashIntegrity": { "passed": null, "description": "Depends on IPFS content" },
      "proofExists": { "passed": true, "description": "Blockchain proof exists" },
      "buyerVerified": { "passed": true, "description": "Confirmed delivery record exists" },
      "timestampValid": { "passed": true, "description": "Review posted after delivery" }
    },
    "overallVerified": false,
    "checksPassedCount": 3,
    "checksTotalCount": 5
  }
}
```

---

### `GET /reviews/:id/proof`

**Purpose**: Get raw blockchain proof data for a review.

**Auth**: Public
**Role**: None

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "reviewId": "65f1a2b3c4d5e6f7a8b9c0h1",
    "proof": {
      "_id": "...",
      "reviewIdHash": "0x...",
      "reviewerAddress": "0x1234567890abcdef...",
      "productHash": "0xaaa...",
      "orderHash": "0xbbb...",
      "ipfsCID": "QmX7b5jxn5fMKRqP4Z8c...",
      "contentHash": "0xccc...",
      "txHash": "0xabc123def456...",
      "blockNumber": 42,
      "blockTimestamp": 1741860000,
      "contractAddress": "0xdef789...",
      "gasUsed": 82451,
      "networkId": 31337,
      "status": "confirmed",
      "createdAt": "2026-03-13T10:00:05.000Z"
    }
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 404 | REVIEW_NOT_FOUND | Review doesn't exist |
| 404 | PROOF_NOT_FOUND | No blockchain proof for this review |

---

## MODULE 13: ADMIN DASHBOARD

### `GET /admin/dashboard`

**Purpose**: Aggregated dashboard statistics.

**Auth**: Authenticated
**Role**: Admin

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalRevenue": 245000,
      "totalOrders": 156,
      "totalUsers": 89,
      "totalProducts": 48,
      "pendingOrders": 12,
      "deliveredOrders": 98,
      "totalReviews": 64,
      "verifiedReviews": 58
    },
    "trends": {
      "revenueChange": 12.5,
      "ordersChange": 8.3,
      "usersChange": 15.2
    },
    "recentOrders": [
      {
        "_id": "...",
        "orderNumber": "KNM-LX7K2-4F9A",
        "user": { "name": "Samir D.", "email": "samir@example.com" },
        "totalAmount": 11297.74,
        "status": "pending",
        "createdAt": "2026-03-09T11:00:00.000Z"
      }
    ]
  }
}
```

**Trends Calculation**:
```
revenueChange:  ((this month revenue - last month revenue) / last month revenue) * 100
ordersChange:   same formula for order count
usersChange:    same formula for new user registrations
```

---

### `GET /admin/orders`

**Purpose**: List ALL orders with filtering (admin view).

**Auth**: Authenticated
**Role**: Admin

**Query Parameters**:
```
?page=1
&limit=20
&status=shipped
&paymentStatus=paid
&search=KNM-LX7K2                  Search by order number
&dateFrom=2026-03-01
&dateTo=2026-03-09
&sort=newest                        newest | oldest | amount_high | amount_low
```

**Validation**:
```
status:         optional, enum of OrderStatus
paymentStatus:  optional, enum of PaymentStatus
search:         optional, string (matches orderNumber)
dateFrom:       optional, valid ISO date
dateTo:         optional, valid ISO date, must be >= dateFrom
sort:           optional, enum
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "orderNumber": "KNM-LX7K2-4F9A",
      "user": { "_id": "...", "name": "Samir D.", "email": "samir@example.com" },
      "items": [ { "name": "Wireless Headphones", "quantity": 2, "price": 4999 } ],
      "totalAmount": 11297.74,
      "status": "shipped",
      "paymentStatus": "paid",
      "paymentMethod": "cod",
      "createdAt": "2026-03-09T11:00:00.000Z"
    }
  ],
  "pagination": { "...": "..." }
}
```

---

### `GET /admin/orders/:id`

**Purpose**: Get full order details (admin view — any order).

**Auth**: Authenticated
**Role**: Admin

**Success Response**: Same structure as customer `GET /orders/:id` but includes full user info.

---

### `PUT /admin/orders/:id/status`

**Purpose**: Advance order to next status in the pipeline.

**Auth**: Authenticated
**Role**: Admin

**Request Body**:
```json
{
  "status": "confirmed",
  "message": "Order confirmed by seller",
  "location": "Warehouse Kathmandu",
  "estimatedDelivery": "2026-03-14"
}
```

**Validation**:
```
status:             required, must be a VALID NEXT STATUS from current status
message:            required, string, min 3, max 500
location:           optional, string, max 200
estimatedDelivery:  optional, valid ISO date, must be in the future
```

**Valid Status Transitions** (enforced):
```
pending          → confirmed, cancelled
confirmed        → processing, cancelled
processing       → shipped
shipped          → out_for_delivery
out_for_delivery → delivered
delivered        → returned
```

**Side Effects When Status = "delivered"**:
```
1. order.status = "delivered"
2. order.deliveredAt = now
3. Create SDC record (unlocks review eligibility)
4. Create delivery_record
5. If paymentMethod === "cod" → paymentStatus = "paid"
6. Create audit_log entry
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Order status updated to confirmed",
  "data": {
    "_id": "...",
    "orderNumber": "KNM-LX7K2-4F9A",
    "status": "confirmed",
    "estimatedDelivery": "2026-03-14T00:00:00.000Z",
    "updatedAt": "2026-03-09T14:00:00.000Z"
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 400 | INVALID_STATUS_TRANSITION | Requested status is not a valid next step |
| 400 | TERMINAL_STATUS | Order is cancelled or returned — no further changes |
| 403 | FORBIDDEN | Not admin |
| 404 | ORDER_NOT_FOUND | Order doesn't exist |
| 422 | VALIDATION_ERROR | Invalid fields |

---

### `POST /admin/orders/:id/delivery`

**Purpose**: Push an informational delivery update (without changing order status).

**Auth**: Authenticated
**Role**: Admin

**Request Body**:
```json
{
  "message": "Package arrived at Bhaktapur distribution center",
  "location": "Bhaktapur Distribution Center"
}
```

**Validation**:
```
message:   required, string, min 3, max 500
location:  optional, string, max 200
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "message": "Delivery update added",
  "data": {
    "_id": "...",
    "order": "65f1a2b3c4d5e6f7a8b9c0g1",
    "status": "shipped",
    "message": "Package arrived at Bhaktapur distribution center",
    "location": "Bhaktapur Distribution Center",
    "updatedBy": "65f1a2b3c4d5e6f7a8b9c0d9",
    "timestamp": "2026-03-10T14:00:00.000Z"
  }
}
```

**Note**: This creates a `delivery_record` but does NOT change order status. Uses the order's current status for the record.

---

### `GET /admin/users`

**Purpose**: List all users with pagination.

**Auth**: Authenticated
**Role**: Admin

**Query Parameters**:
```
?page=1
&limit=20
&role=customer                     Filter by role
&search=samir                      Search by name or email
&sort=newest                       newest | oldest | name_asc | name_desc
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Samir Dangol",
      "email": "samir@example.com",
      "role": "customer",
      "isActive": true,
      "ordersCount": 5,
      "reviewsCount": 3,
      "lastLoginAt": "2026-03-09T10:30:00.000Z",
      "createdAt": "2026-03-01T08:00:00.000Z"
    }
  ],
  "pagination": { "...": "..." }
}
```

**Note**: `ordersCount` and `reviewsCount` are computed via aggregation pipeline lookup, not stored.

---

### `PUT /admin/users/:id/role`

**Purpose**: Change a user's role.

**Auth**: Authenticated
**Role**: Admin

**Request Body**:
```json
{
  "role": "admin"
}
```

**Validation**:
```
role:  required, enum ["customer", "admin"]
```

**Business Rules**:
```
- Cannot change own role (prevent self-demotion lockout)
- Creates audit_log entry
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "User role updated to admin",
  "data": {
    "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Samir Dangol",
    "role": "admin"
  }
}
```

**Error Cases**:
| Status | Error | When |
|--------|-------|------|
| 400 | CANNOT_CHANGE_OWN_ROLE | Admin trying to change their own role |
| 403 | FORBIDDEN | Not admin |
| 404 | USER_NOT_FOUND | User doesn't exist |

---

### `PUT /admin/users/:id/deactivate`

**Purpose**: Deactivate a user account.

**Auth**: Authenticated
**Role**: Admin

**Business Rules**:
```
- Cannot deactivate own account
- Sets user.isActive = false
- User can no longer login (auth service checks isActive)
- Existing orders and reviews are preserved
- Creates audit_log entry
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "User account deactivated",
  "data": { "_id": "...", "name": "...", "isActive": false }
}
```

---

### `PUT /admin/users/:id/reactivate`

**Purpose**: Reactivate a deactivated user account.

**Auth**: Authenticated
**Role**: Admin

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "User account reactivated",
  "data": { "_id": "...", "name": "...", "isActive": true }
}
```

---

### `GET /admin/reviews`

**Purpose**: List all reviews for admin oversight.

**Auth**: Authenticated
**Role**: Admin

**Query Parameters**:
```
?page=1
&limit=20
&verified=true                     Filter by verification status
&flagged=true                      Show only flagged reviews
&sort=newest                       newest | oldest | rating_high | rating_low
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "user": { "name": "Samir D.", "email": "samir@example.com" },
      "product": { "name": "Wireless Headphones", "slug": "..." },
      "rating": 5,
      "title": "Excellent sound quality",
      "content": "These headphones exceeded...",
      "isVerified": true,
      "verificationStatus": "verified",
      "isFlagged": false,
      "ipfsHash": "QmX7b5...",
      "blockchainTxHash": "0xabc...",
      "createdAt": "2026-03-13T10:00:00.000Z"
    }
  ],
  "pagination": { "...": "..." }
}
```

---

### `PUT /admin/reviews/:id/flag`

**Purpose**: Flag a review for moderation.

**Auth**: Authenticated
**Role**: Admin

**Request Body**:
```json
{
  "reason": "Inappropriate language"
}
```

**Validation**:
```
reason:  required, string, min 3, max 500
```

**Note**: Flagging does NOT remove the review (blockchain proof is permanent). It adds a visual indicator.

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Review flagged",
  "data": { "_id": "...", "isFlagged": true, "flagReason": "Inappropriate language" }
}
```

---

### `PUT /admin/reviews/:id/unflag`

**Purpose**: Remove flag from a review.

**Auth**: Authenticated
**Role**: Admin

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Review unflagged",
  "data": { "_id": "...", "isFlagged": false, "flagReason": null }
}
```

---

## MODULE 14: ANALYTICS SUMMARY

### `GET /admin/analytics/revenue`

**Purpose**: Revenue breakdown for charts.

**Auth**: Authenticated
**Role**: Admin

**Query Parameters**:
```
?period=30d                        7d | 30d | 90d | 12m
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "totalRevenue": 245000,
    "averageOrderValue": 1571.79,
    "daily": [
      { "date": "2026-02-08", "revenue": 8500, "orders": 5 },
      { "date": "2026-02-09", "revenue": 12300, "orders": 8 },
      { "date": "2026-02-10", "revenue": 0, "orders": 0 }
    ]
  }
}
```

**Aggregation Pipeline**:
```
1. $match orders where paymentStatus = "paid" and createdAt within period
2. $group by date (day/week/month based on period)
3. $sort by date ascending
4. Fill gaps with zero values for dates with no orders
```

---

### `GET /admin/analytics/products`

**Purpose**: Top products by revenue and by review count.

**Auth**: Authenticated
**Role**: Admin

**Query Parameters**:
```
?limit=10                          Number of top products (default: 10)
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "topByRevenue": [
      {
        "productId": "...",
        "name": "Wireless Headphones",
        "totalRevenue": 49990,
        "totalSold": 10,
        "averageRating": 4.5
      }
    ],
    "topByReviews": [
      {
        "productId": "...",
        "name": "Phone Case",
        "reviewCount": 15,
        "averageRating": 4.2,
        "verifiedReviewCount": 13
      }
    ],
    "lowStock": [
      {
        "productId": "...",
        "name": "Bluetooth Speaker",
        "stock": 3,
        "sku": "ELEC-003"
      }
    ]
  }
}
```

---

### `GET /admin/analytics/orders`

**Purpose**: Order status breakdown.

**Auth**: Authenticated
**Role**: Admin

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "statusBreakdown": {
      "pending": 12,
      "confirmed": 5,
      "processing": 8,
      "shipped": 15,
      "out_for_delivery": 3,
      "delivered": 98,
      "cancelled": 11,
      "returned": 4
    },
    "paymentBreakdown": {
      "pending": 12,
      "paid": 132,
      "failed": 2,
      "refunded": 10
    },
    "fulfillmentRate": 62.82,
    "cancellationRate": 7.05,
    "averageDeliveryDays": 4.2
  }
}
```

**Calculations**:
```
fulfillmentRate:      (delivered / total non-cancelled) × 100
cancellationRate:     (cancelled / total) × 100
averageDeliveryDays:  avg(deliveredAt - createdAt) for delivered orders
```

---

## HEALTH CHECK

### `GET /health`

**Purpose**: Server health check.

**Auth**: Public

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 3600,
    "timestamp": "2026-03-09T14:00:00.000Z",
    "services": {
      "database": "connected",
      "ipfs": "configured",
      "blockchain": "configured"
    }
  }
}
```

---

## ENDPOINT SUMMARY

| Module | Endpoints | Auth |
|--------|-----------|------|
| Auth | 5 | Mixed |
| Users | 2 | Auth |
| Products | 5 | Mixed |
| Categories | 4 | Mixed |
| Cart | 5 | Auth |
| Checkout | 1 | Auth |
| Orders | 3 | Auth |
| Delivery | 1 | Auth |
| Review Eligibility | 2 | Auth |
| Reviews | 3 | Mixed |
| IPFS Verification | 1 | Public |
| Blockchain Verification | 2 | Public |
| Admin Dashboard | 1 | Admin |
| Admin Orders | 4 | Admin |
| Admin Users | 4 | Admin |
| Admin Reviews | 3 | Admin |
| Analytics | 3 | Admin |
| Health | 1 | Public |
| **TOTAL** | **50** | |

**Breakdown**: 8 public, 14 authenticated, 28 admin.

---

*This is the complete API contract. Backend implements exactly this. Frontend consumes exactly this. No ambiguity.*
