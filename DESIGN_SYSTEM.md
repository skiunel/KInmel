# Kinmel — UI/UX Design System

> Premium e-commerce with web3 trust. Clean, confident, modern.

---

## 1. Brand Personality

### Identity
**Kinmel** (किनमेल) means "shopping" in Nepali. The brand combines the warmth and familiarity of local commerce with the precision and trust of blockchain technology.

### Brand Attributes
| Attribute | Expression |
|-----------|-----------|
| **Trustworthy** | Verified badges, proof links, transparent data — trust is shown, not claimed |
| **Premium** | Generous whitespace, restrained palette, quality typography — nothing feels cheap |
| **Modern** | Crisp geometry, subtle motion, glass surfaces — contemporary without being trendy |
| **Confident** | Bold headings, clear hierarchy, decisive CTAs — the UI knows what it wants you to do |
| **Warm** | Rounded corners, soft shadows, human copy — tech that doesn't feel cold |

### Brand Voice (UI Copy)
- **Headlines**: Short, direct, benefit-driven. "Shop with proof." not "Welcome to our blockchain-verified platform."
- **Buttons**: Action verbs. "Add to Cart", "Place Order", "Verify on Chain"
- **Empty states**: Helpful, not sad. "No orders yet — find something you'll love" not "Nothing to display"
- **Errors**: Human, not robotic. "That email's already taken" not "Error: duplicate key"
- **Verification**: Technical but accessible. "This review is stored on IPFS and proven on-chain" not "Decentralized content hash verified via smart contract"

### Brand Tagline Options (for hero section)
- "Every review, blockchain proven."
- "Shop with proof."
- "Verified reviews. Zero trust required."

---

## 2. Color Palette

### Core Palette

```
┌─────────────────────────────────────────────────────────────────┐
│  PRIMARY — Indigo                                               │
│                                                                 │
│  50   #EEF2FF   ░░░░░  Backgrounds, hover tints                │
│  100  #E0E7FF   ░░░░░  Light fills, selected states            │
│  200  #C7D2FE   ░░░░░  Borders on active elements              │
│  300  #A5B4FC   ░░░░░  Focus rings                             │
│  400  #818CF8   ░░░░░  Secondary buttons, links                │
│  500  #6366F1   █████  BRAND PRIMARY — main buttons, accents   │
│  600  #4F46E5   █████  Hover state for primary                 │
│  700  #4338CA   █████  Active/pressed state                    │
│  800  #3730A3   █████  Dark text on light bg                   │
│  900  #312E81   █████  Headings, high-contrast text            │
│  950  #1E1B4B   █████  Near-black for dark surfaces            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ACCENT — Amber (Verified / Trust)                              │
│                                                                 │
│  50   #FFFBEB   ░░░░░  Badge backgrounds                      │
│  100  #FEF3C7   ░░░░░  Highlight strips                       │
│  200  #FDE68A   ░░░░░  Star fills (inactive)                   │
│  400  #FBBF24   █████  Star fills (active), badges             │
│  500  #F59E0B   █████  VERIFIED ACCENT — badges, stars, trust  │
│  600  #D97706   █████  Hover on amber elements                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  NEUTRAL — Slate                                                │
│                                                                 │
│  50   #F8FAFC   ░░░░░  Page background                        │
│  100  #F1F5F9   ░░░░░  Card backgrounds, table stripes         │
│  200  #E2E8F0   ░░░░░  Borders, dividers                      │
│  300  #CBD5E1   ░░░░░  Disabled states, placeholder text       │
│  400  #94A3B8   ░░░░░  Secondary text, icons                  │
│  500  #64748B   █████  Body text (secondary)                   │
│  600  #475569   █████  Body text (primary)                     │
│  700  #334155   █████  Headings (secondary)                    │
│  800  #1E293B   █████  Headings (primary)                      │
│  900  #0F172A   █████  High emphasis text, dark surfaces       │
│  950  #020617   █████  Near-black                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Semantic Colors

```
SUCCESS     #10B981  (Emerald-500)   — Order confirmed, delivery complete, verified
SUCCESS-BG  #ECFDF5  (Emerald-50)    — Success alert backgrounds
ERROR       #EF4444  (Red-500)       — Validation errors, failed states
ERROR-BG    #FEF2F2  (Red-50)        — Error alert backgrounds
WARNING     #F59E0B  (Amber-500)     — Low stock, pending actions
WARNING-BG  #FFFBEB  (Amber-50)      — Warning alert backgrounds
INFO        #3B82F6  (Blue-500)      — Informational, processing states
INFO-BG     #EFF6FF  (Blue-50)       — Info alert backgrounds
```

### Blockchain / Web3 Accent

```
CHAIN       #8B5CF6  (Violet-500)    — Blockchain-specific elements
CHAIN-BG    #F5F3FF  (Violet-50)     — Verification page backgrounds
CHAIN-GLOW  #8B5CF6/20%              — Glow effect on verified badges
IPFS        #65A30D  (Lime-600)      — IPFS-specific indicators
```

### Gradient Definitions

```
HERO-GRADIENT:      from-indigo-600 via-indigo-500 to-violet-500
                    (used on hero section, primary CTAs)

