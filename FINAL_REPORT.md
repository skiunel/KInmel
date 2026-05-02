# Kinmel - Final Year Project Defense Report

> Blockchain-Verified Review E-Commerce Platform

Prepared for FYP defense and final submission
Codebase validation date: April 12, 2026

Student Name: ______________________
Roll No: ___________________________
Program: ___________________________
Department: ________________________
Supervisor: ________________________
Institution: _______________________
Submission Date: ___________________

---

## Abstract

**Kinmel** is a full-stack e-commerce platform designed to solve a real trust problem in online shopping: fake and unverifiable product reviews. In many conventional systems, anyone can post a review, reviews can be silently edited or deleted by the platform, and buyers cannot independently verify whether the feedback they see is genuine. This project addresses that gap by introducing a hybrid verification architecture that combines traditional e-commerce operations with modern proof technologies.

The system uses a **three-layer trust model**. First, review eligibility is enforced on the backend so that only customers with delivered orders can submit a review. Second, the review content is serialized into canonical JSON and stored through an IPFS-compatible workflow, producing a content hash and public content identifier. Third, a compact proof of that review is anchored on a Solidity smart contract, making the record tamper-evident and independently verifiable.

Kinmel is not a fully decentralized marketplace. Products, orders, users, and delivery status are still managed by a standard web application architecture using Next.js, Express.js, MongoDB, and JWT-based authentication. This hybrid design is intentional: it preserves the usability of a normal e-commerce platform while adding public verification where trust matters most.

The final implementation includes customer shopping flows, order management, profile management, public review verification, and a dedicated admin panel for products, orders, reviews, and users. The current codebase contains **31 app page/layout files, 77 frontend component files, 8 backend controllers, 12 backend service modules, 6 database models, 1 smart contract, 85 passing backend tests, and 13 passing smart contract tests**.

