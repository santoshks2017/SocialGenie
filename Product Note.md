# Cardeko Social AI - Product Guide

### 🚗 The Elevator Pitch (For Product & Business)

**What is this app?**
Cardeko Social AI is a "Dealer Growth Engine." It replaces the need for a human social media manager or a marketing agency for Indian auto dealerships.

In 10 minutes a day, a dealer can type a simple prompt (e.g., _"Weekend offer on Maruti Brezza"_), and the AI automatically generates the caption, designs the image, pulls the real car price from their inventory, and publishes it to Facebook, Instagram, and Google My Business (GMB). It also handles ad-boosting and gives AI-suggested replies for incoming customer messages.

---

### 🛠️ The Tech Stack (For Developers)

The project is built as a **Full-Stack TypeScript Monorepo** (meaning both frontend and backend live in one codebase but are split into packages):

- **Frontend (`apps/web`)**: React 18/19, Vite, Tailwind CSS. It is a mobile-first web app because dealers mostly use their phones on the showroom floor.
- **Backend (`apps/api`)**: Node.js using **Fastify** (a very fast web framework, similar to Express).
- **Database**: PostgreSQL managed by **Prisma** (an ORM that makes talking to the database easy and type-safe).
- **Background Jobs**: **BullMQ** + **Redis**. This is crucial for scheduling posts in the future or running heavy AI tasks without freezing the app.

---

### 🧩 Module-by-Module Breakdown

Here is how the app's features map to the codebase.

#### 1. The AI Creative Engine (Creating a Post)

- **What it does (UI)**: The dealer goes to the "Create Post" screen, clicks a quick-prompt chip (like _"New Arrival"_), and the app spits out 3 different AI-generated caption variants and image designs.
- **Frontend**: `apps/web/src/pages/CreatePost.tsx`
- **Backend**: `apps/api/src/routes/creative.ts` & `services/openai.ts`
  - When the UI asks for a post, `creative.ts` intercepts it, looks up the dealer's specific inventory, and sends the data to OpenAI's GPT-4o model via `openai.ts`.

#### 2. Multi-Platform Publisher & Calendar

- **What it does (UI)**: Once a post is generated, the dealer hits "Publish Now" or "Schedule." They can view all upcoming posts in a weekly/monthly grid.
- **Frontend**: `apps/web/src/pages/Calendar.tsx` and `CreatePost.tsx`
- **Backend**: `apps/api/src/routes/publisher.ts` & `workers/publishWorker.ts`
  - If scheduled, it gets saved to the database and adds a job to **BullMQ**. When the time comes, `publishWorker.ts` wakes up and pushes the post to Meta and Google.

#### 3. One-Click Boost (Ad Campaigns)

- **What it does (UI)**: Bypasses the complicated Meta Ads Manager. Dealers pick a budget, a duration, and the AI automatically targets "auto-intenders" within a 25km radius.
- **Frontend**: `apps/web/src/pages/Boost.tsx`
- **Backend**: `apps/api/src/routes/boost.ts`

#### 4. Unified Inbox

- **What it does (UI)**: Combines Facebook comments, Instagram DMs, and Google Reviews into one single chat interface. It also auto-generates AI replies and puts a giant red warning on angry/negative reviews.
- **Frontend**: `apps/web/src/pages/InboxPage.tsx`
- **Backend**: `apps/api/src/routes/inbox.ts`

#### 5. Inventory Connector

- **What it does (UI)**: A place for the dealer to see all their cars. They can drag-and-drop a CSV file to bulk-upload their current stock.
- **Frontend**: `apps/web/src/pages/Inventory.tsx`
- **Backend**: `apps/api/src/routes/inventory.ts`

#### 6. Analytics & Lead Attribution

- **What it does (UI)**: A dashboard showing how many leads came from Facebook vs WhatsApp, top-performing posts, and cost-per-lead.
- **Frontend**: `apps/web/src/pages/Analytics.tsx`
- **Backend**: `workers/metricsWorker.ts`

#### 7. User Authentication & Settings

- **What it does (UI)**: Dealers log in via phone OTP (No passwords!). They can manage their brand colors, logo, and connect their social media accounts.
- **Frontend**: `apps/web/src/pages/SettingsPage.tsx`, `Onboarding.tsx`
- **Backend**: `apps/api/src/routes/auth.ts`, `routes/users.ts`, `routes/platform.ts`

---

### 💡 Summary: How to Explain Your Work

If someone asks you to walk them through the code, use this flow:

1. _"We have a React/Vite frontend that acts as the dealership's dashboard."_

2. _"When a dealer wants to post, the frontend talks to our Fastify Node.js API."_

3. _"Our API acts as the brain. It talks to the **Prisma Postgres Database** to check what cars are in stock, and then feeds that context to **OpenAI** to generate smart, locally relevant captions."_

4. _"Instead of freezing the app while posting to 3 different platforms, we dump the task into a **BullMQ Redis Queue**. Background workers securely take that task and push it to the Meta and Google APIs."_

5. _"At the same time, we have webhooks listening for incoming DMs and comments, passing them through AI for suggested replies, and piping them straight into our Unified Inbox UI."_