VERIFIED-GRADIENT:  from-amber-400 to-amber-500
                    (verified badge shimmer)

GLASS-GRADIENT:     from-white/80 to-white/60 + backdrop-blur-xl
                    (glass cards on hero, floating elements)

MESH-GRADIENT:      Radial gradients of indigo-100 + violet-100 + amber-50
                    (subtle background texture on hero/auth pages)
```

### Usage Rules
- Primary indigo is ONLY for interactive elements: buttons, links, focus rings, active states
- Amber is ONLY for trust/verification: verified badges, star ratings, blockchain indicators
- Violet is ONLY for blockchain/web3 elements: verification page, chain badges, proof displays
- Neutral slate is for everything else: text, backgrounds, borders, dividers
- Never use more than 2 accent colors in a single component
- Page backgrounds are always slate-50 (#F8FAFC), never pure white
- Cards are always white (#FFFFFF) to lift off the slate-50 background

---

## 3. Typography System

### Font Stack

```
HEADINGS:   "Plus Jakarta Sans", system-ui, sans-serif
            Weight: 600 (semibold), 700 (bold)
            Tracking: -0.025em (tight)

BODY:       "Inter", system-ui, sans-serif
            Weight: 400 (regular), 500 (medium)
            Tracking: normal

MONO:       "JetBrains Mono", "Fira Code", monospace
            Used for: tx hashes, IPFS CIDs, order numbers, code
            Weight: 400
```

### Type Scale

```
DISPLAY     48px / 3rem      Plus Jakarta Sans 700    -0.025em    Hero headlines
H1          36px / 2.25rem   Plus Jakarta Sans 700    -0.025em    Page titles
H2          30px / 1.875rem  Plus Jakarta Sans 600    -0.025em    Section titles
H3          24px / 1.5rem    Plus Jakarta Sans 600    -0.02em     Card titles, modal titles
H4          20px / 1.25rem   Plus Jakarta Sans 600    -0.02em     Subsection titles
H5          18px / 1.125rem  Inter 600                normal      Label headings
BODY-LG     18px / 1.125rem  Inter 400                normal      Lead paragraphs
BODY        16px / 1rem      Inter 400                normal      Default body text
BODY-SM     14px / 0.875rem  Inter 400                normal      Secondary text, captions
CAPTION     12px / 0.75rem   Inter 500                0.05em      Labels, badges, metadata
OVERLINE    11px / 0.6875rem Inter 600 UPPERCASE      0.1em       Category labels, section tags
```

### Line Heights

```
Headings:   1.2  (tight — gives density and authority)
Body:       1.6  (comfortable reading)
Captions:   1.4  (compact but legible)
```

### Text Color Mapping

```
Heading primary:      slate-900   #0F172A
Heading secondary:    slate-700   #334155
Body primary:         slate-600   #475569
Body secondary:       slate-400   #94A3B8
Body on dark bg:      white       #FFFFFF
Link default:         indigo-500  #6366F1
Link hover:           indigo-600  #4F46E5
Error text:           red-500     #EF4444
Success text:         emerald-600 #059669
```

### Typography Rules
- Never go below 12px for any text
- Headings always use Plus Jakarta Sans, never Inter
- Body text always uses Inter, never Plus Jakarta Sans
- Monospace is exclusively for technical identifiers (hashes, order numbers, SKUs)
- Max line width for body text: 65-75 characters (~680px)
- Price text: Inter 600 (medium-bold) at body size or larger, never light weight

---

## 4. Spacing System

### Base Unit: 4px

```
0     0px        —
0.5   2px        Micro gaps (icon-to-text inline)
1     4px        Minimum spacing
1.5   6px        Tight internal padding (badges)
2     8px        Compact padding, small gaps
3     12px       Default gap between related elements
4     16px       Standard padding, component gaps
5     20px       Comfortable padding
6     24px       Section internal padding
8     32px       Card padding, component separation
10    40px       Section gaps
12    48px       Large section padding
16    64px       Section separation on pages
20    80px       Hero section padding
24    96px       Major page sections vertical spacing
```

### Spacing Rules

```
CARD PADDING:
  Desktop:    p-6  (24px)
  Mobile:     p-4  (16px)

CARD GAP (in grids):
  Desktop:    gap-6  (24px)
  Mobile:     gap-4  (16px)

PAGE HORIZONTAL PADDING:
  Desktop:    px-8 or container mx-auto max-w-7xl px-6
  Tablet:     px-6
  Mobile:     px-4

SECTION VERTICAL SPACING:
  Between sections:    py-16 to py-24  (64-96px)
  Within sections:     space-y-8 to space-y-12

FORM FIELD SPACING:
  Between fields:      space-y-4  (16px)
  Label to input:      space-y-1.5 (6px)
  Error below input:   mt-1.5 (6px)

