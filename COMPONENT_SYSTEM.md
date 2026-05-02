# Kinmel — Component Design System

> Every component listed here is a reusable building block.
> Nothing is page-specific. Everything composes into larger layouts.

---

## Component Organization

```
components/
├── ui/                    # shadcn/ui primitives (installed, not custom)
│   ├── button.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   ├── separator.tsx
│   ├── skeleton.tsx
│   ├── avatar.tsx
│   ├── sheet.tsx
│   ├── tooltip.tsx
│   ├── tabs.tsx
│   ├── checkbox.tsx
│   ├── radio-group.tsx
│   ├── slider.tsx
│   ├── table.tsx
│   └── popover.tsx
│
├── layout/                # Structural wrappers
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── MobileNav.tsx
│   ├── AdminSidebar.tsx
│   ├── AdminLayout.tsx
│   ├── PageHeader.tsx
│   ├── Container.tsx
│   └── SectionWrapper.tsx
│
├── shared/                # Cross-cutting reusable components
│   ├── Logo.tsx
│   ├── StarRating.tsx
│   ├── StatusBadge.tsx
│   ├── VerifiedBadge.tsx
│   ├── PriceDisplay.tsx
│   ├── QuantitySelector.tsx
│   ├── EmptyState.tsx
│   ├── LoadingSpinner.tsx
│   ├── PageLoader.tsx
│   ├── Pagination.tsx
│   ├── ConfirmDialog.tsx
│   ├── SearchInput.tsx
│   ├── ImageWithFallback.tsx
│   ├── StepIndicator.tsx
│   ├── Timeline.tsx
│   ├── StatCard.tsx
│   ├── DataTable.tsx
│   ├── FormField.tsx
│   └── AnimatedSection.tsx
│
├── product/               # Product domain
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── ProductGallery.tsx
│   ├── ProductInfo.tsx
│   ├── ProductFilters.tsx
│   ├── CategoryCard.tsx
│   └── RelatedProducts.tsx
│
├── cart/                  # Cart domain
│   ├── CartItem.tsx
│   ├── CartSummary.tsx
│   ├── CartEmpty.tsx
│   └── CartIcon.tsx
│
├── checkout/              # Checkout domain
│   ├── ShippingForm.tsx
│   ├── OrderReview.tsx
│   └── OrderConfirmation.tsx
│
├── order/                 # Order domain
│   ├── OrderCard.tsx
│   ├── OrderItems.tsx
│   ├── OrderTimeline.tsx
│   └── OrderStatusUpdater.tsx
│
├── review/                # Review domain
│   ├── ReviewCard.tsx
│   ├── ReviewForm.tsx
│   ├── ReviewList.tsx
│   ├── RatingDistribution.tsx
│   └── VerificationProof.tsx
│
├── admin/                 # Admin domain
│   ├── RevenueChart.tsx
│   ├── RecentOrders.tsx
│   ├── ProductForm.tsx
│   └── UserTable.tsx
│
└── home/                  # Homepage domain
    ├── HeroSection.tsx
    ├── TrustBar.tsx
    ├── FeaturedProducts.tsx
    ├── CategorySection.tsx
    └── HowItWorks.tsx
```

**Total: ~70 components**
- 22 shadcn/ui primitives (installed, not built)
- 18 shared reusable components
- 8 layout components
- ~22 domain-specific components (composed from shared + ui)

---

## LAYER 1: LAYOUT COMPONENTS

These define page structure. They wrap content, never own data.

---

### 1.1 `Navbar`

**Purpose**: Main site navigation. Persistent across all public and customer pages.

**States**:
| State | Behavior |
|-------|----------|
| Default (top of page) | Transparent or white background, no shadow |
| Scrolled | White background, shadow-sm, backdrop-blur-xl (glass) |
| Mobile | Hamburger icon replaces links, triggers MobileNav sheet |
| Guest | Shows: Logo, Products, Login, Register |
| Customer | Shows: Logo, Products, Cart (with count badge), Orders, Avatar dropdown |
| Admin | Shows: Logo, "Admin Panel" label, Avatar dropdown |

**Props**:
```
No props — reads auth state from context/store.
```

**Reuse**: Used in root layout. Single instance, never duplicated.

**Style**:
- Sticky `top-0 z-50`
- `h-16` desktop, `h-14` mobile
- Container centered `max-w-7xl mx-auto px-6`
- Logo on left, nav links center, actions right
- Active link: `text-indigo-600 font-medium`, others: `text-slate-600 hover:text-slate-900`
- Cart icon has absolute-positioned count badge (indigo-500 circle, white text)
- Avatar dropdown: user name + role, links to Profile/Orders/Logout (admin gets Dashboard link)
- Transition between transparent → solid uses `transition-all duration-300`

---

### 1.2 `Footer`

**Purpose**: Site footer with links, branding, and trust signals.

**States**: None — static content.

**Props**:
```
No props — static component.
```

**Reuse**: Used in root layout below main content. Not shown on admin pages.

**Style**:
- `bg-slate-900 text-slate-300`
- `py-16 px-6`
- 4-column grid (desktop) → 2-col (tablet) → 1-col stacked (mobile)
- Columns: Brand + tagline, Quick Links, Customer Service, Contact
- Bottom bar: copyright + "Powered by blockchain" subtle text
- Links: `text-slate-400 hover:text-white transition-colors`

---

### 1.3 `MobileNav`

**Purpose**: Full-screen slide-out navigation for mobile devices.

**States**:
| State | Behavior |
|-------|----------|
| Closed | Not rendered (or off-screen) |
| Open | Slides in from right, dark overlay behind |

**Props**:
```
isOpen: boolean
onClose: () => void
```

**Reuse**: Rendered inside Navbar, triggered by hamburger icon. Uses shadcn `Sheet` component.

**Style**:
- Full-height sheet from right side
- `bg-white w-[300px]`
- Large touch-friendly nav links: `py-4 px-6 text-lg`
- Active link: indigo-50 background, indigo-600 text
- Close button top-right
- If logged in: avatar + name at top, logout at bottom

---

### 1.4 `AdminSidebar`

**Purpose**: Vertical navigation for admin dashboard pages.

**States**:
| State | Behavior |
|-------|----------|
| Expanded (desktop) | Full sidebar with icons + labels, `w-64` |
| Collapsed (tablet) | Icon-only, `w-16`, tooltip on hover for labels |
| Hidden (mobile) | Off-screen, triggered by hamburger in admin navbar |

**Props**:
```
No props — reads current route for active state.
```

