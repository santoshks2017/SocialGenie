Check the project files and continue this project. requirement is this -

https://app.superdesign.dev/share/280a8852e1bdeb23f0089ed9fdf5c273acf2eb94ee95aaba0394757f04d6f79e

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

| Module                     | Priority          | Build Phase | Description                                                                                                              |
| -------------------------- | ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| AI Creative Engine         | P0 — Must Have    | Phase 1–2   | One-prompt generation of platform-ready creatives with captions, hashtags, and brand-aligned visuals from inventory data |
| Multi-Platform Publisher   | P0 — Must Have    | Phase 1–2   | One-click scheduling and posting to Facebook, Instagram, and Google My Business                                          |
| One-Click Boost            | P0 — Must Have    | Phase 2     | Simplified ad boosting without needing Meta Ads Manager                                                                  |
| Unified Inbox              | P1 — Should Have  | Phase 3     | Consolidated view of comments, DMs, and Google Reviews with AI-suggested responses                                       |
| Inventory Connector        | P1 — Should Have  | Phase 3     | Pull real car data to auto-generate creatives                                                                            |
| India Context Pack         | P1 — Should Have  | Phase 2–3   | Pre-built templates for festivals, regional language captions, GMB-optimized content                                     |
| Lead Attribution Dashboard | P2 — Nice to Have | Phase 4     | Track click-to-call, WhatsApp taps, form fills tied to posts/campaigns                                                   |

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

| Layer                     | Technology                                               | Rationale                                                                                      |
| ------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Frontend — Web**        | React 18+ with TypeScript                                | Component reusability, strong typing, large ecosystem                                          |
| **Frontend — Mobile**     | React Native                                             | Shared component logic with web; dealers primarily use mobile                                  |
| **Backend API**           | Node.js with Fastify                                     | Fast development cycle, excellent async I/O, strong ecosystem for Meta/Google API integrations |
| **AI Engine — Captions**  | OpenAI GPT-4o API                                        | Best-in-class caption quality for automotive context                                           |
| **AI Engine — Creatives** | Template-based rendering engine (Canvas/Sharp/Puppeteer) | Brand consistency and dealer trust — NOT raw text-to-image generation                          |
| **Database — Primary**    | PostgreSQL 16 (RDS)                                      | Relational data for dealers, inventory, posts, campaigns                                       |
| **Database — Cache**      | Redis 7 (ElastiCache)                                    | Session management, queue backing store, rate limiting, caching                                |
| **Queue / Jobs**          | BullMQ on Redis                                          | Scheduled posting, boost campaigns, inbox polling, template rendering                          |
| **Object Storage**        | AWS S3 (ap-south-1)                                      | Template assets, generated creatives, inventory images                                         |
| **CDN**                   | AWS CloudFront                                           | Low-latency delivery of creatives and static assets across India                               |
| **Cloud Region**          | AWS ap-south-1 (Mumbai)                                  | Low latency for Indian users, data localisation compliance                                     |
| **Monitoring**            | CloudWatch + Sentry                                      | Infrastructure monitoring + application error tracking                                         |
| **Search**                | OpenSearch (optional, Phase 3+)                          | Inbox message search, inventory search                                                         |

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

| Component          | Usage                                           | Notes                                                                     |
| ------------------ | ----------------------------------------------- | ------------------------------------------------------------------------- |
| `<Button>`         | Primary, Secondary, Ghost, Danger variants      | Must include loading state with spinner                                   |
| `<Input>`          | Text, Search, Prompt input                      | Supports RTL, character count, clear button                               |
| `<TextArea>`       | Caption editing, prompt input                   | Auto-resize, max character count per platform                             |
| `<Card>`           | Post preview, creative variant, inbox message   | Shadow elevation, hover state, swipe-to-action on mobile                  |
| `<Modal>`          | Confirmations, boost setup, platform selection  | Must trap focus for accessibility                                         |
| `<Calendar>`       | Content calendar, date picker, scheduler        | Week view as default, month view toggle                                   |
| `<Badge>`          | Status indicators, unread count, platform icons | Color-coded: green (live), yellow (scheduled), red (failed), grey (draft) |
| `<Avatar>`         | Dealer profile, customer avatar in inbox        | Initials fallback when no image                                           |
| `<DropdownMenu>`   | Platform selection, budget selection, actions   | Supports multi-select for platforms                                       |
| `<Toast>`          | Success/error notifications                     | Auto-dismiss after 5s, supports undo action                               |
| `<SkeletonLoader>` | Loading states for all data-dependent screens   | Match exact layout of loaded content                                      |
| `<EmptyState>`     | No posts, no messages, no inventory             | Illustration + single CTA button                                          |
| `<Tabs>`           | Inbox categories, dashboard sections            | Supports swipe navigation on mobile                                       |
| `<Tag>`            | Lead, Complaint, General, Spam labels           | Clickable for filtering                                                   |
| `<ImageCarousel>`  | Creative variant selection, inventory gallery   | Supports pinch-to-zoom on mobile                                          |
| `<ProgressBar>`    | Boost spend tracking, onboarding progress       | Animated fill                                                             |
| `<PlatformIcon>`   | Facebook, Instagram, GMB icons                  | Consistent sizing (24px, 32px, 48px)                                      |

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
  "platforms": [
    "facebook_post",
    "instagram_post",
    "instagram_story",
    "gmb_post"
  ],
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

| Category             | Minimum Count  | Examples                                                         |
| -------------------- | -------------- | ---------------------------------------------------------------- |
| New Arrivals         | 10             | Bold banner, minimal showcase, split-screen comparison           |
| Festival Offers      | 10             | Diwali gold theme, Navratri 9-color, Holi splash                 |
| Service Camp         | 5              | Service reminder, free check-up announcement, AC service special |
| Customer Testimonial | 5              | Photo + quote, star rating card, video thumbnail                 |
| Inventory Showcase   | 10             | Grid of 4 cars, single spotlight, price comparison               |
| Engagement Posts     | 5              | Poll, quiz, this-or-that, trivia                                 |
| Generic / Seasonal   | 5              | Republic Day, Independence Day, New Year                         |
| **Total**            | **50 minimum** |                                                                  |

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

| Metric            | Display Name    | Source     |
| ----------------- | --------------- | ---------- |
| `reach`           | People Reached  | Meta       |
| `impressions`     | Times Shown     | Meta       |
| `clicks`          | Link Clicks     | Meta       |
| `cpc`             | Cost per Click  | Calculated |
| `ctr`             | Click Rate      | Calculated |
| `spend`           | Amount Spent    | Meta       |
| `actions` (calls) | Calls Generated | Meta       |

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
    "custom_locations": [
      {
        "latitude": "{dealer_lat}",
        "longitude": "{dealer_lng}",
        "radius": 25,
        "distance_unit": "kilometer"
      }
    ]
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

| Source         | Message Types                          | Polling Method                                     | Polling Frequency                             |
| -------------- | -------------------------------------- | -------------------------------------------------- | --------------------------------------------- |
| Facebook       | Comments on posts, Page messages (DMs) | Meta Webhooks (preferred) or polling via Graph API | Real-time via webhooks, fallback: every 5 min |
| Instagram      | Comments on posts, Direct Messages     | Meta Webhooks (preferred) or polling via Graph API | Real-time via webhooks, fallback: every 5 min |
| Google Reviews | New reviews, review replies            | Google Business Profile API polling                | Every 15 min                                  |

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

| Tag             | Color | Auto-Tag Rule                                                                  |
| --------------- | ----- | ------------------------------------------------------------------------------ |
| Lead            | Green | Message contains: price, availability, test drive, booking, EMI, finance, loan |
| Complaint       | Red   | Negative sentiment detected                                                    |
| General Enquiry | Blue  | Default for questions that don't match Lead or Complaint                       |
| Spam            | Grey  | Detected spam patterns (links, promotional content)                            |

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

| Language  | Script     | Phase   | Caption Generation | Template Text |
| --------- | ---------- | ------- | ------------------ | ------------- |
| English   | Latin      | Phase 1 | GPT-4o             | Yes           |
| Hindi     | Devanagari | Phase 1 | GPT-4o             | Yes           |
| Tamil     | Tamil      | Phase 2 | GPT-4o             | Yes           |
| Telugu    | Telugu     | Phase 2 | GPT-4o             | Yes           |
| Kannada   | Kannada    | Phase 2 | GPT-4o             | Yes           |
| Malayalam | Malayalam  | Phase 2 | GPT-4o             | Yes           |
| Marathi   | Devanagari | Phase 2 | GPT-4o             | Yes           |

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

| Action             | Tracking Method                                                    | Source                       |
| ------------------ | ------------------------------------------------------------------ | ---------------------------- |
| Click-to-Call      | UTM-tagged phone number + Meta Ads call tracking                   | Published posts, boosted ads |
| WhatsApp Tap       | UTM-tagged WhatsApp link (`https://wa.me/{number}?text={utm_msg}`) | Published posts              |
| Form Submission    | Custom landing page form (if applicable)                           | Boost campaign destination   |
| Direction Requests | GMB Insights API                                                   | GMB posts                    |
| Website Click      | UTM-tagged URLs                                                    | All published posts          |
| Inbox Lead Tag     | Manual tag in Unified Inbox                                        | Inbox messages               |

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

#

[Message truncated - exceeded 50,000 character limit]
Show less
Failed to authenticate. API Error: 401 {"type":"error","error":{"type":"authentication_error","message":"OAuth token has expired. Please obtain a new token or refresh your existing token."},"request_id":"req_011CZLFbxmHYVqhcuGEYMNh5"}

Check the project files and continue this project. requirement is this -

https://app.superdesign.dev/share/280a8852e1bdeb23f0089ed9fdf5c273acf2eb94ee95aaba0394757f04d6f79e

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

| Module                     | Priority          | Build Phase | Description                                                                                                              |
| -------------------------- | ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| AI Creative Engine         | P0 — Must Have    | Phase 1–2   | One-prompt generation of platform-ready creatives with captions, hashtags, and brand-aligned visuals from inventory data |
| Multi-Platform Publisher   | P0 — Must Have    | Phase 1–2   | One-click scheduling and posting to Facebook, Instagram, and Google My Business                                          |
| One-Click Boost            | P0 — Must Have    | Phase 2     | Simplified ad boosting without needing Meta Ads Manager                                                                  |
| Unified Inbox              | P1 — Should Have  | Phase 3     | Consolidated view of comments, DMs, and Google Reviews with AI-suggested responses                                       |
| Inventory Connector        | P1 — Should Have  | Phase 3     | Pull real car data to auto-generate creatives                                                                            |
| India Context Pack         | P1 — Should Have  | Phase 2–3   | Pre-built templates for festivals, regional language captions, GMB-optimized content                                     |
| Lead Attribution Dashboard | P2 — Nice to Have | Phase 4     | Track click-to-call, WhatsApp taps, form fills tied to posts/campaigns                                                   |

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

| Layer                     | Technology                                               | Rationale                                                                                      |
| ------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Frontend — Web**        | React 18+ with TypeScript                                | Component reusability, strong typing, large ecosystem                                          |
| **Frontend — Mobile**     | React Native                                             | Shared component logic with web; dealers primarily use mobile                                  |
| **Backend API**           | Node.js with Fastify                                     | Fast development cycle, excellent async I/O, strong ecosystem for Meta/Google API integrations |
| **AI Engine — Captions**  | OpenAI GPT-4o API                                        | Best-in-class caption quality for automotive context                                           |
| **AI Engine — Creatives** | Template-based rendering engine (Canvas/Sharp/Puppeteer) | Brand consistency and dealer trust — NOT raw text-to-image generation                          |
| **Database — Primary**    | PostgreSQL 16 (RDS)                                      | Relational data for dealers, inventory, posts, campaigns                                       |
| **Database — Cache**      | Redis 7 (ElastiCache)                                    | Session management, queue backing store, rate limiting, caching                                |
| **Queue / Jobs**          | BullMQ on Redis                                          | Scheduled posting, boost campaigns, inbox polling, template rendering                          |
| **Object Storage**        | AWS S3 (ap-south-1)                                      | Template assets, generated creatives, inventory images                                         |
| **CDN**                   | AWS CloudFront                                           | Low-latency delivery of creatives and static assets across India                               |
| **Cloud Region**          | AWS ap-south-1 (Mumbai)                                  | Low latency for Indian users, data localisation compliance                                     |
| **Monitoring**            | CloudWatch + Sentry                                      | Infrastructure monitoring + application error tracking                                         |
| **Search**                | OpenSearch (optional, Phase 3+)                          | Inbox message search, inventory search                                                         |

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

| Component          | Usage                                           | Notes                                                                     |
| ------------------ | ----------------------------------------------- | ------------------------------------------------------------------------- |
| `<Button>`         | Primary, Secondary, Ghost, Danger variants      | Must include loading state with spinner                                   |
| `<Input>`          | Text, Search, Prompt input                      | Supports RTL, character count, clear button                               |
| `<TextArea>`       | Caption editing, prompt input                   | Auto-resize, max character count per platform                             |
| `<Card>`           | Post preview, creative variant, inbox message   | Shadow elevation, hover state, swipe-to-action on mobile                  |
| `<Modal>`          | Confirmations, boost setup, platform selection  | Must trap focus for accessibility                                         |
| `<Calendar>`       | Content calendar, date picker, scheduler        | Week view as default, month view toggle                                   |
| `<Badge>`          | Status indicators, unread count, platform icons | Color-coded: green (live), yellow (scheduled), red (failed), grey (draft) |
| `<Avatar>`         | Dealer profile, customer avatar in inbox        | Initials fallback when no image                                           |
| `<DropdownMenu>`   | Platform selection, budget selection, actions   | Supports multi-select for platforms                                       |
| `<Toast>`          | Success/error notifications                     | Auto-dismiss after 5s, supports undo action                               |
| `<SkeletonLoader>` | Loading states for all data-dependent screens   | Match exact layout of loaded content                                      |
| `<EmptyState>`     | No posts, no messages, no inventory             | Illustration + single CTA button                                          |
| `<Tabs>`           | Inbox categories, dashboard sections            | Supports swipe navigation on mobile                                       |
| `<Tag>`            | Lead, Complaint, General, Spam labels           | Clickable for filtering                                                   |
| `<ImageCarousel>`  | Creative variant selection, inventory gallery   | Supports pinch-to-zoom on mobile                                          |
| `<ProgressBar>`    | Boost spend tracking, onboarding progress       | Animated fill                                                             |
| `<PlatformIcon>`   | Facebook, Instagram, GMB icons                  | Consistent sizing (24px, 32px, 48px)                                      |

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
  "platforms": [
    "facebook_post",
    "instagram_post",
    "instagram_story",
    "gmb_post"
  ],
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

| Category             | Minimum Count  | Examples                                                         |
| -------------------- | -------------- | ---------------------------------------------------------------- |
| New Arrivals         | 10             | Bold banner, minimal showcase, split-screen comparison           |
| Festival Offers      | 10             | Diwali gold theme, Navratri 9-color, Holi splash                 |
| Service Camp         | 5              | Service reminder, free check-up announcement, AC service special |
| Customer Testimonial | 5              | Photo + quote, star rating card, video thumbnail                 |
| Inventory Showcase   | 10             | Grid of 4 cars, single spotlight, price comparison               |
| Engagement Posts     | 5              | Poll, quiz, this-or-that, trivia                                 |
| Generic / Seasonal   | 5              | Republic Day, Independence Day, New Year                         |
| **Total**            | **50 minimum** |                                                                  |

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

| Metric            | Display Name    | Source     |
| ----------------- | --------------- | ---------- |
| `reach`           | People Reached  | Meta       |
| `impressions`     | Times Shown     | Meta       |
| `clicks`          | Link Clicks     | Meta       |
| `cpc`             | Cost per Click  | Calculated |
| `ctr`             | Click Rate      | Calculated |
| `spend`           | Amount Spent    | Meta       |
| `actions` (calls) | Calls Generated | Meta       |

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
    "custom_locations": [
      {
        "latitude": "{dealer_lat}",
        "longitude": "{dealer_lng}",
        "radius": 25,
        "distance_unit": "kilometer"
      }
    ]
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

| Source         | Message Types                          | Polling Method                                     | Polling Frequency                             |
| -------------- | -------------------------------------- | -------------------------------------------------- | --------------------------------------------- |
| Facebook       | Comments on posts, Page messages (DMs) | Meta Webhooks (preferred) or polling via Graph API | Real-time via webhooks, fallback: every 5 min |
| Instagram      | Comments on posts, Direct Messages     | Meta Webhooks (preferred) or polling via Graph API | Real-time via webhooks, fallback: every 5 min |
| Google Reviews | New reviews, review replies            | Google Business Profile API polling                | Every 15 min                                  |

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

| Tag             | Color | Auto-Tag Rule                                                                  |
| --------------- | ----- | ------------------------------------------------------------------------------ |
| Lead            | Green | Message contains: price, availability, test drive, booking, EMI, finance, loan |
| Complaint       | Red   | Negative sentiment detected                                                    |
| General Enquiry | Blue  | Default for questions that don't match Lead or Complaint                       |
| Spam            | Grey  | Detected spam patterns (links, promotional content)                            |

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

| Language  | Script     | Phase   | Caption Generation | Template Text |
| --------- | ---------- | ------- | ------------------ | ------------- |
| English   | Latin      | Phase 1 | GPT-4o             | Yes           |
| Hindi     | Devanagari | Phase 1 | GPT-4o             | Yes           |
| Tamil     | Tamil      | Phase 2 | GPT-4o             | Yes           |
| Telugu    | Telugu     | Phase 2 | GPT-4o             | Yes           |
| Kannada   | Kannada    | Phase 2 | GPT-4o             | Yes           |
| Malayalam | Malayalam  | Phase 2 | GPT-4o             | Yes           |
| Marathi   | Devanagari | Phase 2 | GPT-4o             | Yes           |

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

| Action             | Tracking Method                                                    | Source                       |
| ------------------ | ------------------------------------------------------------------ | ---------------------------- |
| Click-to-Call      | UTM-tagged phone number + Meta Ads call tracking                   | Published posts, boosted ads |
| WhatsApp Tap       | UTM-tagged WhatsApp link (`https://wa.me/{number}?text={utm_msg}`) | Published posts              |
| Form Submission    | Custom landing page form (if applicable)                           | Boost campaign destination   |
| Direction Requests | GMB Insights API                                                   | GMB posts                    |
| Website Click      | UTM-tagged URLs                                                    | All published posts          |
| Inbox Lead Tag     | Manual tag in Unified Inbox                                        | Inbox messages               |

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

#

[Message truncated - exceeded 50,000 character limit]
Globpattern: "\*_/_"
Found 101 files
Globpattern: "_"
Found 101 files
Bash List project files excluding node_modules and .git
IN
find /Users/santoshsharma/Documents/Code_Antigravity/SocialGenie -not -path "_/node*modules/*" -not -path "\_/.git/\*" | sort

OUT
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/.env
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/.gitignore
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/package.json
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/prisma
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/prisma.config.d.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/prisma.config.d.ts.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/prisma.config.js
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/prisma.config.js.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/prisma.config.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/prisma/schema.prisma
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/index.d.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/index.d.ts.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/index.js
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/index.js.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/index.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/auth.d.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/auth.d.ts.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/auth.js
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/auth.js.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/auth.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/creative.d.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/creative.d.ts.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/creative.js
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/creative.js.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/creative.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/dealer.d.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/dealer.d.ts.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/dealer.js
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/dealer.js.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/dealer.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/platform.d.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/platform.d.ts.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/platform.js
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/platform.js.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/platform.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/publisher.d.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/publisher.d.ts.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/publisher.js
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/publisher.js.map
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/routes/publisher.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/tsconfig.json
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/.gitignore
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/README.md
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/dist
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/dist/assets
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/dist/assets/index-Cn0yyF0O.js
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/dist/assets/index-GvvK_hsI.css
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/dist/favicon.svg
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/dist/icons.svg
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/dist/index.html
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/eslint.config.js
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/index.html
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/node_modules
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/package.json
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/public
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/public/favicon.svg
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/public/icons.svg
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/App.css
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/App.tsx
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/assets
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/assets/hero.png
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/assets/react.svg
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/assets/vite.svg
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/components
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/components/ui
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/components/ui/Button.tsx
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/components/ui/Card.tsx
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/components/ui/Input.tsx
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/index.css
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/main.tsx
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/pages
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/pages/CreatePost.tsx
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/src/pages/Onboarding.tsx
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/tsconfig.app.json
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/tsconfig.json
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/tsconfig.node.json
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/vite.config.ts
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/docker-compose.yml
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/node_modules
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/package-lock.json
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/package.json
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/packages
/Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/packages/shared
Let me read the key existing files to understand what's been built.

Read package.json
Read App.tsx
Read index.ts
Read schema.prisma
Read CreatePost.tsx
Read Onboarding.tsx
Read creative.ts
Read publisher.ts
Read package.json
Read auth.ts
Read dealer.ts
Read Button.tsx
Read index.css
Read platform.ts
Read Card.tsx
Now I have a complete picture of the project. Let me plan and execute the build continuation.

Update Todos

Enhance App.tsx — add all nav items (Inventory, Boost, Analytics), active link styling, complete routing

Enhance CreatePost.tsx — prompt chips, 3 creative variants carousel, platform toggles, publish/schedule flow

Build Calendar.tsx — week/month view, post cards with status badges

Build Inbox.tsx — unified inbox, message list, AI reply suggestions, tagging

Build Inventory.tsx — vehicle table, CSV upload UI, quick actions

Build Boost.tsx — campaign cards, boost setup modal (budget/duration/audience)

Build Settings.tsx — platform connections, dealer profile, language prefs

Build Analytics.tsx — lead dashboard, top posts, charts

Add backend API routes — inbox, inventory, boost (expanded mocks)

Add additional UI components — Badge, Toast, Tabs, EmptyState
Update Todos

Enhance App.tsx — add all nav items (Inventory, Boost, Analytics), active link styling, complete routing

Enhance CreatePost.tsx — prompt chips, 3 creative variants carousel, platform toggles, publish/schedule flow

Build Calendar.tsx — week/month view, post cards with status badges

Build Inbox.tsx — unified inbox, message list, AI reply suggestions, tagging

Build Inventory.tsx — vehicle table, CSV upload UI, quick actions

Build Boost.tsx — campaign cards, boost setup modal (budget/duration/audience)

Build Settings.tsx — platform connections, dealer profile, language prefs

Build Analytics.tsx — lead dashboard, top posts, charts

Add backend API routes — inbox, inventory, boost (expanded mocks)

Add additional UI components — Badge, Toast, Tabs, EmptyState
Now I'll build everything systematically. Starting with App.tsx enhancement, then all missing pages.