BUTTON INTERNAL PADDING:
  Default:    px-4 py-2.5  (16px × 10px)
  Large:      px-6 py-3    (24px × 12px)
  Small:      px-3 py-1.5  (12px × 6px)

NAVBAR HEIGHT:
  Desktop:    h-16  (64px)
  Mobile:     h-14  (56px)

SIDEBAR WIDTH (admin):
  Expanded:   w-64  (256px)
  Collapsed:  w-16  (64px)
```

### Container Widths

```
max-w-7xl    1280px    Primary content container
max-w-5xl    1024px    Narrow content (checkout, auth)
max-w-3xl    768px     Form-focused pages
max-w-md     448px     Auth cards, modals
```

---

## 5. Icon Style

### Library: Lucide React

```
Why Lucide:
  - Clean 24×24 grid, 2px stroke
  - Consistent style across 1000+ icons
  - Tree-shakeable (only import what you use)
  - Perfect match for shadcn/ui (already included)
```

### Icon Sizing

```
XS     14px    w-3.5 h-3.5    Inline with caption text, badge icons
SM     16px    w-4 h-4        Inline with body text, button icons
MD     20px    w-5 h-5        Default standalone, nav items
LG     24px    w-6 h-6        Card feature icons, section icons
XL     32px    w-8 h-8        Empty state illustrations, stat icons
2XL    48px    w-12 h-12      Hero feature icons, major empty states
```

### Icon Color Rules
- Navigation icons: slate-400, hover → slate-600
- Active nav icons: indigo-500
- Button icons: inherit button text color
- Decorative icons in cards: indigo-500 on indigo-50 circle background
- Blockchain/verified icons: amber-500 or violet-500
- Status icons: use semantic colors (green check, red x, amber clock)

### Key Icon Mapping

```
NAVIGATION:
  Home            → Home
  Products        → Package
  Cart            → ShoppingCart
  Orders          → ClipboardList
  Profile         → User
  Admin           → LayoutDashboard
  Search          → Search
  Menu            → Menu

ACTIONS:
  Add to cart     → Plus or ShoppingCart
  Remove          → Trash2
  Edit            → Pencil
  Delete          → Trash2
  Save            → Check
  Cancel          → X
  Filter          → SlidersHorizontal
  Sort            → ArrowUpDown

ORDER STATUS:
  Pending         → Clock
  Confirmed       → CheckCircle
  Processing      → Loader2
  Shipped         → Truck
  Out for delivery→ MapPin
  Delivered       → PackageCheck
  Cancelled       → XCircle

BLOCKCHAIN / TRUST:
  Verified        → ShieldCheck
  Blockchain      → Link2 or Blocks
  IPFS            → Database
  Proof           → Fingerprint
  Transaction     → ArrowRightLeft
  Verify          → ScanSearch
  Star (filled)   → Star (fill="currentColor")
  Star (empty)    → Star
```

---

## 6. Border Radius Rules

```
NONE        rounded-none    0px     Never used (everything has some radius)

SM          rounded-sm      2px     Never used

DEFAULT     rounded         4px     Rarely — inline code snippets only

MD          rounded-md      6px     Inputs, selects, textareas, small badges

LG          rounded-lg      8px     Cards, dropdowns, modals, dialogs, tooltips
                                    THIS IS THE DEFAULT for most components

XL          rounded-xl      12px    Featured cards, hero cards, image containers

2XL         rounded-2xl     16px    Large feature sections, glass panels, auth card

FULL        rounded-full    9999px  Avatars, badges, pills, icon buttons, tags
```

### Radius Rules
- All interactive components minimum `rounded-md` (6px)
- Cards always `rounded-lg` (8px) or `rounded-xl` (12px) for featured
- Buttons are `rounded-lg` (8px), never fully rounded (too playful)
- Avatars and status dots are always `rounded-full`
- Images inside cards inherit the card's radius with `overflow-hidden`
- Nested elements never have more radius than their parent

---

## 7. Shadows & Blur Rules

### Shadow Scale

```
NONE        shadow-none
            Used for: flat elements, elements inside cards

SM          shadow-sm         0 1px 2px rgba(0,0,0,0.05)
            Used for: inputs at rest, subtle card edges

DEFAULT     shadow            0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
            Used for: buttons at rest, dropdown triggers

MD          shadow-md         0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)
            Used for: cards at rest, navbar (if not bordered)

LG          shadow-lg         0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
            Used for: cards on hover, dropdowns, popovers, modals

XL          shadow-xl         0 20px 25px rgba(0,0,0,0.1), 0 8px 10px rgba(0,0,0,0.04)
            Used for: floating elements, hero cards, featured sections

2XL         shadow-2xl        0 25px 50px rgba(0,0,0,0.15)
            Used for: rarely — only full-page modals or hero overlays
```

### Custom Shadows

```
CARD-HOVER:     0 8px 30px rgba(99, 102, 241, 0.08)
                Indigo-tinted shadow for card hover states