**Reuse**: Used in AdminLayout, wraps all `/admin/*` pages.

**Style**:
- `bg-white border-r border-slate-200 h-screen sticky top-0`
- Logo/brand at top
- Section dividers with uppercase overline labels: "OVERVIEW", "MANAGEMENT"
- Nav items: `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm`
- Active: `bg-indigo-50 text-indigo-700`, icon `text-indigo-500`
- Hover: `bg-slate-50 text-slate-700`

---

### 1.5 `AdminLayout`

**Purpose**: Wrapper layout for all admin pages. Provides sidebar + top bar + content area.

**Props**:
```
children: ReactNode
title: string              // Page title shown in header area
description?: string       // Subtitle text
action?: ReactNode         // Optional top-right action button (e.g., "Add Product")
```

**Reuse**: Every admin page wraps its content in this.

**Style**:
- Sidebar on left, main content on right
- Content area: `p-6 max-w-7xl`
- Page header: title (H2) + description + action button row
- Background: `bg-slate-50` (the main content area)

---

### 1.6 `PageHeader`

**Purpose**: Consistent page title section for public/customer pages.

**Props**:
```
title: string
description?: string
breadcrumbs?: { label: string; href?: string }[]
children?: ReactNode        // Optional right-side content (search bar, filters)
```

**Reuse**: Used at the top of Products listing, Orders list, Cart, Profile, etc.

**Style**:
- `py-8 bg-white border-b border-slate-100`
- Breadcrumbs: `text-sm text-slate-400` with `ChevronRight` separators, last item `text-slate-700`
- Title: H1 style (`text-3xl font-bold text-slate-900`)
- Description: `text-slate-500 mt-2`

---

### 1.7 `Container`

**Purpose**: Centers content with consistent max-width and horizontal padding.

**Props**:
```
children: ReactNode
size?: "default" | "narrow" | "wide"    // max-w-7xl | max-w-3xl | max-w-full
className?: string
```

**Reuse**: Used everywhere content needs centering. Foundational wrapper.

**Style**:
- `mx-auto w-full`
- Default: `max-w-7xl px-4 sm:px-6 lg:px-8`
- Narrow: `max-w-3xl px-4 sm:px-6`
- Wide: no max-width, just padding

---

### 1.8 `SectionWrapper`

**Purpose**: Wraps homepage/landing sections with consistent vertical spacing and optional backgrounds.

**Props**:
```
children: ReactNode
title?: string
subtitle?: string
background?: "white" | "slate" | "gradient"
className?: string
```

**Reuse**: Used on homepage for each section (Featured, Categories, How It Works).

**Style**:
- `py-16 sm:py-20 lg:py-24`
- White: `bg-white`
- Slate: `bg-slate-50`
- Gradient: subtle mesh gradient (indigo-50/violet-50 radials)
- Title: centered H2 with subtitle below, `mb-12`

---

## LAYER 2: SHARED REUSABLE COMPONENTS

These are domain-agnostic. They work anywhere.

---

### 2.1 `Logo`

**Purpose**: Brand mark. Renders the Kinmel logo consistently.

**Props**:
```
size?: "sm" | "md" | "lg"         // 24px | 32px | 48px
variant?: "default" | "white"     // For dark backgrounds
showText?: boolean                // Show "Kinmel" text next to mark
```

**States**: None.

**Reuse**: Navbar, Footer, MobileNav, AdminSidebar, auth pages, loading screen.

**Style**:
- Text logo using Plus Jakarta Sans 700
- Small geometric mark (abstract "K" or shopping bag icon in indigo-500)
- White variant for footer (dark bg)
- `flex items-center gap-2`

---

### 2.2 `StarRating`

**Purpose**: Displays star ratings (read-only) or allows star selection (interactive).

**Props**:
```
value: number                     // 0-5, supports half values for display
onChange?: (rating: number) => void  // If provided, becomes interactive
size?: "sm" | "md" | "lg"        // 14px | 18px | 24px
showValue?: boolean               // Show "4.5" text next to stars
count?: number                    // Show "(128 reviews)" next to rating
readOnly?: boolean
```

**States**:
| State | Behavior |
|-------|----------|
| Read-only | Filled stars amber-400, empty stars slate-200, no pointer |
| Interactive hover | Stars highlight up to hovered position |
| Interactive selected | Stars fill up to clicked position |

**Reuse**: ProductCard, ProductInfo, ReviewCard, ReviewForm, RatingDistribution.

**Style**:
- Stars are Lucide `Star` icons
- Filled: `fill-amber-400 text-amber-400`
- Empty: `fill-slate-200 text-slate-200`
- Interactive: `cursor-pointer hover:scale-110 transition-transform`
- Value text: `text-sm font-semibold text-slate-700`
- Count text: `text-sm text-slate-400`

---

### 2.3 `StatusBadge`

**Purpose**: Displays order status, payment status, or any categorical label.

**Props**:
```
status: OrderStatus | PaymentStatus | string
size?: "sm" | "md"
```

**States**: Visual-only — color determined by status value.

**Color Mapping**:
```
pending          → amber
confirmed        → blue
processing       → indigo
shipped          → cyan
out_for_delivery → purple
delivered        → emerald
cancelled        → red
returned         → slate
paid             → emerald
failed           → red
refunded         → slate
```

**Reuse**: OrderCard, OrderTimeline, admin order tables, admin dashboard.

**Style**:
- `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium`
- Dot indicator: `w-1.5 h-1.5 rounded-full bg-current` before text
- Background: `{color}-50`, text: `{color}-700`, border: `border {color}-200`

---

### 2.4 `VerifiedBadge`

**Purpose**: "Blockchain Verified" trust indicator on reviews.

**Props**:
```
size?: "sm" | "md"
clickable?: boolean               // If true, links to verification page
reviewId?: string                 // For generating verification link
```

**States**:
| State | Behavior |
|-------|----------|
| Default | Gradient badge with shield icon |
| Hover (if clickable) | Slight scale-up, deeper shadow |

**Reuse**: ReviewCard, ProductInfo (review summary area), verification page.

**Style**:
- `inline-flex items-center gap-1.5 px-3 py-1 rounded-full`
- `bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-semibold`
- `shadow-sm shadow-amber-500/20`
- Icon: `ShieldCheck` w-3.5 h-3.5
- Hover (clickable): `hover:shadow-md hover:scale-[1.02] transition-all`

---

### 2.5 `PriceDisplay`

**Purpose**: Renders product price with optional compare-at-price and currency formatting.

