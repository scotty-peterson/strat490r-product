# Product Spec — The Dead Evening

**Version**: 1.0 (Sprint 3)
**Last updated**: March 2026
**Author**: Scotty Peterson

---

## Problem Statement

College couples in Provo, UT hit a "dead zone" around 8–10 PM where decision fatigue kills the evening. They scroll Instagram for ideas, argue mildly about what to do, then default to a movie that runs too late. The next morning is rough. This happens 3–5x per week.

**The root cause is not lack of options — it's lack of a trusted, fast recommendation that fits their actual situation right now.**

---

## Job To Be Done

> "I'm trying to find something genuinely good to do with my girlfriend tonight so I can have an energizing, memorable evening without defaulting to a movie that drags late and wrecks the next day."

---

## Ideal Customer Profile

**Jake — The College Boyfriend**
- Age 19–24, BYU or UVU student in Provo, UT
- In a relationship 6+ months, cares about quality time
- Has $0–$25 free, 1–3 hours, and low decision energy by evening
- Owns an iPhone, discovers apps through word of mouth
- Currently: Googles "fun things to do in Provo" and gets the same 10 tourist traps

**Pain points (from customer interviews):**
- "We end up watching a movie every time because we can't think of anything"
- "Google gives me stuff that's either closed or takes too long to get to"
- "By the time we agree on something, neither of us is excited anymore"
- "I want something that actually works at 9 PM"

---

## Value Proposition

> "We help couples find reliable, time-appropriate things to do in the evening by surfacing vetted, executable ideas that actually work late at night — in under 60 seconds, on your phone."

**Unfair advantages:**
- Provo-specific: every idea is locally vetted with real addresses and hours
- Late-night filtered: 110/201 ideas explicitly marked as late-night friendly
- Zero friction: no account required to get recommendations
- Speed: answer 4 questions, get 3 ideas, go — under 60 seconds

---

## User Stories (MoSCoW)

### Must Have

| ID | User Story | Acceptance Criteria |
|---|---|---|
| US-01 | As a user, I want to answer a few quick questions about my evening so I get relevant recommendations | Questionnaire has exactly 4 steps; each step has clear question + options; can complete in < 60 seconds |
| US-02 | As a user, I want to see 3 date ideas that match my time, budget, mood, and setting | Results page shows exactly 3 cards; each card matches the filters used; no out-of-budget or too-long ideas appear |
| US-03 | As a user, I want to tap an idea card to see full details | Detail page shows: description, time, cost, setting, mood tags, pro tip, location with map link, share button |
| US-04 | As a user, I want to see different ideas if I don't like the first 3 | "Show Me 3 More" excludes already-shown ideas from subsequent results |
| US-05 | As a user, I want the app to work well on my phone | All touch targets ≥ 44px; no horizontal scroll; text readable without zoom; tested on iPhone SE (375px) |
| US-06 | As a user, I want to save date ideas I like so I can come back to them | Save button on detail page; persists across sessions; requires account (Supabase auth) |

### Should Have

| ID | User Story | Acceptance Criteria |
|---|---|---|
| US-07 | As a user, I want to see my saved ideas in one place | `/saved` page lists all saved ideas; each links to detail page; can unsave from list |
| US-08 | As a user, I want to share a specific idea with my partner | Tapping Share uses Web Share API (iOS) or copies URL to clipboard; shared URL opens correct detail page |
| US-09 | As a user, I want to open the location in Maps | "Open in Maps" link opens Apple Maps on iOS, Google Maps otherwise; uses real address from data |
| US-10 | As a user, I want the app to still show me something even if nothing perfectly matches | Progressive fallback: relaxes setting → time → budget; shows note when results are looser matches |

### Could Have

| ID | User Story | Acceptance Criteria |
|---|---|---|
| US-11 | As a user, I want to add the app to my home screen | PWA manifest present; app opens full-screen from home screen; themed splash screen |
| US-12 | As a user, I want to go back and change my answers | Back button in concierge preserves previous answers; back on results returns to last concierge step |
| US-13 | As a returning user, I want the app to remember my last filters | — (nice to have, not required for MVP) |

### Won't Have (This Sprint)

- Native iOS/Android app
- Real-time business hours via Google Places API
- Social features (share saves with partner, collaborative lists)
- User-submitted ideas
- Push notifications
- Map view of ideas
- Booking/reservation integration

---

## Functional Requirements

### FR-01: Concierge Questionnaire
- **4 steps** in order: Time → Budget → Mood → Setting
- Single-select steps (Time, Budget, Setting) auto-advance after selection
- Multi-select step (Mood) allows up to 3 selections; "Next" button appears after ≥ 1 selection
- Animated slide transition between steps (200ms, ease-in-out)
- Progress dots indicator shows current position
- Back arrow returns to previous step; on step 0, navigates to landing page
- Filter state passed via URL search params to results page