VERIFIED-GLOW:  0 0 20px rgba(245, 158, 11, 0.15)
                Amber glow around verified badges

CHAIN-GLOW:     0 0 20px rgba(139, 92, 246, 0.15)
                Violet glow around blockchain elements

INPUT-FOCUS:    0 0 0 3px rgba(99, 102, 241, 0.15)
                Combined with ring-2 ring-indigo-300 for focus state
```

### Backdrop Blur

```
blur-sm       4px       Subtle glass effect
blur          8px       Standard glass panels
blur-md       12px      NOT USED (odd step)
blur-lg       16px      Heavy glass — hero overlays
blur-xl       24px      Maximum glass — floating nav on scroll
```

### Shadow Rules
- Cards go from `shadow-sm` → `shadow-lg` on hover (with transition)
- Dropdowns and popovers always use `shadow-lg`
- Modals use `shadow-xl` with a `bg-black/50 backdrop-blur-sm` overlay
- Navbar uses `shadow-sm` only after scrolling (transparent at top)
- Never stack shadows (don't put a shadow-md card inside a shadow-lg container)
- Glass elements: `bg-white/80 backdrop-blur-xl shadow-lg border border-white/20`

---

## 8. Motion & Animation Style

### Philosophy
Motion should feel **natural and intentional**. Every animation serves a purpose: guiding attention, confirming actions, or smoothing transitions. Nothing bounces. Nothing spins unnecessarily. Nothing delays the user.

### Framer Motion Defaults

```
TIMING:
  Fast:       0.15s    Button press feedback, toggles
  Normal:     0.2s     Most transitions, hover states
  Smooth:     0.3s     Page elements entering, modals opening
  Slow:       0.5s     Hero animations, staggered lists
  Lazy:       0.8s     Background decorative animations only
```

### Easing Curves

```
DEFAULT:    [0.25, 0.1, 0.25, 1.0]     ease (CSS default)
            Used for: most transitions

SMOOTH:     [0.4, 0.0, 0.2, 1.0]       ease-out-cubic
            Used for: elements entering the screen

SPRING:     { type: "spring", stiffness: 300, damping: 30 }
            Used for: interactive elements, button presses

BOUNCE:     NEVER USED — too playful for the brand
```

### Animation Patterns

```
FADE-UP (page elements entering):
  initial:    { opacity: 0, y: 20 }
  animate:    { opacity: 1, y: 0 }
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  Use:        Section headings, cards entering viewport, page content

FADE-IN (subtle appearance):
  initial:    { opacity: 0 }
  animate:    { opacity: 1 }
  transition: { duration: 0.3 }
  Use:        Dropdowns, tooltips, toast notifications

SCALE-IN (modals, dialogs):
  initial:    { opacity: 0, scale: 0.95 }
  animate:    { opacity: 1, scale: 1 }
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  Use:        Modal open, dialog open

SLIDE-IN-RIGHT (mobile nav, drawers):
  initial:    { x: "100%" }
  animate:    { x: 0 }
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  Use:        Mobile menu, side drawers

STAGGER (list items):
  Container:  { staggerChildren: 0.05 }
  Children:   fade-up pattern
  Use:        Product grids, order lists, review lists

HOVER-LIFT (cards):
  whileHover: { y: -4 }
  transition: { duration: 0.2 }
  Combined with shadow-sm → shadow-lg transition
  Use:        Product cards, feature cards

PRESS (buttons):
  whileTap:   { scale: 0.98 }
  transition: { duration: 0.1 }
  Use:        All clickable buttons
```

### CSS Transition Defaults

```
For elements not using Framer Motion:

transition-colors     duration-200    Color changes (hover, focus)
transition-shadow     duration-200    Shadow changes (card hover)
transition-transform  duration-200    Scale/translate changes
transition-all        duration-300    Multiple properties changing

IMPORTANT: Always specify which properties transition.
           Never use transition-all on elements with layout changes.
```

### Motion Rules
- Every hover state must transition (never instant color/shadow changes)
- Page content uses fade-up with stagger on first load only (not on every route change)
- Route transitions: simple fade (0.2s), no slide (feels sluggish on navigation)
- Loading spinners: `animate-spin` with `duration-700` (calm, not frantic)
- Skeleton loaders: `animate-pulse` with default timing
- Toast notifications: slide-in from top-right, fade-out after 4 seconds
- Never animate width/height changes (use opacity + scale instead — avoids layout thrash)
- Respect `prefers-reduced-motion`: disable all motion except opacity transitions

---

## 9. Button Styles

### Variants

```
PRIMARY (main CTA):
  Base:     bg-indigo-500 text-white rounded-lg
  Hover:    bg-indigo-600 shadow-md
  Active:   bg-indigo-700 scale-[0.98]
  Focus:    ring-2 ring-indigo-300 ring-offset-2
  Disabled: bg-indigo-300 cursor-not-allowed
  Use:      "Add to Cart", "Place Order", "Submit Review"