**Props**:
```
price: number
compareAtPrice?: number           // Strikethrough original price
size?: "sm" | "md" | "lg"
currency?: string                 // Default "Rs."
```

**States**:
| State | Behavior |
|-------|----------|
| Regular price | Single price displayed |
| On sale | Current price in emerald/slate-900 + original price struck through in slate-400 |

**Reuse**: ProductCard, ProductInfo, CartItem, OrderItems, CheckoutReview.

**Style**:
- Current price: `font-semibold text-slate-900`
- SM: `text-sm`, MD: `text-lg`, LG: `text-2xl`
- Compare-at: `text-sm text-slate-400 line-through ml-2`
- Sale indicator: optional small `% off` badge next to price
- Currency symbol in same weight but slightly smaller

---

### 2.6 `QuantitySelector`

**Purpose**: Increment/decrement number input for cart items and product detail.

**Props**:
```
value: number
onChange: (value: number) => void
min?: number                      // Default 1
max?: number                      // Stock limit
disabled?: boolean
size?: "sm" | "md"
```

**States**:
| State | Behavior |
|-------|----------|
| Default | Shows value with -/+ buttons |
| At minimum | Minus button disabled (slate-300) |
| At maximum | Plus button disabled (slate-300), "Max" tooltip |
| Disabled | All controls greyed out |

**Reuse**: ProductInfo (add-to-cart section), CartItem.

**Style**:
- `inline-flex items-center border border-slate-200 rounded-lg`
- Buttons: `w-9 h-9 flex items-center justify-center` with Minus/Plus icons
- Value: `w-12 text-center text-sm font-medium` between buttons
- Hover on buttons: `bg-slate-50`
- Disabled buttons: `text-slate-300 cursor-not-allowed`

---

### 2.7 `EmptyState`

**Purpose**: Friendly placeholder when a list or section has no data.

**Props**:
```
icon: LucideIcon                  // Icon component to render
title: string                     // "No orders yet"
description: string               // "Once you place an order, it will appear here."
action?: {
  label: string                   // "Browse Products"
  href: string                    // "/products"
}
```

**States**: None — static.

**Reuse**: Cart (empty), Orders (no orders), Reviews (no reviews), admin tables (no data), search (no results).

**Style**:
- `flex flex-col items-center justify-center py-16 text-center`
- Icon: `w-12 h-12 text-slate-300 mb-4`
- Title: `text-lg font-semibold text-slate-700`
- Description: `text-sm text-slate-400 mt-1 max-w-sm`
- Action button: outline-indigo variant, `mt-6`

---

### 2.8 `LoadingSpinner`

**Purpose**: Inline loading indicator for buttons and small areas.

**Props**:
```
size?: "sm" | "md" | "lg"        // 16px | 24px | 32px
className?: string
```

**Reuse**: Inside buttons during form submission, inline loading states.

**Style**:
- Lucide `Loader2` icon with `animate-spin`
- `text-current` (inherits parent color)
- `duration-700` (calm rotation, not frantic)

---

### 2.9 `PageLoader`

**Purpose**: Full-page loading state shown during initial data fetch or route transitions.

**Props**:
```
text?: string                     // Optional "Loading products..."
```

**Reuse**: Any page that fetches data on mount.

**Style**:
- `flex flex-col items-center justify-center min-h-[60vh]`
- Spinner (md size) + optional text below
- Text: `text-sm text-slate-400 mt-4`

---

### 2.10 `Pagination`

**Purpose**: Page navigation for paginated lists.

**Props**:
```
currentPage: number
totalPages: number
onPageChange: (page: number) => void
```

**States**:
| State | Behavior |
|-------|----------|
| First page | Previous button disabled |
| Last page | Next button disabled |
| Many pages | Show 1 ... 4 5 6 ... 20 (ellipsis compression) |
| Single page | Component not rendered |

**Reuse**: Product listing, admin tables (orders, users, products), review list.

**Style**:
- `flex items-center justify-center gap-1`
- Page buttons: `w-10 h-10 rounded-lg text-sm font-medium`
- Active page: `bg-indigo-500 text-white`
- Other pages: `text-slate-600 hover:bg-slate-100`
- Previous/Next: secondary button style with ChevronLeft/ChevronRight icons
- Ellipsis: `text-slate-300`

---

### 2.11 `ConfirmDialog`

**Purpose**: Modal confirmation before destructive or important actions.

**Props**:
```
open: boolean
onOpenChange: (open: boolean) => void
title: string                     // "Cancel this order?"
description: string               // "This action cannot be undone."
confirmLabel?: string             // "Yes, cancel" (default: "Confirm")
cancelLabel?: string              // "Go back" (default: "Cancel")
variant?: "danger" | "default"    // Red confirm button vs indigo
onConfirm: () => void
loading?: boolean
```

**States**:
| State | Behavior |
|-------|----------|
| Closed | Not rendered |
| Open | Centered modal with overlay |
| Loading | Confirm button shows spinner, both buttons disabled |

**Reuse**: Order cancellation, product deletion (admin), user deactivation (admin).

**Style**:
- Uses shadcn `Dialog` as base
- Overlay: `bg-black/50 backdrop-blur-sm`
- Card: `max-w-md rounded-2xl p-6`
- Icon at top: AlertTriangle (amber) for default, Trash2 (red) for danger
- Title: H3 centered
- Buttons row: cancel (secondary) + confirm (primary or destructive)

---

### 2.12 `SearchInput`

**Purpose**: Debounced search input with icon and clear button.

**Props**:
```
value: string
onChange: (value: string) => void
placeholder?: string              // "Search products..."
debounceMs?: number               // Default 300
className?: string
```

**States**:
| State | Behavior |
|-------|----------|
| Empty | Shows search icon + placeholder |
| Has value | Shows search icon + text + X clear button |
| Focused | Indigo ring, expanded width on desktop (optional) |

**Reuse**: Product listing page, admin tables, navbar (optional).

**Style**:
- `relative` wrapper
- Search icon: `absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4`
- Input: `pl-10 pr-10` (space for icons both sides)
- Clear button: `absolute right-3` X icon, appears only when value exists
- Standard input styling from form system

---

### 2.13 `ImageWithFallback`

**Purpose**: Image component with loading state and fallback for missing images.

**Props**:
```
src: string
alt: string
fallback?: string                 // Fallback image URL or icon
aspectRatio?: "square" | "video" | "auto"
className?: string
```