### FR-02: Matching Algorithm
- **Hard filters**: `estimatedTimeMinutes ≤ timeRange_max`, `estimatedCostDollars ≤ budgetTier_max`, setting matches (or is "either")
- **Mood scoring**: +10 per matching mood, +5 bonus if all user moods match, +0–3 random jitter
- **Sort**: descending by score; take top 3
- **Fallback**: If < 3 results — (1) relax setting to "either", (2) expand time tier up by one, (3) expand budget tier up by one
- **Exclusion**: Already-shown idea IDs passed as exclusion list on "Show Me 3 More"

### FR-03: Results Page
- Reads filters from URL params (shareable, back-button safe)
- Shows 3 IdeaCard components with: title, description (2-line clamp), time, cost, late-night badge, mood tags, location badge
- Each card links to `/idea/[id]`
- "Show Me 3 More" button tracks shown IDs in component state
- "Start Over" resets to empty filter state
- Empty state message when no ideas match even after fallback

### FR-04: Idea Detail Page
- Shows: category, title, info chips (time, cost, setting, late-night), description, pro tip, location card, mood badges, seasonal note
- "Open in Maps": Apple Maps URL on iOS, Google Maps URL on other devices
- Share button: `navigator.share()` on supported browsers, clipboard fallback with alert
- Save/unsave button: requires auth; persists to Supabase `saved_ideas` table
- Back button returns to previous page

### FR-05: Authentication (Supabase)
- Email + magic link sign-in (no password to remember)
- Auth state persisted via Supabase session cookie
- Unauthenticated users can use all features except saving
- Save button prompts sign-in for unauthenticated users
- Sign-in/sign-up on a minimal `/auth` page or modal

### FR-06: Saved Ideas
- Save is per-user, persisted in Supabase `saved_ideas` table
- `/saved` page lists all saved ideas (requires auth; redirects to `/auth` if not signed in)
- Can unsave from either detail page or saved list
- Real-time save state reflected in UI (heart icon filled/unfilled)

---

## Non-Functional Requirements

| Requirement | Target |
|---|---|
| Performance | Lighthouse Performance ≥ 90 on mobile |
| Accessibility | Lighthouse Accessibility ≥ 90 |
| Time to interactive | < 2s on 4G mobile |
| Questionnaire completion | < 60 seconds for a new user |
| Mobile compatibility | iOS Safari 16+, Chrome Android 110+ |
| Availability | 99%+ (Vercel free tier SLA) |
| Cost | $0/month (Vercel free + Supabase free tier) |

---

## Success Metrics

### Primary
- **Task completion rate**: % of users who start the concierge and reach results page → target 80%+
- **Idea engagement rate**: % of users who tap at least one idea card → target 60%+

### Secondary
- **"Show Me 3 More" rate**: how often users want different options → signals match quality
- **Save rate**: % of authenticated users who save at least one idea
- **Return visits**: users who come back within 7 days

### Sprint 3 Validation Targets (User Tests)
- 3/3 users complete the concierge in < 60 seconds without help
- 3/3 users can identify at least 1 idea they'd actually do tonight
- 0/3 users confused by save/sign-in flow

---

## Edge Cases

| Scenario | Handling |
|---|---|
| No ideas match filters | Progressive fallback; if still 0, show empty state with "Try broadening your preferences" |
| User has seen all ideas in a filter set | Exclusion list cleared when exhausted; "You've seen everything — showing repeats" |
| Invalid `idea.id` in URL | "Idea not found" message with link back to concierge |
| No navigator.share support | Copy URL to clipboard + alert toast |
| Unauthenticated user taps Save | Prompt to sign in; return to idea after auth |
| Supabase offline/error | Save button shows error state; existing saves still visible from cache |

---

## Out of Scope (v1.0)

- Real-time hours/availability from Google Places
- User-submitted or user-rated ideas
- Map view
- Push notifications ("It's 8 PM, time to plan your evening")
- Booking integration (OpenTable, Eventbrite)
- Partner sharing or collaborative lists
- Monetization (affiliate links, promoted ideas)
- Native iOS/Android app

---

## Open Questions

1. Should sign-in be a modal or a dedicated `/auth` page? (Currently: dedicated page)
2. Should we show saved count on idea cards in results? ("12 people saved this")
3. When do we add more than 201 ideas? (Target: 500 by Sprint 4)

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0 | March 2026 | Initial spec — concierge flow, matching algorithm, saved ideas with Supabase auth |
