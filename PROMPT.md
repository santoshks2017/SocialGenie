# CARDEKO SOCIAL AI — Complete Build Instructions for Design & Engineering

**Document Type:** Engineering & Design Execution Prompt  
**Version:** 1.0  
**Date:** March 2026  
**Author:** Product Management  
**Audience:** Design Team, Frontend Engineering, Backend Engineering, AI/ML Engineering, DevOps, QA  
**Classification:** Internal — Confidential

---

## TABLE OF CONTENTS

1. [Context & Objective](#1-context--objective)
2. [Product Summary](#2-product-summary)
3. [System Architecture](#3-system-architecture)
4. [Design System & UI Foundation](#4-design-system--ui-foundation)
5. [Module 1 — AI Creative Engine (P0)](#5-module-1--ai-creative-engine-p0)
6. [Module 2 — Multi-Platform Publisher (P0)](#6-module-2--multi-platform-publisher-p0)
7. [Module 3 — One-Click Boost (P0)](#7-module-3--one-click-boost-p0)
8. [Module 4 — Unified Inbox (P1)](#8-module-4--unified-inbox-p1)
9. [Module 5 — Inventory Connector (P1)](#9-module-5--inventory-connector-p1)
10. [Module 6 — India Context Pack (P1)](#10-module-6--india-context-pack-p1)
11. [Module 7 — Lead Attribution Dashboard (P2)](#11-module-7--lead-attribution-dashboard-p2)
12. [Authentication, Onboarding & Dealer Management](#12-authentication-onboarding--dealer-management)
13. [Database Schema](#13-database-schema)
14. [API Design Standards](#14-api-design-standards)
15. [Third-Party Integrations](#15-third-party-integrations)
16. [Job Queue & Background Workers](#16-job-queue--background-workers)
17. [Mobile Responsiveness & React Native](#17-mobile-responsiveness--react-native)
18. [Testing Strategy](#18-testing-strategy)
19. [DevOps, CI/CD & Infrastructure](#19-devops-cicd--infrastructure)
20. [Security & Compliance](#20-security--compliance)
21. [Performance Benchmarks](#21-performance-benchmarks)
22. [Phased Delivery Plan](#22-phased-delivery-plan)
23. [Acceptance Criteria Summary](#23-acceptance-criteria-summary)
24. [Appendix A — Festival Calendar Data](#appendix-a--festival-calendar-data)
25. [Appendix B — Template Category Taxonomy](#appendix-b--template-category-taxonomy)
26. [Appendix C — Design Mockup Reference](#appendix-c--design-mockup-reference)

---

## 1. Context & Objective

### 1.1 What You Are Building

You are building **Cardeko Social AI** — an AI-native, dealership-specific marketing execution platform purpose-built for Indian automobile dealerships. This is not a social media scheduling tool. This is a **Dealer Growth Engine** that replaces a designer, a social media manager, and an agency in one product.

The one-line positioning is: **From car inventory to customer leads — fully automated in one platform.**

### 1.2 Why This Exists

The legacy Cardeko service model used 14 people to manage roughly 100 dealers manually. Every step — content planning, design, approvals, posting, boosting — was manual. The result was low margins, high delays, constant escalations, and zero scalability. This MVP must flip that entirely.

### 1.3 Who Uses This

The primary user is the **Indian automobile dealership** — new car showrooms, pre-owned car lots, two-wheeler dealers, and multi-brand outlets. The decision-maker is typically the dealership owner or general manager. They care about footfall, enquiries, and leads. They do not care about vanity metrics.

### 1.4 What Success Looks Like

> A dealership owner can run their entire digital marketing in 10 minutes a day. Type one prompt. AI generates content. Click publish and boost. AI handles responses. Leads come in.

### 1.5 Design Mockups Reference

All UI/UX design mockups are available at:  
**https://app.superdesign.dev/share/280a8852e1bdeb23f0089ed9fdf5c273acf2eb94ee95aaba0394757f04d6f79e**

Every screen you build must reference and adhere to these mockups. Where this document provides functional specifications that go beyond the mockups, use the design language and component patterns established in the mockups as the baseline and extend them consistently.

---

## 2. Product Summary

### 2.1 Module Priority Matrix

| Module | Priority | Build Phase | Description |
|--------|----------|-------------|-------------|
| AI Creative Engine | P0 — Must Have | Phase 1–2 | One-prompt generation of platform-ready creatives with captions, hashtags, and brand-aligned visuals from inventory data |
| Multi-Platform Publisher | P0 — Must Have | Phase 1–2 | One-click scheduling and posting to Facebook, Instagram, and Google My Business |
| One-Click Boost | P0 — Must Have | Phase 2 | Simplified ad boosting without needing Meta Ads Manager |
| Unified Inbox | P1 — Should Have | Phase 3 | Consolidated view of comments, DMs, and Google Reviews with AI-suggested responses |
| Inventory Connector | P1 — Should Have | Phase 3 | Pull real car data to auto-generate creatives |
| India Context Pack | P1 — Should Have | Phase 2–3 | Pre-built templates for festivals, regional language captions, GMB-optimized content |
| Lead Attribution Dashboard | P2 — Nice to Have | Phase 4 | Track click-to-call, WhatsApp taps, form fills tied to posts/campaigns |

### 2.2 Core User Flows (The Three Daily Rituals)

**Flow 1 — Create & Publish a Post (Daily, under 5 minutes):**
1. Dealer logs into Cardeko dashboard (mobile or desktop)
2. Taps "Create Post" — sees a prompt box and a library of suggested prompts
3. Types or selects a prompt (e.g., "Weekend offer on Maruti Brezza")
4. AI generates 3 creative variants with captions — dealer picks one
5. Dealer selects platforms (FB, IG, GMB), confirms posting time
6. Optionally adds a boost budget
7. Taps "Publish" — post goes live, boost campaign launches

**Flow 2 — Respond to Customer Messages (Daily):**
1. Dealer opens Unified Inbox — sees all new comments, DMs, and reviews
2. Each message shows an AI-suggested response
3. Dealer taps "Approve" to send, or edits before sending
4. Negative reviews are flagged and require manual approval

**Flow 3 — Weekly Content Planning (Weekly):**
1. Dealer opens Content Calendar — sees a pre-populated week with AI-suggested posts
2. Dealer reviews, swaps, or approves each day's content
3. Taps "Schedule All" — entire week is queued

---

## 3. System Architecture

### 3.1 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend — Web** | React 18+ with TypeScript | Component reusability, strong typing, large ecosystem |
| **Frontend — Mobile** | React Native | Shared component logic with web; dealers primarily use mobile |
| **Backend API** | Node.js with Fastify | Fast development cycle, excellent async I/O, strong ecosystem for Meta/Google API integrations |
| **AI Engine — Captions** | OpenAI GPT-4o API | Best-in-class caption quality for automotive context |
| **AI Engine — Creatives** | Template-based rendering engine (Canvas/Sharp/Puppeteer) | Brand consistency and dealer trust — NOT raw text-to-image generation |
| **Database — Primary** | PostgreSQL 16 (RDS) | Relational data for dealers, inventory, posts, campaigns |
| **Database — Cache** | Redis 7 (ElastiCache) | Session management, queue backing store, rate limiting, caching |
| **Queue / Jobs** | BullMQ on Redis | Scheduled posting, boost campaigns, inbox polling, template rendering |
| **Object Storage** | AWS S3 (ap-south-1) | Template assets, generated creatives, inventory images |
| **CDN** | AWS CloudFront | Low-latency delivery of creatives and static assets across India |
| **Cloud Region** | AWS ap-south-1 (Mumbai) | Low latency for Indian users, data localisation compliance |
| **Monitoring** | CloudWatch + Sentry | Infrastructure monitoring + application error tracking |
| **Search** | OpenSearch (optional, Phase 3+) | Inbox message search, inventory search |

### 3.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │  React Web   │  │  React Native    │  │  WhatsApp Bot    │   │
│  │  (Dashboard) │  │  (Mobile App)    │  │  (Notifications) │   │
│  └──────┬───────┘  └────────┬─────────┘  └────────┬─────────┘   │
└─────────┼───────────────────┼─────────────────────┼─────────────┘
          │                   │                     │
          ▼                   ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Fastify)                       │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │
│  │  Auth   │ │  Rate    │ │  Input   │ │  Request Routing  │   │
│  │  Layer  │ │  Limiter │ │  Validn  │ │  & Versioning     │   │
│  └─────────┘ └──────────┘ └──────────┘ └───────────────────┘   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│  CREATIVE SERVICE│ │  PUBLISH SERVICE │ │  INBOX SERVICE       │
│  - Prompt parse  │ │  - Post scheduler│ │  - Message polling   │
│  - Caption gen   │ │  - Platform push │ │  - AI response gen   │
│  - Template      │ │  - Calendar mgmt │ │  - Sentiment analysis│
│    render        │ │  - Boost launch  │ │  - Tagging engine    │
│  - Variant gen   │ │  - Status track  │ │  - Notification push │
└────────┬─────────┘ └────────┬─────────┘ └──────────┬───────────┘
         │                    │                      │
         ▼                    ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA & QUEUE LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │PostgreSQL│  │  Redis   │  │  BullMQ  │  │  S3 + CDN      │  │
│  │  (RDS)   │  │(Elasti-  │  │  (Jobs)  │  │  (Assets)      │  │
│  │          │  │  Cache)  │  │          │  │                │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│  META GRAPH API  │ │  GOOGLE BUSINESS │ │  OPENAI API          │
│  - FB Publish    │ │  PROFILE API     │ │  - GPT-4o Captions   │
│  - IG Publish    │ │  - GMB Publish   │ │  - Sentiment         │
│  - Boost/Ads     │ │  - Reviews       │ │  - Reply suggestions │
│  - Comments/DMs  │ │  - Insights      │ │                      │
│  - Insights      │ │                  │ │                      │
└──────────────────┘ └──────────────────┘ └──────────────────────┘
```

### 3.3 Service Boundaries

Do NOT build a monolith. Structure the backend as a modular monolith with clear domain boundaries, ready to be split into microservices if needed post-MVP. Use the following domain modules within the single Fastify application:

- `modules/auth` — Authentication, session management, dealer CRUD
- `modules/creative` — Template engine, AI caption generation, variant rendering
- `modules/publisher` — Post scheduling, platform publishing, calendar management
- `modules/boost` — Campaign creation, budget management, performance tracking via Meta API
- `modules/inbox` — Message polling, AI response suggestions, sentiment analysis
- `modules/inventory` — CSV/Excel upload, inventory CRUD, auto-creative triggers
- `modules/analytics` — Lead attribution, performance metrics, report generation
- `modules/festival` — Festival calendar, regional template mapping, auto-campaign suggestions

Each module owns its own routes, services, and database queries. Cross-module communication happens through a shared event bus (Node.js EventEmitter for MVP, replaceable with message broker later).

---

## 4. Design System & UI Foundation

### 4.1 Design Principles

1. **Mobile-first:** Indian dealers primarily use smartphones. Every screen must be designed for mobile first, then scaled up for desktop. The mockups reflect this — follow them faithfully.
2. **Speed over features:** If a screen takes more than 2 taps to complete the primary action, redesign it.
3. **Vernacular-ready:** Every text element must support right-to-left fallback and variable-length strings for Hindi and regional languages.
4. **Low bandwidth tolerance:** Assume 3G connections in Tier-2/3 cities. Lazy-load images, compress aggressively, use skeleton screens.
5. **Dealer-friendly language:** No jargon. "Boost" not "Promote via Meta Ads." "Post Now" not "Publish to Connected Social Accounts."

### 4.2 Component Library

Build a shared component library using React + TypeScript. Every component must support theming for future white-label (Enterprise tier).

**Required Base Components:**

| Component | Usage | Notes |
|-----------|-------|-------|
| `<Button>` | Primary, Secondary, Ghost, Danger variants | Must include loading state with spinner |
| `<Input>` | Text, Search, Prompt input | Supports RTL, character count, clear button |
| `<TextArea>` | Caption editing, prompt input | Auto-resize, max character count per platform |
| `<Card>` | Post preview, creative variant, inbox message | Shadow elevation, hover state, swipe-to-action on mobile |
| `<Modal>` | Confirmations, boost setup, platform selection | Must trap focus for accessibility |
| `<Calendar>` | Content calendar, date picker, scheduler | Week view as default, month view toggle |
| `<Badge>` | Status indicators, unread count, platform icons | Color-coded: green (live), yellow (scheduled), red (failed), grey (draft) |
| `<Avatar>` | Dealer profile, customer avatar in inbox | Initials fallback when no image |
| `<DropdownMenu>` | Platform selection, budget selection, actions | Supports multi-select for platforms |
| `<Toast>` | Success/error notifications | Auto-dismiss after 5s, supports undo action |
| `<SkeletonLoader>` | Loading states for all data-dependent screens | Match exact layout of loaded content |
| `<EmptyState>` | No posts, no messages, no inventory | Illustration + single CTA button |
| `<Tabs>` | Inbox categories, dashboard sections | Supports swipe navigation on mobile |
| `<Tag>` | Lead, Complaint, General, Spam labels | Clickable for filtering |
| `<ImageCarousel>` | Creative variant selection, inventory gallery | Supports pinch-to-zoom on mobile |
| `<ProgressBar>` | Boost spend tracking, onboarding progress | Animated fill |
| `<PlatformIcon>` | Facebook, Instagram, GMB icons | Consistent sizing (24px, 32px, 48px) |

### 4.3 Typography

- **Primary Font:** Inter (Google Font) — clean, excellent readability at small sizes, supports Devanagari
- **Fallback:** system-ui, sans-serif
- **Scale:** 12px (caption), 14px (body), 16px (subheading), 20px (heading), 28px (page title)
- **Line Height:** 1.5 for body text, 1.3 for headings
- **Regional Language Font:** Noto Sans (covers Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi)

### 4.4 Color Palette

Derive from the mockup design system. At minimum, define:

- **Primary:** Brand blue (for CTAs, active states, links)
- **Secondary:** Brand dark (for text, headings)
- **Success:** Green (#22C55E) — published, approved
- **Warning:** Amber (#F59E0B) — scheduled, pending review
- **Error:** Red (#EF4444) — failed, negative sentiment, required action
- **Neutral:** Grey scale (#F3F4F6, #9CA3AF, #4B5563, #111827) — backgrounds, borders, secondary text
- **Platform Colors:** Facebook Blue (#1877F2), Instagram Gradient, Google Blue (#4285F4), WhatsApp Green (#25D366)

### 4.5 Layout Grid

- **Mobile:** Single column, 16px horizontal padding, 12px gap between cards
- **Tablet:** Two-column where appropriate, 24px horizontal padding
- **Desktop:** Sidebar (240px fixed) + main content area, 32px horizontal padding, max content width 1200px
- **Breakpoints:** 640px (sm), 768px (md), 1024px (lg), 1280px (xl)

### 4.6 Navigation Structure

**Desktop — Left Sidebar:**
```
┌─────────────────┐
│  🏠 Dashboard    │
│  ✨ Create Post  │
│  📅 Calendar     │
│  📬 Inbox        │
│  🚗 Inventory    │
│  📊 Analytics    │
│  ⚡ Boost        │
│  ⚙️ Settings     │
│─────────────────│
│  Dealer Name     │
│  Plan: Growth    │
│  [Switch Dealer] │
└─────────────────┘
```

**Mobile — Bottom Tab Bar (5 items max):**
```
[Home] [Create] [Calendar] [Inbox] [More]
```

"More" expands to: Inventory, Analytics, Boost, Settings.

---

## 5. Module 1 — AI Creative Engine (P0)

This is the heart of the product. Get this right, and the rest follows.

### 5.1 Functional Requirements

#### 5.1.1 Prompt Input System

**Prompt Box (Primary Interface):**
- Free-text input field at the top of the Create Post screen
- Placeholder text: "Describe what you want to post..." (localised)
- Character limit: 500 characters
- Below the prompt box, show a horizontally scrollable row of **Suggested Prompt Chips** categorised by:
  - 🚗 New Arrival
  - 🎉 Festival Offer
  - 🔧 Service Camp
  - ⭐ Customer Testimonial
  - 📸 Inventory Showcase
  - 💬 Engagement Post
- Tapping a chip auto-fills the prompt box with a pre-written prompt that the dealer can edit
- The prompt library must contain **at minimum 100 pre-written prompts** across all categories, 15–20 per category

**Prompt Library Management (Backend):**
- Store prompts in the database with: `id`, `category`, `text_en`, `text_hi`, `text_regional`, `is_active`, `usage_count`, `created_at`
- Admin API to add/edit/deactivate prompts
- Sort suggested prompts by: (1) relevance to current date/festivals, (2) popularity (usage count), (3) recency

#### 5.1.2 AI Caption Generation

When the dealer submits a prompt, the backend must:

1. **Parse the prompt** to extract intent (new arrival, offer, testimonial, etc.), vehicle details (make, model, variant), offer details (discount, EMI, exchange), and tone (urgent, celebratory, informational)
2. **Check inventory** — if vehicle mentioned, pull real data (price, specs, stock count, images) from the inventory module
3. **Call OpenAI GPT-4o** with a structured system prompt that includes:
   - Dealer brand name, city, contact details
   - Vehicle/offer context extracted from step 1
   - Inventory data from step 2 (if available)
   - Platform-specific constraints (Instagram caption limit: 2200 chars, FB: 63,206 chars, GMB: 1500 chars)
   - Tone and style guidelines for Indian automotive marketing
   - **Guardrails:** Do not hallucinate prices, do not invent model names, do not use inappropriate language, do not make false claims about mileage/safety ratings
4. **Return 3 caption variants** with:
   - Caption text (platform-specific lengths)
   - 5–10 relevant hashtags (mix of brand, local, trending)
   - Suggested emoji usage (tasteful, not excessive)
   - Hindi version (if dealer has Hindi enabled)
   - Suggested posting time based on dealer's audience engagement data

**GPT-4o System Prompt Template (Store in config, not hardcoded):**

```
You are a social media marketing expert for Indian automobile dealerships.
You write captions that drive footfall, enquiries, and leads.

DEALER CONTEXT:
- Name: {dealer_name}
- City: {dealer_city}
- Brand(s): {dealer_brands}
- Contact: {dealer_phone}, {dealer_whatsapp}

VEHICLE CONTEXT (if applicable):
- Model: {vehicle_model}
- Variant: {vehicle_variant}
- Price: {vehicle_price} (use exact price, NEVER approximate)
- Key Features: {vehicle_features}
- Stock Available: {stock_count}

RULES:
1. Never invent or approximate prices. If no price provided, omit pricing.
2. Never invent vehicle specifications. Only use provided data.
3. Include a clear call-to-action: visit showroom, call now, WhatsApp us.
4. Use the dealer's city name for local relevance.
5. Keep tone professional but warm — this is a trusted business, not a meme page.
6. If festival context is provided, weave it naturally — do not force it.
7. Generate exactly 3 variants: (a) Short & punchy, (b) Detailed & informative, (c) Emotional/aspirational.

OUTPUT FORMAT:
Return a JSON object with three variants, each containing:
- caption_text: string
- hashtags: string[] (5-10)
- suggested_emoji: string[] (2-3)
- platform_notes: string (any platform-specific adjustments)
```

#### 5.1.3 Template-Based Creative Rendering

This is NOT text-to-image AI generation. This is a **template rendering engine** that composites dealer branding, inventory images, text overlays, and design elements into platform-ready images.

**Template Architecture:**

Each template is a JSON specification that defines:

```json
{
  "template_id": "new_arrival_001",
  "category": "new_arrival",
  "name": "New Arrival — Bold Banner",
  "platforms": ["facebook_post", "instagram_post", "instagram_story", "gmb_post"],
  "dimensions": {
    "facebook_post": { "width": 1200, "height": 630 },
    "instagram_post": { "width": 1080, "height": 1080 },
    "instagram_story": { "width": 1080, "height": 1920 },
    "gmb_post": { "width": 1200, "height": 900 }
  },
  "layers": [
    {
      "type": "background",
      "source": "solid_color",
      "color": "{dealer_primary_color}",
      "fallback_color": "#1A1A2E"
    },
    {
      "type": "image",
      "source": "inventory_image",
      "position": { "x": "center", "y": "60%" },
      "size": { "width": "80%", "height": "auto" },
      "fallback": "placeholder_car.png"
    },
    {
      "type": "text",
      "content": "{headline}",
      "font": "Inter Bold",
      "size": 48,
      "color": "#FFFFFF",
      "position": { "x": "center", "y": "10%" },
      "max_width": "90%",
      "max_lines": 2
    },
    {
      "type": "text",
      "content": "{price_text}",
      "font": "Inter Bold",
      "size": 36,
      "color": "#FFD700",
      "position": { "x": "center", "y": "25%" }
    },
    {
      "type": "image",
      "source": "dealer_logo",
      "position": { "x": "5%", "y": "90%" },
      "size": { "width": 120, "height": "auto" }
    },
    {
      "type": "text",
      "content": "{dealer_phone}",
      "font": "Inter Medium",
      "size": 20,
      "color": "#FFFFFF",
      "position": { "x": "right-5%", "y": "92%" }
    }
  ],
  "color_scheme": "dark",
  "regional_variants": ["hi", "ta", "te", "kn", "ml", "mr"],
  "tags": ["new_arrival", "car", "showcase"]
}
```

**Rendering Pipeline:**

1. AI selects the best template based on prompt intent + category matching
2. Engine resolves all `{variables}` from dealer profile, inventory, and AI-generated headline/price text
3. Engine renders the image using **Sharp (Node.js)** for static compositing OR **Puppeteer** for complex layouts with HTML/CSS templates
4. Generate all platform-specific sizes in parallel
5. Compress output images (JPEG quality 85 for photos, PNG for graphics with transparency)
6. Upload to S3, return CDN URLs
7. Generate 3 visual variants by varying: template choice, color scheme, layout, and headline text

**Template Library Requirements (MVP):**

| Category | Minimum Count | Examples |
|----------|---------------|---------|
| New Arrivals | 10 | Bold banner, minimal showcase, split-screen comparison |
| Festival Offers | 10 | Diwali gold theme, Navratri 9-color, Holi splash |
| Service Camp | 5 | Service reminder, free check-up announcement, AC service special |
| Customer Testimonial | 5 | Photo + quote, star rating card, video thumbnail |
| Inventory Showcase | 10 | Grid of 4 cars, single spotlight, price comparison |
| Engagement Posts | 5 | Poll, quiz, this-or-that, trivia |
| Generic / Seasonal | 5 | Republic Day, Independence Day, New Year |
| **Total** | **50 minimum** | |

Each template must support all 4 platform sizes (Facebook post, Instagram post, Instagram story, GMB post).

#### 5.1.4 Creative Preview & Selection Screen

After generation, show the dealer:

- **3 creative variants** displayed as a horizontal carousel (swipeable on mobile)
- Below each variant: the corresponding caption text (truncated with "Read more")
- **Platform toggle buttons** (FB, IG, GMB) showing how the creative will look on each platform's dimensions
- **Edit Creative** button: opens a lightweight editor where the dealer can:
  - Change the headline text
  - Swap the vehicle image (from inventory or upload)
  - Toggle dealer logo on/off
  - Change color scheme (3 pre-set options derived from dealer brand colors)
- **Edit Caption** button: opens the caption in a text editor with character count per platform
- **Regenerate** button: creates 3 new variants from the same prompt
- **Download** button: downloads the selected creative as PNG/JPEG

### 5.2 Technical Implementation Notes

- Use a **rendering queue** (BullMQ) to handle creative generation asynchronously. The UI should show a "Generating your creatives..." state with a progress indicator. Target: under 15 seconds from prompt submission to 3 variants displayed.
- Cache GPT-4o responses for identical prompts within the same dealer context for 24 hours.
- Store all generated creatives in S3 with a lifecycle policy: delete unselected variants after 30 days, keep selected/published variants indefinitely.
- Template rendering must be stateless — any worker can render any template given the JSON spec + assets.

### 5.3 Acceptance Criteria

- [ ] Dealer can type a free-text prompt and receive 3 creative variants with captions in under 15 seconds
- [ ] Dealer can select from pre-built prompt library (minimum 100 prompts across 6 categories)
- [ ] Captions include relevant hashtags, are platform-length appropriate, and contain zero hallucinated data
- [ ] Creatives render correctly for all 4 platform sizes
- [ ] Dealer branding (logo, colors, contact) appears on every creative
- [ ] If inventory data exists for the mentioned vehicle, it is automatically pulled into the creative
- [ ] Hindi caption variant is available when dealer language preference includes Hindi
- [ ] Edit creative and edit caption flows work without page reload
- [ ] Regenerate produces genuinely different variants (not minor rewording)

---

## 6. Module 2 — Multi-Platform Publisher (P0)

### 6.1 Functional Requirements

#### 6.1.1 Platform Connection (Onboarding Prerequisite)

Before a dealer can publish, they must connect their social accounts. Build a **Platform Connection** screen in Settings:

- **Facebook Page:** OAuth 2.0 via Meta Graph API. Dealer grants `pages_manage_posts`, `pages_read_engagement`, `pages_manage_metadata`, `pages_messaging` permissions. Store the long-lived Page Access Token (60-day expiry, auto-refresh).
- **Instagram Business:** Connected through the same Meta OAuth flow. Requires a linked Facebook Page. Permissions: `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_messages`.
- **Google My Business:** OAuth 2.0 via Google Business Profile API. Permissions: `https://www.googleapis.com/auth/business.manage`. Store refresh token.

For each connected platform, display:
- Platform icon + account name + connection status (green/red indicator)
- "Reconnect" button if token is expired
- "Disconnect" button with confirmation modal

**Token Refresh Strategy:**
- Run a daily background job that checks all tokens expiring within 7 days
- Attempt silent refresh using stored refresh tokens
- If refresh fails, send the dealer a push notification + email: "Your [Platform] connection needs to be renewed. Tap here to reconnect."
- Mark the platform as "Disconnected" in the UI until renewed

#### 6.1.2 Post Scheduling & Publishing

**Post Now Flow:**
1. After creative selection (from Module 1), dealer selects target platforms via toggle buttons (FB, IG, GMB — only connected platforms are enabled)
2. Dealer taps "Post Now"
3. Backend immediately enqueues a publish job per platform
4. UI shows real-time status per platform: Queued → Publishing → Published (or Failed with retry option)
5. On success, show the live post URL (tappable link)

**Schedule for Later Flow:**
1. After creative selection, dealer taps "Schedule"
2. Date/time picker opens — default to next "best time" suggested by the AI (based on historical engagement data for this dealer, or industry defaults if no data)
3. Dealer confirms schedule
4. Post appears in the Content Calendar as "Scheduled" (yellow badge)
5. BullMQ delayed job fires at the scheduled time and publishes to all selected platforms
6. If any platform publish fails, retry 3 times with exponential backoff (1 min, 5 min, 15 min). If all retries fail, mark as "Failed" and notify dealer.

**Bulk Schedule (Weekly Content Planning):**
1. Dealer opens Content Calendar → Week View
2. AI pre-populates the week with suggested posts based on: inventory changes, upcoming festivals, dealer posting patterns, and content category balance
3. Each day shows 1–2 suggested post cards with thumbnails and captions
4. Dealer can: Approve (schedule at suggested time), Edit (modify before scheduling), Swap (replace with different suggestion), Delete (remove from week), Add (create new post for that day)
5. "Schedule All Approved" button at the bottom queues all approved posts for their respective times

#### 6.1.3 Content Calendar

**Week View (Default):**
- 7-column grid (Mon–Sun), each column shows scheduled/published/draft posts as cards
- Card shows: thumbnail, platform icons, time, status badge
- Drag-and-drop to reschedule (desktop only)
- Tap a card to view details / edit / delete

**Month View:**
- Standard calendar grid, each date shows post count dots (colored by status)
- Tap a date to see all posts for that day in a bottom sheet (mobile) or side panel (desktop)

**Statuses:**
- Draft (grey) — created but not scheduled
- Scheduled (yellow) — queued for future publish
- Publishing (blue, animated) — currently being sent to platforms
- Published (green) — live on all platforms
- Partially Published (orange) — live on some platforms, failed on others
- Failed (red) — publish failed on all platforms

#### 6.1.4 Post Analytics (Per-Post)

After a post is published, show basic metrics on the post card (fetched from platform APIs periodically):

- **Facebook:** Reach, Likes, Comments, Shares
- **Instagram:** Reach, Likes, Comments, Saves
- **GMB:** Views, Clicks, Direction Requests

Polling frequency: every 6 hours for the first 7 days after publish, then daily for 30 days, then stop.

### 6.2 Technical Implementation Notes

**Platform Publishing APIs:**

- **Facebook:** `POST /{page_id}/photos` (for image posts) with `message` and `url` parameters via Meta Graph API v19.0+
- **Instagram:** Two-step process — (1) Create media container: `POST /{ig_user_id}/media` with `image_url` and `caption`, (2) Publish: `POST /{ig_user_id}/media_publish` with `creation_id`. Instagram does NOT support direct scheduling via API — you must hold the job in BullMQ and publish at the scheduled time.
- **GMB:** `POST /v1/{name}/localPosts` with `media`, `summary`, and `callToAction` via Google Business Profile API.

**Multi-Location Support:**
- A single Cardeko account (Enterprise tier) can manage multiple dealer locations.
- Each location has its own platform connections, inventory, and content calendar.
- The dealer can switch between locations via a dropdown in the sidebar/header.
- Posts can be cross-posted to all locations with one action (content shared, platform connections per-location).

### 6.3 Acceptance Criteria

- [ ] Dealer can connect Facebook, Instagram, and GMB accounts via OAuth
- [ ] Token refresh runs automatically; expired tokens trigger dealer notification
- [ ] "Post Now" publishes to all selected platforms in under 30 seconds
- [ ] Scheduled posts fire within 60 seconds of scheduled time
- [ ] Failed publishes retry 3 times with exponential backoff and notify dealer on final failure
- [ ] Content Calendar shows week and month views with correct status badges
- [ ] Bulk schedule allows dealer to approve and queue an entire week's content in one action
- [ ] AI-suggested best posting times are shown and are based on dealer engagement history (or industry defaults for new dealers)
- [ ] Per-post analytics display within 6 hours of publishing
- [ ] Multi-location dealers can manage each location independently

---

## 7. Module 3 — One-Click Boost (P0)

This is the single biggest revenue wedge. Most Indian dealers do not boost posts because Meta Ads Manager is intimidating. We simplify it to 3 choices: pick a post, set a budget, hit launch.

### 7.1 Functional Requirements

#### 7.1.1 Boost Setup Flow

1. On any published or scheduled post, show a "Boost" button (lightning bolt icon)
2. Tapping "Boost" opens a bottom sheet (mobile) or modal (desktop) with:

**Step 1 — Budget Selection:**
- Pre-set buttons: ₹500/day, ₹1,000/day, ₹2,500/day, Custom
- Custom opens a number input (minimum ₹200/day, no maximum)
- Show estimated reach range below the selected budget (fetched from Meta Ads API reach estimate)

**Step 2 — Duration Selection:**
- Pre-set buttons: 3 days, 7 days, 14 days, Custom
- Custom opens a date range picker
- Show total estimated spend: (daily budget × days)

**Step 3 — Audience (Pre-Configured, Advanced Optional):**
- Default audience is pre-configured by Cardeko:
  - Location: Dealer's city + radius (configurable in settings, default 25 km)
  - Age: 25–55
  - Interests: Auto-intenders (Facebook targeting: "Automobile" interest, "Car Dealership" interest, vehicle brand interests)
  - Language: Based on dealer's region
- "Advanced" toggle (collapsed by default) reveals:
  - Location radius slider (5 km — 50 km)
  - Age range slider
  - Gender toggle (All / Male / Female)
  - Additional interest keywords (text input with suggestions)

**Step 4 — Confirmation:**
- Summary card showing: post thumbnail, budget, duration, estimated reach, audience summary
- "Launch Boost" button (primary CTA)
- Legal disclaimer: "By boosting, you agree to Meta's advertising policies. Actual results may vary."

#### 7.1.2 Boost Management Dashboard

Accessible from the "Boost" tab in the sidebar:

- **Active Boosts:** Cards showing each running campaign with: post thumbnail, daily spend, total spent, remaining budget, reach so far, clicks, CTR, cost per click
- **Pause/Resume** button per campaign
- **Stop** button with confirmation (remaining budget is not charged)
- **Completed Boosts:** Historical list with final metrics
- **Total Spend This Month:** Summary metric at top

#### 7.1.3 Performance Metrics (Per Boost)

Poll Meta Ads Reporting API every 4 hours for active campaigns:

| Metric | Display Name | Source |
|--------|-------------|--------|
| `reach` | People Reached | Meta |
| `impressions` | Times Shown | Meta |
| `clicks` | Link Clicks | Meta |
| `cpc` | Cost per Click | Calculated |
| `ctr` | Click Rate | Calculated |
| `spend` | Amount Spent | Meta |
| `actions` (calls) | Calls Generated | Meta |

### 7.2 Technical Implementation — Meta Ads API

**Campaign Creation Flow (Backend):**

1. Create Campaign: `POST /act_{ad_account_id}/campaigns` with `objective: "OUTCOME_TRAFFIC"` or `"OUTCOME_AWARENESS"`, `status: "PAUSED"`
2. Create Ad Set: `POST /act_{ad_account_id}/adsets` with targeting spec, budget, schedule, billing event
3. Create Ad: `POST /act_{ad_account_id}/ads` with the creative (post) linked
4. Activate: Update campaign status to `"ACTIVE"`

**Targeting Spec Structure:**
```json
{
  "geo_locations": {
    "custom_locations": [{
      "latitude": "{dealer_lat}",
      "longitude": "{dealer_lng}",
      "radius": 25,
      "distance_unit": "kilometer"
    }]
  },
  "age_min": 25,
  "age_max": 55,
  "interests": [
    { "id": "6003346953805", "name": "Automobile" },
    { "id": "{brand_interest_id}", "name": "{brand_name}" }
  ],
  "locales": [{ "key": "en_GB" }]
}
```

**Ad Account Requirement:**
- Dealers must have an active Meta Ad Account linked to their Facebook Page.
- During onboarding, Cardeko checks for an existing Ad Account. If none exists, guide the dealer through creation (or create one via API if permissions allow).
- Store `ad_account_id` in dealer profile.

**Revenue Model:**
- Cardeko charges a 5–10% service fee on ad spend routed through the platform.
- Implementation: Dealer pre-pays Cardeko (Razorpay/Cashfree). Cardeko funds the Meta campaign from its own Ad Account with the dealer as the advertiser, or uses the dealer's Ad Account directly. Define the billing model clearly before Phase 2 build begins. For MVP, use the dealer's own Ad Account and bill the service fee separately.

### 7.3 Acceptance Criteria

- [ ] Boost setup completes in 3 taps: budget → duration → launch
- [ ] Pre-configured audience targets auto-intenders within dealer's city radius
- [ ] Estimated reach is displayed before launching
- [ ] Campaign launches on Meta within 60 seconds of dealer confirmation
- [ ] Active campaigns show real-time spend and performance metrics (updated every 4 hours)
- [ ] Dealer can pause, resume, and stop campaigns
- [ ] Boost dashboard shows historical campaigns with final metrics
- [ ] Total monthly spend summary is visible at the top of the boost dashboard

---

## 8. Module 4 — Unified Inbox (P1)

### 8.1 Functional Requirements

#### 8.1.1 Message Aggregation

The Inbox pulls messages from 3 sources into a single chronological stream:

| Source | Message Types | Polling Method | Polling Frequency |
|--------|--------------|----------------|-------------------|
| Facebook | Comments on posts, Page messages (DMs) | Meta Webhooks (preferred) or polling via Graph API | Real-time via webhooks, fallback: every 5 min |
| Instagram | Comments on posts, Direct Messages | Meta Webhooks (preferred) or polling via Graph API | Real-time via webhooks, fallback: every 5 min |
| Google Reviews | New reviews, review replies | Google Business Profile API polling | Every 15 min |

**Webhook Setup (Meta):**
- Register webhooks for `page` subscriptions: `feed`, `messages`, `messaging_postbacks`
- Verify webhook with challenge token
- Process incoming events and store messages in the database
- If webhook delivery fails, fall back to polling

#### 8.1.2 Inbox UI Layout

**Mobile — Full Screen List:**
- Vertical list of messages sorted by recency (newest first)
- Each row: platform icon, customer name/avatar, message preview (1 line), timestamp, tag badge (if tagged), unread indicator (blue dot)
- Tap to open message thread
- Filter tabs at top: All, Unread, Facebook, Instagram, Google Reviews
- Search bar (searches message content and customer name)

**Desktop — Two-Panel:**
- Left panel: message list (same as mobile)
- Right panel: selected message thread with AI-suggested reply, conversation history, and action buttons

#### 8.1.3 AI-Suggested Responses

For every incoming message, the backend generates a suggested response using GPT-4o:

**System Prompt for Reply Generation:**
```
You are a helpful customer service assistant for {dealer_name}, an automobile dealership in {dealer_city}.

RULES:
1. Be polite, professional, and helpful.
2. If the customer is asking about a specific vehicle, include basic info if available from inventory.
3. If the customer is complaining, acknowledge their concern and offer to have a manager call them.
4. Never make promises about pricing or discounts unless provided in dealer settings.
5. Always include a call-to-action: visit showroom, call {dealer_phone}, or WhatsApp {dealer_whatsapp}.
6. Keep responses under 100 words for comments, under 200 words for DMs/reviews.
7. Match the language of the customer's message (Hindi reply for Hindi message, etc.).

SENTIMENT: {detected_sentiment} (positive/neutral/negative)
CUSTOMER MESSAGE: {message_text}
CONTEXT: {post_context_if_comment}
```

**Response Display:**
- AI-suggested reply appears in a highlighted box below the customer's message
- Two buttons: "Send" (sends as-is) and "Edit" (opens text editor for modification)
- For **negative sentiment** messages (detected by GPT-4o or keyword rules), the response box is bordered in red with a warning: "⚠️ Negative sentiment detected. Review suggested response carefully before sending."
- Negative review responses ALWAYS require human approval (the "Send" button is replaced with "Approve & Send")

#### 8.1.4 Tagging System

Every message can be tagged (manually or auto-tagged by AI):

| Tag | Color | Auto-Tag Rule |
|-----|-------|---------------|
| Lead | Green | Message contains: price, availability, test drive, booking, EMI, finance, loan |
| Complaint | Red | Negative sentiment detected |
| General Enquiry | Blue | Default for questions that don't match Lead or Complaint |
| Spam | Grey | Detected spam patterns (links, promotional content) |

Auto-tags can be overridden manually by the dealer. Tags are filterable in the inbox list.

#### 8.1.5 Lead Handoff

When a message is tagged as "Lead":
- Show a "Create Lead" button that opens a quick form: customer name, phone (if extractable from message), vehicle interest, source (FB/IG/Google)
- Store in leads table for the Lead Attribution Dashboard (Module 7)
- Optionally trigger a WhatsApp notification to the dealer's sales team (if WhatsApp Business API is connected)

### 8.2 Acceptance Criteria

- [ ] Messages from Facebook, Instagram, and Google Reviews appear in a single inbox within 5 minutes of being received
- [ ] Webhook integration for Meta delivers messages in real-time
- [ ] Every message has an AI-suggested response generated within 5 seconds
- [ ] Negative sentiment messages are visually flagged and require manual approval
- [ ] Messages can be tagged as Lead, Complaint, General, or Spam
- [ ] Auto-tagging works with 80%+ accuracy on Lead and Complaint detection
- [ ] Dealer can search messages by content and customer name
- [ ] Filter by platform and tag works correctly
- [ ] "Create Lead" from inbox captures customer details and stores in leads table

---

## 9. Module 5 — Inventory Connector (P1)

### 9.1 Functional Requirements

#### 9.1.1 Phase 1 — CSV/Excel Upload

- **Upload Screen:** Simple drag-and-drop zone (mobile: file picker button)
- **Supported formats:** `.csv`, `.xlsx`, `.xls`
- **Required columns:** Make, Model, Variant, Year, Price, Condition (New/Used), Image URL(s)
- **Optional columns:** Color, Fuel Type, Transmission, Mileage (for used), Stock Count, VIN/Registration
- **Column Mapping UI:** After upload, show a mapping screen where the dealer maps their file's column headers to Cardeko's expected fields (with auto-detection for common header names)
- **Validation:** Show errors inline (missing required fields, invalid prices, broken image URLs) and allow the dealer to fix before confirming import
- **Import confirmation:** Show summary — "Importing 47 vehicles. 3 errors found (click to fix)."
- **Incremental updates:** Subsequent uploads can append, update (matched by Make+Model+Variant+Year), or replace all inventory

#### 9.1.2 Inventory Management Screen

- **Table/Grid view** of all inventory items
- Columns: Image thumbnail, Make, Model, Variant, Year, Price, Status (In Stock / Sold / Reserved), Date Added
- **Filters:** Make, Model, Year, Price Range, Condition, Status
- **Sort:** Price, Date Added, Make
- **Quick Actions per row:** Edit, Mark as Sold, Generate Post (opens Create Post with this vehicle pre-filled), Delete
- **Bulk Actions:** Select multiple → Mark as Sold, Generate Group Showcase Post, Delete

#### 9.1.3 Auto-Creative Triggers

When new inventory items are added (via upload or manual entry):
- Show a notification: "12 new vehicles added to inventory. Generate showcase posts?"
- If dealer confirms, auto-generate creative variants for each new vehicle (or a combined showcase for multiple vehicles of the same make)
- These appear as drafts in the Content Calendar

When inventory items are marked as Sold:
- Any scheduled (unpublished) posts featuring this vehicle are flagged: "⚠️ This vehicle has been marked as sold. Unpublish this post?"
- Published posts are NOT automatically removed (dealer decides)

#### 9.1.4 Phase 2 — API Connector (Post-MVP, Design Now)

- Design the database schema and API contracts now to support direct DMS/ERP integration
- Target platforms: AutoVista, custom dealer ERPs
- Webhook-based sync: dealer's DMS pushes inventory changes to Cardeko webhook endpoint
- Polling-based sync: Cardeko polls dealer's API at configurable intervals
- Build a generic `InventorySource` interface that both CSV upload and API connectors implement

### 9.2 Acceptance Criteria

- [ ] Dealer can upload CSV/Excel and see inventory in under 60 seconds for files up to 500 rows
- [ ] Column mapping UI auto-detects common headers and allows manual override
- [ ] Validation catches missing required fields and broken image URLs before import
- [ ] Inventory table supports filtering, sorting, and pagination
- [ ] "Generate Post" from inventory row opens Create Post with vehicle data pre-filled
- [ ] New inventory additions trigger optional auto-creative generation
- [ ] Sold vehicles flag associated scheduled posts for review
- [ ] Incremental upload correctly updates existing vehicles and adds new ones

---

## 10. Module 6 — India Context Pack (P1)

### 10.1 Functional Requirements

#### 10.1.1 Festival Calendar Engine

- **Pre-loaded database** of Indian festivals, national holidays, and automotive buying occasions for the next 12 months (see Appendix A for initial data)
- **Auto-campaign suggestions:** 14 days before each festival, the system generates a notification and pre-populates the Content Calendar with suggested festival posts for that dealer's region
- **Regional filtering:** Dealers set their region(s) during onboarding (North, South, East, West, or specific states). They only see festivals relevant to their region.

#### 10.1.2 Regional Language Support

| Language | Script | Phase | Caption Generation | Template Text |
|----------|--------|-------|-------------------|---------------|
| English | Latin | Phase 1 | GPT-4o | Yes |
| Hindi | Devanagari | Phase 1 | GPT-4o | Yes |
| Tamil | Tamil | Phase 2 | GPT-4o | Yes |
| Telugu | Telugu | Phase 2 | GPT-4o | Yes |
| Kannada | Kannada | Phase 2 | GPT-4o | Yes |
| Malayalam | Malayalam | Phase 2 | GPT-4o | Yes |
| Marathi | Devanagari | Phase 2 | GPT-4o | Yes |

**Important:** This is NOT translation. The AI must generate culturally native phrasing. "Diwali ki Dhoom Dhamaka Offer" is correct. "Diwali's Grand Celebration Offer" translated to Hindi is wrong. The GPT-4o system prompt must specify: "Generate content natively in {language}. Do not translate from English. Use idioms, references, and phrasing natural to {language}-speaking automobile buyers."

#### 10.1.3 Festival Template Library

- Minimum 2 templates per major festival (see Appendix A)
- Templates must incorporate festival-specific visual elements: Diwali diyas, Holi colors, Onam pookalam, etc.
- Templates must support dealer branding overlay (logo, colors)
- Region-specific templates: Onam templates for Kerala dealers only, Pongal for Tamil Nadu, Baisakhi for Punjab, etc.

#### 10.1.4 GMB-First Strategy

Google is the primary discovery channel for local businesses in India. GMB posting is NOT an afterthought.

- Every creative generated must include a GMB-optimized variant (1200×900, shorter text, CTA button)
- GMB posts should include `callToAction` with type: `CALL`, `LEARN_MORE`, or `ORDER` (used for booking)
- Weekly GMB update posts should be auto-suggested (hours update, service availability, stock highlights)
- GMB review response is integrated into the Unified Inbox (Module 4)

### 10.2 Acceptance Criteria

- [ ] Festival calendar contains all major Indian festivals for 12 months with regional mapping
- [ ] Auto-campaign suggestions appear 14 days before each relevant festival
- [ ] Regional filtering works — Kerala dealer sees Onam, not Baisakhi
- [ ] Hindi captions are culturally native (not translated English)
- [ ] GMB-optimized creative variant is generated for every post
- [ ] Festival templates render with festival-specific visual elements and dealer branding
- [ ] Dealer can set language preference during onboarding and change in settings

---

## 11. Module 7 — Lead Attribution Dashboard (P2)

### 11.1 Functional Requirements

This module connects marketing activity to business outcomes. It is P2 for MVP but must be architected now so data collection starts from Day 1.

#### 11.1.1 Tracked Actions

| Action | Tracking Method | Source |
|--------|----------------|--------|
| Click-to-Call | UTM-tagged phone number + Meta Ads call tracking | Published posts, boosted ads |
| WhatsApp Tap | UTM-tagged WhatsApp link (`https://wa.me/{number}?text={utm_msg}`) | Published posts |
| Form Submission | Custom landing page form (if applicable) | Boost campaign destination |
| Direction Requests | GMB Insights API | GMB posts |
| Website Click | UTM-tagged URLs | All published posts |
| Inbox Lead Tag | Manual tag in Unified Inbox | Inbox messages |

#### 11.1.2 Dashboard Widgets

- **Total Leads This Month** (large number with trend arrow)
- **Leads by Source** (pie/donut chart: Facebook, Instagram, GMB, WhatsApp, Organic)
- **Leads by Campaign** (table: campaign name, leads generated, cost per lead if boosted)
- **Top Performing Posts** (ranked by lead generation, not engagement)
- **Weekly Trend** (line chart: leads per week over last 8 weeks)
- **Monthly Summary Card** (auto-generated, suitable for WhatsApp-sharing with dealer owner)

#### 11.1.3 Monthly Report Auto-Generation

- At the end of each month, auto-generate a summary report PDF/image
- Include: total posts published, total reach, total leads, boost spend, cost per lead, top 3 performing posts
- Send to dealer via WhatsApp (if connected) and email
- Design the report to be "forward-friendly" — a dealer should proudly share it with their OEM or team

### 11.2 Acceptance Criteria

- [ ] UTM-tagged links are appended to every published post's CTA
- [ ] Click-to-call and WhatsApp taps are tracked (at minimum via UTM analytics, ideally via Meta tracking)
- [ ] Dashboard shows lead count, source breakdown, and campaign attribution
- [ ] Monthly report auto-generates and is delivered to the dealer

---

## 12. Authentication, Onboarding & Dealer Management

### 12.1 Authentication

- **Method:** Phone number (OTP via SMS) as primary. Email/password as secondary.
- **OTP Provider:** MSG91 or Twilio (Indian SMS delivery reliability is critical — test multiple providers)
- **Session:** JWT (access token: 1 hour, refresh token: 30 days) stored in httpOnly cookies (web) and secure storage (mobile)
- **Multi-device:** Support simultaneous sessions on web + mobile

### 12.2 Onboarding Flow (First-Time Setup)

This is where we either win or lose the dealer in the first 15 minutes. The target is: **time to first post under 15 minutes from signup.**

**Step 1 — Phone Verification (30 seconds):**
- Enter phone number → receive OTP → verify → account created

**Step 2 — Dealer Profile (2 minutes):**
- Dealership name (required)
- City / Location (required, auto-detect via geolocation with manual override)
- Vehicle brands sold (multi-select from predefined list: Maruti Suzuki, Hyundai, Tata, Mahindra, Kia, Toyota, Honda, MG, Volkswagen, Skoda, BMW, Mercedes, Audi, etc. + "Other" with text input)
- Showroom type: New Cars, Pre-Owned, Two-Wheeler, Multi-Brand (multi-select)
- Contact phone (pre-filled from auth), WhatsApp number
- Dealership logo upload (optional, can skip)

**Step 3 — Brand Setup (1 minute):**
- Auto-detect brand colors from uploaded logo (if available) using color extraction
- Or: pick primary and secondary colors from a palette
- Preview: "This is how your brand will look on posts" with a sample creative

**Step 4 — Connect Platforms (3 minutes):**
- Show 3 cards: Facebook, Instagram, Google My Business
- Each card: "Connect" button with OAuth flow
- "Skip for now" option (all three can be connected later in Settings)
- Minimum 1 platform connection required to proceed, OR allow skipping entirely with a warning: "You'll need to connect at least one platform to publish posts."

**Step 5 — First Post (5 minutes):**
- Auto-redirect to Create Post screen
- Show a guided tutorial overlay: "Type your first prompt here or pick one of these suggestions"
- Pre-select the most relevant prompt based on dealer profile (e.g., if they sell Hyundai, suggest "Showcase our latest Hyundai Creta stock")
- After first creative is generated, confetti animation + congratulations message

**Onboarding Progress:**
- Show a progress bar throughout (Steps 1–5)
- Allow going back to previous steps
- Save progress — if dealer drops off at Step 3, they resume at Step 3 on next login
- Onboarding completion is tracked as a metric

### 12.3 Dealer Management (Admin)

Build an internal admin panel (accessible only by Cardeko team, not dealers) with:

- List all dealers with: name, city, plan, signup date, last active, platforms connected, posts published this month
- Filter by plan, city, activity status
- Impersonate (view dashboard as dealer — read-only, for support purposes)
- Edit dealer plan, add/remove features, extend trial
- View dealer's platform connection status and token health
- Aggregate metrics: total dealers, active dealers (posted in last 7 days), total posts, total boost spend

### 12.4 Subscription & Billing

**Pricing Tiers:**

| Tier | Price/Month | Post Limit | Platforms | Boost | Inbox | Inventory | Multi-Location |
|------|------------|------------|-----------|-------|-------|-----------|----------------|
| Starter | ₹4,999 | 30 posts | 3 | No | Basic | No | No |
| Growth | ₹9,999 | Unlimited | 3 | Yes | Full + AI | Yes | No |
| Enterprise | ₹19,999+ | Unlimited | 3+ | Yes | Full + AI | Yes | Yes |

**Billing Integration:**
- Payment gateway: Razorpay (best coverage in India for recurring payments)
- Support: Credit/debit cards, UPI, net banking
- Subscription management: auto-renewal with 3-day pre-renewal reminder
- Failed payment: retry 3 times over 7 days, then downgrade to limited access (view-only, no new posts)
- Invoice generation: GST-compliant invoices auto-generated and emailed

### 12.5 Acceptance Criteria

- [ ] OTP-based signup works reliably with Indian phone numbers
- [ ] Onboarding flow can be completed in under 10 minutes (measured)
- [ ] Dealer can connect at least one social platform during onboarding
- [ ] First post is generated within 15 minutes of signup
- [ ] Onboarding progress is saved — drop-offs resume where they left off
- [ ] Admin panel shows all dealers with key metrics and supports impersonation
- [ ] Razorpay subscription handles auto-renewal, failed payments, and plan changes
- [ ] GST-compliant invoices are auto-generated

---

## 13. Database Schema

### 13.1 Core Tables

Design the following PostgreSQL tables. All tables include: `id` (UUID, primary key), `created_at` (timestamptz), `updated_at` (timestamptz). Use `timestamptz` (not `timestamp`) everywhere — always store in UTC.

```
dealers
├── id (UUID PK)
├── phone (varchar, unique, indexed)
├── email (varchar, nullable)
├── name (varchar) -- dealership name
├── city (varchar)
├── state (varchar)
├── latitude (decimal)
├── longitude (decimal)
├── brands (jsonb) -- array of brand names
├── showroom_type (varchar[]) -- new, pre_owned, two_wheeler, multi_brand
├── logo_url (varchar, nullable)
├── primary_color (varchar, default '#1A1A2E')
├── secondary_color (varchar, default '#FFFFFF')
├── contact_phone (varchar)
├── whatsapp_number (varchar, nullable)
├── plan (enum: starter, growth, enterprise)
├── plan_expires_at (timestamptz)
├── onboarding_step (int, default 1)
├── onboarding_completed (boolean, default false)
├── language_preferences (varchar[], default ['en'])
├── region (varchar) -- north, south, east, west, or state code
├── timezone (varchar, default 'Asia/Kolkata')
├── is_active (boolean, default true)
├── created_at, updated_at

platform_connections
├── id (UUID PK)
├── dealer_id (UUID FK → dealers)
├── platform (enum: facebook, instagram, gmb)
├── platform_account_id (varchar) -- page ID, IG user ID, or GMB location ID
├── platform_account_name (varchar)
├── access_token (text, encrypted)
├── refresh_token (text, encrypted, nullable)
├── token_expires_at (timestamptz)
├── ad_account_id (varchar, nullable) -- for Meta boost
├── is_connected (boolean, default true)
├── last_sync_at (timestamptz)
├── created_at, updated_at
├── UNIQUE(dealer_id, platform)

templates
├── id (UUID PK)
├── name (varchar)
├── category (enum: new_arrival, festival, service_camp, testimonial, inventory_showcase, engagement, generic)
├── spec (jsonb) -- full template JSON specification
├── thumbnail_url (varchar)
├── platforms (varchar[]) -- which platform sizes are supported
├── regional_variants (varchar[]) -- supported languages
├── festival_id (UUID FK → festivals, nullable)
├── is_active (boolean, default true)
├── usage_count (int, default 0)
├── created_at, updated_at

prompts
├── id (UUID PK)
├── category (enum, same as templates)
├── text_en (text)
├── text_hi (text, nullable)
├── text_regional (jsonb, nullable) -- {ta: "...", te: "...", etc.}
├── is_active (boolean, default true)
├── usage_count (int, default 0)
├── sort_order (int, default 0)
├── created_at, updated_at

posts
├── id (UUID PK)
├── dealer_id (UUID FK → dealers)
├── prompt_text (text) -- what the dealer typed
├── prompt_id (UUID FK → prompts, nullable) -- if selected from library
├── selected_variant_index (int) -- which of the 3 variants was chosen
├── caption_text (text)
├── caption_hashtags (varchar[])
├── creative_urls (jsonb) -- {facebook_post: "s3://...", instagram_post: "s3://...", ...}
├── template_id (UUID FK → templates)
├── inventory_item_ids (UUID[]) -- linked inventory items
├── platforms (varchar[]) -- target platforms
├── status (enum: draft, scheduled, publishing, published, partially_published, failed)
├── scheduled_at (timestamptz, nullable)
├── published_at (timestamptz, nullable)
├── publish_results (jsonb) -- {facebook: {post_id: "...", status: "success"}, ...}
├── metrics (jsonb) -- {facebook: {reach: 0, likes: 0, ...}, ...}
├── metrics_last_fetched (timestamptz)
├── created_at, updated_at
├── INDEX on (dealer_id, status)
├── INDEX on (dealer_id, scheduled_at)

boost_campaigns
├── id (UUID PK)
├── dealer_id (UUID FK → dealers)
├── post_id (UUID FK → posts)
├── meta_campaign_id (varchar)
├── meta_adset_id (varchar)
├── meta_ad_id (varchar)
├── daily_budget (int) -- in paisa (₹500 = 50000)
├── duration_days (int)
├── start_date (date)
├── end_date (date)
├── targeting_spec (jsonb)
├── status (enum: draft, active, paused, completed, failed)
├── total_spent (int, default 0) -- in paisa
├── metrics (jsonb) -- {reach, impressions, clicks, cpc, ctr}
├── metrics_last_fetched (timestamptz)
├── created_at, updated_at

inbox_messages
├── id (UUID PK)
├── dealer_id (UUID FK → dealers)
├── platform (enum: facebook, instagram, google_reviews)
├── message_type (enum: comment, dm, review)
├── platform_message_id (varchar, unique)
├── post_id (UUID FK → posts, nullable) -- if it's a comment on a post
├── customer_name (varchar)
├── customer_avatar_url (varchar, nullable)
├── customer_platform_id (varchar)
├── message_text (text)
├── sentiment (enum: positive, neutral, negative, nullable)
├── tag (enum: lead, complaint, general, spam, nullable)
├── ai_suggested_reply (text, nullable)
├── reply_text (text, nullable) -- actual reply sent
├── replied_at (timestamptz, nullable)
├── is_read (boolean, default false)
├── requires_approval (boolean, default false) -- true for negative sentiment
├── received_at (timestamptz)
├── created_at, updated_at
├── INDEX on (dealer_id, is_read, received_at)

inventory_items
├── id (UUID PK)
├── dealer_id (UUID FK → dealers)
├── make (varchar)
├── model (varchar)
├── variant (varchar, nullable)
├── year (int)
├── price (int) -- in paisa
├── condition (enum: new, used)
├── color (varchar, nullable)
├── fuel_type (varchar, nullable)
├── transmission (varchar, nullable)
├── mileage_km (int, nullable) -- for used cars
├── stock_count (int, default 1)
├── image_urls (varchar[])
├── status (enum: in_stock, sold, reserved)
├── source (enum: csv_upload, api_sync, manual)
├── created_at, updated_at
├── INDEX on (dealer_id, status)
├── INDEX on (dealer_id, make, model)

festivals
├── id (UUID PK)
├── name_en (varchar)
├── name_hi (varchar, nullable)
├── name_regional (jsonb, nullable)
├── date (date) -- for current year; recalculate annually for lunar calendar festivals
├── regions (varchar[]) -- applicable regions/states
├── category (varchar) -- religious, national, automotive, seasonal
├── campaign_type (varchar) -- offers, auspicious_purchase, patriotic, clearance
├── template_ids (UUID[]) -- associated template IDs
├── auto_suggest_days_before (int, default 14)
├── is_active (boolean, default true)
├── created_at, updated_at

leads
├── id (UUID PK)
├── dealer_id (UUID FK → dealers)
├── customer_name (varchar, nullable)
├── customer_phone (varchar, nullable)
├── source_platform (varchar) -- facebook, instagram, gmb, whatsapp
├── source_type (enum: click_to_call, whatsapp_tap, form_fill, direction_request, inbox_tag, website_click)
├── source_post_id (UUID FK → posts, nullable)
├── source_campaign_id (UUID FK → boost_campaigns, nullable)
├── source_message_id (UUID FK → inbox_messages, nullable)
├── vehicle_interest (varchar, nullable)
├── notes (text, nullable)
├── created_at, updated_at
├── INDEX on (dealer_id, created_at)
```

### 13.2 Encryption

- All `access_token` and `refresh_token` fields must be encrypted at rest using AES-256-GCM
- Encryption key stored in AWS Secrets Manager, NOT in environment variables or code
- Database-level encryption: enable RDS encryption at rest

---

## 14. API Design Standards

### 14.1 General Conventions

- **Base URL:** `https://api.cardekosocial.com/v1`
- **Authentication:** Bearer token (JWT) in `Authorization` header
- **Content-Type:** `application/json` for all requests and responses
- **Versioning:** URL-based (`/v1/`, `/v2/`)
- **Pagination:** Cursor-based for lists (`?cursor=xxx&limit=20`), never offset-based
- **Error Format:**
  ```json
  {
    "error": {
      "code": "INVALID_PROMPT",
      "message": "Prompt text is required and must be under 500 characters.",
      "details": {}
    }
  }
  ```
- **Rate Limiting:** 100 req/min per dealer for standard endpoints, 10 req/min for AI generation endpoints. Return `429 Too Many Requests` with `Retry-After` header.

### 14.2 Key API Endpoints

```
POST   /v1/auth/otp/send          -- Send OTP to phone
POST   /v1/auth/otp/verify        -- Verify OTP, return JWT
POST   /v1/auth/refresh            -- Refresh JWT

GET    /v1/dealer/profile          -- Get current dealer profile
PUT    /v1/dealer/profile          -- Update dealer profile
POST   /v1/dealer/logo             -- Upload dealer logo (multipart)

GET    /v1/platforms                -- List connected platforms
POST   /v1/platforms/connect       -- Initiate OAuth flow (returns redirect URL)
GET    /v1/platforms/callback       -- OAuth callback handler
DELETE /v1/platforms/{platform}     -- Disconnect platform

GET    /v1/prompts                  -- List suggested prompts (filterable by category)
POST   /v1/creative/generate        -- Generate 3 creative variants from prompt
GET    /v1/creative/{id}            -- Get generated creative details
PUT    /v1/creative/{id}            -- Update creative (edit caption/headline)
POST   /v1/creative/{id}/regenerate -- Generate new variants

GET    /v1/templates                -- List available templates
GET    /v1/templates/{id}           -- Get template spec

POST   /v1/posts                    -- Create post (schedule or publish now)
GET    /v1/posts                    -- List posts (filterable by status, date range)
GET    /v1/posts/{id}               -- Get post details with metrics
PUT    /v1/posts/{id}               -- Update post (reschedule, edit)
DELETE /v1/posts/{id}               -- Delete post (only drafts/scheduled)
POST   /v1/posts/{id}/publish       -- Immediately publish a scheduled/draft post
GET    /v1/posts/calendar           -- Get posts for calendar view (date range)
POST   /v1/posts/bulk-schedule      -- Schedule multiple posts at once

POST   /v1/boost                    -- Create and launch boost campaign
GET    /v1/boost                    -- List campaigns (filterable by status)
GET    /v1/boost/{id}               -- Get campaign details with metrics
PUT    /v1/boost/{id}/pause         -- Pause campaign
PUT    /v1/boost/{id}/resume        -- Resume campaign
PUT    /v1/boost/{id}/stop          -- Stop campaign
GET    /v1/boost/estimate           -- Get reach estimate for budget/targeting

GET    /v1/inbox                    -- List messages (filterable by platform, tag, read status)
GET    /v1/inbox/{id}               -- Get message with AI suggestion
PUT    /v1/inbox/{id}/reply         -- Send reply
PUT    /v1/inbox/{id}/tag           -- Update tag
PUT    /v1/inbox/{id}/read          -- Mark as read
GET    /v1/inbox/unread-count       -- Get unread count per platform

POST   /v1/inventory/upload         -- Upload CSV/Excel
GET    /v1/inventory                -- List inventory items (filterable)
GET    /v1/inventory/{id}           -- Get item details
PUT    /v1/inventory/{id}           -- Update item
PUT    /v1/inventory/{id}/status    -- Mark as sold/reserved/in_stock
DELETE /v1/inventory/{id}           -- Delete item

GET    /v1/festivals                -- List upcoming festivals for dealer's region
GET    /v1/festivals/{id}           -- Get festival details with templates

GET    /v1/analytics/dashboard      -- Dashboard metrics (date range)
GET    /v1/analytics/leads          -- Lead list (filterable)
GET    /v1/analytics/report/{month} -- Monthly report data
POST   /v1/analytics/report/{month}/send -- Send report via WhatsApp/email
```

---

## 15. Third-Party Integrations

### 15.1 Meta Graph API (Facebook + Instagram)

- **API Version:** Use the latest stable version (v19.0+ as of March 2026). Pin the version in config to avoid breaking changes.
- **App Review:** The app must pass Meta App Review for production access. Required permissions: `pages_manage_posts`, `pages_read_engagement`, `pages_messaging`, `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_messages`, `ads_management`, `ads_read`.
- **Business Verification:** Required for production access. Begin this process in Week 1 — it can take 2–4 weeks.
- **Rate Limits:** Meta applies rate limits per app and per user. Implement exponential backoff and respect the `x-app-usage` header.
- **Webhook Setup:** Subscribe to `page/feed`, `page/messages`, `instagram/comments`, `instagram/messages`. Verify with hub challenge.

### 15.2 Google Business Profile API

- **API Access:** Apply for Google Business Profile API access through Google Cloud Console. This is NOT instant — plan for 1–2 weeks approval.
- **OAuth Scope:** `https://www.googleapis.com/auth/business.manage`
- **Location Management:** Each dealer may have multiple GMB locations. List locations via API and let dealer select which to connect.
- **Posting:** `POST /v1/{name}/localPosts` with `LocalPost` object including `summary`, `media`, and `callToAction`.
- **Reviews:** `GET /v1/{name}/reviews` to fetch reviews. Reply via `PUT /v1/{name}/reviews/{reviewId}/reply`.

### 15.3 OpenAI API

- **Model:** GPT-4o for all text generation (captions, replies, sentiment)
- **API Key:** Store in AWS Secrets Manager. Rotate quarterly.
- **Rate Limits:** Monitor token usage. Implement request queuing to avoid 429 errors.
- **Cost Management:** Track token usage per dealer per month. Set alerts at budget thresholds.
- **Fallback:** If OpenAI API is down, show a manual caption input field with template-based suggestions (no AI). Never block the posting flow.

### 15.4 Razorpay (Payments)

- **Subscription API:** Create plans for each tier, manage subscriptions programmatically
- **Webhooks:** Subscribe to `subscription.charged`, `subscription.halted`, `payment.failed`
- **Test Mode:** Use Razorpay test keys in staging environment
- **GST:** Configure GSTIN in Razorpay dashboard for GST-compliant invoices

### 15.5 SMS (OTP)

- **Provider:** MSG91 (primary), Twilio (fallback)
- **Template Registration:** Pre-register OTP templates with DLT platform (mandatory in India)
- **Rate Limiting:** Max 3 OTPs per phone per hour. Cooldown between retries: 30s, 60s, 120s.

---

## 16. Job Queue & Background Workers

### 16.1 BullMQ Queue Architecture

| Queue Name | Purpose | Concurrency | Retry Policy |
|------------|---------|-------------|--------------|
| `creative-generation` | AI caption + template rendering | 5 | 2 retries, 30s backoff |
| `post-publish` | Push content to social platforms | 3 | 3 retries, exponential (1m, 5m, 15m) |
| `boost-management` | Create/pause/stop Meta campaigns | 2 | 3 retries, 2m backoff |
| `inbox-poll` | Poll platforms for new messages | 1 | No retry (runs on schedule) |
| `metrics-fetch` | Pull post/boost metrics from APIs | 2 | 2 retries, 5m backoff |
| `token-refresh` | Refresh expiring OAuth tokens | 1 | 3 retries, 1h backoff |
| `report-generation` | Monthly report PDF creation | 1 | 2 retries, 10m backoff |
| `inventory-process` | CSV/Excel parsing and import | 1 | No retry (user re-uploads) |

### 16.2 Scheduled Jobs (Cron)

| Job | Schedule | Description |
|-----|----------|-------------|
| `token-health-check` | Daily at 02:00 IST | Check all tokens expiring within 7 days, attempt refresh |
| `metrics-poll` | Every 6 hours | Fetch post metrics for posts published in last 30 days |
| `boost-metrics` | Every 4 hours | Fetch spend/performance for active boost campaigns |
| `inbox-poll` | Every 5 minutes | Poll platforms for new messages (fallback for webhooks) |
| `festival-reminder` | Daily at 09:00 IST | Check festivals in next 14 days, generate suggestions |
| `monthly-report` | 1st of month, 10:00 IST | Generate and send monthly reports for all active dealers |
| `stale-creative-cleanup` | Weekly, Sunday 03:00 IST | Delete unselected creative variants older than 30 days from S3 |

---

## 17. Mobile Responsiveness & React Native

### 17.1 Web (React) — Mobile-First

- All screens designed for 360px width first, then scaled up
- Use CSS Grid / Flexbox, not fixed pixel widths
- Touch targets: minimum 44px × 44px
- Swipe gestures: left-swipe on inbox messages for quick actions, horizontal swipe on creative variants
- Bottom sheet pattern for all secondary actions (boost setup, platform selection, scheduling)
- No hover-dependent interactions — everything must work on tap

### 17.2 React Native App

**Phase 1 (MVP):** Web app only, optimised for mobile browsers.  
**Phase 2 (Post-MVP):** React Native app with shared business logic.

For MVP, ensure the web app is PWA-ready:
- `manifest.json` with app name, icons, theme color
- Service worker for offline awareness (show "You're offline" message, not broken UI)
- "Add to Home Screen" prompt after 3rd visit
- Push notifications via Web Push API (for inbox messages, boost alerts, scheduled post reminders)

---

## 18. Testing Strategy

### 18.1 Unit Tests

- **Coverage target:** 80% on all service modules
- **Framework:** Jest (backend), React Testing Library (frontend)
- **Critical paths that must have 100% coverage:**
  - AI caption generation guardrails (no hallucinated prices, no wrong model names)
  - Boost campaign creation and budget calculation
  - Token encryption/decryption
  - Inventory CSV parsing and validation

### 18.2 Integration Tests

- Meta API publishing (use Meta test pages and test app)
- Google Business Profile API (use test locations)
- OpenAI API (mock responses for deterministic testing, real API for smoke tests)
- Razorpay subscription lifecycle (use test mode)

### 18.3 End-to-End Tests

- **Framework:** Playwright
- **Critical flows to automate:**
  1. Signup → Onboarding → First Post Published (complete flow)
  2. Create Post → Schedule → Post Goes Live at Scheduled Time
  3. Boost Setup → Campaign Launches on Meta
  4. Inbox Message Received → AI Reply Sent
  5. CSV Upload → Inventory Visible → Post Generated from Inventory

### 18.4 Performance Tests

- Load test the creative generation endpoint: must handle 50 concurrent generation requests (across all dealers) without degradation
- Load test the publish queue: must handle 100 scheduled posts firing in the same minute
- Database: test with 500 dealers × 100 posts each (50,000 posts) — all queries must return in under 200ms

---

## 19. DevOps, CI/CD & Infrastructure

### 19.1 Infrastructure (AWS ap-south-1)

| Service | AWS Resource | Config |
|---------|-------------|--------|
| API Server | ECS Fargate (or EC2 t3.medium for MVP) | 2 instances, auto-scaling on CPU > 70% |
| Database | RDS PostgreSQL 16 (db.t3.medium) | Multi-AZ for production, single-AZ for staging |
| Cache/Queue | ElastiCache Redis 7 (cache.t3.micro) | Single node for MVP, cluster post-MVP |
| Object Storage | S3 | Lifecycle: delete unselected creatives after 30 days |
| CDN | CloudFront | Distribution for S3 assets, API caching for static endpoints |
| Secrets | AWS Secrets Manager | API keys, encryption keys, OAuth secrets |
| DNS | Route 53 | `api.cardekosocial.com`, `app.cardekosocial.com` |
| Monitoring | CloudWatch + Sentry | Alarms: API error rate > 5%, queue backlog > 100, disk > 80% |

### 19.2 Environments

| Environment | Purpose | Database | API Keys |
|------------|---------|----------|----------|
| `local` | Developer machines | Local PostgreSQL + Redis (Docker Compose) | Test/sandbox keys |
| `staging` | QA, demo, UAT | RDS staging instance | Meta test app, Razorpay test mode |
| `production` | Live dealers | RDS production (Multi-AZ) | Production keys |

### 19.3 CI/CD Pipeline

- **Repository:** Monorepo (Turborepo or Nx) with packages: `api`, `web`, `mobile`, `shared`
- **CI:** GitHub Actions
  - On PR: lint + type check + unit tests + build
  - On merge to `main`: all above + integration tests + deploy to staging
  - On release tag (`v*`): deploy to production
- **CD:** Docker images → ECR → ECS deployment with blue/green strategy
- **Database Migrations:** Use `node-pg-migrate` or Prisma migrations, run automatically on deploy

### 19.4 Logging & Observability

- Structured JSON logging (use `pino` with Fastify)
- Request ID tracing across all services
- Log levels: `error`, `warn`, `info`, `debug` (debug only in local/staging)
- Key metrics to dashboard: API response time (p50, p95, p99), queue latency, AI generation time, publish success rate, error rate by endpoint

---

## 20. Security & Compliance

### 20.1 Application Security

- Input validation on all endpoints (use `zod` or `joi` schemas)
- SQL injection prevention: use parameterised queries (never string concatenation)
- XSS prevention: sanitise all user-generated content before rendering
- CSRF protection: SameSite cookies + CSRF token for state-changing requests
- CORS: restrict to `app.cardekosocial.com` and mobile app origins
- Rate limiting: per-dealer and per-IP
- File upload validation: restrict to allowed MIME types and max size (10MB for logos, 50MB for inventory CSVs)

### 20.2 Data Security

- All API traffic over HTTPS (TLS 1.3)
- OAuth tokens encrypted at rest (AES-256-GCM)
- PII (phone numbers, emails) encrypted at rest in database
- S3 buckets: private by default, accessed only via signed URLs (24-hour expiry)
- Regular dependency vulnerability scanning (`npm audit`, `snyk`)

### 20.3 Compliance

- **India IT Act:** Data stored in India (AWS Mumbai region)
- **Meta Platform Terms:** Comply with Meta's Platform Policy, especially around data usage and ad transparency
- **Google Business Profile Terms:** Comply with Google's API Terms of Service
- **GSTIN:** Required for billing. Collect dealer's GSTIN during subscription setup for B2B invoicing.

---

## 21. Performance Benchmarks

These are non-negotiable performance targets for MVP:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to Interactive (web) | < 3 seconds on 3G | Lighthouse mobile audit |
| API Response Time (p95) | < 500ms for CRUD, < 15s for AI generation | CloudWatch metrics |
| Creative Generation (end-to-end) | < 15 seconds for 3 variants | From prompt submission to UI display |
| Post Publish Latency | < 30 seconds from "Publish Now" to live on platform | Queue processing time |
| Scheduled Post Accuracy | Within 60 seconds of scheduled time | BullMQ job execution variance |
| Inbox Message Delivery | < 5 minutes from platform receipt to inbox display | Webhook/polling latency |
| First Contentful Paint (mobile) | < 1.5 seconds | Lighthouse |
| Bundle Size (web) | < 300KB gzipped (initial load) | Webpack bundle analyzer |
| Database Query Time | < 200ms for all common queries | pg_stat_statements |
| Uptime | 99.5% monthly | CloudWatch synthetic monitoring |

---

## 22. Phased Delivery Plan

### Phase 1: Foundation (Weeks 1–4)

**Deliverables:**
- Backend: project scaffolding (Fastify + TypeScript + PostgreSQL + Redis + BullMQ), database schema, auth (OTP), dealer CRUD, platform OAuth (Facebook only)
- AI Engine: GPT-4o integration for caption generation, template rendering engine v1 (20 templates), creative generation pipeline
- Frontend: dealer onboarding flow, dashboard shell, Create Post screen, prompt library (basic), creative preview/selection
- Publisher: Facebook publishing (post now + schedule)
- Infrastructure: AWS setup, CI/CD pipeline, staging environment

**Milestone:** Dealer can sign up, onboard, generate a creative with AI captions, and publish to Facebook.

### Phase 2: Core Loop (Weeks 5–8)

**Deliverables:**
- Publisher: Instagram publishing, GMB publishing, Content Calendar (week + month views), bulk scheduling
- Boost: One-click boost setup, Meta Ads API integration, boost dashboard with metrics
- Creative: 30 more templates (total: 50), Hindi caption support, creative editing
- India Pack: Festival calendar engine, auto-campaign suggestions, first festival templates
- Frontend: mobile-responsive polish, boost UI, calendar UI

**Milestone:** Dealer can manage their entire weekly social media across 3 platforms with boosting, in Hindi.

### Phase 3: Engagement (Weeks 9–12)

**Deliverables:**
- Inbox: Facebook comments + Instagram DMs + Google Reviews aggregation, Meta webhooks, AI reply suggestions, sentiment detection, tagging
- Inventory: CSV/Excel upload, inventory management screen, auto-creative triggers, inventory-to-creative pipeline
- India Pack: remaining festival templates, GMB-first posting strategy
- Analytics: basic post metrics display, lead tracking setup (UTM tagging)

**Milestone:** Full MVP feature set complete. Ready for pilot.

### Phase 4: Pilot & Iterate (Weeks 13–16)

**Deliverables:**
- Pilot: onboard 10 dealers, dedicated success manager
- Bug fixes, performance optimisation, UX refinements based on pilot feedback
- Lead Dashboard v1: click-to-call and WhatsApp tracking, dashboard widgets
- Monthly report auto-generation
- Billing: Razorpay subscription integration, plan management, invoicing
- Onboarding refinement based on pilot drop-off analysis
- NPS collection, qualitative feedback interviews

**Milestone:** 10 dealers actively using the platform. Retention and NPS data collected. Roadmap for v1.1 defined.

---

## 23. Acceptance Criteria Summary

This is the master checklist. Every item must pass before the MVP is considered complete.

### P0 — Must Ship
- [ ] Dealer completes onboarding in under 15 minutes
- [ ] AI generates 3 creative variants with captions in under 15 seconds
- [ ] Captions contain zero hallucinated data (prices, specs, model names)
- [ ] Templates render correctly across all 4 platform sizes
- [ ] Publishing works on Facebook, Instagram, and Google My Business
- [ ] Scheduling posts works with under 60-second accuracy
- [ ] Content Calendar shows week and month views
- [ ] One-click boost launches a Meta campaign in under 60 seconds
- [ ] Boost dashboard shows real-time spend and metrics
- [ ] All OAuth tokens refresh automatically before expiry

### P1 — Must Ship for Pilot
- [ ] Unified Inbox aggregates messages from all 3 platforms
- [ ] AI-suggested replies generate in under 5 seconds
- [ ] Negative sentiment messages are flagged and require approval
- [ ] Inventory CSV/Excel upload works for files up to 500 rows
- [ ] Inventory items can be used to auto-populate creatives
- [ ] Festival calendar shows region-appropriate festivals
- [ ] Hindi caption generation is culturally native (not translated)
- [ ] GMB posts include call-to-action buttons

### P2 — Ship During Pilot
- [ ] Lead attribution tracks click-to-call and WhatsApp taps
- [ ] Monthly report auto-generates and can be sent to dealer
- [ ] Billing and subscription management works via Razorpay

### Non-Functional
- [ ] Web app loads in under 3 seconds on 3G
- [ ] API p95 response time under 500ms (non-AI endpoints)
- [ ] 99.5% uptime in production
- [ ] All OAuth tokens and PII encrypted at rest
- [ ] CI/CD pipeline runs lint + tests + build on every PR

---

## Appendix A — Festival Calendar Data

Pre-load the following festivals into the `festivals` table. Dates are for the current year; recalculate annually for lunar-calendar festivals.

| Month | Festival / Event | Campaign Type | Regions |
|-------|-----------------|---------------|---------|
| January | Republic Day | Patriotic offers | Pan-India |
| January | Pongal | Harvest season deals | Tamil Nadu |
| January | Makar Sankranti | Auspicious purchase | Maharashtra, Gujarat, Karnataka |
| March | Holi | Colourful offer campaigns | North India, Pan-India |
| March | Ugadi / Gudi Padwa | New year new car | Andhra Pradesh, Telangana, Maharashtra, Karnataka |
| April | Baisakhi | Auspicious purchase | Punjab, Haryana |
| April | Vishu | New year celebrations | Kerala |
| April | Tamil New Year | Auspicious purchase | Tamil Nadu |
| May | Akshaya Tritiya | Gold and big purchases | Pan-India |
| August | Independence Day | Freedom offers | Pan-India |
| August | Onam | Festive buying season | Kerala |
| August | Raksha Bandhan | Family offers | North India |
| August | Janmashtami | Festive period | Pan-India |
| September | Ganesh Chaturthi | Festival season kickoff | Maharashtra, Goa, Karnataka |
| October | Navratri | 9-day offer marathon | Pan-India, Gujarat |
| October | Dussehra / Durga Puja | Auspicious purchase | Pan-India, West Bengal |
| November | Dhanteras | Biggest buying day | Pan-India |
| November | Diwali | Peak buying season | Pan-India |
| November | Bhai Dooj | Extended festive offers | North India |
| December | Christmas | Year-end celebrations | Pan-India, Goa, Kerala, Northeast |
| December | Year-End Clearance | Stock clearance, exchange offers | Pan-India |

---

## Appendix B — Template Category Taxonomy

| Category ID | Name | Sub-Categories | Template Count (MVP) |
|------------|------|----------------|---------------------|
| `new_arrival` | New Arrivals | Single car spotlight, multi-car grid, comparison, specs highlight | 10 |
| `festival` | Festival Offers | Diwali, Navratri, Onam, Holi, Independence Day, etc. | 10 |
| `service_camp` | Service Camp | Free check-up, AC service, oil change, brake service | 5 |
| `testimonial` | Customer Testimonial | Photo + quote, video thumbnail, star rating | 5 |
| `inventory_showcase` | Inventory Showcase | Price list, weekly arrivals, comparison, "just arrived" | 10 |
| `engagement` | Engagement Posts | Poll, quiz, this-or-that, trivia, "caption this" | 5 |
| `generic` | Generic / Seasonal | Republic Day, year-end, monsoon care, summer tips | 5 |

Each template must have:
- Unique `template_id`
- JSON spec (layer-based, as defined in Module 1)
- Thumbnail preview (generated from the spec with placeholder data)
- Supported platforms (all 4 sizes)
- Tags for search/filter
- Usage counter (incremented each time a dealer selects it)

---

## Appendix C — Design Mockup Reference

All approved UI/UX mockups are available at:

**https://app.superdesign.dev/share/280a8852e1bdeb23f0089ed9fdf5c273acf2eb94ee95aaba0394757f04d6f79e**

When implementing any screen, cross-reference the mockup for:
- Layout and spacing
- Component styles and states
- Color usage and typography
- Mobile vs desktop variations
- Empty states and loading states
- Error states and edge cases

If a mockup does not exist for a specific screen described in this document, follow the design system established in the existing mockups and flag it for the design team to create before development begins.

---

**END OF DOCUMENT**

*This document is the single source of truth for the Cardeko Social AI MVP build. If there is a conflict between this document and any other source, this document takes precedence. If there is ambiguity, escalate to the Product Manager before making assumptions.*

*Last updated: March 2026*