**States**:
| State | Behavior |
|-------|----------|
| Loading | Slate-100 skeleton pulse |
| Loaded | Fade-in image |
| Error | Fallback placeholder (package icon on slate-50 bg) |

**Reuse**: ProductCard, ProductGallery, CartItem, OrderItems.

**Style**:
- Uses `next/image` under the hood
- `overflow-hidden` on container
- Loading: `bg-slate-100 animate-pulse`
- Loaded transition: `opacity-0 → opacity-100 duration-300`
- Fallback: centered Package icon on `bg-slate-50`

---

### 2.14 `StepIndicator`

**Purpose**: Shows progress through a multi-step flow (checkout).

**Props**:
```
steps: { label: string; description?: string }[]
currentStep: number               // 0-indexed
```

**States per step**:
| State | Visual |
|-------|--------|
| Completed | Indigo circle with check icon, indigo connector line |
| Current | Indigo circle with step number, pulsing ring |
| Upcoming | Slate-200 circle with step number, slate connector line |

**Reuse**: Checkout flow. Could also be used for onboarding if added later.

**Style**:
- `flex items-center justify-between` for horizontal (desktop)
- Step circles: `w-10 h-10 rounded-full flex items-center justify-center`
- Connector lines: `h-0.5 flex-1 mx-4`
- Completed: `bg-indigo-500 text-white` circle, `bg-indigo-500` line
- Current: `bg-indigo-500 text-white` circle, `ring-4 ring-indigo-100`
- Upcoming: `bg-slate-100 text-slate-400` circle, `bg-slate-200` line
- Labels below circles: `text-xs mt-2`, current is `font-medium text-indigo-600`
- Mobile: horizontal with labels hidden, show only current step label below

---

### 2.15 `Timeline`

**Purpose**: Vertical timeline for delivery tracking updates.

**Props**:
```
items: {
  status: string
  message: string
  timestamp: Date
  location?: string
  isActive?: boolean              // Current status
}[]
```

**States**: Each item is either completed, active, or upcoming (derived from position).

**Reuse**: OrderTimeline (primary), could be used for order history summary.

**Style**:
- Vertical layout: line on left, content on right
- Line: `w-0.5 bg-slate-200` with `bg-indigo-500` for completed segments
- Dots on line: `w-3 h-3 rounded-full`
  - Completed: `bg-indigo-500`
  - Active: `bg-indigo-500 ring-4 ring-indigo-100` (pulsing)
  - Upcoming: `bg-slate-200`
- Content right of dot: status label (font-medium), message (text-slate-500), timestamp (text-xs text-slate-400), location (text-xs text-slate-400 with MapPin icon)
- Spacing: `space-y-6`, each item is `relative pl-8`

---

### 2.16 `StatCard`

**Purpose**: Single metric display for admin dashboard.

**Props**:
```
title: string                     // "Total Revenue"
value: string | number            // "Rs. 245,000" or 1234
icon: LucideIcon
trend?: {
  value: number                   // 12 means +12%
  isPositive: boolean
}
iconColor?: string                // Tailwind color class like "indigo" | "emerald" | "amber"
```

**States**: None — data-driven display only.

**Reuse**: Admin dashboard (4 stat cards), could be reused for any metric display.

**Style**:
- `bg-white rounded-xl p-6 border border-slate-100 shadow-sm`
- Icon area: `w-12 h-12 rounded-lg bg-{color}-50 flex items-center justify-center`
- Icon: `w-6 h-6 text-{color}-500`
- Value: `text-2xl font-bold text-slate-900 mt-4`
- Title: `text-sm text-slate-500 mt-1`
- Trend: `text-sm mt-2`, positive = `text-emerald-500 "↑ 12%"`, negative = `text-red-500 "↓ 3%"`

---

### 2.17 `DataTable`

**Purpose**: Reusable table component for admin pages with sorting, pagination, and actions.

**Props**:
```
columns: {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => ReactNode    // Custom cell renderer
}[]
data: any[]
pagination?: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
onSort?: (key: string, direction: "asc" | "desc") => void
isLoading?: boolean
emptyState?: { icon: LucideIcon; title: string; description: string }
```

**States**:
| State | Behavior |
|-------|----------|
| Loading | Skeleton rows (5 rows of pulsing bars) |
| Empty | EmptyState component centered in table body |
| With data | Rendered rows with hover highlight |
| Sorting | Sort icon toggles asc/desc on column header |

**Reuse**: Admin products table, admin orders table, admin users table, admin reviews table.

**Style**:
- Outer: `bg-white rounded-xl border border-slate-100 overflow-hidden`
- Header: `bg-slate-50 border-b border-slate-200`
- Header cells: `px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500`
- Sortable headers: `cursor-pointer hover:text-slate-700` with ArrowUpDown icon
- Body rows: `px-6 py-4 border-b border-slate-50 text-sm text-slate-600 hover:bg-slate-50 transition-colors`
- Pagination integrated at bottom: `px-6 py-3 border-t border-slate-100`

---

### 2.18 `FormField`

**Purpose**: Wraps label + input + error message in a consistent layout.

**Props**:
```
label: string
error?: string
required?: boolean
children: ReactNode               // The actual input/select/textarea
description?: string              // Helper text below label
```

**States**:
| State | Behavior |
|-------|----------|
| Default | Label + input |
| Required | Red asterisk after label |
| Error | Input gets error ring, error message appears below |
| With description | Small helper text between label and input |

**Reuse**: Every form in the app — shipping form, auth forms, product form, review form.

**Style**:
- `space-y-1.5` (6px gap between label and input)
- Label: `text-sm font-medium text-slate-700`
- Required: `text-red-400 ml-0.5 "*"`
- Description: `text-xs text-slate-400`
- Error: `text-sm text-red-500 mt-1.5` with AlertCircle icon inline

---

### 2.19 `AnimatedSection`

**Purpose**: Wraps any content with Framer Motion fade-up-on-scroll animation.

**Props**:
```
children: ReactNode
delay?: number                    // Stagger delay in seconds
className?: string
```

**States**: Not-in-view (invisible) → in-view (animated in).

**Reuse**: Homepage sections, product grid items, any scroll-triggered content.

**Style**:
- Uses `framer-motion` `motion.div` with `whileInView`
- Initial: `{ opacity: 0, y: 20 }`
- Animate: `{ opacity: 1, y: 0 }`
- Transition: `{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }`
- `viewport={{ once: true, margin: "-100px" }}`

---

## LAYER 3: DOMAIN COMPONENTS

---

### PRODUCT DOMAIN