SECONDARY (alternative actions):
  Base:     bg-white text-slate-700 border border-slate-200 rounded-lg
  Hover:    bg-slate-50 border-slate-300
  Active:   bg-slate-100
  Focus:    ring-2 ring-indigo-300 ring-offset-2
  Disabled: bg-slate-50 text-slate-300
  Use:      "Cancel", "Back", "View Details"

GHOST (subtle actions):
  Base:     bg-transparent text-slate-600 rounded-lg
  Hover:    bg-slate-100 text-slate-900
  Active:   bg-slate-200
  Use:      Nav items, icon actions, "Show more"

DESTRUCTIVE (dangerous actions):
  Base:     bg-red-500 text-white rounded-lg
  Hover:    bg-red-600
  Active:   bg-red-700
  Use:      "Delete Product", "Cancel Order" (with confirmation)

VERIFIED (blockchain actions):
  Base:     bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-lg
  Hover:    from-amber-500 to-amber-600 shadow-md
  Use:      "Verify on Blockchain" — ONLY for blockchain verification CTA

OUTLINE-INDIGO (secondary emphasis):
  Base:     bg-transparent text-indigo-500 border border-indigo-200 rounded-lg
  Hover:    bg-indigo-50 border-indigo-300
  Use:      "Write a Review", "View Order"
```

### Sizes

```
SM:     h-8  px-3  text-sm   gap-1.5    Small inline actions
MD:     h-10 px-4  text-sm   gap-2      DEFAULT — most buttons
LG:     h-12 px-6  text-base gap-2.5    Hero CTA, checkout confirm
```

### Button Rules
- Every page has exactly ONE primary button (the main CTA)
- Icon-only buttons use `rounded-lg` and equal width/height (square)
- Loading state: replace text with spinner + "Processing..." (never disable without feedback)
- Buttons with icons: icon on the left, 8px gap, icon size matches text size
- Never use all-caps on buttons
- Minimum touch target: 44×44px on mobile (even if visual button is smaller)

---

## 10. Card Styles

### Product Card

```
CONTAINER:
  bg-white rounded-xl overflow-hidden
  shadow-sm hover:shadow-lg
  transition-all duration-300
  hover:-translate-y-1 (Framer Motion)
  border border-slate-100

IMAGE AREA:
  aspect-square bg-slate-50
  overflow-hidden
  Image: object-cover, hover:scale-105 transition-transform duration-500

CONTENT AREA:
  p-4 space-y-2

CATEGORY LABEL:
  text-xs font-medium uppercase tracking-wide text-indigo-500

PRODUCT NAME:
  text-base font-semibold text-slate-800
  line-clamp-2

PRICE:
  text-lg font-semibold text-slate-900
  Compare-at-price: text-sm text-slate-400 line-through ml-2

RATING:
  Inline stars (amber-400) + review count (text-sm text-slate-400)

ADD TO CART BUTTON:
  Appears on hover (desktop) or always visible (mobile)
  Full-width primary button at bottom of card
```

### Order Card

```
CONTAINER:
  bg-white rounded-lg p-6
  border border-slate-200

HEADER ROW:
  flex justify-between items-start
  Order number (mono font, text-sm) + Status badge + Date

ITEMS PREVIEW:
  flex gap-3, show first 3 item images as 48×48 rounded thumbnails
  "+N more" badge if > 3 items

FOOTER ROW:
  flex justify-between items-center
  Total amount (font-semibold) + "View Details" outline button
```

### Stat Card (Admin Dashboard)

```
CONTAINER:
  bg-white rounded-xl p-6
  border border-slate-100
  shadow-sm

ICON:
  w-12 h-12 rounded-lg bg-{color}-50
  Icon inside: w-6 h-6 text-{color}-500

METRIC:
  text-2xl font-bold text-slate-900 mt-4

LABEL:
  text-sm text-slate-500 mt-1

TREND (optional):
  text-sm text-emerald-500 or text-red-500
  "↑ 12%" or "↓ 3%"
```

### Verification Proof Card

```
CONTAINER:
  bg-gradient-to-br from-violet-50 to-indigo-50
  rounded-2xl p-8
  border border-violet-100
  shadow-lg shadow-violet-500/5

HEADER:
  ShieldCheck icon (violet-500) + "Blockchain Verified" text

PROOF FIELDS:
  Grid of label-value pairs
  Labels: text-xs uppercase tracking-wide text-slate-400
  Values: font-mono text-sm text-slate-800 truncate
  Fields: IPFS Hash, Content Hash, Tx Hash, Block Number, Timestamp

STATUS INDICATORS:
  Green check + "Content Match: Verified"
  Green check + "Proof Exists: Confirmed"
  Green check + "Buyer Verified: Confirmed"
```

---

## 11. Form Styles

### Input Fields

```
DEFAULT STATE:
  h-10 px-3
  bg-white
  border border-slate-200 rounded-md
  text-sm text-slate-800
  placeholder:text-slate-300

HOVER:
  border-slate-300

FOCUS:
  border-indigo-400
  ring-2 ring-indigo-100
  outline-none

