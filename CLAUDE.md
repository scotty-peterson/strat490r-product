# CLAUDE.md — The Dead Evening

## Product Overview

**The Dead Evening** is a mobile-first web app that helps college couples in Provo, UT find something genuinely good to do together on a weeknight evening. Users answer 4 quick questions (time, budget, mood, setting) and receive 3 vetted, executable date ideas — no scrolling, no arguing, no defaulting to a movie.

## The Problem

College couples hit a predictable dead zone around 8–10 PM where the energy is low, nobody wants to plan, and the path of least resistance is a movie that drags on too late and wrecks the next morning. The real need isn't entertainment — it's a trusted recommendation they can act on immediately.

## Target User (ICP)

**Jake — The College Boyfriend**
- Age: 19–24, male, BYU or UVU student in Provo, UT
- In a relationship (6 months+), wants to be the guy who "plans good stuff"
- Feels mild pressure/guilt when evenings go nowhere
- Has 1–3 hours, $0–$25, a phone, and low decision-making energy by evening
- Currently gets ideas from Reddit, Google Maps, or just asks his girlfriend

**Primary Job To Be Done:**
> "I'm trying to find something genuinely good to do with my girlfriend tonight so I can have an energizing, memorable evening without defaulting to a movie that drags late and wrecks the next day."

## Value Proposition

> "We help couples find reliable, time-appropriate things to do in the evening by surfacing vetted, executable ideas that actually work late at night — in under 60 seconds, on your phone."

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) | React ecosystem, Vercel deploy, static export |
| Styling | Tailwind CSS | Utility-first, fast iteration, mobile-first |
| Animation | framer-motion | Smooth step transitions in questionnaire |
| Data | Static JSON (201 ideas) | $0 cost, fast, no API latency |
| Auth | Supabase (email + magic link) | Free tier, built-in RLS, PostgreSQL |
| Database | Supabase PostgreSQL | Saved favorites with per-user RLS |
| Hosting | Vercel free tier | Zero config, instant deploys |
| **Total cost** | **$0/month** | |

## App Structure

```
/ (landing)               — Hero + single CTA
/concierge                — 4-step questionnaire
/results?[params]         — 3 matched idea cards
/idea/[id]                — Full detail + share
/saved                    — Authenticated favorites list
```

## Key Product Decisions

1. **No AI at runtime** — All 201 ideas are pre-generated and stored in a JSON file. Zero latency, zero cost, works offline.
2. **URL-based filter state** — Concierge answers live in URL params so results are shareable and the back button works naturally.
3. **3 results, not 30** — Reduces decision fatigue. "Show Me 3 More" button re-runs the algorithm excluding already-shown ideas.
4. **Progressive fallback** — If < 3 ideas match strict filters, the algorithm relaxes setting → time → budget to always surface something useful.
5. **Mobile-only design** — Optimized for 375px (iPhone SE). PWA manifest enables "Add to Home Screen."
6. **Provo-specific content** — Every idea is geo-targeted: real locations, accurate addresses, BYU/UVU-aware hours and costs.

## Database Schema (Supabase)

```sql
-- Saved ideas (requires auth)
create table saved_ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  idea_id     text not null,                -- matches id field in date-ideas.json
  saved_at    timestamptz default now(),
  unique(user_id, idea_id)
);

-- Row Level Security
alter table saved_ideas enable row level security;

create policy "Users can only see their own saved ideas"
  on saved_ideas for select using (auth.uid() = user_id);

create policy "Users can insert their own saved ideas"
  on saved_ideas for insert with check (auth.uid() = user_id);

create policy "Users can delete their own saved ideas"
  on saved_ideas for delete using (auth.uid() = user_id);
```

## Data Model (DateIdea)

```typescript
interface DateIdea {
  id: string;
  title: string;
  description: string;
  estimatedTimeMinutes: number;
  timeRange: "30" | "60" | "120" | "180+";
  estimatedCostDollars: number;
  budgetTier: "free" | "under10" | "under25" | "splurge";
  moods: Mood[];
  setting: "indoor" | "outdoor" | "either";
  category: Category;
  lateNightFriendly: boolean;
  specificLocation?: string;
  address?: string;
  proTip?: string;
  seasonalAvailability?: string[];
}
```

## Design System

- **Background**: `#0f0d15` (deep midnight purple-black)
- **Primary accent**: `#e8a838` (warm gold) — CTAs, selected states
- **Secondary accent**: `#c77dff` (soft lavender) — late-night badge
- **Typography**: Geist (Next.js default), weights 400–800
- **Corners**: `rounded-2xl` everywhere (friendly, modern)
- **Touch targets**: 48px+ height on all interactive elements

## Running Locally

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Environment Variables (for Supabase features)

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Deployment

Hosted on Vercel. Push to `main` auto-deploys.

```bash
vercel --prod
```

Live URL: https://strat490r-product.vercel.app
GitHub: https://github.com/scotty-peterson/strat490r-product