---

### 3.1 `ProductCard`

**Purpose**: Product display card for grids and carousels.

**Props**:
```
product: {
  _id: string
  slug: string
  name: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: string
  averageRating: number
  reviewCount: number
  stock: number
}
```

**States**:
| State | Behavior |
|-------|----------|
| Default | Image + info |
| Hover | Card lifts (-4px), shadow deepens, image subtle zoom |
| Out of stock | "Out of Stock" overlay on image, add-to-cart hidden |

**Composes**: ImageWithFallback, PriceDisplay, StarRating, Badge (category).

**Style**:
- `bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm`
- `hover:shadow-lg hover:-translate-y-1 transition-all duration-300`
- Image area: `aspect-square bg-slate-50`, image `hover:scale-105 transition-transform duration-500`
- Content: `p-4 space-y-2`
- Category: `text-xs font-medium uppercase tracking-wide text-indigo-500`
- Name: `text-base font-semibold text-slate-800 line-clamp-2`
- Price + rating row: `flex items-center justify-between`

---

### 3.2 `ProductGrid`

**Purpose**: Responsive grid layout for product cards.

**Props**:
```
products: Product[]
isLoading?: boolean
columns?: 3 | 4                   // Default 4
```

**States**:
| State | Behavior |
|-------|----------|
| Loading | Grid of skeleton cards (pulse animation) |
| Empty | EmptyState: "No products found" |
| With data | Animated grid of ProductCards (staggered fade-up) |

**Composes**: ProductCard, EmptyState, Skeleton.

