# Platform Strategy — The Dead Evening

## Decision: Standalone B2C App

### Which strategy and why

The Dead Evening is a **standalone B2C product** — a direct-to-consumer app where individual users (specifically college-age couples in Provo) pay with their attention and optionally their data, in exchange for a fast, reliable recommendation engine for their evenings.

This is the right call for three reasons. First, the core job-to-be-done is personal and individual: Jake isn't trying to find a partner, connect with other couples, or access a business's services — he's trying to solve *his* dead evening *tonight*. The value we deliver is purely in curation and speed of decision-making, not in connecting two sides of a market. A marketplace or platform would add coordination overhead where none is needed. Second, the product's unfair advantage is Provo-specific local knowledge embedded in the data, which is a B2C content moat, not a B2B API. Third, the onboarding friction needs to be near-zero — magic link auth, no profile setup, results in under 60 seconds. Any enterprise or two-sided layer would compromise this.

The B2C model also gives us the cleanest path to revenue: a small premium tier (push notification reminders at 6 PM, partner sync, unlimited saves) for power users, without needing enterprise sales cycles or API documentation. The unit economics are favorable — hosting costs $0/month at current scale, and the content library (201 ideas) cost nothing to generate and has no marginal cost per user.

---

### What data/insights informed this decision

Three signals pointed clearly to B2C standalone:

**1. The user interview finding on timing.** Every person interviewed described the same moment: it's 8–9 PM, they're already with their partner, and they need a decision *now*. That's a personal, in-the-moment problem — not a problem that involves a third party (a business, a creator, a platform). The solution needs to live in Jake's pocket, not require a sign-up flow with a restaurant or an event page.

**2. The "show me 3 more" behavior.** During early testing, users almost immediately tapped "Show Me 3 More" even when the first 3 results were good. This tells us the value isn't just the ideas themselves — it's the speed and trust of the filtering. That's a content/algorithm moat, not a network effect. You can't out-marketplace this; you out-curate it.

**3. Zero willingness to pay for access, high willingness to pay for personalization.** Users found the free version genuinely useful but expressed interest in "something that learns what we like over time" and "reminders before we get stuck." Those are B2C premium features, not B2B capabilities.

---

### What the next 6 months look like

**Month 1–2: Validate retention and deepen Provo content**
- Add push notifications: "It's 6 PM — need a plan for tonight?" (PWA or native wrapper)
- Expand to 400+ ideas, filling gaps in splurge and seasonal categories
- Instrument basic analytics (idea views, saves, share events) to understand which ideas actually get used

**Month 3–4: Partner sharing + couples features**
- Allow users to share a "saved list" with one partner (no full social graph — just a private link)
- Add a "Date Mode" toggle that filters to ideas that work for 2 people (vs. group activities)
- Run 10 more user tests with couples to validate the sharing UX

**Month 5–6: Expand geographically + explore monetization**
- Launch Salt Lake City and Orem versions with new local idea sets
- Test a $2.99/month "Pro" tier: unlimited saves, partner sync, 6 PM daily push reminder, early access to new ideas
- Evaluate whether to build a React Native app or stay PWA based on retention data

The goal by month 6: 500 MAU across Provo/SLC/Orem, 5% conversion to Pro tier, and enough retention data to make a confident decision about whether to raise a small pre-seed round.