ERROR:
  border-red-400
  ring-2 ring-red-100

DISABLED:
  bg-slate-50 text-slate-400
  cursor-not-allowed
```

### Labels

```
text-sm font-medium text-slate-700
mb-1.5 (6px gap to input)
Required indicator: text-red-400 " *" after label text
```

### Error Messages

```
text-sm text-red-500
mt-1.5 (6px below input)
Icon: AlertCircle (w-3.5) inline before text
```

### Select / Dropdown

```
Same dimensions and states as input
ChevronDown icon on right side (text-slate-400)
Dropdown panel: bg-white rounded-lg shadow-lg border border-slate-100
Options: px-3 py-2 hover:bg-indigo-50 text-sm
Selected option: bg-indigo-50 text-indigo-700 font-medium
```

### Textarea

```
Same styling as input but:
min-h-[120px] py-3
resize-y (allow vertical resize only)
```

### Checkbox / Radio

```
Unchecked: w-4 h-4 border-2 border-slate-300 rounded (checkbox) or rounded-full (radio)
Checked: bg-indigo-500 border-indigo-500, white check/dot inside
Focus: ring-2 ring-indigo-300 ring-offset-2
```

### Form Layout Rules
- Single column forms, max-width 480px
- Group related fields with a subtle heading (H5 + divider)
- Checkout forms can be two-column on desktop (city + state side by side)
- Submit button always full-width on mobile, right-aligned on desktop
- Show validation errors on blur (not on every keystroke)
- Show success check icon on valid fields (optional — only for important forms)

---

## 12. Badge Styles

### Status Badges

```
STRUCTURE:
  inline-flex items-center gap-1
  px-2.5 py-0.5
  rounded-full
  text-xs font-medium

VARIANTS:
  Pending:          bg-amber-50     text-amber-700     border border-amber-200
  Confirmed:        bg-blue-50      text-blue-700      border border-blue-200
  Processing:       bg-indigo-50    text-indigo-700     border border-indigo-200
  Shipped:          bg-cyan-50      text-cyan-700       border border-cyan-200
  Out for Delivery: bg-purple-50    text-purple-700     border border-purple-200
  Delivered:        bg-emerald-50   text-emerald-700    border border-emerald-200
  Cancelled:        bg-red-50       text-red-700        border border-red-200
  Returned:         bg-slate-50     text-slate-700      border border-slate-200

  Paid:             bg-emerald-50   text-emerald-700    border border-emerald-200
  Payment Failed:   bg-red-50       text-red-700        border border-red-200
  Refunded:         bg-slate-50     text-slate-700      border border-slate-200
```

### Verified Badge (Blockchain)

```
STRUCTURE:
  inline-flex items-center gap-1.5
  px-3 py-1
  rounded-full
  text-xs font-semibold

STYLE:
  bg-gradient-to-r from-amber-400 to-amber-500
  text-white
  shadow-sm shadow-amber-500/20

  Icon: ShieldCheck (w-3.5 h-3.5) on left
  Text: "Verified"

HOVER (if clickable → links to verification page):
  shadow-md shadow-amber-500/30
  Scale 1.02
```

### Category / Tag Badges

```
  bg-indigo-50 text-indigo-600
  px-2.5 py-0.5 rounded-full
  text-xs font-medium
```

### Count Badges (cart count, notifications)

```
  bg-indigo-500 text-white
  min-w-[18px] h-[18px] rounded-full
  text-[10px] font-bold
  flex items-center justify-center
  Positioned: absolute -top-1 -right-1
```

---

## 13. Dashboard Style (Admin)

### Layout

```
┌────────────────────────────────────────────────────────────┐
│  NAVBAR (h-16, bg-white, border-b border-slate-200)        │
├──────────┬─────────────────────────────────────────────────┤
│          │                                                 │
│ SIDEBAR  │  MAIN CONTENT                                   │
│ w-64     │  max-w-7xl mx-auto p-6                          │
│ bg-white │                                                 │
│ border-r │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│          │  │STAT │ │STAT │ │STAT │ │STAT │              │
│ Logo     │  │CARD │ │CARD │ │CARD │ │CARD │              │
│ ──────── │  └─────┘ └─────┘ └─────┘ └─────┘              │
│ Dashboard│                                                 │
│ Products │  ┌──────────────────────────────────┐           │
│ Orders   │  │  REVENUE CHART (Recharts)        │           │
│ Users    │  │  h-80 bg-white rounded-xl p-6    │           │
│ Reviews  │  └──────────────────────────────────┘           │
│          │                                                 │
│          │  ┌──────────────────────────────────┐           │
│          │  │  RECENT ORDERS TABLE              │           │
│          │  │  bg-white rounded-xl              │           │
│          │  │  Striped rows, hover highlight    │           │
│          │  └──────────────────────────────────┘           │
│          │                                                 │
├──────────┴─────────────────────────────────────────────────┤
```

### Sidebar Navigation

```
NAV ITEM (default):
  flex items-center gap-3 px-3 py-2.5 rounded-lg
  text-sm font-medium text-slate-500
  Icon: w-5 h-5

