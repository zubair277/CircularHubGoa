# CircularGoa Design Guidelines

## Design Approach
**Reference-Based with Custom Brand Identity**: Drawing inspiration from sustainable platforms like Too Good To Go and community marketplaces like Freecycle, while maintaining a distinctive tropical Goa aesthetic that reflects the region's vibrant culture and eco-conscious mission.

## Core Design Elements

### A. Color Palette

**Brand Colors:**
- **Coral Pink**: 351 73% 95% - Primary background, soft accents
- **Eco Green**: 145 35% 56% - Primary CTAs, success states, sustainability metrics
- **Aqua Blue**: 183 38% 76% - Secondary actions, info states, map elements
- **White**: 0 0% 100% - Main backgrounds, cards
- **Charcoal**: 220 13% 18% - Text, dark mode primary
- **Slate Gray**: 215 16% 47% - Secondary text, borders

**Semantic Colors:**
- Success: Eco Green variations
- Warning: 38 92% 50% (Amber)
- Error: 0 84% 60% (Coral Red)
- Info: Aqua Blue variations

**Dark Mode:**
- Background: 220 13% 10%
- Surface: 220 13% 15%
- Borders: 215 16% 25%
- Text: 0 0% 95%

### B. Typography

**Font Stack:** 'Poppins', system-ui, -apple-system, sans-serif

**Scale:**
- Hero/H1: 3.5rem (56px) / Bold / -0.02em
- H2: 2.5rem (40px) / SemiBold / -0.01em
- H3: 1.875rem (30px) / SemiBold / normal
- H4: 1.5rem (24px) / Medium / normal
- Body Large: 1.125rem (18px) / Regular / 1.6
- Body: 1rem (16px) / Regular / 1.5
- Small: 0.875rem (14px) / Regular / 1.4
- Caption: 0.75rem (12px) / Medium / 1.3

### C. Layout System

**Spacing Scale (Tailwind units):** Consistent use of 4, 6, 8, 12, 16, 24 for rhythm
- Micro spacing: p-2, gap-1, mb-3
- Standard spacing: p-4, p-6, gap-4, my-6
- Section spacing: py-12, py-16, pb-24
- Page margins: px-4 (mobile), px-8 (tablet), px-12 (desktop)

**Containers:**
- Max width: max-w-7xl for dashboard/marketplace
- Content width: max-w-4xl for forms/profiles
- Card padding: p-6 (mobile), p-8 (desktop)

**Grid System:**
- Marketplace: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Dashboard metrics: grid-cols-2 lg:grid-cols-4
- Map + Listings: lg:grid-cols-2 with 60/40 split

### D. Component Library

**Navigation:**
- Fixed navbar with blur backdrop (backdrop-blur-md bg-white/80)
- Logo left, nav center, auth/profile right
- Mobile: Slide-in drawer with overlay
- Active state: Eco Green underline (border-b-2)

**Listing Cards:**
- Rounded-2xl, shadow-md, hover:shadow-lg transition
- Image aspect ratio: 4:3
- Category badge (top-right, rounded-full, small caps)
- Status indicator (dot + text): Available (green), Reserved (amber), Completed (gray)
- Footer: Location pin + distance, business type icon

**Map Integration:**
- React-Leaflet with custom markers (Eco Green pins)
- Cluster markers for dense areas
- Popup cards with mini listing preview + "View Details" link
- Toggle: Map view / List view / Split view

**Dashboard Stats Cards:**
- Clean white cards with colored accent borders (left border-l-4)
- Large metric number (3xl, Bold, Eco Green)
- Icon top-right (24x24, opacity-60)
- Trend indicator (↑ green / ↓ red with percentage)

**Forms & Inputs:**
- Floating labels (Shadcn/UI style)
- Rounded-lg borders with focus:ring-2 ring-eco-green
- File upload: Dotted border drop zone with icon
- Category select: Icon + label chips
- Location: Map picker with search autocomplete

**Buttons:**
- Primary: bg-eco-green, rounded-lg, px-6 py-3, font-medium
- Secondary: border-2 border-aqua-blue, text-aqua-blue
- Outline on images: backdrop-blur-sm bg-white/20 border-white/40
- Icon buttons: rounded-full, p-3, hover:bg-gray-100 dark:hover:bg-gray-800

**Authentication:**
- Modal overlay (backdrop-blur-sm bg-black/20)
- Centered card (max-w-md, rounded-2xl, p-8)
- Tabs: Login / Register
- Social login buttons with brand colors
- Divider: "or continue with"

### E. Animations

**Subtle Motion (Sparingly Used):**
- Card hover: transform scale-[1.02], shadow elevation
- Button click: scale-[0.98]
- Page transitions: fade-in 200ms
- Loading states: Eco Green pulse animation
- Map markers: Gentle bounce on add

**No scrolling animations** - focus on instant, responsive feel

## Images

**Hero Section:**
Large hero image (h-[500px] lg:h-[600px]) showcasing Goa's coastal landscape with colorful fishing boats, palm trees, or beach shacks with waste segregation in action. Image should have a subtle gradient overlay (from transparent to coral-pink/10 at bottom) for text legibility.

**Category Icons:**
Use illustrations/icons for waste categories (organic, plastic, glass, paper, electronics) in the marketplace filters - colorful, flat style consistent with the tropical theme.

**Dashboard:**
Small illustrative graphics for metrics (CO₂ cloud, tree icon, recycling symbol) - keep them minimal and accent-colored.

**Empty States:**
Friendly illustrations of Goan landmarks (Aguada Fort outline, Baga Beach silhouette) with encouraging messages to add first listing.

**Profile Headers:**
Business type header images (restaurant kitchen, hotel exterior, art studio) with rounded-t-2xl treatment matching card design.

---

**Overall Philosophy:** Create an approachable, optimistic platform that celebrates Goa's community spirit while making sustainability actionable. Every interaction should feel effortless, colorful but not overwhelming, with clear information hierarchy guiding users to exchange waste efficiently.