**Style**:
- `grid gap-6`
- `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- 3-column variant: drops xl:grid-cols-4
- Stagger animation: `container.staggerChildren = 0.05`

---

### 3.3 `ProductGallery`

**Purpose**: Image gallery with main image + thumbnail strip on product detail page.

**Props**:
```
images: string[]
productName: string               // Alt text
```

**States**:
| State | Behavior |
|-------|----------|
| Default | First image as main, thumbnails below |
| Thumbnail click | Main image swaps with smooth crossfade |
| Single image | No thumbnails shown |

**Composes**: ImageWithFallback.

**Style**:
- Main image: `aspect-square rounded-xl overflow-hidden bg-slate-50`
- Thumbnails: `flex gap-3 mt-3`
- Each thumbnail: `w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2`
- Active thumbnail: `border-indigo-500`
- Inactive: `border-transparent hover:border-slate-300`
- Crossfade: `transition-opacity duration-300`

---

### 3.4 `ProductInfo`

**Purpose**: Right-side product detail panel (name, price, stock, add-to-cart).

**Props**:
```
product: Product
onAddToCart: (quantity: number) => void
isAddingToCart?: boolean
```

**States**:
| State | Behavior |
|-------|----------|
| In stock | Full info + quantity selector + Add to Cart button |
| Out of stock | "Out of Stock" label, Add to Cart disabled |
| Adding to cart | Button shows spinner + "Adding..." |

**Composes**: PriceDisplay, StarRating, QuantitySelector, StatusBadge, Button.

**Style**:
- `space-y-6`
- Category badge at top
- Product name: H1 `text-3xl font-bold text-slate-900`
- Rating row: StarRating + review count link
- Price: PriceDisplay (lg size)
- Stock: emerald text "In Stock (24 left)" or red text "Out of Stock"
- Divider
- Quantity selector + Add to Cart button (lg, primary, full-width on mobile)

---

### 3.5 `ProductFilters`

**Purpose**: Sidebar filter controls for product listing page.

**Props**:
```
categories: string[]
selectedCategory?: string
priceRange?: [number, number]
onCategoryChange: (category: string | undefined) => void
onPriceChange: (range: [number, number]) => void
onClear: () => void
```

**States**:
| State | Behavior |
|-------|----------|
| Desktop | Visible sidebar (w-64) |
| Mobile | Hidden, shown via Sheet (filter icon trigger) |
| Has active filters | "Clear all" link appears at top |

**Composes**: Checkbox, Slider (price range), Button, Sheet (mobile).

**Style**:
- `space-y-6`
- Section headings: `text-sm font-semibold text-slate-700 mb-3`
- Category items: checkbox + label, selected gets indigo highlight
- Price range: dual-thumb slider with min/max display
- Clear all: ghost button, `text-sm text-indigo-500`

---

### 3.6 `CategoryCard`

**Purpose**: Visual category card for homepage category section.

**Props**:
```
category: {
  name: string
  slug: string
  image: string
  productCount: number
}
```

**States**: Default → hover (lift + shadow).

**Style**:
- `relative overflow-hidden rounded-xl aspect-[4/3] group cursor-pointer`
- Background image with dark gradient overlay (`from-black/60 to-transparent`)
- Category name: `text-xl font-bold text-white` positioned bottom-left
- Count: `text-sm text-white/80`
- Hover: image scale 1.05, overlay darkens slightly

---

### 3.7 `RelatedProducts`

**Purpose**: "You might also like" section on product detail page.

**Props**:
```
products: Product[]
title?: string                    // Default: "Related Products"
```

**Composes**: SectionWrapper, ProductCard (or smaller variant).

**Style**:
- Horizontal scroll on mobile (`flex overflow-x-auto gap-4 snap-x`)
- Grid on desktop (`grid grid-cols-4 gap-6`)
- Section title: H3 with "View All" link to category

---

### CART DOMAIN

---

### 3.8 `CartItem`

**Purpose**: Single item row in the cart page.

**Props**:
```
item: {
  product: Product
  quantity: number
  price: number
}
onUpdateQuantity: (quantity: number) => void
onRemove: () => void
```

**States**:
| State | Behavior |
|-------|----------|
| Default | Image + name + price + quantity controls + remove |
| Updating | Quantity selector disabled briefly during API call |
| Removing | Row fades out with `exit` animation |

**Composes**: ImageWithFallback, PriceDisplay, QuantitySelector.

**Style**:
- `flex items-center gap-4 py-4 border-b border-slate-100`
- Image: `w-20 h-20 rounded-lg`
- Name: `text-sm font-medium text-slate-800`
- Price: per-item price right-aligned
- Remove button: ghost, `text-slate-400 hover:text-red-500`, Trash2 icon
- Mobile: stack image + info vertically, quantity + price row below

---

### 3.9 `CartSummary`

**Purpose**: Order total summary panel in cart and checkout.

**Props**:
```
subtotal: number
shippingCost?: number
tax?: number
total: number
actionLabel?: string              // "Proceed to Checkout" | "Place Order"
onAction: () => void
isLoading?: boolean
itemCount: number
```

**States**:
| State | Behavior |
|-------|----------|
| Default | Summary lines + action button |
| Loading | Action button shows spinner |
| Empty cart | Action button disabled |

**Composes**: PriceDisplay, Button, Separator.

**Style**:
- `bg-white rounded-xl p-6 border border-slate-100 shadow-sm`
- Sticky on desktop: `sticky top-24`
- Line items: `flex justify-between text-sm text-slate-600 py-2`
- Divider before total
- Total: `flex justify-between text-lg font-bold text-slate-900 py-3`
- Action button: full-width, primary, lg size

---

### 3.10 `CartEmpty`

**Purpose**: Empty cart state.

**Props**: None.

**Composes**: EmptyState.

**Style**: EmptyState with ShoppingCart icon, "Your cart is empty", "Browse Products" action.

---

### 3.11 `CartIcon`

**Purpose**: Cart icon with item count badge for navbar.

**Props**:
```
count: number
```

**States**:
| State | Behavior |
|-------|----------|
| Empty (0) | ShoppingCart icon, no badge |
| Has items | ShoppingCart icon + red/indigo count badge |
| Item added | Badge briefly scales up (spring animation) |

**Style**:
- `relative` wrapper
- Badge: `absolute -top-2 -right-2 min-w-[18px] h-[18px] rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center`
- Add animation: `scale(1.3) → scale(1)` spring

---

### CHECKOUT DOMAIN

---

### 3.12 `ShippingForm`

**Purpose**: Shipping address input form (checkout step 1).

**Props**:
```
defaultValues?: ShippingAddress
onSubmit: (address: ShippingAddress) => void
onBack?: () => void
isLoading?: boolean
```

**States**:
| State | Behavior |
|-------|----------|
| Default | Empty form or pre-filled from previous order |
| Validating | Inline errors on blur |
| Submitting | Next button shows spinner |

**Composes**: FormField, Input, Select (for country), Button.

**Fields**: fullName, phone, street, city, state, postalCode, country.

**Style**:
- `space-y-4`
- Two-column on desktop for city + state, postalCode + country
- Single column on mobile
- Buttons row: "Back" (secondary, left) + "Continue" (primary, right)

---

### 3.13 `OrderReview`

**Purpose**: Pre-confirmation order summary (checkout step 2).

**Props**:
```
items: CartItem[]
shippingAddress: ShippingAddress
subtotal: number
shippingCost: number
tax: number
total: number
onConfirm: () => void
onBack: () => void
isLoading?: boolean
```

**Composes**: CartItem (read-only variant), PriceDisplay.

**Style**:
- Two sections: "Shipping To" card + "Order Items" card
- Shipping: address displayed in a bordered card, "Edit" link
- Items: compact list (smaller images, no quantity controls)
- Totals: same layout as CartSummary
- "Place Order" button: primary lg, full-width

---

### 3.14 `OrderConfirmation`

**Purpose**: Success screen after order placement.

**Props**:
```
orderNumber: string
orderId: string
estimatedDelivery?: string
```

**Style**:
- Centered layout, `max-w-md mx-auto py-16 text-center`
- Large green CheckCircle icon (animated scale-in)
- "Order Confirmed!" heading
- Order number in mono font
- Estimated delivery date
- Two buttons: "View Order" (primary) + "Continue Shopping" (secondary)
- Confetti or subtle particles animation (optional, using Framer Motion)

---

### ORDER DOMAIN

---

### 3.15 `OrderCard`

**Purpose**: Single order summary in the order history list.

**Props**:
```
order: {
  _id: string
  orderNumber: string
  status: OrderStatus
  items: OrderItem[]
  totalAmount: number
  createdAt: Date
}
```

**Composes**: StatusBadge, PriceDisplay, ImageWithFallback.

**Style**:
- `bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 transition-colors`
- Header: order number (mono) + StatusBadge + date
- Items preview: row of first 3 product thumbnails (`w-12 h-12 rounded-lg`) + "+N more"
- Footer: total amount + "View Details" outline button
- Clickable: entire card links to order detail

---

### 3.16 `OrderItems`

**Purpose**: List of items within an order detail view.

**Props**:
```
items: OrderItem[]
```

**Composes**: ImageWithFallback, PriceDisplay.

**Style**:
- Each item: `flex items-center gap-4 py-4 border-b border-slate-50`
- Image: `w-16 h-16 rounded-lg`
- Name + quantity: left side
- Price: right side
- Clean and compact — no interactivity

---

### 3.17 `OrderTimeline`

**Purpose**: Visual delivery tracking timeline on order detail page.

**Props**:
```
deliveryUpdates: DeliveryUpdate[]
currentStatus: OrderStatus
estimatedDelivery?: Date
```

**Composes**: Timeline (shared), StatusBadge.

**Style**:
- Uses Timeline component with order-specific status icons
- Each status gets its mapped Lucide icon (Clock, CheckCircle, Truck, MapPin, PackageCheck)
- Active step has pulsing indicator
- Estimated delivery shown at bottom if not yet delivered
- Delivered state: green accent throughout the entire timeline

---

### 3.18 `OrderStatusUpdater`

**Purpose**: Admin dropdown to change order status step-by-step.

**Props**:
```
currentStatus: OrderStatus
orderId: string
onStatusUpdate: (newStatus: OrderStatus) => void
isLoading?: boolean
```

**States**:
| State | Behavior |
|-------|----------|
| Default | Shows current status + "Next Status" button |
| Updating | Button shows spinner |
| Delivered | No further updates possible, shows "Delivered" badge |
| Cancelled | No further updates possible |

**Logic**: Only allows advancing to the NEXT status in the pipeline. No skipping.

**Style**:
- `flex items-center gap-3`
- Current status: StatusBadge
- Arrow icon
- Next status button: primary (shows what the next status will be)
- Or: Select dropdown with only valid next statuses

---

### REVIEW DOMAIN

---

### 3.19 `ReviewCard`

**Purpose**: Single review display on product detail page.

**Props**:
```
review: {
  _id: string
  user: { name: string; avatar?: string }
  rating: number
  title: string
  content: string
  isVerified: boolean
  createdAt: Date
}
```

**Composes**: StarRating, VerifiedBadge, Avatar.

**Style**:
- `bg-white rounded-xl p-6 border border-slate-100`
- Header row: Avatar + User name + date (right-aligned)
- StarRating below header
- VerifiedBadge inline next to rating (if verified)
- Title: `font-semibold text-slate-800`
- Content: `text-sm text-slate-600 mt-2 leading-relaxed`
- "Verify on Chain" link: `text-xs text-violet-500 hover:text-violet-600 mt-3` with Link2 icon

---

### 3.20 `ReviewForm`

**Purpose**: Review submission form for verified buyers.

**Props**:
```
productName: string
onSubmit: (data: { rating: number; title: string; content: string }) => void
isSubmitting?: boolean
```

**States**:
| State | Behavior |
|-------|----------|
| Default | Interactive star rating + title input + content textarea |
| Validating | Inline errors (minimum rating, minimum content length) |
| Submitting | Button shows spinner + "Storing on IPFS & Blockchain..." |
| Success | Form replaced with success message + VerifiedBadge |

**Composes**: StarRating (interactive), FormField, Input, Textarea, Button.

**Style**:
- `max-w-xl space-y-6`
- Heading: "Review {productName}"
- Star rating: large size, interactive
- Title: single-line input
- Content: textarea with min-height 120px
- Info box: subtle indigo-50 box explaining "Your review will be stored on IPFS and verified on blockchain"
- Submit button: primary with ShieldCheck icon, "Submit Verified Review"

---

### 3.21 `ReviewList`

**Purpose**: Paginated list of reviews on product detail page.

**Props**:
```
productId: string
reviews: Review[]
totalCount: number
averageRating: number
isLoading?: boolean
```

**Composes**: ReviewCard, RatingDistribution, Pagination, EmptyState, Select (sort).

**Style**:
- Header: "Customer Reviews" + average rating display + total count
- Sort dropdown: "Newest", "Highest Rated", "Lowest Rated"
- RatingDistribution component
- Divider
- List of ReviewCards with `space-y-4`
- Pagination at bottom
- Empty: "No reviews yet. Be the first!"

---

### 3.22 `RatingDistribution`

**Purpose**: 5-star breakdown bar chart showing how many reviews per star level.

**Props**:
```
distribution: {
  5: number
  4: number
  3: number
  2: number
  1: number
}
totalReviews: number
```

**Style**:
- `space-y-2`
- Each row: `flex items-center gap-3`
  - Star label: `text-sm text-slate-600 w-8` ("5 ★")
  - Bar: `flex-1 h-2 bg-slate-100 rounded-full overflow-hidden`
  - Fill: `h-full bg-amber-400 rounded-full` (width = percentage)
  - Count: `text-sm text-slate-400 w-8 text-right`

---

### 3.23 `VerificationProof`

**Purpose**: Full blockchain proof display on the verification page.

**Props**:
```
proof: {
  review: Review
  ipfsHash: string
  ipfsContent: string             // Fetched from IPFS for comparison
  contentHash: string
  txHash: string
  blockNumber: number
  contractAddress: string
  timestamp: Date
  checks: {
    contentMatch: boolean
    proofExists: boolean
    buyerVerified: boolean
  }
}
isLoading?: boolean
```

**States**:
| State | Behavior |
|-------|----------|
| Loading | Skeleton cards with pulse |
| Verified (all checks pass) | Green checks, "Fully Verified" header |
| Partial (some checks fail) | Yellow warnings on failed checks |
| Failed | Red indicators |

**Composes**: StatusBadge, VerifiedBadge.

**Style**:
- Page background: `bg-gradient-to-br from-violet-50 to-indigo-50 min-h-screen`
- Main card: `bg-white rounded-2xl p-8 shadow-xl max-w-2xl mx-auto`
- Header: ShieldCheck icon (large, violet) + "Review Verification" title
- Review content preview: quoted block with rating and text
- Proof data grid: 2-column grid of label-value pairs
  - Labels: `text-xs uppercase tracking-wider text-slate-400`
  - Values: `font-mono text-sm text-slate-800` with copy button
  - IPFS Hash, Content Hash, Tx Hash: truncated with copy-to-clipboard
- Verification checks: three rows
  - Each: icon (CheckCircle green or XCircle red) + check name + status
  - `bg-emerald-50 rounded-lg p-3` for passed
  - `bg-red-50 rounded-lg p-3` for failed
- External links: "View on IPFS" + "View Transaction" buttons (ghost with external link icon)

---

### ADMIN DOMAIN

---

### 3.24 `RevenueChart`

**Purpose**: 30-day revenue trend chart on admin dashboard.

**Props**:
```
data: { date: string; revenue: number }[]
isLoading?: boolean
```

**Composes**: Uses Recharts library (AreaChart).

**Style**:
- `bg-white rounded-xl p-6 border border-slate-100`
- Header: "Revenue" title + period label + total value
- Chart: area fill with indigo-500 stroke, indigo-50 fill
- Grid lines: subtle slate-100
- Tooltip: white card with shadow-lg
- Responsive: full-width, h-80

---

### 3.25 `RecentOrders`

**Purpose**: Quick-view table of latest orders on admin dashboard.

**Props**:
```
orders: Order[]
isLoading?: boolean
```

**Composes**: DataTable (simplified), StatusBadge, PriceDisplay.

**Style**:
- `bg-white rounded-xl border border-slate-100`
- Header: "Recent Orders" + "View All" link
- Columns: Order #, Customer, Status, Total, Date
- Max 5-7 rows, no pagination (dashboard quick view)
- Each row links to order detail

---

### 3.26 `ProductForm`

**Purpose**: Create/edit product form for admin.

**Props**:
```
defaultValues?: Product           // Pre-fill for edit mode
onSubmit: (data: ProductFormData) => void
isSubmitting?: boolean
mode: "create" | "edit"
```

**States**:
| State | Behavior |
|-------|----------|
| Create | Empty form, "Create Product" title |
| Edit | Pre-filled form, "Edit Product" title |
| Submitting | Button disabled with spinner |
| Validation errors | Inline field errors |

**Composes**: FormField, Input, Textarea, Select, Button.

**Fields**: name, description, price, compareAtPrice, category (select), stock, sku, images (URL inputs), tags, isActive (toggle).

**Style**:
- `max-w-2xl space-y-6`
- Grouped sections with subtle headings: "Basic Info", "Pricing", "Inventory", "Media"
- Two-column where logical (price + compareAtPrice, stock + sku)
- Image inputs: list of URL fields with add/remove
- Toggle for isActive: "Published" / "Draft"
- Bottom: Cancel (secondary) + Submit (primary)

---

### 3.27 `UserTable`

**Purpose**: User management table for admin.

**Props**:
```
users: User[]
onRoleChange?: (userId: string, newRole: UserRole) => void
onDeactivate?: (userId: string) => void
isLoading?: boolean
```

**Composes**: DataTable, Avatar, Badge (role), DropdownMenu (actions).

**Style**:
- Standard DataTable
- Columns: Avatar + Name, Email, Role (badge), Joined Date, Orders Count, Actions
- Role badge: `admin` = indigo, `customer` = slate
- Actions dropdown: "Change Role", "View Orders", "Deactivate" (red)

---

### HOMEPAGE DOMAIN

---

### 3.28 `HeroSection`

**Purpose**: Above-the-fold landing section.

**Props**: None (static or minimal dynamic data like review count).

**Style**:
- Full-width, `py-24 lg:py-32`
- Background: mesh gradient (indigo-100/violet-100/amber-50 radial gradients)
- Content: centered `max-w-3xl`
- Glass card: `bg-white/80 backdrop-blur-xl rounded-2xl p-10 shadow-xl`
- Headline: display size, Plus Jakarta Sans 700, `text-slate-900`
  - "Every review," (line 1)
  - "blockchain proven." (line 2, gradient text indigo → violet)
- Subtext: `text-lg text-slate-600 mt-4`
- CTA: primary button lg + secondary button lg, `flex gap-4 mt-8`
- Trust stats row below: "X+ Products", "X+ Verified Reviews", "100% Transparent"
  - Small icons + text, `flex gap-8 mt-8 text-sm text-slate-500`
- Framer Motion: staggered fade-up for each element

---

### 3.29 `TrustBar`

**Purpose**: Horizontal strip of trust signals below hero.

**Props**: None (static).

**Style**:
- `py-8 bg-white border-y border-slate-100`
- `flex items-center justify-center gap-12 lg:gap-16`
- 4 items: ShieldCheck "Verified Reviews", Truck "Free Shipping", CreditCard "Secure Checkout", Star "Quality Products"
- Each: icon (`w-6 h-6 text-indigo-500`) + text (`text-sm font-medium text-slate-600`)
- Mobile: 2×2 grid instead of horizontal row

---

### 3.30 `FeaturedProducts`

**Purpose**: Product showcase section on homepage.

**Props**:
```
products: Product[]
isLoading?: boolean
```

**Composes**: SectionWrapper, ProductGrid (4 cols), ProductCard.

**Style**:
- SectionWrapper with title "Featured Products" + "View All →" link
- Limit: 8 products max (2 rows of 4)
- Mobile: 2 cols, show 4 products

---

### 3.31 `CategorySection`

**Purpose**: Browse-by-category visual section on homepage.

**Props**:
```
categories: Category[]
```

**Composes**: SectionWrapper, CategoryCard.

**Style**:
- SectionWrapper with slate background, title "Shop by Category"
- Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`