NAV ITEM (active):
  bg-indigo-50 text-indigo-700
  Icon: text-indigo-500

NAV ITEM (hover):
  bg-slate-50 text-slate-700

SECTION DIVIDER:
  text-xs uppercase tracking-wider text-slate-300 px-3 mt-6 mb-2
  "MANAGEMENT", "SETTINGS"
```

### Data Tables

```
CONTAINER:
  bg-white rounded-xl border border-slate-100 overflow-hidden

HEADER ROW:
  bg-slate-50 border-b border-slate-200
  text-xs font-semibold uppercase tracking-wider text-slate-500
  px-6 py-3

BODY ROW:
  px-6 py-4 border-b border-slate-50
  text-sm text-slate-600
  hover:bg-slate-50 transition-colors

EVEN ROWS:
  No stripe (clean look) — rely on hover and borders

ACTIONS COLUMN:
  Right-aligned
  Icon buttons (ghost variant) or dropdown menu (MoreVertical icon)

PAGINATION:
  Below table, flex justify-between
  "Showing 1-10 of 48" text + Previous/Next buttons
```

### Stat Cards Grid
```
Desktop:  grid grid-cols-4 gap-6
Tablet:   grid grid-cols-2 gap-4
Mobile:   grid grid-cols-1 gap-4
```

---

## 14. E-Commerce Layout Style

### Homepage Structure

```
┌──────────────────────────────────────────────┐
│  NAVBAR (sticky top-0, glass on scroll)      │
├──────────────────────────────────────────────┤
│                                              │
│  HERO SECTION                                │
│  py-24, mesh gradient background             │
│  ┌────────────────────────────────────────┐  │
│  │ Glass card (bg-white/80 backdrop-blur) │  │
│  │                                        │  │
│  │ "Every review,                         │  │
│  │  blockchain proven."                   │  │
│  │                                        │  │
│  │ Subtext + CTA button                   │  │
│  │ Trust stats: "X verified reviews"      │  │
│  └────────────────────────────────────────┘  │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  TRUST BAR                                   │
│  py-8, bg-white, border-y                    │
│  Icons: ShieldCheck, Truck, CreditCard, Star │
│  "Verified Reviews" "Free Shipping"          │
│  "Secure Checkout" "Quality Products"        │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  FEATURED PRODUCTS                           │
│  py-16                                       │
│  Section heading + "View All" link           │
│  Product card grid (4 cols desktop)          │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  CATEGORIES                                  │
│  py-16 bg-slate-50                           │
│  Category cards (image + name + count)       │
│  Grid: 3-4 cols                              │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  HOW VERIFIED REVIEWS WORK                   │
│  py-16                                       │
│  3-step visual:                              │
│  1. Buy → 2. Receive → 3. Review on-chain   │
│  Each step: icon + heading + description     │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  FOOTER                                      │
│  bg-slate-900 text-slate-300                 │
│  Logo + links + copyright                    │
│                                              │
└──────────────────────────────────────────────┘
```

### Product Listing Layout

```
┌──────────────────────────────────────────────┐
│  NAVBAR                                      │
├──────────────────────────────────────────────┤
│                                              │
│  PAGE HEADER                                 │
│  py-8 bg-white border-b                      │
│  "Products" heading + breadcrumb             │
│  Search bar (max-w-md)                       │
│                                              │
├──────────┬───────────────────────────────────┤
│          │                                   │
│ FILTERS  │  TOOLBAR                          │
│ w-64     │  Sort dropdown + View toggle      │
│ (desktop)│  Results count                    │
│          │                                   │
│ Category │  PRODUCT GRID                     │
│ Price    │  grid-cols-3 (desktop)            │
│ Rating   │  grid-cols-2 (tablet)             │
│          │  grid-cols-1 (mobile — 2 cols)    │
│          │                                   │
│          │  ProductCard × N                  │
│          │                                   │
│          │  PAGINATION                       │
│          │  Centered, numbered pages         │
│          │                                   │
├──────────┴───────────────────────────────────┤
│  FOOTER                                      │
└──────────────────────────────────────────────┘