**Keywords:** e-commerce, blockchain, IPFS, verified reviews, Ethereum, Next.js, Express.js, MongoDB, smart contract, final year project

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Project Aim and Objectives](#3-project-aim-and-objectives)
4. [Scope and Boundaries](#4-scope-and-boundaries)
5. [Novelty and Contribution](#5-novelty-and-contribution)
6. [Users and Main Use Cases](#6-users-and-main-use-cases)
7. [Development Methodology](#7-development-methodology)
8. [Functional Decomposition Diagram (FDD)](#8-functional-decomposition-diagram-fdd)
9. [Technology Stack and Project Scale](#9-technology-stack-and-project-scale)
10. [System Architecture](#10-system-architecture)
11. [Module-Wise Explanation](#11-module-wise-explanation)
12. [Database Design](#12-database-design)
13. [API Design](#13-api-design)
14. [Core Flows and Algorithms](#14-core-flows-and-algorithms)
15. [Security, Validation, and Reliability](#15-security-validation-and-reliability)
16. [Testing and Validation Results](#16-testing-and-validation-results)
17. [Results and Achievements](#17-results-and-achievements)
18. [Limitations](#18-limitations)
19. [Future Enhancements](#19-future-enhancements)
20. [Conclusion](#20-conclusion)
21. [Defense Pitch Notes](#21-defense-pitch-notes)
22. [Possible Viva Questions and Suggested Answers](#22-possible-viva-questions-and-suggested-answers)
23. [References](#23-references)

---

## 1. Introduction

### 1.1 Background

Online shopping platforms depend heavily on product reviews. Reviews influence buyer confidence, guide purchase decisions, and shape seller reputation. However, the review systems used by many commerce platforms are still built on centralized trust. A user must believe that:

1. the reviewer is genuine,
2. the review was posted by a real buyer,
3. the review text has not been edited after submission, and
4. the platform is not selectively hiding or altering feedback.

In practice, these assumptions are weak. Fake reviews are common, bought reviews distort product perception, and consumers rarely have any independent mechanism for verification.

### 1.2 Project Introduction

Kinmel is a web-based e-commerce platform that introduces **cryptographic trust** into the review system without making the whole marketplace decentralized. It follows a hybrid architecture:

- regular commerce operations stay in the web application and database,
- review content is stored in a content-addressable format,
- proof data is anchored on blockchain,
- public verification remains possible even outside the platform interface.

This makes Kinmel academically strong for a final year project because it demonstrates:

- full-stack engineering,
- applied blockchain integration,
- secure backend design,
- database and API design,
- UI/UX design,
- and software testing.

### 1.3 Meaning of the Project Name

The word **Kinmel** is derived from Nepali and relates to the concept of buying. The project therefore represents a localized, trust-focused shopping system built for an academic demonstration of modern web engineering with blockchain-backed verification.

---

## 2. Problem Statement

The project is based on the following real-world problem:

> Existing e-commerce platforms allow users to see product reviews, but those reviews are often difficult to trust because there is no strong guarantee that the reviewer actually bought the product, that the content was not altered, or that the platform is presenting the original unmodified record.

This problem can be broken down into five major issues:

### 2.1 Fake Reviews

Many online reviews are artificially generated, incentivized, or posted by people who never used the product. This damages consumer trust and creates unfair competition among sellers.

### 2.2 Weak Purchase Verification

Traditional review forms usually check only whether a user account exists. They do not strongly verify that the user ordered and received the specific product.

### 2.3 Centralized Control of Review Data

If all review data exists only in the platform database, administrators or system owners can modify, delete, or suppress content without leaving any public evidence.

### 2.4 No Public Proof Layer

Even if a platform claims that a review is genuine, ordinary users cannot independently verify the claim. The system lacks transparency.

### 2.5 Trust Deficit in E-Commerce

When users stop trusting reviews, product discovery becomes less reliable, purchase confidence falls, and honest sellers are affected.

---

## 3. Project Aim and Objectives

### 3.1 Aim

The main aim of Kinmel is:

> To design and implement a full-stack e-commerce platform in which product reviews are restricted to real buyers and are backed by cryptographic proof using IPFS and blockchain.

### 3.2 Primary Objectives

1. To build a complete e-commerce platform with authentication, product browsing, cart, checkout, orders, and admin management.
2. To allow reviews only for delivered products purchased by the logged-in customer.
3. To store review content in a verifiable, content-addressed form.
4. To anchor proof metadata of each review in a Solidity smart contract.
5. To provide a public verification page so anyone can inspect proof status.
6. To create a maintainable, modular architecture suitable for a final year project demonstration.

### 3.3 Secondary Objectives

1. To demonstrate secure API design using JWT, refresh tokens, RBAC, validation, and rate limiting.
2. To build a responsive and polished user interface using modern frontend tools.
3. To test the backend and smart contract logic using automated test suites.
4. To produce a project that is academically practical, technically impressive, and presentation-friendly.

---

## 4. Scope and Boundaries

### 4.1 In-Scope Features

The project includes the following major functional areas:

- customer registration, login, logout, token refresh, and protected routes,
- public product catalog with search, filtering, sorting, and product detail pages,
- persistent cart and checkout workflow,
- order creation and order history,
- delivery tracking and status updates,
- review submission restricted to delivered orders,
- IPFS-backed review content handling,
- blockchain proof anchoring and public verification,
- admin dashboard and management tools,
- automated backend and contract testing.

### 4.2 Out-of-Scope Features

To keep the project academically realistic and achievable, the following are intentionally excluded from the current scope:

- a production payment gateway,
- a fully decentralized marketplace,
- a mobile application,
- real-time socket-based updates,
- CI/CD pipeline and container orchestration,
- production mainnet deployment,
- machine learning recommendation engine.

### 4.3 Why the Scope Is Appropriate for FYP

This scope is strong for a final year project because it balances:

- a usable real-world product,
- a unique technical differentiator,
- manageable implementation complexity,
- and clear demonstration value for defense.

---

## 5. Novelty and Contribution

The key contribution of Kinmel is not just that it is an e-commerce website. Its novelty comes from the **hybrid trust architecture** applied to reviews.

### 5.1 What Makes the Project Different

Most academic e-commerce projects stop at:

- product CRUD,
- cart,
- checkout,
- and simple review storage.

Kinmel goes beyond that by adding:

1. **Buyer eligibility enforcement**  
   Reviews are not open to everyone. The system verifies that the user purchased and received the product.

2. **Content integrity layer**  
   The review record is hashed and stored using a content-addressed workflow.

3. **Immutable proof layer**  
   Proof metadata is written to a smart contract, creating a public and tamper-evident audit record.

4. **Public verification**  
   Verification is not hidden inside the admin panel; it is accessible to ordinary users through a public verification page.

### 5.2 Academic Contribution

From an academic point of view, the project demonstrates integration across:

- frontend architecture,
- backend service design,
- database schema design,
- cryptographic thinking,
- blockchain smart contracts,
- and software quality assurance.

### 5.3 Practical Contribution

The project offers a model for how blockchain can be used **meaningfully** rather than superficially. Instead of forcing all commerce data on-chain, it only places proof where immutability matters most.

---

## 6. Users and Main Use Cases

### 6.1 User Roles

| Role | Description | Main Permissions |
|------|-------------|------------------|
| Guest | Visitor without login | Browse products, read reviews, verify public proofs |
| Customer | Registered user | Shop, place orders, view order history, submit eligible reviews |
| Admin | Management user | Manage products, orders, users, dashboard, review oversight |

### 6.2 Main Customer Use Cases

1. Register and login.
2. Browse products and product details.
3. Add products to cart.
4. Complete checkout.
5. Track orders and delivery status.
6. Submit a review after delivery.
7. View proof status of submitted reviews.
8. Open a public verification page for any review.

### 6.3 Main Admin Use Cases

1. Access the admin dashboard.
2. Create, update, activate, or deactivate products.
3. View and manage all customer orders.
4. Push order status and delivery updates.
5. Review users and review-related operational data.

---

## 7. Development Methodology

Kinmel was developed using an **incremental modular approach** inspired by Agile practice. Instead of building everything at once, the system was divided into implementation phases. Each phase produced a working subset of the final product.

### 7.1 Methodology Rationale

This approach was chosen because:

- it reduces risk,
- it allows testing after each major module,
- it supports continuous refinement,
- and it is well suited to FYP time constraints.

### 7.2 Development Phases

| Phase | Focus | Major Outcome |
|------|-------|---------------|
| Phase 1 | Foundation | Monorepo setup, database connectivity, environment configuration |
| Phase 2 | Auth and frontend shell | Login, registration, protected routing, base layouts |
| Phase 3 | Product catalog | Product listing, search, filtering, detail pages |
| Phase 4 | Cart and checkout | Persistent cart, order creation, order summary |
| Phase 5 | Orders and delivery | Customer order history, admin status updates, delivery timeline |
| Phase 6 | Verified reviews | Eligibility logic, IPFS service, blockchain service, public verification |
| Phase 7 | Admin control panel | Dashboard and management pages |
| Phase 8 | Testing and polish | Automated tests, UI refinement, documentation |

### 7.3 Why This Methodology Helped

The incremental method made it possible to:

- validate the backend before building frontend dependencies,
- complete commerce features before adding blockchain complexity,
- test the smart contract independently,
- and keep the project presentation-ready throughout development.

---

## 8. Functional Decomposition Diagram (FDD)

### 8.1 FDD Diagram

The following FDD can be used directly in the final report or copied into defense slides.

```text
Kinmel: Blockchain-Verified Review E-Commerce Platform
|
|-- 1. User Access and Identity
|   |-- 1.1 Registration
|   |-- 1.2 Login
|   |-- 1.3 Refresh Token Session
|   |-- 1.4 Logout
|   `-- 1.5 Role-Based Access Control
|
|-- 2. Product Commerce
|   |-- 2.1 Product Listing
|   |-- 2.2 Search and Filtering
|   |-- 2.3 Product Detail View
|   |-- 2.4 Cart Management
|   `-- 2.5 Checkout and Order Creation
|
|-- 3. Order and Delivery Management
|   |-- 3.1 Order History
|   |-- 3.2 Order Detail View
|   |-- 3.3 Payment Status Tracking
|   |-- 3.4 Delivery Timeline
|   `-- 3.5 Admin Status Update Pipeline
|
|-- 4. Verified Review System
|   |-- 4.1 Review Eligibility Check
|   |-- 4.2 Review Submission
|   |-- 4.3 Canonical JSON Generation
|   |-- 4.4 Content Hash Creation
|   |-- 4.5 IPFS Storage
|   |-- 4.6 Blockchain Proof Anchoring
|   `-- 4.7 Public Verification
|
`-- 5. Administration and Monitoring
    |-- 5.1 Dashboard Metrics
    |-- 5.2 Product Management
    |-- 5.3 Order Management
    |-- 5.4 User Management
    `-- 5.5 Review Oversight
```

### 8.2 FDD Explanation

The FDD shows the system as a hierarchy of functions:

- **Level 0** is the whole system: Kinmel.
- **Level 1** breaks the system into five major business areas.
- **Level 2** shows the main sub-functions inside each business area.

This diagram is important in the defense because it proves that the project is not just a collection of pages. It is a structured system made of related modules that work together.

### 8.3 How to Explain the FDD in Defense

You can explain it like this:

> "The Functional Decomposition Diagram breaks Kinmel into five top-level modules: identity and access, product commerce, order and delivery, verified reviews, and administration. The most important academic contribution is module 4, where review submission is decomposed into eligibility, canonicalization, hashing, IPFS storage, blockchain anchoring, and public verification."

---

## 9. Technology Stack and Project Scale

### 9.1 Technology Stack

| Layer | Technology | Purpose |
|------|------------|---------|
| Frontend | Next.js 15 App Router | UI routing, rendering, layouts |
| UI Library | React 19 | Component-based frontend |
| Styling | Tailwind CSS 4 | Utility-first styling |
| UI Components | Base UI + shadcn patterns | Reusable UI system |
| State/Data Fetching | TanStack Query + Zustand | Remote data and cart state management |
| Backend | Express.js | REST API and business logic |
| Database | MongoDB + Mongoose | Persistent application data |
| Authentication | JWT access + refresh token | Session management |
| Validation | Zod | Request validation |
| Blockchain | Solidity + Hardhat + Ethers.js | Proof anchoring and verification |
| IPFS Layer | Pinata SDK / stub workflow | Content-addressed review storage |
| Testing | Vitest, Supertest, Hardhat Test | API and contract validation |
| Language | TypeScript | Type-safe full-stack development |

### 9.2 Why These Technologies Were Chosen

- **Next.js** gives structured routing and a scalable frontend foundation.
- **Express.js** is simple, fast, and suitable for layered REST architecture.
- **MongoDB** fits the document-oriented nature of carts, orders, and review metadata.
- **Solidity + Hardhat** provide a practical local blockchain environment for academic demonstration.
- **IPFS-style content addressing** solves review integrity more effectively than plain database storage.

### 9.3 Project Scale

The current codebase includes the following verified implementation scale:

| Metric | Current Count |
|--------|---------------|
| App page/layout files | 31 |
| Frontend component files | 77 |
| Backend controllers | 8 |
| Backend service modules | 12 |
| API route files | 10 |
| Database models | 6 |
| Smart contracts | 1 |
| Backend automated tests | 85 passing |
| Smart contract tests | 13 passing |
| Total automated tests | 98 passing |

---

## 10. System Architecture

### 10.1 High-Level Architecture Diagram

```text
┌────────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                         │
│  Customer pages | Admin pages | Public verification | Profile    │
│  Components | Hooks | Services | React Query | Zustand           │
└───────────────────────────────┬────────────────────────────────────┘
                                │ REST API
┌───────────────────────────────┴────────────────────────────────────┐
│                       Backend (Express.js)                        │
│  Routes -> Middleware -> Controllers -> Services -> Models       │
│  Auth | Products | Cart | Orders | Reviews | Users | Dashboard   │
└───────────────┬──────────────────────────┬─────────────────────────┘
                │                          │
                │                          │
        ┌───────┴────────┐        ┌────────┴────────┐
        │ MongoDB        │        │ External Proof  │
        │ Users          │        │ Services        │
        │ Products       │        │ - IPFS/Pinata   │
        │ Orders         │        │ - Ethereum RPC  │
        │ Reviews        │        │ - Smart Contract│
        │ Categories     │        └─────────────────┘
        │ Cart           │
        └────────────────┘
```

### 10.2 Layered Architecture Pattern

The backend follows a layered pattern:

1. **Route Layer**  
   Receives HTTP requests and maps them to controllers.

2. **Middleware Layer**  
   Handles authentication, authorization, validation, rate limiting, and security headers.

3. **Controller Layer**  
   Handles request-response coordination and delegates logic to services.

4. **Service Layer**  
   Contains business rules such as order creation, review eligibility, IPFS upload, and blockchain anchoring.

5. **Model Layer**  
   Stores application data using MongoDB collections through Mongoose.

### 10.3 Frontend Architecture

The frontend is split into route groups:

```text
app/
|- (auth)/      login, register, forgot/reset password
|- (shop)/      homepage, products, cart, checkout, orders, account, verify
`- admin/       dashboard, users, products, orders, reviews
```

The frontend uses:

- reusable component files for consistent UI,
- hooks for data fetching and mutations,
- service modules for API communication,
- protected route logic for customer and admin access,
- and dedicated layouts for customer and admin experiences.

### 10.4 Backend Architecture

The main backend route groups are:

- `/auth`
- `/products`
- `/categories`
- `/cart`
- `/orders`
- `/reviews`
- `/users`
- `/admin`
- `/health`

Each route group is connected to controller and service logic, keeping HTTP concerns separate from business rules.

### 10.5 Blockchain Architecture

The blockchain layer is intentionally small and focused. The `ReviewProof` smart contract stores only proof data, not the entire review text. This is important because:

- storing large text on-chain is expensive,
- the real need is immutability of proof, not immutability of every UI field,
- and the content can still be verified using the stored hashes.

---

## 11. Module-Wise Explanation

### 11.1 Authentication and Access Control

This module handles:

- user registration,
- secure password hashing,
- login,
- access token creation,
- refresh token flow,
- logout,
- and role-based access control.

Customers and admins are differentiated by role. Admin-only pages and endpoints are protected both in the frontend and backend.

### 11.2 Product Catalog

This module allows users to:

- browse available products,
- filter by category,
- search by text,
- sort by different criteria,
- and view detailed product pages.

Each product stores information such as title, price, description, images, SKU, stock, and review summary.

### 11.3 Cart and Checkout

The cart is persistent per user and stored on the server. The checkout flow collects:

- shipping details,
- selected payment method,
- order summary,
- and final confirmation.

The system calculates:

- subtotal,
- shipping cost,
- tax amount,
- and total order value.

### 11.4 Orders and Delivery Tracking

After checkout, the order system:

- stores a snapshot of ordered items,
- tracks order status,
- keeps delivery updates,
- and exposes order history to the customer.

Admins can move orders through the delivery pipeline:

`pending -> confirmed -> processing -> shipped -> delivered`

Once an order reaches `delivered`, review eligibility is unlocked for the customer.

### 11.5 Verified Review Module

This is the core innovation of the project.

The review module performs:

1. order-based eligibility validation,
2. duplicate review prevention,
3. canonical review serialization,
4. SHA-256 content hash generation,
5. IPFS storage,
6. blockchain proof anchoring,
7. proof status storage in MongoDB,
8. public verification support.

### 11.6 Public Verification Module

The verification page allows public users to inspect:

- review metadata,
- IPFS status,
- blockchain transaction hash,
- contract address,
- block number,
- and verification outcome.

This makes the proof visible beyond the normal customer dashboard.

### 11.7 Admin Module

The admin module includes:

- dashboard metrics,
- product management,
- order management,
- user management,
- and review-related monitoring.

This is important because the project is not only a blockchain demo; it is a working commerce system with operational control.

---

## 12. Database Design

### 12.1 Database Choice

MongoDB was chosen because the project contains multiple document-like entities such as:

- cart items,
- delivery updates,
- product image arrays,
- review proof metadata,
- and nested shipping/order structures.

### 12.2 Main Collections

| Collection | Purpose | Important Fields |
|-----------|---------|------------------|
| `users` | Customer and admin accounts | name, email, password, role, refreshToken, avatar |
| `products` | Product catalog | name, slug, description, price, images, category, stock, SKU |
| `categories` | Product grouping | name, slug, description, displayOrder |
| `cart` | User shopping cart | user, items, totals |
| `orders` | Checkout and delivery history | user, items, shippingAddress, paymentMethod, status, deliveryUpdates |
| `reviews` | Review content and proof metadata | rating, title, content, ipfsHash, blockchainTxHash, verificationStatus |

### 12.3 Relationship Overview

```text
User 1 ---- * Order
User 1 ---- 1 Cart
User 1 ---- * Review
Category 1 ---- * Product
Product 1 ---- * Review
Order 1 ---- * Review (via ordered items and product eligibility)
```

### 12.4 Why This Schema Works

The schema supports both commerce and proof verification:

- Orders connect buyers to products.
- Reviews connect products to delivered purchases.
- Review documents store both UI content and proof metadata.
- Orders store delivery status, which becomes the review eligibility trigger.

---

## 13. API Design

### 13.1 API Style

The backend uses a RESTful API with consistent JSON response envelopes.

### 13.2 Base URL

```text
http://localhost:5000/api/v1
```

### 13.3 Standard Response Pattern

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

### 13.4 Main Endpoint Groups

| Group | Purpose |
|------|---------|
| `/auth` | Registration, login, refresh, logout, current user |
| `/products` | Public listing, detail, admin product actions |
| `/categories` | Category listing and admin category management |
| `/cart` | Cart CRUD and totals |
| `/orders` | Order creation, history, detail, status updates |
| `/reviews` | Review creation, verification, eligibility checking |
| `/users` | Profile and user-related actions |
| `/admin` | Dashboard, users, admin data aggregation |
| `/health` | Health check |

### 13.5 API Design Strengths

The API design is strong because it provides:

- clear grouping by business domain,
- validation before service execution,
- role-based restriction on sensitive endpoints,
- consistent response shapes,
- and a clean separation between customer and admin access.

---

## 14. Core Flows and Algorithms

### 14.1 Verified Review Submission Flow

```text
Customer submits review
        |
        v
Check authentication and delivered-order eligibility
        |
        v
Reject duplicates for same order/product
        |
        v
Build canonical review JSON
        |
        v
Create SHA-256 content hash
        |
        v
Store review document through IPFS workflow
        |
        v
Save initial review in MongoDB
        |
        v
Trigger blockchain anchor in background
        |
        v
Update review with txHash / blockNumber / verification status
```

### 14.2 Why the Flow Uses Two Proof Layers

The two proof layers serve different purposes:

- **IPFS/content-addressing layer** proves the review content record.
- **Blockchain layer** proves that a permanent immutable record of that review existed at a certain time.

This combination is stronger than using only a normal database.

### 14.3 Public Verification Flow

```text
User opens /verify/[reviewId]
        |
        v
Backend fetches review metadata from MongoDB
        |
        v
Check IPFS hash availability
        |
        v
Check on-chain proof existence
        |
        v
Compare stored content hash with smart contract proof
        |
        v
Return verification result to frontend
```

### 14.4 Fire-and-Forget Blockchain Strategy

The blockchain step is asynchronous. This means:

- the customer does not have to wait for blockchain confirmation,
- the user gets a faster response after review submission,
- and if blockchain anchoring fails temporarily, the system can retry later.

### 14.5 Recovery Job for Pending Reviews

The backend includes a recovery strategy for reviews that were stored but not yet anchored successfully. The recovery job scans reviews stuck in a pending or stored state and retries blockchain anchoring in batches.

This design improves reliability without making the customer wait.

### 14.6 Smart Contract Logic Summary

The `ReviewProof` contract provides:

- `anchorReview()` to create a proof,
- `getProof()` to retrieve proof data,
- `hasProof()` for fast existence checking,
- `verifyContent()` to compare a given content hash.

The contract stores:

- content hash,
- IPFS CID hash,
- product ID hash,
- order ID hash,
- reviewer hash,
- timestamp,
- existence flag.

It does **not** store the full review text, which keeps gas cost lower and avoids putting large content directly on-chain.

---

## 15. Security, Validation, and Reliability

### 15.1 Authentication Security

The project uses:

- JWT access tokens for short-lived authorization,
- refresh tokens for session continuation,
- secure logout logic,
- and backend route protection.

### 15.2 Authorization

Role-based access control ensures that:

- customers cannot access admin tools,
- admins can manage operational resources,
- review submission is tied to identity and order ownership.

### 15.3 Input Validation

All major request payloads are validated with Zod before entering business logic. This reduces invalid data, improves API predictability, and protects the backend from malformed requests.

### 15.4 Security Middleware

The backend includes:

- Helmet for secure HTTP headers,
- CORS configuration,
- rate limiting,
- and centralized error handling.

### 15.5 Data Integrity

Data integrity is enforced through multiple layers:

- eligibility checks before review creation,
- canonical JSON generation,
- cryptographic content hashing,
- content-addressed record handling,
- and immutable on-chain proof.

### 15.6 Reliability Considerations

The system includes:

- consistent API envelopes,
- health checks,
- retry support for failed blockchain anchoring,
- and strong separation between core commerce data and proof data.

---

## 16. Testing and Validation Results

### 16.1 Testing Strategy

Testing was performed at multiple levels:

| Level | Tools | Purpose |
|------|------|---------|
| Backend integration/unit | Vitest + Supertest | API behavior, business rules, auth, orders, reviews |
| Smart contract | Hardhat Test | Proof storage, validation, duplicate prevention, read functions |
| Manual UI validation | Browser-based testing | Customer flows, admin flows, verification flows |

### 16.2 Current Automated Test Results

These results were verified from the current codebase on **April 12, 2026**:

| Suite | Result |
|------|--------|
| Backend tests | 85 tests passed |
| Smart contract tests | 13 tests passed |
| Total automated tests | 98 tests passed |

### 16.3 What the Backend Tests Cover

The backend suite validates:

- authentication flow,
- product and category operations,
- cart logic,
- order creation and retrieval,
- review eligibility,
- review verification behavior,
- protected route handling,
- and error cases.

### 16.4 What the Smart Contract Tests Cover

The contract suite verifies:

- correct owner setup,
- initial state,
- successful proof anchoring,
- duplicate protection,
- invalid hash rejection,
- unauthorized access rejection,
- proof retrieval,
- existence checks,
- content verification logic.

### 16.5 Manual Validation Areas

In addition to automated testing, the project is suitable for live demo validation of:

1. customer registration and login,
2. product browsing and cart flow,
3. checkout and order creation,
4. admin order update,
5. unlocking review eligibility,
6. review submission,
7. proof verification page.

---

## 17. Results and Achievements

The final implementation achieved the following:

### 17.1 Full Commerce Workflow

The project supports a realistic e-commerce workflow from registration to browsing, cart management, checkout, and order history.

### 17.2 Verified Review Pipeline

The platform successfully implements a review system where:

- only real delivered-order customers can review,
- the review content is integrity-protected,
- and proof metadata is anchored immutably.

### 17.3 Public Verification

The project provides a public-facing verification page, which makes the proof visible and understandable to users outside the admin system.

### 17.4 Admin Management

The admin interface provides operational control over:

- products,
- orders,
- users,
- and review-related monitoring.

### 17.5 Strong Academic Demonstration Value

The project demonstrates:

- applied full-stack engineering,
- integration of multiple technologies,
- secure software design,
- and a meaningful blockchain use case.

---

## 18. Limitations

Although Kinmel is functionally strong, the following limitations remain:

### 18.1 Local Blockchain Deployment

The blockchain workflow currently targets a local Hardhat environment for academic demonstration. It is not deployed to a public mainnet or production-grade network.

### 18.2 Not Fully Decentralized

Orders, users, products, and delivery state remain centralized in MongoDB and backend services. This is intentional, but it means the whole system is not decentralized end-to-end.

### 18.3 Payment Integration Scope

The system focuses primarily on trust-backed reviews and commerce flow. Production-ready payment gateway integration is outside the current academic scope.

### 18.4 Single-System Deployment

The project is designed as a monorepo full-stack web application. Horizontal scaling, CDN support, distributed caching, and microservice decomposition are not part of the present build.

---

## 19. Future Enhancements

Future work can improve both technical depth and product value.

### 19.1 Short-Term Enhancements

- richer analytics on the admin dashboard,
- improved review moderation tools,
- better image upload workflows,
- expanded customer profile features,
- more detailed delivery tracking.

### 19.2 Medium-Term Enhancements

- production IPFS pinning environment,
- public blockchain testnet deployment,
- wallet-based proof explorer,
- notification workflows,
- invoice generation and email summaries.

### 19.3 Long-Term Vision

- verified seller reputation system,
- multi-vendor marketplace extension,
- decentralized identity integration,
- proof portability across platforms,
- and stronger public trust analytics for review ecosystems.

---

## 20. Conclusion

Kinmel successfully demonstrates that blockchain can be used in e-commerce in a focused, practical, and academically meaningful way. Instead of putting the entire marketplace on-chain, the project uses blockchain only where immutability creates real value: the review proof record.

This makes the solution both realistic and defendable.

From a software engineering perspective, the project delivers:

- a complete full-stack commerce application,
- secure backend architecture,
- structured database design,
- public proof verification,
- and well-tested smart contract integration.

From an academic perspective, the project is strong because it does not treat blockchain as decoration. It applies cryptographic verification to a genuine business problem: trust in product reviews.

Therefore, Kinmel is not only a working e-commerce platform but also a clear demonstration of how hybrid architectures can combine usability, trust, and technical innovation.

---

## 21. Defense Pitch Notes

### 21.1 30-Second Pitch

> "My project is Kinmel, a blockchain-verified review e-commerce platform. It is a full-stack shopping system where only customers with delivered orders can post reviews. Each review is converted into a canonical record, protected through a content-addressed storage workflow, and then anchored on a Solidity smart contract. This creates a review system that is much more trustworthy than a normal centralized e-commerce platform."

### 21.2 2-Minute Pitch

> "The main problem I targeted is fake product reviews. In many e-commerce systems, users cannot independently verify whether a review came from a real buyer or whether the review content was later changed.  
>  
> To solve this, I built Kinmel, a full-stack e-commerce platform using Next.js, Express.js, MongoDB, IPFS-style review storage, and Ethereum smart contracts. The system first verifies that the customer actually purchased and received the product. Then the review is converted into canonical JSON and hashed. The content is stored through an IPFS workflow, and a proof of that content is anchored on-chain.  
>  
> So my project is not just a CRUD e-commerce website. It adds a cryptographic trust layer to online reviews. I also built admin tools, order tracking, profile management, and public verification pages. The final system contains 98 passing automated tests across backend and smart contract modules, which shows that the implementation is not only feature-rich but also technically validated."

### 21.3 5-Minute Defense Flow

Use this order in your presentation:

1. Introduce the problem of fake and unverified reviews.
2. Explain why a normal database alone is not enough.
3. Introduce Kinmel as a hybrid solution.
4. Show the FDD diagram to explain the overall system scope.
5. Show the high-level architecture.
6. Explain the verified review pipeline step by step.
7. Mention the public verification page.
8. Show testing results and project scale.
9. End with contribution, limitations, and future scope.

### 21.4 Three Strongest Points to Tell Your Sir

1. The project solves a real trust problem, not just a classroom CRUD task.
2. Blockchain is used in a meaningful and efficient way, only for immutable proof.
3. The system is implemented end-to-end with testing, admin control, and public verification.

---

## 22. Possible Viva Questions and Suggested Answers

### Q1. Why did you choose this topic?

**Suggested answer:**  
I chose this topic because fake reviews are a real e-commerce problem. I wanted to build something more meaningful than a standard shopping app by adding a trust and verification layer using blockchain and IPFS concepts.

### Q2. Why not store the whole review on blockchain?

**Suggested answer:**  
Storing full review text on-chain would be expensive and inefficient. The important thing is to store immutable proof of the content, not the entire content itself. So I store proof hashes on-chain and keep the review content in a content-addressed record.

### Q3. Why is your system called hybrid and not fully decentralized?

**Suggested answer:**  
Because products, users, orders, and delivery status are still managed by the normal backend and database. Only the proof layer is decentralized or immutable. This was intentional to keep the system usable and practical for a real commerce workflow.

### Q4. How do you ensure only real buyers can review?

**Suggested answer:**  
The backend checks that the logged-in user owns the order, that the product exists in that order, that the order status is delivered, and that the same user has not already reviewed that product for that order.

### Q5. What is the role of IPFS in your project?

**Suggested answer:**  
IPFS provides a content-addressed storage model. It helps create a review record that can be independently checked using hashes. In my project, it acts as the content integrity layer between the database and blockchain proof.

### Q6. What happens if blockchain anchoring fails?

**Suggested answer:**  
The system uses an asynchronous fire-and-forget pattern. The user still gets a response after the review is stored, and a recovery job can retry anchoring later. This improves user experience and reliability.

### Q7. Why did you use MongoDB?

**Suggested answer:**  
MongoDB fits the document structure of products, carts, delivery updates, and review metadata very well. It also works nicely with Mongoose and TypeScript for a fast full-stack development workflow.

### Q8. What is the biggest technical challenge in this project?

**Suggested answer:**  
The biggest challenge was coordinating the review verification pipeline across multiple layers: eligibility checks, canonicalization, hashing, IPFS handling, blockchain anchoring, and recovery handling without making the user experience slow.

### Q9. What is the main limitation of the current implementation?

**Suggested answer:**  
The current blockchain deployment is local and academic, not production mainnet. Also, the complete marketplace is not decentralized. The project is focused on proving a strong review verification model within practical FYP boundaries.

### Q10. What is the main contribution of your project?

**Suggested answer:**  
The main contribution is showing how a standard e-commerce platform can become more trustworthy by attaching cryptographic proof to reviews, without needing to make the entire system blockchain-based.

---

## 23. References

1. Next.js Documentation. Vercel.
2. React Documentation. Meta.
3. Express.js Documentation.
4. MongoDB Manual.
5. Mongoose Documentation.
6. Zod Documentation.
7. Ethers.js Documentation.
8. Hardhat Documentation.
9. Solidity Documentation.
10. IPFS Documentation.
11. Pinata Documentation.
12. OWASP Cheat Sheet Series.
13. RFC 7519: JSON Web Token (JWT).
14. Industry reports and literature on online review trust and fake review ecosystems.