---

### 3.32 `HowItWorks`

**Purpose**: 3-step visual explainer for the verified review system.

**Props**: None (static content).

**Style**:
- SectionWrapper, title "How Verified Reviews Work"
- 3 cards in a row: `grid grid-cols-1 md:grid-cols-3 gap-8`
- Each card:
  - Step number: `text-xs font-bold text-indigo-500 uppercase` "Step 1"
  - Icon: `w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4`
  - Title: H4 `font-semibold text-slate-800`
  - Description: `text-sm text-slate-500`
- Steps:
  1. ShoppingBag icon — "Purchase a Product" — "Order any product from our catalog."
  2. PackageCheck icon — "Receive Your Order" — "Once delivered, your review eligibility is unlocked."
  3. ShieldCheck icon — "Write a Verified Review" — "Your review is stored on IPFS and proven on blockchain. Anyone can verify."
- Connector lines between cards on desktop (decorative dashed lines)

---

## COMPONENT DEPENDENCY MAP

```
Page                    Composes
─────────────────────────────────────────────────────────
Homepage                HeroSection, TrustBar, FeaturedProducts,
                        CategorySection, HowItWorks

Product Listing         PageHeader, SearchInput, ProductFilters,
                        ProductGrid, Pagination

Product Detail          ProductGallery, ProductInfo, ReviewList,
                        RelatedProducts, ReviewCard, VerifiedBadge

Cart                    PageHeader, CartItem, CartSummary, CartEmpty

Checkout                StepIndicator, ShippingForm, OrderReview,
                        CartSummary, OrderConfirmation

Order History           PageHeader, OrderCard, Pagination, EmptyState

Order Detail            OrderItems, OrderTimeline, StatusBadge,
                        PriceDisplay

Review Form             ReviewForm, StarRating, FormField,
                        VerifiedBadge

Verification Page       VerificationProof, VerifiedBadge

Admin Dashboard         AdminLayout, StatCard (×4), RevenueChart,
                        RecentOrders

Admin Products          AdminLayout, DataTable, ProductForm,
                        ConfirmDialog

Admin Orders            AdminLayout, DataTable, OrderStatusUpdater,
                        OrderTimeline, StatusBadge

Admin Users             AdminLayout, UserTable
```