Mobile: Filters collapse into a sheet/drawer triggered by filter button
```

### Product Detail Layout

```
┌──────────────────────────────────────────────┐
│  NAVBAR                                      │
├──────────────────────────────────────────────┤
│  Breadcrumb: Home > Category > Product Name  │
│                                              │
│  ┌─────────────┐  ┌───────────────────────┐  │
│  │             │  │ PRODUCT INFO          │  │
│  │   IMAGE     │  │                       │  │
│  │   GALLERY   │  │ Category badge        │  │
│  │             │  │ Product Name (H1)     │  │
│  │   Main +    │  │ Star rating + count   │  │
│  │   Thumbnails│  │ Price (+ compare-at)  │  │
│  │             │  │ Stock status          │  │
│  │             │  │ Description           │  │
│  │             │  │                       │  │
│  │             │  │ Quantity selector     │  │
│  │             │  │ [Add to Cart] button  │  │
│  │             │  │                       │  │
│  │  50%        │  │ 50%                   │  │
│  └─────────────┘  └───────────────────────┘  │
│                                              │
│  ────────── TAB DIVIDER ──────────           │
│                                              │
│  REVIEWS SECTION                             │
│  Rating distribution bar                     │
│  Sort/filter reviews                         │
│  ReviewCard list                             │
│  Each card: verified badge, stars,           │
│             title, content, date, user       │
│             "Verify on Chain" link           │
│                                              │
├──────────────────────────────────────────────┤
│  RELATED PRODUCTS (same category)            │
│  Horizontal scroll or 4-col grid             │
├──────────────────────────────────────────────┤
│  FOOTER                                      │
└──────────────────────────────────────────────┘

Mobile: Stack image above info (single column)
```

### Checkout Layout

```
┌──────────────────────────────────────────────┐
│  NAVBAR (simplified — logo + cart only)       │
├──────────────────────────────────────────────┤
│                                              │
│  CHECKOUT STEPS INDICATOR                    │
│  ● Shipping ──── ○ Review ──── ○ Confirm     │
│  (active = indigo-500, done = check icon)    │
│                                              │
│  ┌──────────────────┐  ┌────────────────┐    │
│  │                  │  │                │    │
│  │  STEP CONTENT    │  │ ORDER SUMMARY  │    │
│  │  60%             │  │ 40%            │    │
│  │                  │  │                │    │
│  │  Step 1: Form    │  │ Item list      │    │
│  │  Step 2: Review  │  │ Subtotal       │    │
│  │  Step 3: Confirm │  │ Shipping       │    │
│  │                  │  │ Tax            │    │
│  │                  │  │ ────────────   │    │
│  │  [Back] [Next]   │  │ Total (bold)   │    │
│  │                  │  │                │    │
│  └──────────────────┘  └────────────────┘    │
│                                              │
├──────────────────────────────────────────────┤

Mobile: Stack summary below steps (single column),
        summary collapses into expandable section
```

---

## 15. Mobile Responsiveness Rules

### Breakpoints (Tailwind defaults)

```
sm:     640px      Small phones → larger phones
md:     768px      Phones → tablets
lg:     1024px     Tablets → laptops
xl:     1280px     Laptops → desktops
2xl:    1536px     Large monitors (rarely targeted)
```

### Mobile-First Rules

```
DESIGN APPROACH:
  - All styles written mobile-first
  - Layer on complexity at larger breakpoints
  - Mobile is not a shrunken desktop — it's the primary experience

NAVIGATION:
  Mobile:   Hamburger icon → full-screen slide-out drawer
  Desktop:  Horizontal nav links + icons

GRIDS:
  Products:   1 col (mobile) → 2 col (sm) → 3 col (lg) → 4 col (xl)
  Stats:      1 col (mobile) → 2 col (md) → 4 col (lg)
  Categories: 2 col (mobile) → 3 col (md) → 4 col (lg)

SIDEBAR:
  Desktop:  Fixed sidebar (w-64)
  Tablet:   Collapsible sidebar (icon-only w-16)
  Mobile:   No sidebar — hamburger menu with drawer

IMAGES:
  Product cards:     aspect-square always
  Product gallery:   aspect-square (mobile), flexible (desktop)
  Hero:              Full-width, auto-height

TEXT:
  H1:     text-2xl (mobile) → text-4xl (desktop)
  H2:     text-xl (mobile) → text-3xl (desktop)
  Body:   text-sm (mobile) → text-base (desktop)

BUTTONS:
  Mobile:   Full-width (w-full) for primary CTAs
  Desktop:  Auto-width, right-aligned or centered

FORMS:
  Mobile:   Single column, full-width inputs
  Desktop:  Can be multi-column for short fields (city + state)

TABLES:
  Mobile:   Transform to card layout (stack columns vertically)
  Desktop:  Standard table rows

PADDING:
  Page:     px-4 (mobile) → px-6 (tablet) → px-8 (desktop)
  Cards:    p-4 (mobile) → p-6 (desktop)
  Sections: py-12 (mobile) → py-16 (tablet) → py-24 (desktop)

MODALS:
  Mobile:   Full-screen (inset-0, rounded-none)
  Desktop:  Centered with max-w-md, rounded-2xl

TOUCH TARGETS:
  Minimum:  44 × 44px for all tappable elements
  Spacing:  Minimum 8px between adjacent touch targets
```

### Performance Rules for Mobile
- Images: use `next/image` with responsive sizes, lazy loading by default
- Product cards: image loaded at 300px width max on mobile
- Defer non-critical JS (Framer Motion animations) on slow connections
- Font loading: `display: swap` to prevent FOIT
- No horizontal scroll — ever. Test every page at 320px width.

---

*This design system is the visual source of truth for Kinmel. Every component, page, and interaction should reference these specifications.*