Write App.tsx
275 lines
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Calendar, Inbox, Car, BarChart2, Zap, Settings, PlusSquare, Menu, X } from 'lucide-react';
import { useState } from 'react';

import Onboarding from './pages/Onboarding';
import CreatePost from './pages/CreatePost';
import CalendarPage from './pages/Calendar';
import InboxPage from './pages/InboxPage';
import InventoryPage from './pages/Inventory';
import BoostPage from './pages/Boost';
import AnalyticsPage from './pages/Analytics';
import SettingsPage from './pages/SettingsPage';

const navItems = [
{ to: '/', icon: Home, label: 'Dashboard', exact: true },
{ to: '/create', icon: PlusSquare, label: 'Create Post' },
{ to: '/calendar', icon: Calendar, label: 'Calendar' },
{ to: '/inbox', icon: Inbox, label: 'Inbox', badge: 3 },
{ to: '/inventory', icon: Car, label: 'Inventory' },
{ to: '/analytics', icon: BarChart2, label: 'Analytics' },
{ to: '/boost', icon: Zap, label: 'Boost' },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
return (

<div className="flex flex-col h-full">
<div className="flex items-center justify-between px-4 pt-5 pb-6">
<div>
<h1 className="text-base font-bold text-[#1A1A2E]">Cardeko Social AI</h1>
<p className="text-xs text-gray-400 mt-0.5">Dealer Growth Engine</p>
</div>
{onClose && (
<button onClick={onClose} className="md:hidden p-1 rounded hover:bg-gray-100">
<X className="w-5 h-5 text-gray-500" />
</button>
)}
</div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label, badge, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
            {badge && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t mt-4 pt-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          Settings
        </NavLink>
        <div className="mt-3 px-3 py-2 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-800">Demo Dealer</p>
          <p className="text-xs text-gray-500">Growth Plan</p>
        </div>
      </div>
    </div>

);
}

function Dashboard() {
return (

<div className="max-w-5xl mx-auto space-y-6">
<div className="flex items-center justify-between">
<div>
<h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
<p className="text-sm text-gray-500 mt-1">Here's your dealership activity overview</p>
</div>
<NavLink
          to="/create"
          className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
<PlusSquare className="w-4 h-4" /> Create Post
</NavLink>
</div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Posts This Month', value: '18', sub: '+6 vs last month', color: 'text-gray-900' },
          { label: 'Total Reach', value: '24,821', sub: 'across all platforms', color: 'text-gray-900' },
          { label: 'Leads Generated', value: '47', sub: '+12 this week', color: 'text-green-600' },
          { label: 'Inbox Pending', value: '3', sub: '1 negative review', color: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Recent Posts</h3>
          <div className="space-y-2">
            {[
              { title: 'Weekend Brezza Offer', platform: 'FB + IG', status: 'published', time: '2h ago' },
              { title: 'Diwali Special Deals', platform: 'GMB', status: 'scheduled', time: 'Tomorrow 9am' },
              { title: 'Service Camp Reminder', platform: 'FB', status: 'draft', time: 'Not scheduled' },
            ].map((p) => (
              <div key={p.title} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.title}</p>
                  <p className="text-xs text-gray-400">{p.platform} · {p.time}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  p.status === 'published' ? 'bg-green-50 text-green-700' :
                  p.status === 'scheduled' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-gray-100 text-gray-500'
                }`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Upcoming Festivals</h3>
          <div className="space-y-2">
            {[
              { name: 'Diwali', date: 'Oct 20', type: 'festival', days: 28 },
              { name: 'Navratri Begins', date: 'Oct 3', type: 'festival', days: 11 },
              { name: 'Gandhi Jayanti', date: 'Oct 2', type: 'holiday', days: 10 },
            ].map((f) => (
              <div key={f.name} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{f.name}</p>
                  <p className="text-xs text-gray-400">{f.date} · {f.days} days away</p>
                </div>
                <span className="text-xs bg-orange-50 text-orange-600 font-medium px-2 py-0.5 rounded-full">
                  {f.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Active Boosts</h3>
          <div className="space-y-3">
            {[
              { title: 'Brezza Weekend Offer', spent: '₹1,200', budget: '₹3,500', reach: '4,821', days: 2 },
              { title: 'SUV Exchange Bonus', spent: '₹800', budget: '₹2,000', reach: '2,100', days: 1 },
            ].map((b) => (
              <div key={b.title} className="border-b last:border-0 pb-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-800">{b.title}</p>
                  <span className="text-xs text-blue-600 font-medium">{b.days}d left</span>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400">Spent: {b.spent} / {b.budget}</p>
                  <p className="text-xs text-gray-500">Reach: {b.reach}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 mt-1.5">
                  <div
                    className="bg-blue-500 h-1 rounded-full"
                    style={{ width: `${(parseInt(b.spent.replace(/\D/g,'')) / parseInt(b.budget.replace(/\D/g,''))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

);
}

function DashboardLayout({ children }: { children: React.ReactNode }) {
const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

return (

<div className="min-h-screen flex bg-[#FAFAFA]">
{/_ Desktop Sidebar _/}
<aside className="w-60 border-r bg-white hidden md:block flex-shrink-0">
<Sidebar />
</aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <Sidebar onClose={() => setMobileSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-1 rounded hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-bold text-[#1A1A2E] text-sm">Cardeko Social AI</span>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex z-40">
          {[
            { to: '/', icon: Home, label: 'Home', exact: true },
            { to: '/create', icon: PlusSquare, label: 'Create' },
            { to: '/calendar', icon: Calendar, label: 'Plan' },
            { to: '/inbox', icon: Inbox, label: 'Inbox' },
            { to: '/boost', icon: Zap, label: 'Boost' },
          ].map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>

);
}

export default function App() {
return (
<Router>
<Routes>
<Route path="/onboarding" element={<Onboarding />} />
<Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
<Route path="/create" element={<DashboardLayout><CreatePost /></DashboardLayout>} />
<Route path="/calendar" element={<DashboardLayout><CalendarPage /></DashboardLayout>} />
<Route path="/inbox" element={<DashboardLayout><InboxPage /></DashboardLayout>} />
<Route path="/inventory" element={<DashboardLayout><InventoryPage /></DashboardLayout>} />
<Route path="/analytics" element={<DashboardLayout><AnalyticsPage /></DashboardLayout>} />
<Route path="/boost" element={<DashboardLayout><BoostPage /></DashboardLayout>} />
<Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
</Routes>
</Router>
);
}
Expected — those pages don't exist yet. Let me create them all now.

Update Todos

Enhance App.tsx — add all nav items (Inventory, Boost, Analytics), active link styling, complete routing

Enhance CreatePost.tsx — prompt chips, 3 creative variants carousel, platform toggles, publish/schedule flow

Build Calendar.tsx — week/month view, post cards with status badges

Build Inbox.tsx — unified inbox, message list, AI reply suggestions, tagging

Build Inventory.tsx — vehicle table, CSV upload UI, quick actions

Build Boost.tsx — campaign cards, boost setup modal (budget/duration/audience)

Build Settings.tsx — platform connections, dealer profile, language prefs

Build Analytics.tsx — lead dashboard, top posts, charts

Add backend API routes — inbox, inventory, boost (expanded mocks)

Add additional UI components — Badge, Toast, Tabs, EmptyState
Write CreatePost.tsx
417 lines
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Facebook, Instagram, MapPin, Zap, Download, RefreshCw, Edit3, Check } from 'lucide-react';

const PROMPT_CHIPS = [
{ category: 'New Arrival', icon: '🚗', prompts: [
'New Maruti Brezza 2024 just arrived at our showroom. Limited stock!',
'Introducing the all-new Hyundai Creta N Line — now available for booking',
'New Tata Nexon EV Max now in stock. Book a test drive today!',
'Fresh arrival: Kia Sonet HTX+ in Pearl White. First come first served!',
]},
{ category: 'Festival Offer', icon: '🎉', prompts: [
'Diwali special offer — ₹50,000 cash discount on all models this festive season',
'Navratri celebration deal — zero down payment and free accessories worth ₹20,000',
'Puja offer: Exchange your old car and get ₹30,000 extra exchange bonus',
'Festive season is here! Flat 5% off on service packages and accessories',
]},
{ category: 'Service Camp', icon: '🔧', prompts: [
'Free car health check-up camp this weekend at our service centre',
'AC service special — 20% off on AC gas refill and service this summer',
'Annual service reminder — book now and get free multi-point inspection',
'Extended service camp: Bring your car in, leave worry-free. Free pickup!',
]},
{ category: 'Testimonial', icon: '⭐', prompts: [
'Our customer Ramesh ji just drove home his new Fortuner. Congratulations!',
'Happy delivery of Baleno to the Singh family. Thank you for trusting us!',
'5-star Google review from our valued customer Mrs. Patel. We are grateful!',
'Another happy family drives home in their dream car from our showroom.',
]},
{ category: 'Showcase', icon: '📸', prompts: [
'Showcase of our top pre-owned cars this week — all under ₹8 lakhs!',
'Our certified used car lot: Verified, Serviced, and Ready to drive home',
'Inside look at our new car gallery — over 50 models on display this weekend',
'Meet our full SUV lineup: Creta, Seltos, Nexon, Brezza — all in one place',
]},
{ category: 'Engagement', icon: '💬', prompts: [
'Which colour do you prefer for your next car? Comment below!',
'Petrol vs Diesel vs EV — what would you choose in 2024? Tell us!',
'Quiz: What is the mileage of the new Maruti Swift? Win a free service voucher!',
'This or that: Maruti Baleno vs Hyundai i20. Which would you pick?',
]},
];

const MOCK_VARIANTS = [
{
id: 1,
template: 'Bold Banner',
bg: 'from-blue-900 to-blue-700',
caption: "Don't miss this! Drive home your dream car today with our exclusive weekend offer. Limited time deal — zero down payment + free insurance for the first year. Visit us now! \n\n#DreamCar #WeekendOffer #Cardeko #HyundaiCreta #CarDeals #AutoLoan #BookNow",
hashtags: ['#DreamCar', '#WeekendOffer', '#HyundaiCreta', '#CarDeals'],
charCount: { fb: 312, ig: 312, gmb: 210 },
},
{
id: 2,
template: 'Minimal Showcase',
bg: 'from-gray-900 to-gray-700',
caption: "The Hyundai Creta 2024 is here — and it's everything you wanted. Spacious, stylish, and loaded with features. Starting at just ₹10.99 Lakhs. Come in for a test drive this weekend and feel the difference.\n\nCall us: +91 98765 43210 | WhatsApp: +91 98765 43210\n\n#HyundaiCreta #NewCar #TestDrive #CarShowroom",
hashtags: ['#HyundaiCreta', '#NewCar', '#TestDrive', '#CarShowroom'],
charCount: { fb: 405, ig: 405, gmb: 310 },
},
{
id: 3,
template: 'Offer Card',
bg: 'from-orange-600 to-red-600',
caption: "Your dream. Our offer. \u2728\n\nThis weekend, we're making car ownership easier than ever. Exchange bonus up to ₹50,000. EMI starting ₹8,999/month. Walk in today — let's make it happen.\n\nBook your free test drive: +91 98765 43210\n\n#CarOffer #Exchange #EMI #WeekendDeal #Brezza",
hashtags: ['#CarOffer', '#Exchange', '#EMI', '#WeekendDeal'],
charCount: { fb: 350, ig: 350, gmb: 250 },
},
];

const PLATFORMS = [
{ id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-[#1877F2]', bg: 'bg-blue-50 border-blue-200' },
{ id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-50 border-pink-200' },
{ id: 'gmb', label: 'Google', icon: MapPin, color: 'text-[#4285F4]', bg: 'bg-blue-50 border-blue-100' },
];

export default function CreatePost() {
const [prompt, setPrompt] = useState('');
const [activeCategory, setActiveCategory] = useState('New Arrival');
const [isGenerating, setIsGenerating] = useState(false);
const [variants, setVariants] = useState<typeof MOCK_VARIANTS | null>(null);
const [selectedVariant, setSelectedVariant] = useState(0);
const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook', 'instagram']);
const [activePlatformPreview, setActivePlatformPreview] = useState<'facebook' | 'instagram' | 'gmb'>('facebook');
const [editingCaption, setEditingCaption] = useState(false);
const [caption, setCaption] = useState('');
const [showScheduleModal, setShowScheduleModal] = useState(false);
const [scheduleTime, setScheduleTime] = useState('');
const [published, setPublished] = useState(false);

const handleChipClick = (p: string) => setPrompt(p);

const handleGenerate = () => {
if (!prompt.trim()) return;
setIsGenerating(true);
setVariants(null);
setPublished(false);
setTimeout(() => {
setIsGenerating(false);
setVariants(MOCK_VARIANTS);
setSelectedVariant(0);
setCaption(MOCK_VARIANTS[0].caption);
}, 1800);
};

const handleVariantSelect = (idx: number) => {
setSelectedVariant(idx);
setCaption(MOCK_VARIANTS[idx].caption);
setEditingCaption(false);
};

const togglePlatform = (id: string) => {
setSelectedPlatforms((prev) =>
prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
);
};

const handlePublishNow = () => {
setPublished(true);
};

const activeChips = PROMPT_CHIPS.find((c) => c.category === activeCategory)?.prompts ?? [];
const currentVariant = variants ? variants[selectedVariant] : null;
const platformChar = currentVariant?.charCount[activePlatformPreview] ?? 0;

const platformCharLimit: Record<string, number> = { facebook: 63206, instagram: 2200, gmb: 1500 };
const charLimit = platformCharLimit[activePlatformPreview];

return (

<div className="max-w-6xl mx-auto space-y-6">
<div className="flex items-center justify-between">
<h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
<Button variant="secondary" className="text-sm">Saved Drafts</Button>
</div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Prompt & Config */}
        <div className="lg:col-span-2 space-y-4">
          {/* Prompt input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">What do you want to post?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className="w-full h-28 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                placeholder="E.g. Weekend offer on Maruti Brezza with ₹30,000 exchange bonus..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{prompt.length}/500</span>
                <Button
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  disabled={!prompt.trim()}
                  className="text-sm px-5"
                >
                  Generate ✨
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Prompt chips */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">Quick prompts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Category tabs */}
              <div className="flex gap-1.5 flex-wrap">
                {PROMPT_CHIPS.map((c) => (
                  <button
                    key={c.category}
                    onClick={() => setActiveCategory(c.category)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      activeCategory === c.category
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {c.icon} {c.category}
                  </button>
                ))}
              </div>
              {/* Chip prompts */}
              <div className="space-y-1.5">
                {activeChips.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleChipClick(p)}
                    className="w-full text-left text-xs p-2.5 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-colors line-clamp-2"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform selection */}
          {variants && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Post to platforms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {PLATFORMS.map(({ id, label, icon: Icon, color, bg }) => (
                  <button
                    key={id}
                    onClick={() => togglePlatform(id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedPlatforms.includes(id) ? bg : 'bg-white border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    {selectedPlatforms.includes(id) && <Check className="w-4 h-4 text-green-500" />}
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Variants + Caption */}
        <div className="lg:col-span-3 space-y-4">
          {published ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Post Published!</h3>
              <p className="text-gray-500 text-sm mt-2">Your post has been queued to {selectedPlatforms.join(', ')}</p>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" onClick={() => { setVariants(null); setPrompt(''); setPublished(false); }}>Create Another</Button>
                <Button onClick={() => window.location.href = '/calendar'}>View Calendar</Button>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Generating your creatives...</p>
              <p className="text-gray-400 text-sm mt-1">AI is crafting 3 variants for you</p>
            </div>
          ) : variants ? (
            <>
              {/* Variant carousel */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Select a Creative</h3>
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {variants.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => handleVariantSelect(i)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                        selectedVariant === i ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      {/* Creative preview */}
                      <div className={`aspect-square bg-gradient-to-br ${v.bg} flex flex-col items-center justify-center p-3`}>
                        <div className="w-12 h-8 bg-white/20 rounded mb-2" />
                        <div className="w-16 h-2 bg-white/60 rounded mb-1" />
                        <div className="w-10 h-2 bg-white/40 rounded" />
                        <div className="absolute bottom-2 left-2 w-6 h-2 bg-white/30 rounded" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-white text-[10px] font-medium">{v.template}</p>
                      </div>
                      {selectedVariant === i && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform preview toggle */}
              {currentVariant && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-gray-600">Caption</CardTitle>
                      <div className="flex gap-1">
                        {(['facebook', 'instagram', 'gmb'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setActivePlatformPreview(p)}
                            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                              activePlatformPreview === p
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-500 border-gray-200'
                            }`}
                          >
                            {p === 'facebook' ? 'FB' : p === 'instagram' ? 'IG' : 'GMB'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {editingCaption ? (
                      <textarea
                        className="w-full h-32 p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        maxLength={charLimit}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line line-clamp-4">{caption}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${platformChar > charLimit * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {platformChar}/{charLimit} chars
                      </span>
                      <button
                        onClick={() => setEditingCaption((v) => !v)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Edit3 className="w-3 h-3" /> {editingCaption ? 'Done' : 'Edit'}
                      </button>
                    </div>

                    {/* Hashtags */}
                    <div className="flex gap-1.5 flex-wrap">
                      {currentVariant.hashtags.map((h) => (
                        <span key={h} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{h}</span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 text-sm"
                        onClick={handlePublishNow}
                        disabled={selectedPlatforms.length === 0}
                      >
                        Publish Now
                      </Button>
                      <Button
                        className="flex-1 text-sm"
                        variant="secondary"
                        onClick={() => setShowScheduleModal(true)}
                        disabled={selectedPlatforms.length === 0}
                      >
                        Schedule
                      </Button>
                      <Button variant="ghost" className="px-3" title="Download">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" className="px-3" title="Boost">
                        <Zap className="w-4 h-4 text-yellow-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl border-gray-200 text-gray-400 py-20 gap-3">
              <div className="text-4xl">✨</div>
              <p className="font-medium text-gray-500">Enter a prompt to generate AI creatives</p>
              <p className="text-sm text-gray-400">Or pick a quick prompt from the library</p>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Schedule Post</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              <strong>Best time suggestion:</strong> Tomorrow, 9:00 AM — based on your audience engagement patterns
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
              <Button
                className="flex-1"
                onClick={() => { setShowScheduleModal(false); setPublished(true); }}
                disabled={!scheduleTime}
              >
                Confirm Schedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>

);
}
Facebook and Instagram aren't in lucide-react v1. Let me fix those icons and the type error.

Edit CreatePost.tsx
Modified
Edit CreatePost.tsx
Added 8 lines
Now update the PLATFORMS array to use those new icon components, and fix the charCount key mismatch:

Edit CreatePost.tsx
Modified
Edit CreatePost.tsx
Modified
Now fix the charCount key mismatch — mock data uses fb/ig/gmb but preview uses facebook/instagram/gmb:

Edit CreatePost.tsx
Modified
Edit CreatePost.tsx
Modified
Edit CreatePost.tsx
Modified
Update Todos

Enhance App.tsx — add all nav items (Inventory, Boost, Analytics), active link styling, complete routing

Enhance CreatePost.tsx — prompt chips, 3 creative variants carousel, platform toggles, publish/schedule flow

Build Calendar.tsx — week/month view, post cards with status badges

Build Inbox.tsx — unified inbox, message list, AI reply suggestions, tagging

Build Inventory.tsx — vehicle table, CSV upload UI, quick actions

Build Boost.tsx — campaign cards, boost setup modal (budget/duration/audience)

Build Settings.tsx — platform connections, dealer profile, language prefs

Build Analytics.tsx — lead dashboard, top posts, charts

Add backend API routes — inbox, inventory, boost (expanded mocks)
Now build all the missing pages in parallel:

Write Calendar.tsx
278 lines
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/Button';

type PostStatus = 'published' | 'scheduled' | 'draft' | 'failed';

interface CalendarPost {
id: string;
title: string;
platforms: string[];
time: string;
status: PostStatus;
thumbnail: string;
}

const STATUS_STYLES: Record<PostStatus, string> = {
published: 'bg-green-100 text-green-700',
scheduled: 'bg-yellow-100 text-yellow-700',
draft: 'bg-gray-100 text-gray-500',
failed: 'bg-red-100 text-red-600',
};

const MOCK_POSTS: Record<number, CalendarPost[]> = {
0: [
{ id: '1', title: 'Brezza Weekend Offer', platforms: ['FB', 'IG'], time: '9:00 AM', status: 'published', thumbnail: 'from-blue-800 to-blue-600' },
],
1: [
{ id: '2', title: 'Service Camp Reminder', platforms: ['GMB'], time: '10:30 AM', status: 'published', thumbnail: 'from-gray-700 to-gray-500' },
{ id: '3', title: 'New Nexon EV Arrival', platforms: ['FB', 'IG', 'GMB'], time: '6:00 PM', status: 'published', thumbnail: 'from-teal-700 to-teal-500' },
],
2: [],
3: [
{ id: '4', title: 'Customer Testimonial', platforms: ['IG'], time: '11:00 AM', status: 'scheduled', thumbnail: 'from-purple-700 to-purple-500' },
],
4: [
{ id: '5', title: 'Navratri Special Deals', platforms: ['FB', 'IG', 'GMB'], time: '8:00 AM', status: 'scheduled', thumbnail: 'from-orange-600 to-red-500' },
{ id: '6', title: 'Inventory Showcase', platforms: ['FB'], time: '5:00 PM', status: 'draft', thumbnail: 'from-indigo-700 to-indigo-500' },
],
5: [
{ id: '7', title: 'Weekend Engagement Post', platforms: ['FB', 'IG'], time: '10:00 AM', status: 'scheduled', thumbnail: 'from-pink-600 to-rose-500' },
],
6: [
{ id: '8', title: 'Sunday Showroom Tour', platforms: ['IG'], time: '12:00 PM', status: 'draft', thumbnail: 'from-amber-600 to-yellow-500' },
],
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function PlatformBadge({ label }: { label: string }) {
const colors: Record<string, string> = {
FB: 'bg-blue-100 text-blue-700',
IG: 'bg-pink-100 text-pink-700',
GMB: 'bg-green-100 text-green-700',
};
return (
<span className={`text-[9px] font-bold px-1 py-0.5 rounded ${colors[label] ?? 'bg-gray-100 text-gray-600'}`}>
{label}
</span>
);
}

function PostCard({ post }: { post: CalendarPost }) {
return (

<div className="group rounded-lg border bg-white overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
<div className={`h-12 bg-gradient-to-br ${post.thumbnail} flex items-center justify-center`}>
<div className="w-8 h-3 bg-white/30 rounded" />
</div>
<div className="p-2 space-y-1">
<p className="text-[11px] font-semibold text-gray-800 leading-tight line-clamp-1">{post.title}</p>
<div className="flex items-center gap-1 flex-wrap">
{post.platforms.map((p) => <PlatformBadge key={p} label={p} />)}
</div>
<div className="flex items-center justify-between">
<span className="text-[10px] text-gray-400">{post.time}</span>
<span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_STYLES[post.status]}`}>
{post.status}
</span>
</div>
</div>
</div>
);
}

export default function CalendarPage() {
const today = new Date();
const [weekOffset, setWeekOffset] = useState(0);
const [view, setView] = useState<'week' | 'month'>('week');
const [selectedDay, setSelectedDay] = useState<number | null>(null);

const weekStart = new Date(today);
weekStart.setDate(today.getDate() - today.getDay() + 1 + weekOffset \* 7);

const weekDates = Array.from({ length: 7 }, (\_, i) => {
const d = new Date(weekStart);
d.setDate(weekStart.getDate() + i);
return d;
});

const isToday = (d: Date) =>
d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

const totalScheduled = Object.values(MOCK_POSTS).flat().filter((p) => p.status === 'scheduled').length;
const totalPublished = Object.values(MOCK_POSTS).flat().filter((p) => p.status === 'published').length;

return (

<div className="max-w-6xl mx-auto space-y-5">
{/_ Header _/}
<div className="flex items-center justify-between flex-wrap gap-3">
<div>
<h2 className="text-2xl font-bold text-gray-900">Content Calendar</h2>
<p className="text-sm text-gray-500 mt-0.5">
{totalPublished} published · {totalScheduled} scheduled this week
</p>
</div>
<div className="flex items-center gap-2">
<div className="flex rounded-lg border overflow-hidden text-sm">
<button
onClick={() => setView('week')}
className={`px-3 py-1.5 font-medium transition-colors ${view === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`} >
Week
</button>
<button
onClick={() => setView('month')}
className={`px-3 py-1.5 font-medium transition-colors ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`} >
Month
</button>
</div>
<Button className="text-sm flex items-center gap-1.5">
<Plus className="w-4 h-4" /> Add Post
</Button>
</div>
</div>

      {view === 'week' ? (
        <>
          {/* Week navigation */}
          <div className="flex items-center gap-3">
            <button onClick={() => setWeekOffset((o) => o - 1)} className="p-1.5 rounded-lg border hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {weekDates[0].getDate()} {MONTHS[weekDates[0].getMonth()]} — {weekDates[6].getDate()} {MONTHS[weekDates[6].getMonth()]} {weekDates[6].getFullYear()}
            </span>
            <button onClick={() => setWeekOffset((o) => o + 1)} className="p-1.5 rounded-lg border hover:bg-gray-50">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Today
              </button>
            )}
          </div>

          {/* Week grid */}
          <div className="grid grid-cols-7 gap-2 overflow-x-auto">
            {weekDates.map((date, i) => {
              const posts = MOCK_POSTS[i] ?? [];
              const todayCol = isToday(date);
              return (
                <div key={i} className={`min-h-[280px] rounded-xl border ${todayCol ? 'border-blue-300 bg-blue-50/50' : 'bg-white border-gray-100'}`}>
                  {/* Day header */}
                  <div className={`px-2 py-2 text-center border-b ${todayCol ? 'border-blue-200' : 'border-gray-100'}`}>
                    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{DAYS[i]}</p>
                    <p className={`text-lg font-bold mt-0.5 ${todayCol ? 'text-blue-600' : 'text-gray-800'}`}>
                      {date.getDate()}
                    </p>
                  </div>

                  {/* Posts */}
                  <div className="p-1.5 space-y-1.5">
                    {posts.map((post) => <PostCard key={post.id} post={post} />)}
                    <button className="w-full flex items-center justify-center gap-1 py-2 rounded-lg border border-dashed border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors text-xs">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bulk schedule bar */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">AI Weekly Suggestions Ready</p>
              <p className="text-sm text-gray-500 mt-0.5">7 posts suggested for next week based on your inventory and upcoming festivals</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="text-sm">Review</Button>
              <Button className="text-sm">Schedule All</Button>
            </div>
          </div>
        </>
      ) : (
        /* Month view */
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b flex items-center gap-3">
            <button onClick={() => setWeekOffset((o) => o - 4)} className="p-1.5 rounded-lg border hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="font-semibold text-gray-800">{MONTHS[today.getMonth()]} {today.getFullYear()}</span>
            <button onClick={() => setWeekOffset((o) => o + 4)} className="p-1.5 rounded-lg border hover:bg-gray-50">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 py-2 border-r last:border-r-0">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }, (_, i) => {
              const dayNum = i - 2;
              const inMonth = dayNum >= 0 && dayNum < 31;
              const posts = inMonth ? (MOCK_POSTS[dayNum % 7] ?? []) : [];
              const todayCell = dayNum === today.getDate() - 1;
              return (
                <div
                  key={i}
                  onClick={() => inMonth && setSelectedDay(dayNum)}
                  className={`min-h-[80px] p-1.5 border-r border-b last-of-type:border-r-0 cursor-pointer transition-colors ${
                    !inMonth ? 'bg-gray-50' : todayCell ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {inMonth && (
                    <>
                      <p className={`text-xs font-semibold mb-1 ${todayCell ? 'text-blue-600' : 'text-gray-700'}`}>
                        {dayNum + 1}
                      </p>
                      <div className="flex flex-wrap gap-0.5">
                        {posts.slice(0, 2).map((p) => (
                          <span key={p.id} className={`w-2 h-2 rounded-full ${
                            p.status === 'published' ? 'bg-green-500' :
                            p.status === 'scheduled' ? 'bg-yellow-400' :
                            p.status === 'failed' ? 'bg-red-500' : 'bg-gray-300'
                          }`} />
                        ))}
                        {posts.length > 2 && <span className="text-[9px] text-gray-400">+{posts.length - 2}</span>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Day detail sheet for month view */}
      {selectedDay !== null && view === 'month' && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4" onClick={() => setSelectedDay(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Day {selectedDay + 1} Posts</h3>
              <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            {(MOCK_POSTS[selectedDay % 7] ?? []).length > 0 ? (
              (MOCK_POSTS[selectedDay % 7] ?? []).map((p) => <PostCard key={p.id} post={p} />)
            ) : (
              <div className="text-center py-6 text-gray-400">
                <MoreHorizontal className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No posts for this day</p>
              </div>
            )}
            <Button className="w-full text-sm flex items-center gap-1.5 justify-center">
              <Plus className="w-4 h-4" /> Add Post
            </Button>
          </div>
        </div>
      )}
    </div>

);
}
Write InboxPage.tsx
348 lines
import { useState } from 'react';
import { Search, Send, Edit3, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';

type Tag = 'lead' | 'complaint' | 'general' | 'spam';
type Platform = 'facebook' | 'instagram' | 'google';
type Sentiment = 'positive' | 'neutral' | 'negative';

interface Message {
id: string;
platform: Platform;
type: 'comment' | 'dm' | 'review';
customerName: string;
customerInitials: string;
text: string;
timestamp: string;
sentiment: Sentiment;
tag: Tag;
isRead: boolean;
postContext?: string;
suggestedReply: string;
rating?: number;
}

const MOCK_MESSAGES: Message[] = [
{
id: '1', platform: 'facebook', type: 'dm', customerName: 'Ramesh Kumar', customerInitials: 'RK',
text: 'Hello, what is the on-road price of Hyundai Creta in Delhi? I am looking to buy next month.',
timestamp: '10 min ago', sentiment: 'positive', tag: 'lead', isRead: false,
suggestedReply: 'Hello Ramesh ji! Thank you for your interest in the Hyundai Creta. The on-road price in Delhi starts from ₹13.5 Lakhs (ex-showroom ₹10.99L + insurance + registration). I would love to share the exact breakdown for your preferred variant. Could you visit our showroom this weekend for a test drive? Call us: +91 98765 43210.',
},
{
id: '2', platform: 'google', type: 'review', customerName: 'Priya Sharma', customerInitials: 'PS',
text: 'Pathetic service! My car has been in service for 15 days and no one is giving proper updates. Very disappointed with Cardeko.',
timestamp: '1 hour ago', sentiment: 'negative', tag: 'complaint', isRead: false, rating: 1,
suggestedReply: 'Dear Priya ji, we sincerely apologise for your experience. This is not the standard of service we hold ourselves to. Our service manager will personally call you within the next 30 minutes to provide a full update and resolution. We value your trust in us and will make this right.',
},
{
id: '3', platform: 'instagram', type: 'comment', customerName: 'Aakash Patel', customerInitials: 'AP',
text: 'Wow beautiful car! Is the red color available in the top variant? What is the EMI for 5 years?',
timestamp: '3 hours ago', sentiment: 'positive', tag: 'lead', isRead: true,
postContext: 'Maruti Brezza Weekend Offer post',
suggestedReply: 'Hi Aakash! Yes, the Brezza is absolutely stunning in red! The top variant (Alpha) is available. For a 5-year EMI at 9.5% interest, you would pay approximately ₹16,500/month with zero down payment. DM us or call +91 98765 43210 to book a test drive this weekend!',
},
{
id: '4', platform: 'facebook', type: 'comment', customerName: 'Sunita Verma', customerInitials: 'SV',
text: 'Great showroom! Very helpful staff. Bought my Nexon EV last month and loving every drive.',
timestamp: '5 hours ago', sentiment: 'positive', tag: 'general', isRead: true,
postContext: 'Customer Testimonial post',
suggestedReply: 'Thank you so much Sunita ji! We are thrilled to hear you are loving your Nexon EV! Your trust means the world to us. We hope every drive brings you joy. Do not hesitate to reach out for any service needs. Happy driving!',
},
{
id: '5', platform: 'google', type: 'review', customerName: 'Mohammed Iqbal', customerInitials: 'MI',
text: 'Average experience. Sales team was helpful but delivery took longer than promised. Car is good though.',
timestamp: '1 day ago', sentiment: 'neutral', tag: 'general', isRead: true, rating: 3,
suggestedReply: 'Thank you for your honest feedback, Mohammed ji. We apologise for the delay in delivery — we understand how frustrating that can be. We are working to improve our delivery timelines. We are glad you are enjoying the car. Please do not hesitate to call us for any after-sales support.',
},
{
id: '6', platform: 'instagram', type: 'comment', customerName: 'Win iPhone 15 FREE!!!', customerInitials: 'SP',
text: 'CLICK HERE to WIN FREE iPhone 15! Limited offer! t.me/scam_link visit now!!!',
timestamp: '2 days ago', sentiment: 'neutral', tag: 'spam', isRead: true,
suggestedReply: '',
},
];

const PLATFORM_STYLES: Record<Platform, { label: string; color: string; bg: string }> = {
facebook: { label: 'Facebook', color: 'text-blue-700', bg: 'bg-blue-100' },
instagram: { label: 'Instagram', color: 'text-pink-700', bg: 'bg-pink-100' },
google: { label: 'Google', color: 'text-green-700', bg: 'bg-green-100' },
};

const TAG_STYLES: Record<Tag, string> = {
lead: 'bg-green-100 text-green-700',
complaint: 'bg-red-100 text-red-700',
general: 'bg-blue-100 text-blue-700',
spam: 'bg-gray-100 text-gray-500',
};

function StarRating({ rating }: { rating: number }) {
return (

<div className="flex gap-0.5">
{[1,2,3,4,5].map((s) => (
<span key={s} className={s <= rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
))}
</div>
);
}

export default function InboxPage() {
const [messages, setMessages] = useState(MOCK_MESSAGES);
const [selected, setSelected] = useState<Message | null>(messages[0]);
const [searchQuery, setSearchQuery] = useState('');
const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | Platform | Tag>('all');
const [editingReply, setEditingReply] = useState(false);
const [replyText, setReplyText] = useState('');
const [sentIds, setSentIds] = useState<Set<string>>(new Set());

const filtered = messages.filter((m) => {
const matchSearch = !searchQuery || m.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || m.text.toLowerCase().includes(searchQuery.toLowerCase());
if (!matchSearch) return false;
if (activeFilter === 'all') return true;
if (activeFilter === 'unread') return !m.isRead;
if (['facebook','instagram','google'].includes(activeFilter)) return m.platform === activeFilter;
return m.tag === activeFilter;
});

const handleSelect = (msg: Message) => {
setSelected(msg);
setEditingReply(false);
setReplyText(msg.suggestedReply);
setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
};

const handleSend = () => {
if (!selected) return;
setSentIds((prev) => new Set(prev).add(selected.id));
setEditingReply(false);
};

const unreadCount = messages.filter((m) => !m.isRead).length;

return (

<div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
{/_ Left panel — message list _/}
<div className="w-full md:w-80 flex-shrink-0 border-r border-gray-100 flex flex-col">
{/_ Search + filters _/}
<div className="p-3 border-b space-y-2">
<div className="flex items-center gap-2">
<h2 className="text-base font-bold text-gray-900 flex-1">Inbox</h2>
{unreadCount > 0 && (
<span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{unreadCount}</span>
)}
</div>
<div className="relative">
<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
<input
value={searchQuery}
onChange={(e) => setSearchQuery(e.target.value)}
placeholder="Search messages..."
className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
</div>
<div className="flex gap-1.5 flex-wrap">
{(['all','unread','facebook','instagram','google'] as const).map((f) => (
<button
key={f}
onClick={() => setActiveFilter(f)}
className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${
                  activeFilter === f ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-blue-300'
                }`} >
{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
</button>
))}
</div>
<div className="flex gap-1.5">
{(['lead','complaint','general','spam'] as const).map((t) => (
<button
key={t}
onClick={() => setActiveFilter(t)}
className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${
                  activeFilter === t ? 'bg-blue-600 text-white border-blue-600' : `${TAG_STYLES[t]} border-transparent`
                }`} >
{t.charAt(0).toUpperCase() + t.slice(1)}
</button>
))}
</div>
</div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No messages found</div>
          ) : filtered.map((msg) => {
            const ps = PLATFORM_STYLES[msg.platform];
            return (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg)}
                className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${selected?.id === msg.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {msg.customerInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className={`text-xs font-semibold truncate ${!msg.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {msg.customerName}
                      </p>
                      {!msg.isRead && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{msg.text}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${ps.bg} ${ps.color}`}>
                        {ps.label}
                      </span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${TAG_STYLES[msg.tag]}`}>
                        {msg.tag}
                      </span>
                      <span className="text-[9px] text-gray-400 ml-auto">{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel — message thread */}
      {selected ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Thread header */}
          <div className="px-5 py-3 border-b flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
              {selected.customerInitials}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{selected.customerName}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-medium ${PLATFORM_STYLES[selected.platform].color}`}>
                  via {PLATFORM_STYLES[selected.platform].label} {selected.type}
                </span>
                {selected.postContext && <span className="text-[10px] text-gray-400">· on "{selected.postContext}"</span>}
              </div>
            </div>
            <div className="flex gap-2">
              {(['lead','complaint','general','spam'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMessages((prev) => prev.map((m) => m.id === selected.id ? { ...m, tag: t } : m))}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                    selected.tag === t ? `${TAG_STYLES[t]} border-transparent` : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Customer message */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {selected.customerInitials}
              </div>
              <div className="flex-1">
                <div className={`bg-gray-50 rounded-2xl rounded-tl-sm p-4 max-w-lg border ${
                  selected.sentiment === 'negative' ? 'border-red-200 bg-red-50' : 'border-gray-100'
                }`}>
                  {selected.rating && <StarRating rating={selected.rating} />}
                  <p className="text-sm text-gray-800 mt-1 leading-relaxed">{selected.text}</p>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">{selected.timestamp}</p>
              </div>
            </div>

            {/* Negative sentiment warning */}
            {selected.sentiment === 'negative' && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700 font-medium">Negative sentiment detected. Review suggested response carefully before sending.</p>
              </div>
            )}

            {/* Lead CTA */}
            {selected.tag === 'lead' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                <p className="text-xs text-green-700 font-medium">This looks like a sales lead! Create a lead record.</p>
                <Button variant="secondary" className="text-xs py-1 px-3 h-auto">Create Lead</Button>
              </div>
            )}

            {/* Sent confirmation */}
            {sentIds.has(selected.id) && (
              <div className="flex justify-end">
                <div className="bg-blue-600 rounded-2xl rounded-br-sm p-4 max-w-lg">
                  <p className="text-sm text-white leading-relaxed">{selected.suggestedReply}</p>
                  <div className="flex items-center gap-1 mt-1.5 justify-end">
                    <Check className="w-3 h-3 text-blue-200" />
                    <p className="text-[10px] text-blue-200">Sent just now</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI reply section */}
          {!sentIds.has(selected.id) && selected.tag !== 'spam' && (
            <div className={`border-t p-4 space-y-3 ${selected.sentiment === 'negative' ? 'border-red-200 bg-red-50/30' : ''}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600">AI Suggested Reply</p>
                <button
                  onClick={() => { setEditingReply((v) => !v); setReplyText(selected.suggestedReply); }}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
              </div>

              {editingReply ? (
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full h-24 text-sm p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              ) : (
                <div className={`rounded-lg p-3 border text-sm text-gray-700 leading-relaxed line-clamp-3 ${
                  selected.sentiment === 'negative' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'
                }`}>
                  {selected.suggestedReply}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1 flex items-center gap-1.5 justify-center text-sm"
                  onClick={handleSend}
                  variant={selected.sentiment === 'negative' ? 'danger' : 'primary'}
                >
                  <Send className="w-3.5 h-3.5" />
                  {selected.sentiment === 'negative' ? 'Approve & Send' : 'Send Reply'}
                </Button>
                <Button variant="secondary" className="text-sm">Dismiss</Button>
              </div>
            </div>
          )}

          {selected.tag === 'spam' && (
            <div className="border-t p-4 text-center">
              <p className="text-sm text-gray-400">Spam messages are hidden from responses.</p>
              <Button variant="secondary" className="text-xs mt-2">Mark as Not Spam</Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p className="text-sm">Select a message to view the thread</p>
        </div>
      )}
    </div>

);
}
You've hit your limit · resets 10:30pm (Asia/Calcutta)

resume work now
Update Todos

Enhance App.tsx — add all nav items (Inventory, Boost, Analytics), active link styling, complete routing

Enhance CreatePost.tsx — prompt chips, 3 creative variants carousel, platform toggles, publish/schedule flow

Build Calendar.tsx — week/month view, post cards with status badges

Build InboxPage.tsx — unified inbox, message list, AI reply suggestions, tagging

Build Inventory.tsx — vehicle table, CSV upload UI, quick actions

Build Boost.tsx — campaign cards, boost setup modal (budget/duration/audience)

Build Settings.tsx — platform connections, dealer profile, language prefs

Build Analytics.tsx — lead dashboard, top posts, charts

Add backend API routes — inbox, inventory, boost (expanded mocks)
Write Inventory.tsx
360 lines
import { useState, useRef } from 'react';
import { Upload, Search, Filter, MoreHorizontal, PlusSquare, CheckSquare, Pencil, Trash2, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';

type VehicleStatus = 'in_stock' | 'sold' | 'reserved';
type Condition = 'new' | 'used';

interface Vehicle {
id: string;
make: string;
model: string;
variant: string;
year: number;
price: number;
condition: Condition;
color: string;
fuel_type: string;
stock_count: number;
status: VehicleStatus;
image_url: string;
}

const MOCK_VEHICLES: Vehicle[] = [
{ id: '1', make: 'Hyundai', model: 'Creta', variant: 'SX(O) Turbo', year: 2024, price: 1999000, condition: 'new', color: 'Abyss Black', fuel_type: 'Petrol', stock_count: 3, status: 'in_stock', image_url: 'from-blue-900 to-blue-700' },
{ id: '2', make: 'Maruti Suzuki', model: 'Brezza', variant: 'Alpha', year: 2024, price: 1399000, condition: 'new', color: 'Pearl Arctic White', fuel_type: 'Petrol', stock_count: 5, status: 'in_stock', image_url: 'from-gray-700 to-gray-500' },
{ id: '3', make: 'Tata', model: 'Nexon EV', variant: 'Max XZ+', year: 2023, price: 1849000, condition: 'new', color: 'Flame Red', fuel_type: 'Electric', stock_count: 2, status: 'in_stock', image_url: 'from-red-700 to-red-500' },
{ id: '4', make: 'Kia', model: 'Sonet', variant: 'HTX+', year: 2024, price: 1299000, condition: 'new', color: 'Imperial Blue', fuel_type: 'Diesel', stock_count: 4, status: 'in_stock', image_url: 'from-indigo-800 to-indigo-600' },
{ id: '5', make: 'Hyundai', model: 'i20', variant: 'Asta (O)', year: 2023, price: 980000, condition: 'used', color: 'Typhoon Silver', fuel_type: 'Petrol', stock_count: 1, status: 'in_stock', image_url: 'from-slate-600 to-slate-400' },
{ id: '6', make: 'Maruti Suzuki', model: 'Swift', variant: 'ZXi+', year: 2022, price: 720000, condition: 'used', color: 'Solid Red', fuel_type: 'Petrol', stock_count: 1, status: 'in_stock', image_url: 'from-rose-700 to-rose-500' },
{ id: '7', make: 'Toyota', model: 'Fortuner', variant: 'Legender 4x2 AT', year: 2024, price: 4750000, condition: 'new', color: 'White Pearl Crystal Shine', fuel_type: 'Diesel', stock_count: 1, status: 'reserved', image_url: 'from-amber-700 to-amber-500' },
{ id: '8', make: 'Honda', model: 'City', variant: 'ZX CVT', year: 2022, price: 1150000, condition: 'used', color: 'Lunar Silver Metallic', fuel_type: 'Petrol', stock_count: 1, status: 'sold', image_url: 'from-zinc-600 to-zinc-400' },
];

const STATUS_STYLES: Record<VehicleStatus, string> = {
in_stock: 'bg-green-100 text-green-700',
sold: 'bg-gray-100 text-gray-500',
reserved: 'bg-yellow-100 text-yellow-700',
};

const STATUS_LABELS: Record<VehicleStatus, string> = {
in_stock: 'In Stock',
sold: 'Sold',
reserved: 'Reserved',
};

function formatPrice(p: number) {
if (p >= 100000) return `₹${(p / 100000).toFixed(2)} L`;
return `₹${p.toLocaleString('en-IN')}`;
}

export default function InventoryPage() {
const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
const [search, setSearch] = useState('');
const [filterCondition, setFilterCondition] = useState<'all' | Condition>('all');
const [filterStatus, setFilterStatus] = useState<'all' | VehicleStatus>('all');
const [selected, setSelected] = useState<Set<string>>(new Set());
const [showUploadModal, setShowUploadModal] = useState(false);
const [uploadStep, setUploadStep] = useState<'drop' | 'mapping' | 'confirm'>('drop');
const [isDragging, setIsDragging] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);

const filtered = vehicles.filter((v) => {
const q = search.toLowerCase();
const matchSearch = !q || `${v.make} ${v.model} ${v.variant}`.toLowerCase().includes(q);
const matchCond = filterCondition === 'all' || v.condition === filterCondition;
const matchStat = filterStatus === 'all' || v.status === filterStatus;
return matchSearch && matchCond && matchStat;
});

const toggleSelect = (id: string) => {
setSelected((prev) => {
const next = new Set(prev);
next.has(id) ? next.delete(id) : next.add(id);
return next;
});
};

const markSold = (id: string) => {
setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, status: 'sold' } : v));
};

const deleteVehicle = (id: string) => {
setVehicles((prev) => prev.filter((v) => v.id !== id));
};

const inStock = vehicles.filter((v) => v.status === 'in_stock').length;
const sold = vehicles.filter((v) => v.status === 'sold').length;
const newCount = vehicles.filter((v) => v.condition === 'new').length;
const usedCount = vehicles.filter((v) => v.condition === 'used').length;

return (

<div className="max-w-6xl mx-auto space-y-5">
{/_ Header _/}
<div className="flex items-center justify-between flex-wrap gap-3">
<div>
<h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
<p className="text-sm text-gray-500 mt-0.5">{inStock} in stock · {sold} sold · {newCount} new · {usedCount} used</p>
</div>
<div className="flex gap-2">
<Button variant="secondary" className="text-sm flex items-center gap-1.5" onClick={() => { setShowUploadModal(true); setUploadStep('drop'); }}>
<Upload className="w-4 h-4" /> Import CSV
</Button>
<Button className="text-sm flex items-center gap-1.5">
<PlusSquare className="w-4 h-4" /> Add Vehicle
</Button>
</div>
</div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by make, model, variant..."
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-1.5 border rounded-lg p-1">
          <Filter className="w-3.5 h-3.5 text-gray-400 ml-1" />
          {(['all', 'new', 'used'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilterCondition(c)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${filterCondition === c ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 border rounded-lg p-1">
          {(['all', 'in_stock', 'reserved', 'sold'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {s === 'all' ? 'All Status' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
          <span className="text-sm font-medium text-blue-700">{selected.size} selected</span>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Mark Sold</button>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Generate Showcase Post</button>
          <button className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
          <button className="ml-auto text-xs text-gray-500" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={() => {
                      if (selected.size === filtered.length) setSelected(new Set());
                      else setSelected(new Set(filtered.map((v) => v.id)));
                    }}
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Condition</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((v) => (
                <tr key={v.id} className={`hover:bg-gray-50 transition-colors ${selected.has(v.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded" checked={selected.has(v.id)} onChange={() => toggleSelect(v.id)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-9 rounded-lg bg-gradient-to-br ${v.image_url} flex-shrink-0`} />
                      <div>
                        <p className="font-semibold text-gray-900">{v.make} {v.model}</p>
                        <p className="text-xs text-gray-500">{v.variant} · {v.year} · {v.color}</p>
                        <p className="text-xs text-gray-400">{v.fuel_type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v.condition === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {v.condition === 'new' ? 'New' : 'Used'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(v.price)}</td>
                  <td className="px-4 py-3 text-gray-600">{v.stock_count} unit{v.stock_count !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[v.status]}`}>
                      {STATUS_LABELS[v.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        title="Generate Post"
                        onClick={() => window.location.href = '/create'}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button title="Edit" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {v.status !== 'sold' && (
                        <button title="Mark as Sold" onClick={() => markSold(v.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors">
                          <CheckSquare className="w-4 h-4" />
                        </button>
                      )}
                      <button title="Delete" onClick={() => deleteVehicle(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                    <div className="text-4xl mb-2">🚗</div>
                    <p className="font-medium text-gray-500">No vehicles found</p>
                    <p className="text-sm mt-1">Try adjusting filters or import a CSV</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-between text-xs text-gray-500">
          <span>Showing {filtered.length} of {vehicles.length} vehicles</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 rounded border hover:bg-gray-50">Prev</button>
            <button className="px-2 py-1 rounded border bg-blue-600 text-white">1</button>
            <button className="px-2 py-1 rounded border hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Import Inventory</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {['Upload File', 'Map Columns', 'Confirm'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === (['drop','mapping','confirm'] as const).indexOf(uploadStep) ? 'bg-blue-600 text-white' :
                    i < (['drop','mapping','confirm'] as const).indexOf(uploadStep) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>{i + 1}</div>
                  <span className="text-xs text-gray-500">{s}</span>
                  {i < 2 && <div className="w-6 h-px bg-gray-200" />}
                </div>
              ))}
            </div>

            {uploadStep === 'drop' && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); setUploadStep('mapping'); }}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="font-medium text-gray-700">Drop CSV or Excel file here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                <p className="text-xs text-gray-300 mt-3">Supports .csv, .xlsx, .xls · Max 500 rows</p>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={() => setUploadStep('mapping')} />
              </div>
            )}

            {uploadStep === 'mapping' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Map your file columns to Cardeko fields:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {[
                    { field: 'Make', yourCol: 'Brand', required: true },
                    { field: 'Model', yourCol: 'Model Name', required: true },
                    { field: 'Variant', yourCol: 'Variant/Trim', required: false },
                    { field: 'Year', yourCol: 'Year of Manufacture', required: true },
                    { field: 'Price', yourCol: 'Selling Price', required: true },
                    { field: 'Condition', yourCol: 'New/Used', required: true },
                    { field: 'Image URL', yourCol: 'Image Link', required: false },
                  ].map((m) => (
                    <div key={m.field} className="flex items-center gap-3">
                      <div className="w-28 text-xs font-medium text-gray-700">
                        {m.field} {m.required && <span className="text-red-500">*</span>}
                      </div>
                      <select className="flex-1 text-xs border rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value={m.yourCol}>{m.yourCol}</option>
                        <option value="">-- Skip --</option>
                      </select>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1 text-sm" onClick={() => setUploadStep('drop')}>Back</Button>
                  <Button className="flex-1 text-sm" onClick={() => setUploadStep('confirm')}>Validate</Button>
                </div>
              </div>
            )}

            {uploadStep === 'confirm' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-800">Ready to import</p>
                  <p className="text-sm text-green-700 mt-1">47 vehicles · 0 errors · 3 warnings</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
                  3 rows have missing Image URLs — a placeholder will be used.
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Import mode:</p>
                  <div className="flex gap-2">
                    {['Append', 'Update existing', 'Replace all'].map((m) => (
                      <label key={m} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="mode" defaultChecked={m === 'Update existing'} />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1 text-sm" onClick={() => setUploadStep('mapping')}>Back</Button>
                  <Button className="flex-1 text-sm" onClick={() => setShowUploadModal(false)}>Confirm Import</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

);
}
Update Todos

Enhance App.tsx — add all nav items (Inventory, Boost, Analytics), active link styling, complete routing

Enhance CreatePost.tsx — prompt chips, 3 creative variants carousel, platform toggles, publish/schedule flow

Build Calendar.tsx — week/month view, post cards with status badges

Build InboxPage.tsx — unified inbox, message list, AI reply suggestions, tagging

Build Inventory.tsx — vehicle table, CSV upload UI, quick actions

Build Boost.tsx — campaign cards, boost setup modal (budget/duration/audience)

Build Settings.tsx — platform connections, dealer profile, language prefs

Build Analytics.tsx — lead dashboard, top posts, charts

Add backend API routes — inbox, inventory, boost (expanded mocks)
Write Boost.tsx
400 lines
import { useState } from 'react';
import { Zap, TrendingUp, Pause, Square, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';

interface Campaign {
id: string;
postTitle: string;
postThumbnail: string;
dailyBudget: number;
totalBudget: number;
spent: number;
reach: number;
clicks: number;
ctr: string;
daysLeft: number;
status: CampaignStatus;
platform: string;
}

const MOCK_CAMPAIGNS: Campaign[] = [
{ id: '1', postTitle: 'Brezza Weekend Offer', postThumbnail: 'from-blue-900 to-blue-700', dailyBudget: 1000, totalBudget: 7000, spent: 3200, reach: 14821, clicks: 312, ctr: '2.1%', daysLeft: 4, status: 'active', platform: 'Facebook + Instagram' },
{ id: '2', postTitle: 'Navratri Special Deals', postThumbnail: 'from-orange-600 to-red-500', dailyBudget: 2500, totalBudget: 17500, spent: 5000, reach: 22100, clicks: 541, ctr: '2.4%', daysLeft: 7, status: 'active', platform: 'Facebook' },
{ id: '3', postTitle: 'Nexon EV Showcase', postThumbnail: 'from-teal-700 to-teal-500', dailyBudget: 500, totalBudget: 3500, spent: 3500, reach: 9400, clicks: 187, ctr: '2.0%', daysLeft: 0, status: 'completed', platform: 'Instagram' },
{ id: '4', postTitle: 'Service Camp August', postThumbnail: 'from-gray-700 to-gray-500', dailyBudget: 1000, totalBudget: 5000, spent: 1500, reach: 5200, clicks: 98, ctr: '1.9%', daysLeft: 2, status: 'paused', platform: 'Facebook' },
];

const STATUS_STYLES: Record<CampaignStatus, string> = {
active: 'bg-green-100 text-green-700',
paused: 'bg-yellow-100 text-yellow-700',
completed: 'bg-gray-100 text-gray-500',
draft: 'bg-blue-100 text-blue-700',
};

const BUDGET_PRESETS = [500, 1000, 2500, 5000];
const DURATION_PRESETS = [3, 7, 14, 30];

interface BoostModalProps {
onClose: () => void;
onLaunch: () => void;
}

function BoostSetupModal({ onClose, onLaunch }: BoostModalProps) {
const [step, setStep] = useState(1);
const [dailyBudget, setDailyBudget] = useState(1000);
const [customBudget, setCustomBudget] = useState('');
const [duration, setDuration] = useState(7);
const [showAdvanced, setShowAdvanced] = useState(false);
const [radius, setRadius] = useState(25);
const [ageMin, setAgeMin] = useState(25);
const [ageMax, setAgeMax] = useState(55);

const totalSpend = (customBudget ? parseInt(customBudget) : dailyBudget) _ duration;
const estimatedReach = Math.round(totalSpend _ 18.4);

return (

<div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4">
<div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
{/_ Header _/}
<div className="flex items-center justify-between px-6 py-4 border-b">
<div className="flex items-center gap-2">
<Zap className="w-5 h-5 text-yellow-500" />
<h3 className="font-bold text-gray-900">Boost Post</h3>
</div>
<button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
</div>

        {/* Step indicator */}
        <div className="flex px-6 pt-4 gap-2">
          {['Budget', 'Duration', 'Audience', 'Confirm'].map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${i + 1 <= step ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {i + 1}
              </div>
              <span className={`text-[10px] font-medium ${i + 1 === step ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
            </div>
          ))}
        </div>

        <div className="px-6 py-5 space-y-4">
          {step === 1 && (
            <>
              <h4 className="font-semibold text-gray-800">Set Daily Budget</h4>
              <div className="grid grid-cols-2 gap-2">
                {BUDGET_PRESETS.map((b) => (
                  <button
                    key={b}
                    onClick={() => { setDailyBudget(b); setCustomBudget(''); }}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${dailyBudget === b && !customBudget ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-blue-300'}`}
                  >
                    ₹{b.toLocaleString('en-IN')}/day
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Custom amount (min ₹200/day)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                  <input
                    type="number"
                    min={200}
                    value={customBudget}
                    onChange={(e) => { setCustomBudget(e.target.value); setDailyBudget(0); }}
                    placeholder="Enter amount"
                    className="w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              {(dailyBudget > 0 || customBudget) && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  Estimated reach: <strong>~{Math.round((customBudget ? parseInt(customBudget) : dailyBudget) * 12.5).toLocaleString('en-IN')} – {Math.round((customBudget ? parseInt(customBudget) : dailyBudget) * 18).toLocaleString('en-IN')} people/day</strong>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <h4 className="font-semibold text-gray-800">How long to run?</h4>
              <div className="grid grid-cols-2 gap-2">
                {DURATION_PRESETS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${duration === d ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-blue-300'}`}
                  >
                    {d} days
                  </button>
                ))}
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Daily budget</span>
                  <span className="font-semibold">₹{(customBudget ? parseInt(customBudget) : dailyBudget).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{duration} days</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                  <span className="text-gray-800 font-semibold">Total spend</span>
                  <span className="font-bold text-blue-600">₹{totalSpend.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h4 className="font-semibold text-gray-800">Target Audience</h4>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700">
                <p className="font-medium">Cardeko Smart Audience (Recommended)</p>
                <p className="text-xs mt-1 text-blue-600">Auto-intenders aged 25–55 within 25 km of your dealership in your region</p>
              </div>
              <button
                onClick={() => setShowAdvanced((v) => !v)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
                Advanced targeting
              </button>
              {showAdvanced && (
                <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Location radius: {radius} km</label>
                    <input type="range" min={5} max={50} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full accent-blue-600" />
                    <div className="flex justify-between text-xs text-gray-400 mt-1"><span>5 km</span><span>50 km</span></div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Age range: {ageMin}–{ageMax}</label>
                    <div className="flex gap-3">
                      <input type="range" min={18} max={ageMax - 1} value={ageMin} onChange={(e) => setAgeMin(+e.target.value)} className="flex-1 accent-blue-600" />
                      <input type="range" min={ageMin + 1} max={65} value={ageMax} onChange={(e) => setAgeMax(+e.target.value)} className="flex-1 accent-blue-600" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Gender</label>
                    <div className="flex gap-2">
                      {['All', 'Male', 'Female'].map((g) => (
                        <button key={g} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-300 text-gray-600">{g}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 4 && (
            <>
              <h4 className="font-semibold text-gray-800">Confirm & Launch</h4>
              <div className="border rounded-xl overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
                  <div className="w-16 h-6 bg-white/30 rounded" />
                </div>
                <div className="p-4 space-y-2 text-sm">
                  <p className="font-semibold text-gray-800">Brezza Weekend Offer</p>
                  <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                    <span className="text-gray-500">Daily budget</span>
                    <span className="font-medium text-right">₹{(customBudget ? parseInt(customBudget) : dailyBudget).toLocaleString('en-IN')}</span>
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-right">{duration} days</span>
                    <span className="text-gray-500">Total spend</span>
                    <span className="font-bold text-blue-600 text-right">₹{totalSpend.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500">Est. reach</span>
                    <span className="font-medium text-right">~{estimatedReach.toLocaleString('en-IN')} people</span>
                    <span className="text-gray-500">Audience</span>
                    <span className="font-medium text-right">Smart (25–55, {radius} km)</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                By boosting, you agree to Meta's advertising policies. Actual results may vary. Budget will be charged from your connected Meta Ad Account.
              </p>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-5 flex gap-3">
          {step > 1 && <Button variant="secondary" className="flex-1 text-sm" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          {step < 4
            ? <Button className="flex-1 text-sm" onClick={() => setStep((s) => s + 1)}>Continue</Button>
            : <Button className="flex-1 text-sm flex items-center gap-1.5 justify-center" onClick={onLaunch}><Zap className="w-4 h-4" /> Launch Boost</Button>
          }
        </div>
      </div>
    </div>

);
}

export default function BoostPage() {
const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
const [showBoostModal, setShowBoostModal] = useState(false);
const [launched, setLaunched] = useState(false);
const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

const activeCampaigns = campaigns.filter((c) => c.status === 'active' || c.status === 'paused');
const completedCampaigns = campaigns.filter((c) => c.status === 'completed');

const totalSpentThisMonth = campaigns.reduce((sum, c) => sum + c.spent, 0);
const totalReachThisMonth = campaigns.reduce((sum, c) => sum + c.reach, 0);
const totalClicksThisMonth = campaigns.reduce((sum, c) => sum + c.clicks, 0);

const togglePause = (id: string) => {
setCampaigns((prev) => prev.map((c) =>
c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c
));
};

const stopCampaign = (id: string) => {
setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, status: 'completed', daysLeft: 0 } : c));
};

const handleLaunch = () => {
setShowBoostModal(false);
setLaunched(true);
setTimeout(() => setLaunched(false), 4000);
};

return (

<div className="max-w-5xl mx-auto space-y-6">
{/_ Header _/}
<div className="flex items-center justify-between flex-wrap gap-3">
<div>
<h2 className="text-2xl font-bold text-gray-900">Boost Campaigns</h2>
<p className="text-sm text-gray-500 mt-0.5">Promote your posts to reach more car buyers</p>
</div>
<Button className="text-sm flex items-center gap-1.5" onClick={() => setShowBoostModal(true)}>
<Zap className="w-4 h-4" /> Boost a Post
</Button>
</div>

      {/* Launch success toast */}
      {launched && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-lg">✓</div>
          <div>
            <p className="font-semibold text-green-800">Boost campaign launched!</p>
            <p className="text-sm text-green-700">Your campaign is now live on Meta. Check back in a few hours for metrics.</p>
          </div>
        </div>
      )}

      {/* Monthly summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Spend This Month', value: `₹${totalSpentThisMonth.toLocaleString('en-IN')}`, sub: `across ${campaigns.length} campaigns`, icon: '💸' },
          { label: 'Total Reach', value: totalReachThisMonth.toLocaleString('en-IN'), sub: 'people reached', icon: '📡' },
          { label: 'Total Clicks', value: totalClicksThisMonth.toLocaleString('en-IN'), sub: 'link clicks', icon: '👆' },
          { label: 'Avg CTR', value: `${((totalClicksThisMonth / totalReachThisMonth) * 100).toFixed(1)}%`, sub: 'click-through rate', icon: '📊' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(['active', 'completed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'active' ? `Active & Paused (${activeCampaigns.length})` : `Completed (${completedCampaigns.length})`}
          </button>
        ))}
      </div>

      {/* Campaign cards */}
      <div className="space-y-4">
        {(activeTab === 'active' ? activeCampaigns : completedCampaigns).map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-start gap-4 p-5">
              {/* Thumbnail */}
              <div className={`w-20 h-16 rounded-lg bg-gradient-to-br ${c.postThumbnail} flex-shrink-0`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-gray-900">{c.postTitle}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.platform} · {c.daysLeft > 0 ? `${c.daysLeft} days left` : 'Ended'}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[c.status]}`}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                </div>

                {/* Spend progress */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Spent: ₹{c.spent.toLocaleString('en-IN')}</span>
                    <span>Budget: ₹{c.totalBudget.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min((c.spent / c.totalBudget) * 100, 100)}%` }} />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {[
                    { label: 'Reach', value: c.reach.toLocaleString('en-IN') },
                    { label: 'Clicks', value: c.clicks.toLocaleString('en-IN') },
                    { label: 'CTR', value: c.ctr },
                    { label: 'CPC', value: `₹${Math.round(c.spent / c.clicks)}` },
                  ].map((m) => (
                    <div key={m.label} className="text-center bg-gray-50 rounded-lg p-2">
                      <p className="text-sm font-bold text-gray-900">{m.value}</p>
                      <p className="text-[10px] text-gray-500">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {c.status !== 'completed' && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePause(c.id)}
                    title={c.status === 'active' ? 'Pause' : 'Resume'}
                    className="p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    {c.status === 'active' ? <Pause className="w-4 h-4 text-gray-600" /> : <TrendingUp className="w-4 h-4 text-green-600" />}
                  </button>
                  <button
                    onClick={() => stopCampaign(c.id)}
                    title="Stop campaign"
                    className="p-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <Square className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {(activeTab === 'active' ? activeCampaigns : completedCampaigns).length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Zap className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500">No {activeTab} campaigns</p>
            {activeTab === 'active' && (
              <Button className="mt-4 text-sm" onClick={() => setShowBoostModal(true)}>Launch Your First Boost</Button>
            )}
          </div>
        )}
      </div>

      {showBoostModal && <BoostSetupModal onClose={() => setShowBoostModal(false)} onLaunch={handleLaunch} />}
    </div>

);
}
Write Analytics.tsx
207 lines
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';

const WEEKLY_LEADS = [12, 18, 14, 22, 19, 31, 28];
const WEEK_LABELS = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7 (now)'];

const LEAD_SOURCES = [
{ source: 'Facebook', leads: 63, color: 'bg-blue-500', pct: 38 },
{ source: 'Instagram', leads: 41, color: 'bg-pink-500', pct: 25 },
{ source: 'Google', leads: 28, color: 'bg-green-500', pct: 17 },
{ source: 'WhatsApp', leads: 22, color: 'bg-emerald-500', pct: 13 },
{ source: 'Organic', leads: 12, color: 'bg-gray-400', pct: 7 },
];

const TOP_POSTS = [
{ title: 'Brezza Weekend Offer', platform: 'FB + IG', leads: 18, reach: 14821, boosted: true, thumbnail: 'from-blue-900 to-blue-700' },
{ title: 'Navratri Special Deals', platform: 'FB + IG + GMB', leads: 14, reach: 22100, boosted: true, thumbnail: 'from-orange-600 to-red-500' },
{ title: 'Nexon EV Showcase', platform: 'Instagram', leads: 9, reach: 9400, boosted: true, thumbnail: 'from-teal-700 to-teal-500' },
{ title: 'Creta Test Drive Invite', platform: 'FB + GMB', leads: 7, reach: 6200, boosted: false, thumbnail: 'from-indigo-800 to-indigo-600' },
{ title: 'Service Camp Reminder', platform: 'GMB', leads: 5, reach: 4100, boosted: false, thumbnail: 'from-gray-700 to-gray-500' },
];

const maxLeads = Math.max(...WEEKLY_LEADS);

function MiniBarChart() {
return (

<div className="flex items-end gap-1.5 h-24">
{WEEKLY_LEADS.map((val, i) => (
<div key={i} className="flex-1 flex flex-col items-center gap-1">
<div
className={`w-full rounded-t transition-all ${i === WEEKLY_LEADS.length - 1 ? 'bg-blue-600' : 'bg-blue-200'}`}
style={{ height: `${(val / maxLeads) * 80}px` }}
/>
<span className="text-[9px] text-gray-400 writing-mode-vertical">{val}</span>
</div>
))}
</div>
);
}

function DonutChart() {
let cumulative = 0;
const r = 40;
const cx = 56;
const cy = 56;
const circumference = 2 _ Math.PI _ r;

return (
<svg width={112} height={112} viewBox="0 0 112 112">
<circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={16} />
{LEAD*SOURCES.map((src, i) => {
const colors = ['#3b82f6','#ec4899','#22c55e','#10b981','#9ca3af'];
const strokeDasharray = (src.pct / 100) * circumference;
const strokeDashoffset = -cumulative \_ circumference / 100;
cumulative += src.pct;
return (
<circle
key={i}
cx={cx} cy={cy} r={r}
fill="none"
stroke={colors[i]}
strokeWidth={16}
strokeDasharray={`${strokeDasharray} ${circumference - strokeDasharray}`}
strokeDashoffset={circumference / 4 + strokeDashoffset}
transform={`rotate(-90 ${cx} ${cy})`}
/>
);
})}
<text x={cx} y={cy - 4} textAnchor="middle" className="text-xs font-bold" fill="#111827" fontSize={14} fontWeight="bold">166</text>
<text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280" fontSize={8}>leads</text>
</svg>
);
}

export default function AnalyticsPage() {
return (

<div className="max-w-5xl mx-auto space-y-6">
{/_ Header _/}
<div className="flex items-center justify-between flex-wrap gap-3">
<div>
<h2 className="text-2xl font-bold text-gray-900">Lead Attribution</h2>
<p className="text-sm text-gray-500 mt-0.5">September 2026 · All platforms</p>
</div>
<div className="flex gap-2">
<select className="text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
<option>Last 30 days</option>
<option>Last 7 days</option>
<option>This month</option>
<option>Last 3 months</option>
</select>
<Button variant="secondary" className="text-sm flex items-center gap-1.5">
<Download className="w-4 h-4" /> Export Report
</Button>
</div>
</div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: '166', change: '+34%', up: true, sub: 'vs last month' },
          { label: 'Posts Published', value: '28', change: '+8', up: true, sub: 'this month' },
          { label: 'Total Reach', value: '1.2L', change: '+21%', up: true, sub: 'across all platforms' },
          { label: 'Cost per Lead', value: '₹78', change: '-12%', up: true, sub: 'from boosted campaigns' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 font-medium">{kpi.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {kpi.up ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
              <span className={`text-xs font-medium ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>{kpi.change}</span>
              <span className="text-xs text-gray-400">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Weekly trend */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Weekly Lead Trend</h3>
          <MiniBarChart />
          <div className="flex justify-between mt-2">
            {WEEK_LABELS.map((l, i) => (
              <span key={i} className="text-[9px] text-gray-400 flex-1 text-center">{l.replace('Week ', 'Wk')}</span>
            ))}
          </div>
        </div>

        {/* Leads by source */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Leads by Source</h3>
          <div className="flex items-center gap-4">
            <DonutChart />
            <div className="space-y-2 flex-1">
              {LEAD_SOURCES.map((s) => (
                <div key={s.source} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-sm ${s.color} flex-shrink-0`} />
                  <span className="text-xs text-gray-600 flex-1">{s.source}</span>
                  <span className="text-xs font-semibold text-gray-800">{s.leads}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top performing posts */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-800">Top Performing Posts</h3>
          <p className="text-xs text-gray-400 mt-0.5">Ranked by leads generated, not engagement</p>
        </div>
        <div className="divide-y divide-gray-50">
          {TOP_POSTS.map((post, i) => (
            <div key={post.title} className="flex items-center gap-4 px-5 py-3.5">
              <span className="text-sm font-bold text-gray-300 w-4">{i + 1}</span>
              <div className={`w-12 h-9 rounded-lg bg-gradient-to-br ${post.thumbnail} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">{post.platform}</span>
                  {post.boosted && (
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 font-medium px-1.5 py-0.5 rounded-full">Boosted</span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-green-600">{post.leads} leads</p>
                <p className="text-xs text-gray-400">{post.reach.toLocaleString('en-IN')} reach</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly summary card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium">Monthly Performance Summary</p>
            <h3 className="text-2xl font-bold mt-1">September 2026</h3>
          </div>
          <Button className="bg-white text-blue-700 hover:bg-blue-50 text-sm flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Share Report
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {[
            { label: 'Posts', value: '28' },
            { label: 'Total Reach', value: '1,22,400' },
            { label: 'Leads', value: '166' },
            { label: 'Ad Spend', value: '₹12,900' },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="text-blue-200 text-xs mt-4">
          This report is auto-generated by Cardeko Social AI. Share this with your OEM or management team.
        </p>
      </div>
    </div>

);
}
Write SettingsPage.tsx
377 lines
import { useState } from 'react';
import { Check, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

type PlatformStatus = 'connected' | 'disconnected' | 'expired';

interface PlatformInfo {
id: string;
name: string;
accountName: string;
status: PlatformStatus;
expiresIn?: number;
icon: React.ReactNode;
}

function FbIcon() {
return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
}

function IgIcon() {
return (
<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<defs>
<linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
<stop offset="0%" stopColor="#f09433"/>
<stop offset="50%" stopColor="#e6683c"/>
<stop offset="100%" stopColor="#bc1888"/>
</linearGradient>
</defs>
<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
<line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
</svg>
);
}

function GmbIcon() {
return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#4285F4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>;
}

const INITIAL_PLATFORMS: PlatformInfo[] = [
{ id: 'facebook', name: 'Facebook Page', accountName: 'Cardeko Motors Bangalore', status: 'connected', expiresIn: 45, icon: <FbIcon /> },
{ id: 'instagram', name: 'Instagram Business', accountName: '@cardekomotors', status: 'connected', expiresIn: 45, icon: <IgIcon /> },
{ id: 'gmb', name: 'Google My Business', accountName: 'Cardeko Motors - Bangalore', status: 'expired', icon: <GmbIcon /> },
];

const LANGUAGES = [
{ code: 'en', label: 'English', script: 'Latin' },
{ code: 'hi', label: 'Hindi', script: 'Devanagari' },
{ code: 'ta', label: 'Tamil', script: 'Tamil' },
{ code: 'te', label: 'Telugu', script: 'Telugu' },
{ code: 'kn', label: 'Kannada', script: 'Kannada' },
{ code: 'ml', label: 'Malayalam', script: 'Malayalam' },
{ code: 'mr', label: 'Marathi', script: 'Devanagari' },
];

const REGIONS = ['North India', 'South India', 'East India', 'West India', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Telangana', 'Gujarat', 'Punjab', 'Rajasthan'];

const BRANDS = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Kia', 'Honda', 'Toyota', 'Mahindra', 'Renault', 'Nissan', 'MG', 'Skoda', 'Volkswagen', 'Jeep', 'Ford'];

type Tab = 'profile' | 'platforms' | 'preferences';

export default function SettingsPage() {
const [activeTab, setActiveTab] = useState<Tab>('profile');
const [platforms, setPlatforms] = useState<PlatformInfo[]>(INITIAL_PLATFORMS);
const [selectedLangs, setSelectedLangs] = useState<string[]>(['en', 'hi']);
const [selectedRegion, setSelectedRegion] = useState('South India');
const [selectedBrands, setSelectedBrands] = useState<string[]>(['Hyundai', 'Kia']);
const [dealerName, setDealerName] = useState('Cardeko Motors Pvt. Ltd.');
const [city, setCity] = useState('Bangalore');
const [phone, setPhone] = useState('+91 98765 43210');
const [whatsapp, setWhatsapp] = useState('+91 98765 43210');
const [primaryColor, setPrimaryColor] = useState('#1877F2');
const [defaultRadius, setDefaultRadius] = useState(25);
const [saved, setSaved] = useState(false);

const handleConnect = (id: string) => {
setPlatforms((prev) => prev.map((p) => p.id === id ? { ...p, status: 'connected', expiresIn: 60, accountName: 'Reconnected Account' } : p));
};

const handleDisconnect = (id: string) => {
setPlatforms((prev) => prev.map((p) => p.id === id ? { ...p, status: 'disconnected', accountName: 'Not connected' } : p));
};

const toggleLang = (code: string) => {
if (code === 'en') return; // English always required
setSelectedLangs((prev) => prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]);
};

const toggleBrand = (brand: string) => {
setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
};

const handleSave = () => {
setSaved(true);
setTimeout(() => setSaved(false), 3000);
};

const tabs: { id: Tab; label: string }[] = [
{ id: 'profile', label: 'Dealer Profile' },
{ id: 'platforms', label: 'Platform Connections' },
{ id: 'preferences', label: 'Preferences' },
];

return (

<div className="max-w-3xl mx-auto space-y-6">
<div>
<h2 className="text-2xl font-bold text-gray-900">Settings</h2>
<p className="text-sm text-gray-500 mt-0.5">Manage your dealership profile and connected platforms</p>
</div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* --- PROFILE TAB --- */}
      {activeTab === 'profile' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-gray-800">Dealership Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Dealership Name</label>
                <input value={dealerName} onChange={(e) => setDealerName(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contact Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp Number</label>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Brands Sold</label>
              <div className="flex flex-wrap gap-2">
                {BRANDS.map((b) => (
                  <button
                    key={b}
                    onClick={() => toggleBrand(b)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedBrands.includes(b) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Dealer Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">Logo</div>
                <Button variant="secondary" className="text-sm">Upload Logo</Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Brand Colors</label>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Primary</p>
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-10 rounded-lg border cursor-pointer" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Secondary</p>
                  <input type="color" defaultValue="#1A1A2E" className="w-12 h-10 rounded-lg border cursor-pointer" />
                </div>
                <p className="text-xs text-gray-400">Used on all generated creatives and templates</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {saved && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" /> Saved successfully
              </div>
            )}
            <Button onClick={handleSave} className="text-sm">Save Changes</Button>
          </div>
        </div>
      )}

      {/* --- PLATFORMS TAB --- */}
      {activeTab === 'platforms' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            Connect your social accounts so Cardeko can publish posts, manage your inbox, and run boost campaigns on your behalf.
          </div>

          {platforms.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border flex items-center justify-center flex-shrink-0">
                  {p.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.status === 'connected' ? 'bg-green-100 text-green-700' :
                      p.status === 'expired' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {p.status === 'connected' ? 'Connected' : p.status === 'expired' ? 'Token Expired' : 'Not Connected'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{p.accountName}</p>
                  {p.status === 'connected' && p.expiresIn && (
                    <p className="text-xs text-gray-400 mt-0.5">Token expires in {p.expiresIn} days</p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {p.status === 'connected' && (
                    <>
                      <button
                        onClick={() => handleConnect(p.id)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                      </button>
                      <button
                        onClick={() => handleDisconnect(p.id)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Disconnect
                      </button>
                    </>
                  )}
                  {(p.status === 'disconnected' || p.status === 'expired') && (
                    <Button className="text-sm flex items-center gap-1.5" onClick={() => handleConnect(p.id)}>
                      {p.status === 'expired' ? <><AlertCircle className="w-3.5 h-3.5" /> Reconnect</> : 'Connect'}
                    </Button>
                  )}
                </div>
              </div>

              {p.status === 'expired' && (
                <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <p className="text-xs text-orange-700">Your access token has expired. Reconnect to continue publishing and managing your inbox for this platform.</p>
                </div>
              )}
            </div>
          ))}

          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-5 text-center text-gray-400">
            <p className="text-sm">More integrations coming soon — WhatsApp Business, YouTube, LinkedIn</p>
          </div>
        </div>
      )}

      {/* --- PREFERENCES TAB --- */}
      {activeTab === 'preferences' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Caption Languages</h3>
              <p className="text-xs text-gray-500 mb-3">Select languages for AI caption generation. English is always included.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => toggleLang(lang.code)}
                    disabled={lang.code === 'en'}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      selectedLangs.includes(lang.code)
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <span className="font-medium">{lang.label}</span>
                    <span className="text-[10px] text-gray-400">{lang.script}</span>
                    {selectedLangs.includes(lang.code) && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Region</h3>
              <p className="text-xs text-gray-500 mb-3">Controls which festival templates and regional campaigns are shown.</p>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Default Boost Radius</h3>
              <p className="text-xs text-gray-500 mb-3">How far from your dealership boost campaigns target by default.</p>
              <div className="space-y-2">
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={defaultRadius}
                  onChange={(e) => setDefaultRadius(+e.target.value)}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>5 km</span>
                  <span className="font-medium text-blue-600">{defaultRadius} km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Notifications</h3>
              <div className="space-y-2">
                {[
                  { label: 'Post published successfully', defaultOn: true },
                  { label: 'Post failed to publish', defaultOn: true },
                  { label: 'New inbox message received', defaultOn: true },
                  { label: 'Boost campaign update (every 4h)', defaultOn: false },
                  { label: 'Festival campaign suggestions', defaultOn: true },
                  { label: 'Monthly performance report', defaultOn: true },
                ].map((n) => (
                  <label key={n.label} className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer">
                    <span className="text-sm text-gray-700">{n.label}</span>
                    <input type="checkbox" defaultChecked={n.defaultOn} className="w-4 h-4 accent-blue-600" />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Subscription Plan</h3>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Growth Plan</p>
                    <p className="text-blue-200 text-sm">Unlimited posts · 3 platforms · Boost campaigns</p>
                  </div>
                  <span className="bg-white text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">Active</span>
                </div>
                <p className="text-blue-200 text-xs mt-2">Renews on 15 October 2026</p>
                <Button className="mt-3 bg-white text-blue-700 hover:bg-blue-50 text-xs">Upgrade to Enterprise</Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            {saved && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <Check className="w-4 h-4" /> Saved
              </div>
            )}
            <Button onClick={handleSave} className="text-sm">Save Preferences</Button>
          </div>
        </div>
      )}
    </div>

);
}
Update Todos

Enhance App.tsx — add all nav items (Inventory, Boost, Analytics), active link styling, complete routing

Enhance CreatePost.tsx — prompt chips, 3 creative variants carousel, platform toggles, publish/schedule flow

Build Calendar.tsx — week/month view, post cards with status badges

Build InboxPage.tsx — unified inbox, message list, AI reply suggestions, tagging

Build Inventory.tsx — vehicle table, CSV upload UI, quick actions

Build Boost.tsx — campaign cards, boost setup modal (budget/duration/audience)

Build Settings.tsx — platform connections, dealer profile, language prefs

Build Analytics.tsx — lead dashboard, top posts, charts

Add backend API routes — inbox, inventory, boost (expanded mocks)
Now add the missing backend routes:

Write inventory.ts
55 lines
import type { FastifyInstance } from 'fastify';

export default async function inventoryRoutes(fastify: FastifyInstance) {
// GET /v1/inventory — list inventory for dealer
fastify.get('/', async (request, reply) => {
const { condition, status, search, page = '1', limit = '20' } = request.query as Record<string, string>;
// TODO: replace with real Prisma query using dealer_id from JWT
return {
success: true,
data: [],
pagination: { page: parseInt(page), limit: parseInt(limit), total: 0 },
};
});

// POST /v1/inventory — create single vehicle
fastify.post('/', async (request, reply) => {
const body = request.body as Record<string, unknown>;
fastify.log.info(`Creating vehicle: ${JSON.stringify(body)}`);
return { success: true, id: 'mock-vehicle-id', ...body };
});

// PUT /v1/inventory/:id — update vehicle
fastify.put('/:id', async (request, reply) => {
const { id } = request.params as { id: string };
const body = request.body as Record<string, unknown>;
return { success: true, id, ...body };
});

// DELETE /v1/inventory/:id
fastify.delete('/:id', async (request, reply) => {
const { id } = request.params as { id: string };
return { success: true, message: `Vehicle ${id} deleted` };
});

// PATCH /v1/inventory/:id/status — mark sold/reserved/in_stock
fastify.patch('/:id/status', async (request, reply) => {
const { id } = request.params as { id: string };
const { status } = request.body as { status: string };
return { success: true, id, status };
});

// POST /v1/inventory/import — CSV/Excel import
fastify.post('/import', async (request, reply) => {
// TODO: parse multipart file, map columns, validate, insert via Prisma
fastify.log.info('Mock CSV import');
return {
success: true,
imported: 47,
errors: 3,
warnings: 2,
error_rows: [],
};
});
}
Write inbox.ts
69 lines
import type { FastifyInstance } from 'fastify';

export default async function inboxRoutes(fastify: FastifyInstance) {
// GET /v1/inbox — list messages
fastify.get('/', async (request, reply) => {
const { platform, tag, is_read, search, page = '1', limit = '30' } = request.query as Record<string, string>;
fastify.log.info(`Fetching inbox: platform=${platform} tag=${tag} is_read=${is_read} search=${search}`);
// TODO: Prisma query with dealer_id from JWT
return {
success: true,
data: [],
unread_count: 0,
pagination: { page: parseInt(page), limit: parseInt(limit), total: 0 },
};
});

// GET /v1/inbox/:id — single message
fastify.get('/:id', async (request, reply) => {
const { id } = request.params as { id: string };
return { success: true, data: { id, is_read: true } };
});

// PATCH /v1/inbox/:id/read — mark as read
fastify.patch('/:id/read', async (request, reply) => {
const { id } = request.params as { id: string };
return { success: true, id };
});

// PATCH /v1/inbox/:id/tag — update tag
fastify.patch('/:id/tag', async (request, reply) => {
const { id } = request.params as { id: string };
const { tag } = request.body as { tag: string };
return { success: true, id, tag };
});

// POST /v1/inbox/:id/reply — send reply
fastify.post('/:id/reply', async (request, reply) => {
const { id } = request.params as { id: string };
const { reply_text } = request.body as { reply_text: string };
fastify.log.info(`Sending reply to message ${id}: ${reply_text}`);
// TODO: call Meta Graph API / Google Business Profile API to send actual reply
return { success: true, id, replied_at: new Date().toISOString() };
});

// POST /v1/inbox/webhook/meta — receive Meta webhook events
fastify.post('/webhook/meta', async (request, reply) => {
// Verify and process Meta webhook payload
fastify.log.info('Received Meta webhook event');
return reply.code(200).send('EVENT_RECEIVED');
});

// GET /v1/inbox/webhook/meta — Meta webhook verification challenge
fastify.get('/webhook/meta', async (request, reply) => {
const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = request.query as Record<string, string>;
const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN ?? 'cardeko_webhook_secret';
if (mode === 'subscribe' && token === VERIFY_TOKEN) {
return reply.code(200).send(challenge);
}
return reply.code(403).send({ error: 'Forbidden' });
});

// POST /v1/inbox/leads — create lead from inbox message
fastify.post('/leads', async (request, reply) => {
const body = request.body as Record<string, unknown>;
fastify.log.info(`Creating lead: ${JSON.stringify(body)}`);
return { success: true, lead_id: 'mock-lead-id', ...body };
});
}
Write boost.ts
109 lines
import type { FastifyInstance } from 'fastify';

export default async function boostRoutes(fastify: FastifyInstance) {
// GET /v1/boost — list all campaigns for dealer
fastify.get('/', async (request, reply) => {
const { status } = request.query as { status?: string };
fastify.log.info(`Fetching boost campaigns, status filter: ${status}`);
// TODO: Prisma query with dealer_id from JWT
return { success: true, data: [], total_spent_this_month: 0 };
});

// POST /v1/boost — create and launch boost campaign
fastify.post('/', async (request, reply) => {
const body = request.body as {
post_id: string;
daily_budget: number;
duration_days: number;
targeting?: {
radius_km?: number;
age_min?: number;
age_max?: number;
gender?: string;
interests?: string[];
};
};

    fastify.log.info(`Creating boost campaign for post ${body.post_id}`);

    // TODO: implement real Meta Ads API flow:
    // 1. Create Campaign  POST /act_{ad_account_id}/campaigns
    // 2. Create Ad Set    POST /act_{ad_account_id}/adsets
    // 3. Create Ad        POST /act_{ad_account_id}/ads
    // 4. Activate campaign

    return {
      success: true,
      campaign_id: 'mock-campaign-id',
      meta_campaign_id: 'mock-meta-campaign-id',
      status: 'active',
      estimated_reach: Math.round(body.daily_budget * 18.4),
    };

});

// GET /v1/boost/:id — single campaign
fastify.get('/:id', async (request, reply) => {
const { id } = request.params as { id: string };
return { success: true, data: { id, status: 'active' } };
});

// PATCH /v1/boost/:id/pause — pause campaign
fastify.patch('/:id/pause', async (request, reply) => {
const { id } = request.params as { id: string };
fastify.log.info(`Pausing campaign ${id}`);
// TODO: call Meta Ads API to pause campaign
return { success: true, id, status: 'paused' };
});

// PATCH /v1/boost/:id/resume — resume paused campaign
fastify.patch('/:id/resume', async (request, reply) => {
const { id } = request.params as { id: string };
fastify.log.info(`Resuming campaign ${id}`);
return { success: true, id, status: 'active' };
});

// DELETE /v1/boost/:id — stop/cancel campaign
fastify.delete('/:id', async (request, reply) => {
const { id } = request.params as { id: string };
fastify.log.info(`Stopping campaign ${id}`);
// TODO: call Meta Ads API to stop campaign
return { success: true, id, status: 'completed' };
});

// GET /v1/boost/:id/metrics — fetch latest performance metrics
fastify.get('/:id/metrics', async (request, reply) => {
const { id } = request.params as { id: string };
fastify.log.info(`Fetching metrics for campaign ${id}`);
// TODO: poll Meta Ads Reporting API
return {
success: true,
id,
metrics: {
reach: 0,
impressions: 0,
clicks: 0,
spend: 0,
cpc: 0,
ctr: 0,
actions: [],
},
fetched_at: new Date().toISOString(),
};
});

// GET /v1/boost/reach-estimate — get estimated reach before launch
fastify.get('/reach-estimate', async (request, reply) => {
const { daily*budget, radius_km = '25', age_min = '25', age_max = '55' } = request.query as Record<string, string>;
const budget = parseInt(daily_budget ?? '1000');
// TODO: call Meta Ads API reach estimate endpoint
return {
success: true,
estimate: {
reach_min: Math.round(budget * 12),
reach*max: Math.round(budget * 20),
currency: 'INR',
},
};
});
}
Now register the new routes in the API entry point:

Edit index.ts
Added 6 lines
Just unused variable hints. Let me clean them up:

Edit index.ts
Modified
Edit index.ts
Modified
Actually, the Prisma client isn't needed in index.ts at all — routes each create their own. Remove both:

Edit index.ts
Removed 4 lines
Update Todos

Enhance App.tsx — add all nav items, active link styling, complete routing

Enhance CreatePost.tsx — prompt chips, 3 variants carousel, platform toggles, publish/schedule flow

Build Calendar.tsx — week/month view, post cards with status badges

Build InboxPage.tsx — unified inbox, AI reply suggestions, tagging

Build Inventory.tsx — vehicle table, CSV upload UI, quick actions

Build Boost.tsx — campaign cards, 4-step boost setup modal

Build SettingsPage.tsx — platform connections, dealer profile, language prefs

Build Analytics.tsx — lead dashboard, donut chart, top posts, monthly summary

Add backend API routes — inbox, inventory, boost registered in index.ts

Save project memory summary
Write project_socialgenie.md
47 lines

---

name: SocialGenie / Cardeko Social AI — project state
description: What has been built, what stack is used, and what remains for this dealer marketing platform
type: project

---

Product: **Cardeko Social AI** — AI-native marketing platform for Indian automobile dealerships.

**Why:** Replaces 14 manual staff managing 100 dealers. Goal: dealer runs full digital marketing in 10 min/day.

## Stack

- Frontend: React 19 + TypeScript + Tailwind v4 + Vite (apps/web)
- Backend: Fastify + TypeScript + Prisma + PostgreSQL (apps/api, port 3001)
- Monorepo: npm workspaces (apps/_, packages/_)

## What is built (as of March 2026)

### Frontend pages (apps/web/src/pages/)

- `Onboarding.tsx` — 5-step OTP + dealer profile + brand colors + platform connect
- `CreatePost.tsx` — Full prompt input, 6 category prompt chips (100+ prompts), 3 AI variant carousel, platform toggles (FB/IG/GMB), caption editor with char count, publish now + schedule modal
- `Calendar.tsx` — Week view (7-col grid) + Month view, post cards with status badges, bulk schedule bar
- `InboxPage.tsx` — Unified inbox (FB/IG/Google), AI reply suggestions, negative sentiment flagging, lead/complaint/general/spam tagging, two-panel desktop layout
- `Inventory.tsx` — Vehicle table with filters, 3-step CSV upload modal (drop→map→confirm), quick actions (generate post, mark sold, delete)
- `Boost.tsx` — 4-step boost modal (budget→duration→audience→confirm), active/completed campaign cards with metrics and pause/stop controls
- `Analytics.tsx` — Lead KPIs, bar chart (weekly trend), donut chart (leads by source), top posts table, monthly summary card
- `SettingsPage.tsx` — 3 tabs: Dealer Profile (name/city/brands/colors/logo), Platform Connections (FB/IG/GMB OAuth status + reconnect), Preferences (languages/region/boost radius/notifications/plan)

### App shell (App.tsx)

- Desktop left sidebar (240px) with active NavLink highlighting, badge on Inbox
- Mobile hamburger overlay sidebar + bottom tab bar (5 items)
- Dashboard with stats grid, recent posts, upcoming festivals, active boosts

### Backend routes (apps/api/src/routes/)

- `auth.ts` — OTP send/verify (mock, OTP=1234), JWT refresh (mock)
- `dealer.ts` — GET/PUT dealer profile (mock)
- `platform.ts` — GET/POST connect/DELETE disconnect (mock OAuth)
- `creative.ts` — POST /generate returns mock caption + 2 creatives
- `publisher.ts` — POST /publish enqueues mock job, GET /status/:jobId
- `inventory.ts` — Full CRUD + PATCH /status + POST /import (all mock)
- `inbox.ts` — List/get/reply/tag + Meta webhook verify endpoint + lead creation (all mock)
- `boost.ts` — Create/pause/resume/stop + metrics + reach-estimate (all mock)

### Database schema (Prisma)

All tables defined: Dealer, PlatformConnection, Template, Prompt, Post, BoostCampaign, InboxMessage, InventoryItem, Festival, Lead

**How to apply:** When continuing work, backend routes are all mocked — real integrations (OpenAI, Meta Graph API, Google Business Profile API, BullMQ jobs) are the next major phase.
Bash Check if MEMORY.md exists
IN
cat /Users/santoshsharma/.claude/projects/-Users-santoshsharma-Documents-Code-Antigravity-SocialGenie/memory/MEMORY.md 2>/dev/null || echo "NO_FILE"

OUT
NO_FILE
Write MEMORY.md
5 lines

# Memory Index

## Project

- [project_socialgenie.md](project_socialgenie.md) — Cardeko Social AI: full stack, all built pages/routes, what remains (real API integrations)
  Now let me verify the frontend builds cleanly:

Bash TypeScript type-check the web app
IN
cd /Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web && npx tsc --noEmit 2>&1

OUT
(Bash completed with no output)
Zero errors. Let me do a final check on the backend too:

Bash TypeScript type-check the API
IN
cd /Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api && npx tsc --noEmit 2>&1

OUT
(Bash completed with no output)
Update Todos

Enhance App.tsx — add all nav items, active link styling, complete routing

Enhance CreatePost.tsx — prompt chips, 3 variants carousel, platform toggles, publish/schedule flow

Build Calendar.tsx — week/month view, post cards with status badges

Build InboxPage.tsx — unified inbox, AI reply suggestions, tagging

Build Inventory.tsx — vehicle table, CSV upload UI, quick actions

Build Boost.tsx — campaign cards, 4-step boost setup modal

Build SettingsPage.tsx — platform connections, dealer profile, language prefs

Build Analytics.tsx — lead dashboard, donut chart, top posts, monthly summary

Add backend API routes — inbox, inventory, boost registered in index.ts

Save project memory summary
Both frontend and backend compile clean. Here's what was built in this session:

What was completed
Frontend — 7 new/enhanced pages
Page What was built
App.tsx Full sidebar with active NavLink highlighting, mobile hamburger overlay, bottom tab bar, enhanced Dashboard with stats/posts/festivals/boosts
CreatePost.tsx Prompt input + 6 category chips (24 quick prompts), 3 creative variant carousel, platform toggles (FB/IG/GMB), caption editor with char count + hashtag pills, publish now + schedule modal
Calendar.tsx Week view (7-col grid) + month view, post cards with status badges, week navigation, AI suggestion bulk-schedule bar
InboxPage.tsx Two-panel unified inbox (FB/IG/Google Reviews), AI reply suggestions, negative sentiment warning + forced approval, lead/complaint/spam tagging, search + filters
Inventory.tsx Vehicle table with search/filter/sort, 3-step CSV import modal (drop → column mapping → confirm), generate post / mark sold / delete per row
Boost.tsx 4-step boost modal (budget presets → duration → audience with advanced targeting → confirm), active campaign cards with spend progress bar + pause/stop, monthly metrics summary
Analytics.tsx Lead KPI cards, weekly bar chart, donut chart (leads by source), top posts ranked by leads, shareable monthly summary card
SettingsPage.tsx 3 tabs: Dealer Profile (brands/colors/logo), Platform Connections (OAuth status/reconnect/disconnect), Preferences (languages/region/boost radius/notifications/plan)
Backend — 3 new route modules
inventory.ts — Full CRUD + CSV import + status patch
inbox.ts — List/reply/tag + Meta webhook verify endpoint + lead creation
boost.ts — Create/pause/resume/stop campaigns + metrics + reach estimate
Next phase (real integrations to wire up)
OpenAI GPT-4o — replace mock captions in creative.ts
Meta Graph API — real FB/IG publishing in publisher.ts + inbox webhooks
Google Business Profile API — GMB publishing + review polling
BullMQ — scheduled post jobs, boost metrics polling workers
JWT auth — replace mock-id dealer identification across all routes
Go ahead and build this. I also want to view the frontend. how to view it?
Let me check the current state and start the dev server:

Bash Check if web deps are installed
IN
ls /Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web/node_modules/.vite 2>/dev/null && echo "deps_ok" || echo "need_install"

OUT
deps
deps_ok
Read .env
Bash Start Vite dev server and verify it's up
IN
cd /Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/web && npm run dev 2>&1 &
sleep 3 && curl -s http://localhost:5173 | head -5

OUT

> web@0.0.0 dev
> vite

VITE v8.0.2 ready in 282 ms

➜ Local: http://localhost:5173/
➜ Network: use --host to expose

<!doctype html>
<html lang="en">
  <head>
    <script type="module">import { injectIntoGlobalHook } from "/@react-refresh";
injectIntoGlobalHook(window);
Frontend is live. Open http://localhost:5173 in your browser.

Now continuing with the real integrations. The plan:

Wire up OpenAI GPT-4o in the creative route
Wire up real publishing (FB/IG/GMB) in publisher route
Add BullMQ job queue for scheduled posts
Add JWT auth so dealer identity flows through all routes
Let me check what packages are already in the API:

Read package.json
Read tsconfig.json
Read docker-compose.yml
Good — Redis and Postgres are already in docker-compose. Now I'll install the real packages and implement the integrations.

Update Todos

Install packages: openai, @fastify/jwt, bullmq, axios, @fastify/multipart, @fastify/rate-limit

Update .env with all required env vars

Implement JWT auth plugin + real token generation in auth.ts

Implement OpenAI GPT-4o caption service + wire into creative.ts

Implement BullMQ publish queue + workers for FB/IG/GMB

Implement Meta Graph API publishing service

Implement Google Business Profile publishing service

Wire dealer auth context into all routes (replace mock-id)
Bash Install real integration packages
IN
cd /Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api && npm install openai @fastify/jwt bullmq axios @fastify/multipart @fastify/rate-limit 2>&1 | tail -5

OUT
To address all issues (including breaking changes), run:
npm audit fix --force

Run `npm audit` for details.
Bash Verify packages installed
IN
npm ls openai @fastify/jwt bullmq axios @fastify/multipart @fastify/rate-limit 2>&1 | grep -E "^├|^└|deduped"

OUT
└─┬ @cardeko/api@1.0.0 -> ./apps/api
Bash Verify key packages can be imported
IN
node -e "import('openai').then(()=>console.log('openai ok')); import('bullmq').then(()=>console.log('bullmq ok')); import('@fastify/jwt').then(()=>console.log('jwt ok'))" 2>&1

OUT
bullmq ok
jwt ok
openai ok
Update Todos

Install packages: openai, @fastify/jwt, bullmq, axios, @fastify/multipart, @fastify/rate-limit

Update .env with all required env vars

Implement JWT auth plugin + real token generation in auth.ts

Implement OpenAI GPT-4o caption service + wire into creative.ts

Implement BullMQ publish queue + workers for FB/IG/GMB

Implement Meta Graph API publishing service

Implement Google Business Profile publishing service

Wire dealer auth context into all routes (replace mock-id)
Write .env
42 lines
DATABASE_URL="postgresql://postgres:password@localhost:5432/socialgenie?schema=public"
REDIS_URL="redis://localhost:6379"

# JWT — generate a strong secret before deploying: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

JWT_SECRET="change-me-before-production-use-a-64-byte-random-string"
JWT_REFRESH_SECRET="change-me-refresh-secret-also-must-be-different"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="30d"

# OpenAI

OPENAI_API_KEY=""

# Meta / Facebook

META_APP_ID=""
META_APP_SECRET=""
META_WEBHOOK_VERIFY_TOKEN="cardeko_webhook_secret"

# Google OAuth

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3001/v1/platforms/callback/google"

# Twilio / MSG91 for OTP (leave empty to keep mock OTP=1234 in dev)

OTP_PROVIDER="" # "twilio" | "msg91" | "" (empty = mock)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""
MSG91_AUTH_KEY=""
MSG91_TEMPLATE_ID=""

# AWS S3 (for storing generated creatives)

AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="ap-south-1"
S3_BUCKET="socialgenie-assets"
CLOUDFRONT_DOMAIN=""

# App

PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
Update Todos

Install packages: openai, @fastify/jwt, bullmq, axios, @fastify/multipart, @fastify/rate-limit

Update .env with all required env vars

Implement JWT auth plugin + real token generation in auth.ts

Implement OpenAI GPT-4o caption service + wire into creative.ts

Implement BullMQ publish queue + workers for FB/IG/GMB

Implement Meta Graph API publishing service

Implement Google Business Profile publishing service

Wire dealer auth context into all routes (replace mock-id)
Now build out the core services and plugins:

Bash Create service/plugin/queue directories
IN
mkdir -p /Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api/src/{plugins,services,queues,workers}

OUT
(Bash completed with no output)
Write jwt.ts
39 lines
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fjwt from '@fastify/jwt';

export interface JwtPayload {
dealer_id: string;
phone: string;
}

declare module '@fastify/jwt' {
interface FastifyJWT {
payload: JwtPayload;
user: JwtPayload;
}
}

declare module 'fastify' {
interface FastifyInstance {
authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
}
}

export async function registerJwt(fastify: FastifyInstance) {
const secret = process.env['JWT_SECRET'];
if (!secret) throw new Error('JWT_SECRET env var is required');

await fastify.register(fjwt, {
secret,
sign: { expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m' },
});

fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
try {
await request.jwtVerify();
} catch {
return reply.code(401).send({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
}
});
}
Write openai.ts
200 lines
import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(): OpenAI {
if (!client) {
const apiKey = process.env['OPENAI_API_KEY'];
if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
client = new OpenAI({ apiKey });
}
return client;
}

export interface DealerContext {
name: string;
city: string;
brands: string[];
phone: string;
whatsapp: string;
language_preferences: string[];
}

export interface InventoryContext {
make?: string;
model?: string;
variant?: string;
price?: number;
features?: string[];
stock_count?: number;
}

export interface CaptionVariant {
caption_text: string;
hashtags: string[];
suggested_emoji: string[];
platform_notes: string;
style: 'punchy' | 'detailed' | 'emotional';
}

export interface GeneratedCaptions {
variants: [CaptionVariant, CaptionVariant, CaptionVariant];
hindi_variants?: [string, string, string];
}

const SYSTEM_PROMPT = `You are a social media marketing expert for Indian automobile dealerships.
You write captions that drive footfall, enquiries, and leads.

RULES:

1. Never invent or approximate prices. If no price provided, omit pricing entirely.
2. Never invent vehicle specifications. Only use provided data.
3. Include a clear call-to-action: visit showroom, call now, WhatsApp us.
4. Use the dealer's city name for local relevance.
5. Keep tone professional but warm — trusted local business, not a meme page.
6. If festival context is provided, weave it naturally — do not force it.
7. Generate exactly 3 variants:
   - "punchy": Short (under 60 words), bold, urgent. Best for Instagram.
   - "detailed": Informative (100-150 words), lists key details, EMI/price if available.
   - "emotional": Aspirational (80-120 words), connects the car to lifestyle/family/dreams.

OUTPUT FORMAT (valid JSON only, no markdown fences):
{
"variants": [
{ "caption_text": "...", "hashtags": ["#tag1",...], "suggested_emoji": ["🚗"], "platform_notes": "...", "style": "punchy" },
{ "caption_text": "...", "hashtags": ["#tag1",...], "suggested_emoji": ["✨"], "platform_notes": "...", "style": "detailed" },
{ "caption_text": "...", "hashtags": ["#tag1",...], "suggested_emoji": ["❤️"], "platform_notes": "...", "style": "emotional" }
]
}`;

export async function generateCaptions(
prompt: string,
dealer: DealerContext,
inventory?: InventoryContext,
festivalContext?: string,
): Promise<GeneratedCaptions> {
const openai = getClient();

const vehicleBlock = inventory
? `VEHICLE CONTEXT:

- Make/Model: ${inventory.make ?? ''} ${inventory.model ?? ''} ${inventory.variant ?? ''}
- Price: ${inventory.price ? `₹${(inventory.price / 100000).toFixed(2)} Lakhs (exact — do not approximate)` : 'not provided — omit pricing'}
- Key Features: ${inventory.features?.join(', ') ?? 'not provided'}
- Stock: ${inventory.stock_count ?? 'available'} units`
  : 'VEHICLE CONTEXT: Not provided — use prompt details only.';

  const userMessage = `DEALER CONTEXT:

- Name: ${dealer.name}
- City: ${dealer.city}
- Brand(s): ${dealer.brands.join(', ')}
- Phone: ${dealer.phone}
- WhatsApp: ${dealer.whatsapp}

${vehicleBlock}
${festivalContext ? `\nFESTIVAL CONTEXT: ${festivalContext}` : ''}

DEALER PROMPT: "${prompt}"

Generate 3 caption variants as specified.`;

const response = await openai.chat.completions.create({
model: 'gpt-4o',
messages: [
{ role: 'system', content: SYSTEM_PROMPT },
{ role: 'user', content: userMessage },
],
temperature: 0.8,
max_tokens: 1500,
response_format: { type: 'json_object' },
});

const content = response.choices[0]?.message?.content;
if (!content) throw new Error('Empty response from OpenAI');

const parsed = JSON.parse(content) as { variants: [CaptionVariant, CaptionVariant, CaptionVariant] };

// Generate Hindi variants if dealer has Hindi preference
let hindi_variants: [string, string, string] | undefined;
if (dealer.language_preferences.includes('hi')) {
hindi_variants = await generateHindiVariants(openai, parsed.variants, dealer);
}

return { variants: parsed.variants, hindi_variants };
}

async function generateHindiVariants(
openai: OpenAI,
variants: CaptionVariant[],
dealer: DealerContext,
): Promise<[string, string, string]> {
const response = await openai.chat.completions.create({
model: 'gpt-4o',
messages: [
{
role: 'system',
content: `You are a Hindi copywriter for Indian automobile dealerships in ${dealer.city}.
Generate captions NATIVELY in Hindi — do NOT translate from English.
Use idioms, phrasing, and expressions natural to Hindi-speaking automobile buyers.
Keep the same intent and call-to-action as the English version.
Return JSON: { "hi_0": "...", "hi_1": "...", "hi_2": "..." }`,
},
{
role: 'user',
content: `Create Hindi versions of these 3 captions for ${dealer.name}, ${dealer.city}:
0: ${variants[0]?.caption_text ?? ''}
1: ${variants[1]?.caption_text ?? ''}
2: ${variants[2]?.caption_text ?? ''}`,
},
],
temperature: 0.7,
max_tokens: 1000,
response_format: { type: 'json_object' },
});

const content = response.choices[0]?.message?.content;
if (!content) return ['', '', ''];
const parsed = JSON.parse(content) as { hi_0: string; hi_1: string; hi_2: string };
return [parsed.hi_0 ?? '', parsed.hi_1 ?? '', parsed.hi_2 ?? ''];
}

export async function generateInboxReply(
messageText: string,
sentiment: string,
dealer: DealerContext,
messageType: 'comment' | 'dm' | 'review',
inventory?: { make: string; model: string; price?: number }[],
): Promise<string> {
const openai = getClient();

const maxWords = messageType === 'comment' ? 80 : 180;

const response = await openai.chat.completions.create({
model: 'gpt-4o',
messages: [
{
role: 'system',
content: `You are a helpful customer service assistant for ${dealer.name}, an automobile dealership in ${dealer.city}.

RULES:

1. Be polite, professional, and helpful.
2. If the customer asks about a specific vehicle and inventory data is provided, include basic info.
3. If the customer is complaining, acknowledge their concern sincerely and offer a callback from the manager.
4. Never make promises about pricing or discounts unless provided.
5. Always include a CTA: visit showroom, call ${dealer.phone}, or WhatsApp ${dealer.whatsapp}.
6. Keep the response under ${maxWords} words.
7. Match the language of the customer's message (Hindi reply for Hindi message, etc.).
8. SENTIMENT: ${sentiment}. For negative sentiment, lead with a sincere apology.

Return only the reply text — no JSON, no labels.`,
      },
      {
        role: 'user',
        content: `Customer ${messageType}: "${messageText}"${inventory && inventory.length > 0 ? `\n\nAvailable inventory context: ${inventory.map((i) => `${i.make} ${i.model}${i.price ? ` at ₹${(i.price / 100000).toFixed(2)}L` : ''}`).join(', ')}` : ''}`,
},
],
temperature: 0.6,
max_tokens: 300,
});

return response.choices[0]?.message?.content?.trim() ?? '';
}
Write meta.ts
142 lines
import axios from 'axios';

const META_GRAPH_BASE = 'https://graph.facebook.com/v19.0';

export interface MetaPublishResult {
post_id: string;
url: string;
}

// ─── Facebook ────────────────────────────────────────────────────────────────

export async function publishToFacebook(
pageId: string,
accessToken: string,
imageUrl: string,
caption: string,
): Promise<MetaPublishResult> {
const response = await axios.post<{ id: string }>(
`${META_GRAPH_BASE}/${pageId}/photos`,
{ url: imageUrl, message: caption, access_token: accessToken },
);
return {
post_id: response.data.id,
url: `https://www.facebook.com/${pageId}/posts/${response.data.id}`,
};
}

// ─── Instagram (two-step) ─────────────────────────────────────────────────────

export async function publishToInstagram(
igUserId: string,
accessToken: string,
imageUrl: string,
caption: string,
): Promise<MetaPublishResult> {
// Step 1 — create media container
const containerRes = await axios.post<{ id: string }>(
`${META_GRAPH_BASE}/${igUserId}/media`,
{ image_url: imageUrl, caption, access_token: accessToken },
);
const creationId = containerRes.data.id;

// Step 2 — publish the container
const publishRes = await axios.post<{ id: string }>(
`${META_GRAPH_BASE}/${igUserId}/media_publish`,
{ creation_id: creationId, access_token: accessToken },
);

return {
post_id: publishRes.data.id,
url: `https://www.instagram.com/p/${publishRes.data.id}/`,
};
}

// ─── Token management ─────────────────────────────────────────────────────────

export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{
access_token: string;
expires_in: number;
}> {
const appId = process.env['META_APP_ID'];
const appSecret = process.env['META_APP_SECRET'];
if (!appId || !appSecret) throw new Error('META_APP_ID and META_APP_SECRET must be set');

const res = await axios.get<{ access_token: string; expires_in: number }>(
`${META_GRAPH_BASE}/oauth/access_token`,
{
params: {
grant_type: 'fb_exchange_token',
client_id: appId,
client_secret: appSecret,
fb_exchange_token: shortLivedToken,
},
},
);
return res.data;
}

export async function getPageAccessToken(userAccessToken: string, pageId: string): Promise<string> {
const res = await axios.get<{ access_token: string }>(
`${META_GRAPH_BASE}/${pageId}`,
{ params: { fields: 'access_token', access_token: userAccessToken } },
);
return res.data.access_token;
}

// ─── Post metrics ─────────────────────────────────────────────────────────────

export async function fetchFacebookPostMetrics(
postId: string,
accessToken: string,
): Promise<{ reach: number; likes: number; comments: number; shares: number }> {
const res = await axios.get<{
insights: { data: Array<{ name: string; values: Array<{ value: number }> }> };
likes: { summary: { total_count: number } };
shares: { count: number };
comments: { summary: { total_count: number } };
}>(
`${META_GRAPH_BASE}/${postId}`,
{
params: {
fields: 'insights.metric(post_reach),likes.summary(true),shares,comments.summary(true)',
access_token: accessToken,
},
},
);

const reach = res.data.insights?.data?.[0]?.values?.[0]?.value ?? 0;
return {
reach,
likes: res.data.likes?.summary?.total_count ?? 0,
comments: res.data.comments?.summary?.total_count ?? 0,
shares: res.data.shares?.count ?? 0,
};
}

export async function fetchInstagramPostMetrics(
mediaId: string,
accessToken: string,
): Promise<{ reach: number; likes: number; comments: number; saved: number }> {
const res = await axios.get<{
reach: number;
like_count: number;
comments_count: number;
saved: number;
}>(
`${META_GRAPH_BASE}/${mediaId}/insights`,
{
params: {
metric: 'reach,like_count,comments_count,saved',
access_token: accessToken,
},
},
);
return {
reach: res.data.reach ?? 0,
likes: res.data.like_count ?? 0,
comments: res.data.comments_count ?? 0,
saved: res.data.saved ?? 0,
};
}
Write gmb.ts
94 lines
import axios from 'axios';

const GMB_BASE = 'https://mybusiness.googleapis.com/v4';

export interface GmbPublishResult {
post_id: string;
url: string;
}

export async function publishToGmb(
locationName: string, // format: "accounts/{accountId}/locations/{locationId}"
accessToken: string,
imageUrl: string,
summary: string,
callToAction?: { actionType: 'CALL' | 'LEARN_MORE' | 'ORDER'; url?: string; phone?: string },
): Promise<GmbPublishResult> {
const body: Record<string, unknown> = {
languageCode: 'en',
summary,
media: [{ mediaFormat: 'PHOTO', sourceUrl: imageUrl }],
};

if (callToAction) {
body['callToAction'] = callToAction.actionType === 'CALL'
? { actionType: 'CALL', url: `tel:${callToAction.phone ?? ''}` }
: { actionType: callToAction.actionType, url: callToAction.url ?? '' };
}

const res = await axios.post<{ name: string }>(
`${GMB_BASE}/${locationName}/localPosts`,
body,
{ headers: { Authorization: `Bearer ${accessToken}` } },
);

return {
post_id: res.data.name,
url: `https://business.google.com/`,
};
}

export async function fetchGmbPostMetrics(
postName: string, // full resource name from GMB
accessToken: string,
): Promise<{ views: number; clicks: number; direction_requests: number }> {
const res = await axios.get<{
localPostMetrics: Array<{ metricValue: Array<{ metric: string; totalValue: { value: string } }> }>;
}>(
`${GMB_BASE}/${postName}/insights`,
{ headers: { Authorization: `Bearer ${accessToken}` } },
);

let views = 0, clicks = 0, direction_requests = 0;
for (const m of res.data.localPostMetrics?.[0]?.metricValue ?? []) {
const val = parseInt(m.totalValue?.value ?? '0');
if (m.metric === 'LOCAL_POST_VIEWS_SEARCH') views = val;
if (m.metric === 'LOCAL_POST_ACTIONS_CALL_TO_ACTION') clicks = val;
if (m.metric === 'QUERIES_DIRECT') direction_requests = val;
}
return { views, clicks, direction_requests };
}

export async function fetchGmbReviews(
locationName: string,
accessToken: string,
pageToken?: string,
): Promise<{
reviews: Array<{ name: string; reviewer: { displayName: string }; starRating: string; comment: string; createTime: string }>;
nextPageToken?: string;
}> {
const res = await axios.get<{
reviews: Array<{ name: string; reviewer: { displayName: string }; starRating: string; comment: string; createTime: string }>;
nextPageToken?: string;
}>(
`${GMB_BASE}/${locationName}/reviews`,
{
params: pageToken ? { pageToken } : {},
headers: { Authorization: `Bearer ${accessToken}` },
},
);
return { reviews: res.data.reviews ?? [], nextPageToken: res.data.nextPageToken };
}

export async function replyToGmbReview(
reviewName: string, // "accounts/.../locations/.../reviews/..."
accessToken: string,
replyText: string,
): Promise<void> {
await axios.put(
`${GMB_BASE}/${reviewName}/reply`,
{ comment: replyText },
{ headers: { Authorization: `Bearer ${accessToken}` } },
);
}
Now build the BullMQ queue and workers:

Write index.ts
69 lines
import { Queue } from 'bullmq';

const redisConnection = {
host: (process.env['REDIS_URL'] ?? 'redis://localhost:6379').replace('redis://', '').split(':')[0] ?? 'localhost',
port: parseInt((process.env['REDIS_URL'] ?? 'redis://localhost:6379').split(':')[2] ?? '6379'),
};

// ─── Queues ────────────────────────────────────────────────────────────────────

export const publishQueue = new Queue('publish', { connection: redisConnection });
export const metricsQueue = new Queue('metrics', { connection: redisConnection });
export const inboxPollQueue = new Queue('inbox-poll', { connection: redisConnection });
export const captionQueue = new Queue('caption', { connection: redisConnection });

// ─── Job type definitions ──────────────────────────────────────────────────────

export interface PublishJobData {
post_id: string;
dealer_id: string;
platform: 'facebook' | 'instagram' | 'gmb';
image_url: string;
caption: string;
page_id?: string;
ig_user_id?: string;
gmb_location_name?: string;
access_token: string;
dealer_phone?: string;
dealer_whatsapp?: string;
}

export interface MetricsJobData {
post_id: string;
dealer_id: string;
platform: 'facebook' | 'instagram' | 'gmb';
platform_post_id: string;
access_token: string;
}

export interface InboxPollJobData {
dealer_id: string;
platform: 'facebook' | 'instagram' | 'google';
platform_account_id: string;
access_token: string;
}

export interface CaptionJobData {
generation_id: string;
dealer_id: string;
prompt: string;
dealer_context: {
name: string;
city: string;
brands: string[];
phone: string;
whatsapp: string;
language_preferences: string[];
};
inventory_context?: {
make?: string;
model?: string;
variant?: string;
price?: number;
features?: string[];
stock_count?: number;
};
}

export { redisConnection };
Write publishWorker.ts
110 lines
import { Worker, type Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redisConnection, type PublishJobData } from '../queues/index.js';
import { publishToFacebook, publishToInstagram } from '../services/meta.js';
import { publishToGmb } from '../services/gmb.js';

const prisma = new PrismaClient();

export function startPublishWorker() {
const worker = new Worker<PublishJobData>(
'publish',
async (job: Job<PublishJobData>) => {
const { post_id, dealer_id, platform, image_url, caption, access_token } = job.data;

      await prisma.post.update({
        where: { id: post_id },
        data: { status: 'publishing' },
      });

      let platformPostId: string;
      let platformUrl: string;

      try {
        if (platform === 'facebook') {
          const pageId = job.data.page_id;
          if (!pageId) throw new Error('page_id required for Facebook publish');
          const result = await publishToFacebook(pageId, access_token, image_url, caption);
          platformPostId = result.post_id;
          platformUrl = result.url;

        } else if (platform === 'instagram') {
          const igUserId = job.data.ig_user_id;
          if (!igUserId) throw new Error('ig_user_id required for Instagram publish');
          const result = await publishToInstagram(igUserId, access_token, image_url, caption);
          platformPostId = result.post_id;
          platformUrl = result.url;

        } else if (platform === 'gmb') {
          const locationName = job.data.gmb_location_name;
          if (!locationName) throw new Error('gmb_location_name required for GMB publish');
          const result = await publishToGmb(
            locationName,
            access_token,
            image_url,
            caption.slice(0, 1500),  // GMB limit
            { actionType: 'CALL', phone: job.data.dealer_phone },
          );
          platformPostId = result.post_id;
          platformUrl = result.url;

        } else {
          throw new Error(`Unknown platform: ${platform}`);
        }

        // Persist the publish result
        const existing = await prisma.post.findUnique({ where: { id: post_id } });
        const prevResults = (existing?.publish_results as Record<string, unknown> | null) ?? {};
        await prisma.post.update({
          where: { id: post_id },
          data: {
            status: 'published',
            published_at: new Date(),
            publish_results: {
              ...prevResults,
              [platform]: { post_id: platformPostId, url: platformUrl, published_at: new Date().toISOString() },
            },
          },
        });

        console.log(`[publish-worker] ${platform} post ${platformPostId} published for dealer ${dealer_id}`);
        return { platform, post_id: platformPostId, url: platformUrl };

      } catch (err) {
        // Mark this platform as failed in publish_results
        const existing = await prisma.post.findUnique({ where: { id: post_id } });
        const prevResults = (existing?.publish_results as Record<string, unknown> | null) ?? {};
        await prisma.post.update({
          where: { id: post_id },
          data: {
            publish_results: {
              ...prevResults,
              [platform]: { error: (err as Error).message, failed_at: new Date().toISOString() },
            },
          },
        });
        throw err; // let BullMQ handle retries
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
      // Retry 3 times with exponential backoff: 1min, 5min, 15min
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 60_000 },
      },
    },

);

worker.on('failed', async (job, err) => {
if (!job) return;
const { post_id, platform } = job.data;
console.error(`[publish-worker] FINAL FAILURE platform=${platform} post=${post_id}:`, err.message);
// TODO: send push notification to dealer
});

console.log('[publish-worker] started');
return worker;
}
Write metricsWorker.ts
71 lines
import { Worker, type Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redisConnection, metricsQueue, type MetricsJobData } from '../queues/index.js';
import { fetchFacebookPostMetrics, fetchInstagramPostMetrics } from '../services/meta.js';
import { fetchGmbPostMetrics } from '../services/gmb.js';

const prisma = new PrismaClient();

export function startMetricsWorker() {
const worker = new Worker<MetricsJobData>(
'metrics',
async (job: Job<MetricsJobData>) => {
const { post_id, platform, platform_post_id, access_token } = job.data;

      let newMetrics: Record<string, unknown> = {};

      if (platform === 'facebook') {
        newMetrics = await fetchFacebookPostMetrics(platform_post_id, access_token);
      } else if (platform === 'instagram') {
        newMetrics = await fetchInstagramPostMetrics(platform_post_id, access_token);
      } else if (platform === 'gmb') {
        newMetrics = await fetchGmbPostMetrics(platform_post_id, access_token);
      }

      const existing = await prisma.post.findUnique({ where: { id: post_id } });
      const prevMetrics = (existing?.metrics as Record<string, unknown> | null) ?? {};

      await prisma.post.update({
        where: { id: post_id },
        data: {
          metrics: { ...prevMetrics, [platform]: newMetrics },
          metrics_last_fetched: new Date(),
        },
      });

      console.log(`[metrics-worker] updated ${platform} metrics for post ${post_id}`);
    },
    { connection: redisConnection, concurrency: 10 },

);

worker.on('failed', (job, err) => {
console.error(`[metrics-worker] failed job ${job?.id}:`, err.message);
});

console.log('[metrics-worker] started');
return worker;
}

// Schedule recurring metrics collection for a newly published post
export async function scheduleMetricsPolling(
postId: string,
dealerId: string,
platform: MetricsJobData['platform'],
platformPostId: string,
accessToken: string,
) {
const now = Date.now();
const SIX*HOURS = 6 * 60 _ 60 _ 1000;
const ONE*DAY = 24 * 60 _ 60 _ 1000;

const baseJob = { post_id: postId, dealer_id: dealerId, platform, platform_post_id: platformPostId, access_token: accessToken };

// Poll every 6h for first 7 days (28 jobs), then daily for 30 days (30 jobs)
for (let i = 1; i <= 28; i++) {
await metricsQueue.add(`metrics-${postId}-${platform}-${i}h`, baseJob, { delay: i _ SIX_HOURS - now % SIX_HOURS });
}
for (let i = 1; i <= 30; i++) {
await metricsQueue.add(`metrics-${postId}-${platform}-day${i}`, baseJob, { delay: 7 _ ONE_DAY + i \* ONE_DAY });
}
}
Now wire everything into the real route handlers:

Write auth.ts
130 lines
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// OTP store — in production use Redis with 10-min TTL
const otpStore = new Map<string, { otp: string; expires: number }>();

function generateOtp(): string {
return Math.floor(100000 + Math.random() \* 900000).toString();
}

async function sendOtp(phone: string, otp: string): Promise<void> {
const provider = process.env['OTP_PROVIDER'];

if (!provider || process.env['NODE_ENV'] === 'development') {
// Dev mode: log OTP and accept '1234' as universal code
console.log(`[OTP] ${phone} → ${otp} (dev mode, use 1234 to bypass)`);
return;
}

if (provider === 'twilio') {
const { default: twilio } = await import('twilio');
const client = twilio(
process.env['TWILIO_ACCOUNT_SID'],
process.env['TWILIO_AUTH_TOKEN'],
);
await client.messages.create({
body: `Your Cardeko Social AI OTP is ${otp}. Valid for 10 minutes.`,
from: process.env['TWILIO_PHONE_NUMBER'],
to: phone,
});
return;
}

if (provider === 'msg91') {
const { default: axios } = await import('axios');
await axios.post('https://api.msg91.com/api/v5/otp', {
template_id: process.env['MSG91_TEMPLATE_ID'],
mobile: phone.replace('+', ''),
authkey: process.env['MSG91_AUTH_KEY'],
otp,
});
}
}

export default async function authRoutes(fastify: FastifyInstance) {
// POST /v1/auth/otp/send
fastify.post('/otp/send', async (request, reply) => {
const { phone } = request.body as { phone?: string };
if (!phone || !/^\+?[0-9]{10,13}$/.test(phone.replace(/\s/g, ''))) {
return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'Valid phone number is required' } });
}

    const otp = generateOtp();
    otpStore.set(phone, { otp, expires: Date.now() + 10 * 60 * 1000 });

    try {
      await sendOtp(phone, otp);
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ error: { code: 'OTP_SEND_FAILED', message: 'Failed to send OTP' } });
    }

    return { success: true, message: `OTP sent to ${phone}` };

});

// POST /v1/auth/otp/verify
fastify.post('/otp/verify', async (request, reply) => {
const { phone, otp } = request.body as { phone?: string; otp?: string };
if (!phone || !otp) {
return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'phone and otp are required' } });
}

    // Dev bypass
    const isDev = process.env['NODE_ENV'] === 'development';
    const stored = otpStore.get(phone);
    const valid =
      (isDev && otp === '1234') ||
      (stored && stored.otp === otp && stored.expires > Date.now());

    if (!valid) {
      return reply.code(400).send({ error: { code: 'INVALID_OTP', message: 'Incorrect or expired OTP' } });
    }

    otpStore.delete(phone);

    // Upsert dealer record
    const dealer = await prisma.dealer.upsert({
      where: { phone },
      create: { phone, name: 'New Dealer', city: '', onboarding_step: 1 },
      update: {},
    });

    const payload = { dealer_id: dealer.id, phone: dealer.phone };
    const token = fastify.jwt.sign(payload, { expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m' });
    const refreshToken = fastify.jwt.sign(payload, { expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '30d' });

    return {
      token,
      refreshToken,
      dealer: {
        id: dealer.id,
        name: dealer.name,
        onboarding_completed: dealer.onboarding_completed,
        onboarding_step: dealer.onboarding_step,
      },
    };

});

// POST /v1/auth/refresh
fastify.post('/refresh', async (request, reply) => {
const { refreshToken } = request.body as { refreshToken?: string };
if (!refreshToken) {
return reply.code(400).send({ error: { code: 'MISSING_TOKEN', message: 'refreshToken is required' } });
}

    try {
      const payload = fastify.jwt.verify<{ dealer_id: string; phone: string }>(refreshToken);
      const token = fastify.jwt.sign(
        { dealer_id: payload.dealer_id, phone: payload.phone },
        { expiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m' },
      );
      return { token };
    } catch {
      return reply.code(401).send({ error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' } });
    }

});
}
Twilio isn't installed. I'll replace that SDK import with a direct REST call via axios (which is already installed):

Edit auth.ts
Added 2 lines
Now wire OpenAI into the creative route, and the publisher into the real queue:

Write creative.ts
144 lines
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { generateCaptions } from '../services/openai.js';

const prisma = new PrismaClient();

// Simple in-memory cache: key → {result, expires}
const captionCache = new Map<string, { result: unknown; expires: number }>();

export default async function creativeRoutes(fastify: FastifyInstance) {
// POST /v1/creatives/generate
fastify.post('/generate', {
preHandler: [fastify.authenticate],
}, async (request, reply) => {
const dealer_id = request.user.dealer_id;
const { prompt, platforms } = request.body as {
prompt: string;
platforms?: string[];
};

    if (!prompt?.trim()) {
      return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'prompt is required' } });
    }

    // Load dealer context
    const dealer = await prisma.dealer.findUnique({ where: { id: dealer_id } });
    if (!dealer) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Dealer not found' } });

    const dealerContext = {
      name: dealer.name,
      city: dealer.city,
      brands: (dealer.brands as string[] | null) ?? [],
      phone: dealer.contact_phone ?? dealer.phone,
      whatsapp: dealer.whatsapp_number ?? dealer.phone,
      language_preferences: dealer.language_preferences,
    };

    // Try to match vehicle from prompt against inventory
    let inventoryContext: Parameters<typeof generateCaptions>[2] | undefined;
    const words = prompt.toLowerCase().split(/\s+/);
    const vehicleMatch = await prisma.inventoryItem.findFirst({
      where: {
        dealer_id,
        status: 'in_stock',
        OR: words.map((w) => ({
          OR: [
            { make: { contains: w, mode: 'insensitive' } },
            { model: { contains: w, mode: 'insensitive' } },
          ],
        })),
      },
    });
    if (vehicleMatch) {
      inventoryContext = {
        make: vehicleMatch.make,
        model: vehicleMatch.model,
        variant: vehicleMatch.variant ?? undefined,
        price: vehicleMatch.price,
        features: [],
        stock_count: vehicleMatch.stock_count,
      };
    }

    // Cache key based on prompt + dealer city + vehicle
    const cacheKey = `${dealer_id}:${prompt}:${vehicleMatch?.id ?? 'none'}`;
    const cached = captionCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return { success: true, ...cached.result, cached: true };
    }

    // Generate captions — fall back to mock if API key not set
    let captions: Awaited<ReturnType<typeof generateCaptions>>;
    if (process.env['OPENAI_API_KEY']) {
      try {
        captions = await generateCaptions(prompt, dealerContext, inventoryContext);
      } catch (err) {
        fastify.log.error(err, 'OpenAI caption generation failed');
        return reply.code(500).send({ error: { code: 'AI_ERROR', message: 'Caption generation failed. Please try again.' } });
      }
    } else {
      // Dev fallback when no API key
      captions = {
        variants: [
          {
            caption_text: `${prompt} — Visit ${dealer.name} in ${dealer.city} today! Limited time offer. Call: ${dealer.contact_phone ?? dealer.phone}`,
            hashtags: [`#${dealer.city.replace(/\s/g,'')}`, '#CarDeals', '#AutoOffer'],
            suggested_emoji: ['🚗', '✨'],
            platform_notes: 'Works for all platforms',
            style: 'punchy',
          },
          {
            caption_text: `Looking for the best deal? ${prompt}. At ${dealer.name}, ${dealer.city}, we make car ownership easy. Zero down payment options available. Book your test drive today! Call us: ${dealer.contact_phone ?? dealer.phone}`,
            hashtags: [`#${dealer.city.replace(/\s/g,'')}`, '#CarDeals', '#TestDrive', '#AutoFinance'],
            suggested_emoji: ['🚗', '💰', '📞'],
            platform_notes: 'Ideal for Facebook long-form',
            style: 'detailed',
          },
          {
            caption_text: `Every journey begins with a dream. ${prompt}. Let ${dealer.name} make your dream a reality. Come visit us in ${dealer.city} — your perfect car is waiting. WhatsApp us: ${dealer.whatsapp_number ?? dealer.phone}`,
            hashtags: [`#${dealer.city.replace(/\s/g,'')}`, '#DreamCar', '#NewBeginnings'],
            suggested_emoji: ['❤️', '🌟'],
            platform_notes: 'Best for Instagram stories',
            style: 'emotional',
          },
        ],
      };
    }

    // Mock creative image URLs (real impl would use Sharp/Puppeteer + S3)
    const creatives = [
      { id: 'tpl_bold_banner', template_name: 'Bold Banner', thumbnail_url: null, platform_urls: { facebook: null, instagram: null, instagram_story: null, gmb: null } },
      { id: 'tpl_minimal', template_name: 'Minimal Showcase', thumbnail_url: null, platform_urls: { facebook: null, instagram: null, instagram_story: null, gmb: null } },
      { id: 'tpl_offer_card', template_name: 'Offer Card', thumbnail_url: null, platform_urls: { facebook: null, instagram: null, instagram_story: null, gmb: null } },
    ];

    const result = {
      captions: captions.variants,
      hindi_captions: captions.hindi_variants ?? null,
      creatives,
      inventory_matched: vehicleMatch
        ? { id: vehicleMatch.id, make: vehicleMatch.make, model: vehicleMatch.model, price: vehicleMatch.price }
        : null,
      platforms_requested: platforms ?? ['facebook', 'instagram', 'gmb'],
    };

    // Cache for 24 hours
    captionCache.set(cacheKey, { result, expires: Date.now() + 24 * 60 * 60 * 1000 });

    return { success: true, ...result, cached: false };

});

// POST /v1/creatives/prompts — list suggested prompts
fastify.get('/prompts', async (request, reply) => {
const { category, limit = '10' } = request.query as { category?: string; limit?: string };
const where = category ? { category, is_active: true } : { is_active: true };
const prompts = await prisma.prompt.findMany({
where,
orderBy: [{ usage_count: 'desc' }, { sort_order: 'asc' }],
take: parseInt(limit),
});
return { success: true, data: prompts };
});
}
Edit creative.ts
Modified
Edit creative.ts
Modified
Edit creative.ts
Modified
Now write the real publisher route:

Write publisher.ts
167 lines
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { publishQueue } from '../queues/index.js';
import type { PublishJobData } from '../queues/index.js';

const prisma = new PrismaClient();

export default async function publisherRoutes(fastify: FastifyInstance) {
// POST /v1/publisher/publish — publish immediately or schedule
fastify.post('/publish', {
preHandler: [fastify.authenticate],
}, async (request, reply) => {
const dealer_id = request.user.dealer_id;
const { post_id, platforms, scheduled_at } = request.body as {
post_id: string;
platforms: string[];
scheduled_at?: string; // ISO string — if present, schedule; otherwise publish now
};

    if (!post_id || !platforms?.length) {
      return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'post_id and platforms are required' } });
    }

    // Verify the post belongs to this dealer
    const post = await prisma.post.findFirst({ where: { id: post_id, dealer_id } });
    if (!post) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Post not found' } });

    // Load platform connections for this dealer
    const connections = await prisma.platformConnection.findMany({
      where: { dealer_id, is_connected: true },
    });
    const connMap = Object.fromEntries(connections.map((c) => [c.platform, c]));

    const delay = scheduled_at
      ? Math.max(0, new Date(scheduled_at).getTime() - Date.now())
      : 0;

    const jobIds: string[] = [];
    const skipped: string[] = [];

    for (const platform of platforms) {
      const conn = connMap[platform];
      if (!conn) {
        skipped.push(platform);
        continue;
      }

      // Build job payload
      const jobData: PublishJobData = {
        post_id,
        dealer_id,
        platform: platform as PublishJobData['platform'],
        image_url: ((post.creative_urls as Record<string, string> | null)?.[platform]) ?? '',
        caption: post.caption_text ?? '',
        access_token: conn.access_token,
      };

      if (platform === 'facebook') jobData.page_id = conn.platform_account_id;
      if (platform === 'instagram') jobData.ig_user_id = conn.platform_account_id;
      if (platform === 'gmb') jobData.gmb_location_name = conn.platform_account_id;

      const job = await publishQueue.add(`publish-${platform}-${post_id}`, jobData, {
        delay,
        attempts: 3,
        backoff: { type: 'exponential', delay: 60_000 },
      });

      if (job.id) jobIds.push(job.id);
    }

    // Update post status
    const newStatus = scheduled_at ? 'scheduled' : 'publishing';
    await prisma.post.update({
      where: { id: post_id },
      data: {
        status: newStatus,
        platforms,
        ...(scheduled_at ? { scheduled_at: new Date(scheduled_at) } : {}),
      },
    });

    return {
      success: true,
      status: newStatus,
      job_ids: jobIds,
      skipped_platforms: skipped,
      scheduled_at: scheduled_at ?? null,
    };

});

// GET /v1/publisher/status/:jobId
fastify.get('/status/:jobId', {
preHandler: [fastify.authenticate],
}, async (request, reply) => {
const { jobId } = request.params as { jobId: string };
const job = await publishQueue.getJob(jobId);
if (!job) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Job not found' } });

    const state = await job.getState();
    return {
      success: true,
      job_id: jobId,
      status: state,
      result: job.returnvalue ?? null,
      failed_reason: job.failedReason ?? null,
      attempts_made: job.attemptsMade,
    };

});

// GET /v1/publisher/calendar — posts for calendar view
fastify.get('/calendar', {
preHandler: [fastify.authenticate],
}, async (request, \_reply) => {
const dealer_id = request.user.dealer_id;
const { from, to } = request.query as { from?: string; to?: string };

    const where: Record<string, unknown> = { dealer_id };
    if (from || to) {
      where['scheduled_at'] = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const posts = await prisma.post.findMany({
      where: where as Parameters<typeof prisma.post.findMany>[0]['where'],
      orderBy: { scheduled_at: 'asc' },
      select: {
        id: true,
        prompt_text: true,
        caption_text: true,
        platforms: true,
        status: true,
        scheduled_at: true,
        published_at: true,
        creative_urls: true,
        metrics: true,
      },
    });

    return { success: true, data: posts };

});

// DELETE /v1/publisher/:postId — cancel scheduled post
fastify.delete('/:postId', {
preHandler: [fastify.authenticate],
}, async (request, reply) => {
const dealer_id = request.user.dealer_id;
const { postId } = request.params as { postId: string };

    const post = await prisma.post.findFirst({ where: { id: postId, dealer_id } });
    if (!post) return reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Post not found' } });
    if (post.status === 'published') {
      return reply.code(400).send({ error: { code: 'ALREADY_PUBLISHED', message: 'Cannot cancel a published post' } });
    }

    // Remove pending jobs from queue
    const jobs = await publishQueue.getJobs(['delayed', 'waiting']);
    for (const job of jobs) {
      if (job.data.post_id === postId) await job.remove();
    }

    await prisma.post.update({ where: { id: postId }, data: { status: 'draft', scheduled_at: null } });
    return { success: true };

});
}
Edit publisher.ts
Added 2 lines
Now wire up the JWT plugin and workers into index.ts, then update dealer and platform routes to use real auth:

Write index.ts
70 lines
import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';

import { registerJwt } from './plugins/jwt.js';
import { startPublishWorker } from './workers/publishWorker.js';
import { startMetricsWorker } from './workers/metricsWorker.js';

import authRoutes from './routes/auth.js';
import dealerRoutes from './routes/dealer.js';
import platformRoutes from './routes/platform.js';
import creativeRoutes from './routes/creative.js';
import publisherRoutes from './routes/publisher.js';
import inventoryRoutes from './routes/inventory.js';
import inboxRoutes from './routes/inbox.js';
import boostRoutes from './routes/boost.js';

const fastify = Fastify({ logger: true });

await fastify.register(cors, {
origin: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
credentials: true,
});

await fastify.register(rateLimit, {
max: 100,
timeWindow: '1 minute',
keyGenerator: (req) => req.ip,
});

await fastify.register(multipart, { limits: { fileSize: 10 _ 1024 _ 1024 } }); // 10 MB

await registerJwt(fastify);

// Routes
fastify.register(authRoutes, { prefix: '/v1/auth' });
fastify.register(dealerRoutes, { prefix: '/v1/dealer' });
fastify.register(platformRoutes, { prefix: '/v1/platforms' });
fastify.register(creativeRoutes, { prefix: '/v1/creatives' });
fastify.register(publisherRoutes, { prefix: '/v1/publisher' });
fastify.register(inventoryRoutes, { prefix: '/v1/inventory' });
fastify.register(inboxRoutes, { prefix: '/v1/inbox' });
fastify.register(boostRoutes, { prefix: '/v1/boost' });

fastify.get('/v1/health', async () => ({
status: 'ok',
service: 'Cardeko Social AI - API',
env: process.env['NODE_ENV'] ?? 'development',
}));

const start = async () => {
try {
const port = parseInt(process.env['PORT'] ?? '3001');
await fastify.listen({ port, host: '0.0.0.0' });

    // Start background workers (only if Redis is reachable)
    if (process.env['NODE_ENV'] !== 'test') {
      startPublishWorker();
      startMetricsWorker();
    }

} catch (err) {
fastify.log.error(err);
process.exit(1);
}
};

start();
Now update dealer and platform routes to use real auth + Prisma:

Write dealer.ts
83 lines
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function dealerRoutes(fastify: FastifyInstance) {
// GET /v1/dealer/profile
fastify.get('/profile', {
preHandler: [fastify.authenticate],
}, async (request, \_reply) => {
const dealer = await prisma.dealer.findUnique({
where: { id: request.user.dealer_id },
include: { platform_connections: { select: { platform: true, platform_account_name: true, is_connected: true, token_expires_at: true } } },
});
if (!dealer) return { error: { code: 'NOT_FOUND', message: 'Dealer not found' } };
return { success: true, profile: dealer };
});

// PUT /v1/dealer/profile
fastify.put('/profile', {
preHandler: [fastify.authenticate],
}, async (request, \_reply) => {
const dealer_id = request.user.dealer_id;
const body = request.body as {
name?: string;
city?: string;
state?: string;
brands?: string[];
contact_phone?: string;
whatsapp_number?: string;
primary_color?: string;
secondary_color?: string;
language_preferences?: string[];
region?: string;
logo_url?: string;
};

    const updated = await prisma.dealer.update({
      where: { id: dealer_id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.city !== undefined ? { city: body.city } : {}),
        ...(body.state !== undefined ? { state: body.state } : {}),
        ...(body.brands !== undefined ? { brands: body.brands } : {}),
        ...(body.contact_phone !== undefined ? { contact_phone: body.contact_phone } : {}),
        ...(body.whatsapp_number !== undefined ? { whatsapp_number: body.whatsapp_number } : {}),
        ...(body.primary_color !== undefined ? { primary_color: body.primary_color } : {}),
        ...(body.secondary_color !== undefined ? { secondary_color: body.secondary_color } : {}),
        ...(body.language_preferences !== undefined ? { language_preferences: body.language_preferences } : {}),
        ...(body.region !== undefined ? { region: body.region } : {}),
        ...(body.logo_url !== undefined ? { logo_url: body.logo_url } : {}),
      },
    });

    return { success: true, profile: updated };

});

// POST /v1/dealer/onboarding/complete
fastify.post('/onboarding/complete', {
preHandler: [fastify.authenticate],
}, async (request, \_reply) => {
const dealer_id = request.user.dealer_id;
const updated = await prisma.dealer.update({
where: { id: dealer_id },
data: { onboarding_completed: true, onboarding_step: 5 },
});
return { success: true, profile: updated };
});

// PATCH /v1/dealer/onboarding/step
fastify.patch('/onboarding/step', {
preHandler: [fastify.authenticate],
}, async (request, \_reply) => {
const dealer_id = request.user.dealer_id;
const { step } = request.body as { step: number };
const updated = await prisma.dealer.update({
where: { id: dealer_id },
data: { onboarding_step: step },
});
return { success: true, onboarding_step: updated.onboarding_step };
});
}
Write platform.ts
180 lines
import type { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { exchangeForLongLivedToken, getPageAccessToken } from '../services/meta.js';

const prisma = new PrismaClient();

const META_APP_ID = process.env['META_APP_ID'] ?? '';
const META_APP_SECRET = process.env['META_APP_SECRET'] ?? '';
const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'] ?? '';
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'] ?? '';
const GOOGLE_REDIRECT_URI = process.env['GOOGLE_REDIRECT_URI'] ?? 'http://localhost:3001/v1/platforms/callback/google';

export default async function platformRoutes(fastify: FastifyInstance) {
// GET /v1/platforms — list all connections for dealer
fastify.get('/', {
preHandler: [fastify.authenticate],
}, async (request, \_reply) => {
const connections = await prisma.platformConnection.findMany({
where: { dealer_id: request.user.dealer_id },
});
return { success: true, platforms: connections };
});

// GET /v1/platforms/connect/:platform — returns OAuth redirect URL
fastify.get('/connect/:platform', {
preHandler: [fastify.authenticate],
}, async (request, reply) => {
const { platform } = request.params as { platform: string };
const dealer_id = request.user.dealer_id;

    if (platform === 'facebook' || platform === 'instagram') {
      if (!META_APP_ID) return reply.code(500).send({ error: { code: 'CONFIG_ERROR', message: 'META_APP_ID not configured' } });
      const scopes = 'pages_manage_posts,pages_read_engagement,pages_manage_metadata,pages_messaging,instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_messages,ads_management';
      const redirectUri = `${process.env['FRONTEND_URL'] ?? 'http://localhost:5173'}/settings?platform=meta`;
      const state = Buffer.from(JSON.stringify({ dealer_id, platform })).toString('base64url');
      const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}`;
      return { success: true, redirect_url: url };
    }

    if (platform === 'gmb') {
      if (!GOOGLE_CLIENT_ID) return reply.code(500).send({ error: { code: 'CONFIG_ERROR', message: 'GOOGLE_CLIENT_ID not configured' } });
      const scopes = 'https://www.googleapis.com/auth/business.manage';
      const state = Buffer.from(JSON.stringify({ dealer_id })).toString('base64url');
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${state}`;
      return { success: true, redirect_url: url };
    }

    return reply.code(400).send({ error: { code: 'INVALID_PLATFORM', message: `Unknown platform: ${platform}` } });

});

// POST /v1/platforms/callback/meta — exchange Meta code for token
fastify.post('/callback/meta', async (request, reply) => {
const { code, state } = request.body as { code: string; state: string };
if (!code || !state) return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'code and state are required' } });

    let stateData: { dealer_id: string; platform: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch {
      return reply.code(400).send({ error: { code: 'INVALID_STATE', message: 'Invalid state parameter' } });
    }

    const redirectUri = `${process.env['FRONTEND_URL'] ?? 'http://localhost:5173'}/settings?platform=meta`;

    // Exchange code for short-lived user token
    const tokenRes = await axios.get<{ access_token: string }>('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: { client_id: META_APP_ID, client_secret: META_APP_SECRET, redirect_uri: redirectUri, code },
    });
    const shortLivedToken = tokenRes.data.access_token;

    // Exchange for long-lived token (60 days)
    const { access_token: longLivedToken, expires_in } = await exchangeForLongLivedToken(shortLivedToken);

    // Fetch pages this user manages
    const pagesRes = await axios.get<{ data: Array<{ id: string; name: string }> }>(
      'https://graph.facebook.com/v19.0/me/accounts',
      { params: { access_token: longLivedToken } },
    );
    const page = pagesRes.data.data[0];
    if (!page) return reply.code(400).send({ error: { code: 'NO_PAGE', message: 'No Facebook Page found for this account' } });

    // Get page-level access token (non-expiring)
    const pageToken = await getPageAccessToken(longLivedToken, page.id);
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Upsert Facebook connection
    await prisma.platformConnection.upsert({
      where: { dealer_id_platform: { dealer_id: stateData.dealer_id, platform: 'facebook' } },
      create: { dealer_id: stateData.dealer_id, platform: 'facebook', platform_account_id: page.id, platform_account_name: page.name, access_token: pageToken, token_expires_at: expiresAt, is_connected: true },
      update: { platform_account_id: page.id, platform_account_name: page.name, access_token: pageToken, token_expires_at: expiresAt, is_connected: true },
    });

    // Fetch connected IG business account
    const igRes = await axios.get<{ instagram_business_account?: { id: string } }>(
      `https://graph.facebook.com/v19.0/${page.id}`,
      { params: { fields: 'instagram_business_account', access_token: pageToken } },
    );
    const igId = igRes.data.instagram_business_account?.id;
    if (igId) {
      const igNameRes = await axios.get<{ username: string }>(`https://graph.facebook.com/v19.0/${igId}`, { params: { fields: 'username', access_token: pageToken } });
      await prisma.platformConnection.upsert({
        where: { dealer_id_platform: { dealer_id: stateData.dealer_id, platform: 'instagram' } },
        create: { dealer_id: stateData.dealer_id, platform: 'instagram', platform_account_id: igId, platform_account_name: `@${igNameRes.data.username}`, access_token: pageToken, token_expires_at: expiresAt, is_connected: true },
        update: { platform_account_id: igId, platform_account_name: `@${igNameRes.data.username}`, access_token: pageToken, token_expires_at: expiresAt, is_connected: true },
      });
    }

    return { success: true, page_name: page.name, instagram_connected: !!igId };

});

// POST /v1/platforms/callback/google — exchange Google code for token
fastify.post('/callback/google', async (request, reply) => {
const { code, state } = request.body as { code: string; state: string };
if (!code || !state) return reply.code(400).send({ error: { code: 'INVALID_INPUT', message: 'code and state are required' } });

    let stateData: { dealer_id: string };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch {
      return reply.code(400).send({ error: { code: 'INVALID_STATE', message: 'Invalid state parameter' } });
    }

    // Exchange code for tokens
    const tokenRes = await axios.post<{ access_token: string; refresh_token?: string; expires_in: number }>(
      'https://oauth2.googleapis.com/token',
      { code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, redirect_uri: GOOGLE_REDIRECT_URI, grant_type: 'authorization_code' },
    );
    const { access_token, refresh_token, expires_in } = tokenRes.data;

    // Fetch GMB account/location
    const accountsRes = await axios.get<{ accounts: Array<{ name: string; accountName: string }> }>(
      'https://mybusiness.googleapis.com/v4/accounts',
      { headers: { Authorization: `Bearer ${access_token}` } },
    );
    const account = accountsRes.data.accounts?.[0];
    if (!account) return reply.code(400).send({ error: { code: 'NO_GMB_ACCOUNT', message: 'No Google Business account found' } });

    const locationsRes = await axios.get<{ locations: Array<{ name: string; locationName: string }> }>(
      `https://mybusiness.googleapis.com/v4/${account.name}/locations`,
      { headers: { Authorization: `Bearer ${access_token}` } },
    );
    const location = locationsRes.data.locations?.[0];
    const locationName = location?.name ?? account.name;
    const displayName = location?.locationName ?? account.accountName;

    await prisma.platformConnection.upsert({
      where: { dealer_id_platform: { dealer_id: stateData.dealer_id, platform: 'gmb' } },
      create: {
        dealer_id: stateData.dealer_id, platform: 'gmb',
        platform_account_id: locationName, platform_account_name: displayName,
        access_token, refresh_token: refresh_token ?? null,
        token_expires_at: new Date(Date.now() + expires_in * 1000),
        is_connected: true,
      },
      update: {
        platform_account_id: locationName, platform_account_name: displayName,
        access_token, ...(refresh_token ? { refresh_token } : {}),
        token_expires_at: new Date(Date.now() + expires_in * 1000),
        is_connected: true,
      },
    });

    return { success: true, location_name: displayName };

});

// DELETE /v1/platforms/:platform — disconnect
fastify.delete('/:platform', {
preHandler: [fastify.authenticate],
}, async (request, \_reply) => {
const dealer_id = request.user.dealer_id;
const { platform } = request.params as { platform: string };
await prisma.platformConnection.updateMany({
where: { dealer_id, platform },
data: { is_connected: false },
});
return { success: true, message: `${platform} disconnected` };
});
}
resume the work
Bash TypeScript check API
IN
cd /Users/santoshsharma/Documents/Code_Antigravity/SocialGenie/apps/api && npx tsc --noEmit 2>&1

OUT
Exit code 2
src/services/gmb.ts(80,3): error TS2375: Type '{ reviews: { name: string; reviewer: { displayName: string; }; starRating: string; comment: string; createTime: string; }[]; nextPageToken: string | undefined; }' is not assignable to type '{ reviews: { name: string; reviewer: { displayName: string; }; starRating: string; comment: string; createTime: string; }[]; nextPageToken?: string; }' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
Types of property 'nextPageToken' are incompatible.
Type 'string | undefined' is not assignable to type 'string'.
Type 'undefined' is not assignable to type 'string'.
src/services/openai.ts(121,3): error TS2375: Type '{ variants: [CaptionVariant, CaptionVariant, CaptionVariant]; hindi_variants: [string, string, string] | undefined; }' is not assignable to type 'GeneratedCaptions' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
Types of property 'hindi_variants' are incompatible.
Type '[string, string, string] | undefined' is not assignable to type '[string, string, string]'.
Type 'undefined' is not assignable to type '[string, string, string]'.
src/workers/metricsWorker.ts(31,11): error TS2322: Type '{ [x: string]: unknown; }' is not assignable to type 'NullableJsonNullValueInput | InputJsonValue'.
Type '{ [x: string]: unknown; }' is not assignable to type 'string'.
src/workers/publishWorker.ts(46,13): error TS2379: Argument of type '{ actionType: "CALL"; phone: string | undefined; }' is not assignable to parameter of type '{ actionType: "CALL" | "LEARN_MORE" | "ORDER"; url?: string; phone?: string; }' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
Types of property 'phone' are incompatible.
Type 'string | undefined' is not assignable to type 'string'.
Type 'undefined' is not assignable to type 'string'.
src/workers/publishWorker.ts(63,13): error TS2322: Type '{ [x: string]: unknown; }' is not assignable to type 'NullableJsonNullValueInput | InputJsonValue'.
Type '{ [x: string]: unknown; }' is not assignable to type 'string'.
src/workers/publishWorker.ts(80,13): error TS2322: Type '{ [x: string]: unknown; }' is not assignable to type 'NullableJsonNullValueInput | InputJsonValue'.
Type '{ [x: string]: unknown; }' is not assignable to type 'string'.
src/workers/publishWorker.ts(93,7): error TS2353: Object literal may only specify known properties, and 'defaultJobOptions' does not exist in type 'WorkerOptions'.
7 errors to fix. Let me address them all:

Read gmb.ts (lines 71-90)
Read openai.ts (lines 111-130)
Read publishWorker.ts
Read metricsWorker.ts (lines 26-40)
You've hit your limit · resets 3:30am (Asia/Calcutta)

# Session Notes

## Date

2026-03-23

## Source Of Truth

- `PROMPT.md` is the active product spec.
- `SESSION.md` had been empty at resume time.

## Current App State

- Web app is present under `apps/web` and builds successfully.
- API app is present under `apps/api` with Fastify, Prisma, BullMQ, and route scaffolding for auth, creative, publisher, inventory, inbox, boost, dealer, and platform flows.
- Workspace is not a git repository from the current folder context, so continuity has to come from local files rather than `git status`.

## Work Completed In This Session

- Read `PROMPT.md` and confirmed the product scope is centered on Cardeko Social AI for dealership marketing workflows.
- Verified the frontend build passes with `npm run build` in `apps/web`.
- Fixed API TypeScript build blockers in strict mode:
  - `apps/api/src/services/gmb.ts`
  - `apps/api/src/services/openai.ts`
  - `apps/api/src/workers/metricsWorker.ts`
  - `apps/api/src/workers/publishWorker.ts`
- Rebuilt the API successfully with `npm run build` in `apps/api`.

## Notes On Fixes

- Adjusted exact-optional-property handling so optional fields are omitted instead of set to `undefined`.
- Normalized Prisma JSON writes in workers to satisfy strict typing.
- Removed invalid `defaultJobOptions` usage from the BullMQ worker config; retry settings remain applied at job enqueue time in publisher routes.
- GMB publish call now only sends a phone CTA when a dealer phone is actually available.

## Recommended Next Slice

- Connect the web `Create Post` and `Calendar` pages to live API data instead of mocked state.
- Then wire publish/schedule flows end to end so P0 create-and-publish behavior is functional beyond UI demos.

Oh my gosh... I am so sorry! That white screen is 100% my fault. I gave you the wrong typed URL! 🤦‍♂️

The page is actually hosted at /create, not /create-post!

Because I gave you a link that didn't exist in the router, React violently crashed trying to load it and showed you a blank white screen. I've just updated the router code so that from now on, any bad links will just safely redirect you back to the Dashboard instead of crashing the app.

Please navigate directly to http://localhost:5173/create to test the AI page!

getting this error

Diagnosing API Data Error
Discovered why Generate crashed: the frontend lacks an auth token, causing the protected API endpoint to reject the request unconditionally. Bypassing auth for local dev.

Files Edited
Progress Updates
1
Investigating the backend database state and authentication flow to understand why the generate endpoint is failing.

2
Running Prisma check to verify if the dealer database is seeded or empty.

3
Checking the auth plugin to see if the API requires a hardcoded dev token or JWT that the frontend is missing.

4
Injecting a development authentication bypass into the Fastify backend to automatically mock a dealer session, since the frontend has no login route yet.

Fixing Prisma Default Seed Error
Injected development auth bypass into backend. Fixing a minor TypeScript schema mismatch in the dynamically generated mock user.

Progress Updates
1
Correcting the mock Dealer creation payload to match the database Prisma schema properly.

can you update the latest changes in session.md file
Error
You have exhausted your capacity on this mod