---

## REUSE STRATEGY SUMMARY

| Component | Used In (count) |
|-----------|----------------|
| Button | Every page (30+) |
| PriceDisplay | 6 pages |
| StatusBadge | 5 pages |
| StarRating | 4 pages |
| ImageWithFallback | 6 pages |
| FormField | 5 forms |
| EmptyState | 6 pages |
| Pagination | 4 pages |
| DataTable | 4 admin pages |
| VerifiedBadge | 3 pages |
| Container | Every page |
| AnimatedSection | Every public page |

---

## INSTALL LIST (shadcn/ui components to add)

```bash
npx shadcn@latest init
npx shadcn@latest add button input label badge card dialog
npx shadcn@latest add dropdown-menu select textarea toast
npx shadcn@latest add separator skeleton avatar sheet tooltip
npx shadcn@latest add tabs checkbox radio-group table popover
npx shadcn@latest add slider
```

## ADDITIONAL DEPENDENCIES

```bash
npm install framer-motion          # Animations
npm install recharts               # Admin charts
npm install lucide-react           # Icons (comes with shadcn)
npm install zustand                # State management
npm install @tanstack/react-query  # Server state / data fetching
npm install axios                  # HTTP client
npm install react-hook-form        # Form management
npm install @hookform/resolvers    # Zod resolver for forms
npm install zod                    # Validation (shared with backend)
```

---

*Every component in this system is a building block. Pages are just compositions. No one-off UI. Everything is reusable.*
