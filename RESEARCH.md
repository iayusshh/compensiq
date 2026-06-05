# Compensation Platform Research
## Track C — Mandatory Pre-Implementation Analysis

---

## Key Observations

### Levels.fyi (Primary Reference)
The defining insight: **compensation is meaningless without a level**. A "Senior Engineer" at Google (L5, ~₹1.2Cr TC) is not comparable to a "Senior Engineer" at a mid-tier company (₹25L TC). Levels.fyi built its entire data model around this — every submission requires a company-specific level, and they maintain a cross-company level mapping database so L5 Google ≈ E5 Meta ≈ 63 Microsoft. This is the core intellectual property. Everything else (charts, comparisons, negotiation tools) is downstream of this one structural decision.

Data is broken into three components — base, bonus, equity — because conflating them obscures negotiation leverage. A company with low base but high equity is a fundamentally different risk profile than all-cash comp. Levels.fyi makes this visible.

### 6figr
India-focused. Closest competitor to what we built. Key differentiator: AI-first approach — you upload your offer letter and it benchmarks it against live data. Also has "JobGPT" for auto-applying. Data structure includes fixed + variable + ESOP, which is correct for India. Weakness: level system is weak. Data leans title-based rather than level-based, which makes cross-company comparison unreliable.

### AmbitionBox
Reviews-first platform that also has salary data. The salary data is secondary — it's attached to reviews, which means it's title-based, often vague ("₹8L–₹25L for SDE"), and not broken into components. Strong on company culture signals, weak on compensation precision. Owned by Naukri (Info Edge), which gives it India scale but also makes it review-focused rather than comp-focused.

### Glassdoor
Global platform with the same review-first problem as AmbitionBox. P25/P50/P75 ranges are shown but the data is title-aggregated across all levels — a "Software Engineer" range from ₹4L to ₹40L is not useful for negotiation. No concept of levels at all. Strong on company culture, interview experiences, CEO ratings — not structured enough for compensation intelligence.

---

## Feature Comparison Matrix

| Feature | Levels.fyi | 6figr | AmbitionBox | Glassdoor | Built in CompensIQ? |
|---------|-----------|-------|-------------|-----------|---------------------|
| **Data Structure** | | | | | |
| Structured levels (L3, SDE2, etc.) | ✅ Core feature | ⚠️ Partial | ❌ Title-only | ❌ Title-only | ✅ `level` + `levelOrder` |
| Cross-company level mapping | ✅ Level mapping DB | ❌ | ❌ | ❌ | ⚠️ `levelToOrder()` normalizes numerically |
| Base / Bonus / Equity split | ✅ | ✅ | ❌ Lump sum | ⚠️ Partial | ✅ All three stored separately |
| Total Comp computed | ✅ | ✅ | ❌ | ⚠️ | ✅ Computed on write |
| Missing bonus/stock → 0 | ✅ | ✅ | N/A | N/A | ✅ Default 0 |
| Verified submissions | ✅ | ❌ | ❌ | ❌ | ⚠️ `verified` flag in schema, UI pending |
| **Search & Filtering** | | | | | |
| Filter by company | ✅ | ✅ | ✅ | ✅ | ✅ |
| Filter by role/title | ✅ | ✅ | ✅ | ✅ | ✅ |
| Filter by level | ✅ | ⚠️ | ❌ | ❌ | ✅ |
| Filter by location | ✅ | ✅ | ✅ | ✅ | ✅ |
| Filter by TC range | ✅ | ✅ | ❌ | ⚠️ | ✅ `minTC` / `maxTC` |
| Filter by YoE | ✅ | ✅ | ❌ | ⚠️ | ⚠️ Stored, not filterable in UI yet |
| Pagination | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Compensation Data** | | | | | |
| P25 / P50 / P75 percentiles | ✅ | ⚠️ Shows avg | ❌ Range only | ✅ | ✅ All three |
| Company-level breakdown | ✅ | ⚠️ | ❌ | ❌ | ✅ Per-level P25/P50/P75 |
| Median TC across all levels | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| **Comparison Tools** | | | | | |
| Side-by-side company comparison | ✅ | ❌ | ⚠️ Basic | ⚠️ Basic | ✅ Up to 3 companies |
| Level-by-level comparison | ✅ | ❌ | ❌ | ❌ | ✅ |
| Comparison charts | ✅ | ⚠️ | ❌ | ⚠️ | ✅ Bar charts (Recharts) |
| Offer comparison | ✅ | ✅ AI-powered | ❌ | ❌ | ❌ Not built |
| Benefits comparison | ✅ | ❌ | ❌ | ⚠️ | ❌ Not built |
| **Company Pages** | | | | | |
| Company overview with TC | ✅ | ✅ | ✅ | ✅ | ✅ |
| TC by level chart | ✅ | ⚠️ | ❌ | ❌ | ✅ |
| Company tier classification | ❌ | ❌ | ❌ | ❌ | ✅ FAANG / Tier1 / Mid / Startup |
| Recent submissions | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Submission** | | | | | |
| Anonymous submission | ✅ | ✅ | ⚠️ | ✅ | ✅ |
| Company name dedup / normalization | ✅ | ✅ | ✅ | ✅ | ✅ `normalizedName` |
| Input validation | ✅ | ✅ | ⚠️ | ⚠️ | ✅ Zod schema |
| Live TC preview on submit | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Authentication** | | | | | |
| Auth required to submit | ✅ | ✅ | ✅ | ✅ | ⚠️ Optional (allows anon) |
| Social login (Google etc.) | ✅ | ✅ | ✅ | ✅ | ❌ Credentials only |
| View data without auth | ✅ | ⚠️ Limited | ⚠️ Limited | ⚠️ Limited | ✅ |
| **Visualizations** | | | | | |
| Bar charts | ✅ | ⚠️ | ❌ | ✅ | ✅ |
| Geographic heatmap | ✅ | ❌ | ❌ | ✅ | ❌ Not built |
| TC trend over time | ✅ | ⚠️ | ❌ | ✅ | ❌ Not built |
| **India Coverage** | | | | | |
| India-specific data | ⚠️ Secondary | ✅ Primary | ✅ Primary | ⚠️ Secondary | ✅ INR default, India focus |
| Indian company tiers | ❌ | ⚠️ | ⚠️ | ❌ | ✅ Flipkart, Swiggy, Razorpay etc. |
| INR currency native | ❌ | ✅ | ✅ | ❌ | ✅ `formatLakhs()` |
| **Other** | | | | | |
| Salary heatmap by city | ✅ | ❌ | ❌ | ✅ | ❌ |
| Internship data | ✅ | ❌ | ❌ | ⚠️ | ❌ |
| H-1B / visa tracking | ✅ | ❌ | ❌ | ❌ | ❌ |
| Company reviews | ❌ | ❌ | ✅ Core | ✅ Core | ❌ Out of scope |
| Interview Q&A | ❌ | ❌ | ✅ | ✅ | ❌ Out of scope |
| Job board | ✅ | ✅ JobGPT | ✅ | ✅ | ❌ Out of scope |
| AI offer analysis | ❌ | ✅ | ❌ | ❌ | ❌ |
| Negotiation coaching | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mobile app | ✅ | ⚠️ | ✅ | ✅ | ❌ (PWA-ready) |
| Platform-wide stats | ✅ | ⚠️ | ❌ | ⚠️ | ✅ `/api/stats` |

---

## What I Chose to Build and Why

### Built
**Level-first data model** — Taken directly from Levels.fyi. Every entry has a `level` string and a derived `levelOrder` integer. This means a Google L5 and a Flipkart SDE3 can be sorted and compared numerically even though the strings are different. This is the core architectural decision everything else depends on.

**TC split into three components** — Base, bonus, equity stored separately so users can see where the money comes from, not just the headline number. Equity-heavy packages (FAANG) vs all-cash (Indian mid-tier) are fundamentally different risk profiles.

**P25/P50/P75 on every aggregate** — Not just median. Taken from both Levels.fyi and Glassdoor. A Google L5 range of ₹70L–₹1.2Cr is more useful than "median ₹90L" for negotiation.

**Company tier classification (FAANG / Tier1 / Mid / Startup)** — None of the reference platforms do this. Added it because India's market is stratified in a way that's not captured by raw company names alone.

**Normalization on company names** — Taken from all four platforms implicitly. Prevents "google", "Google", "Google India" from splitting the data.

**Live TC preview on submission** — None of the reference platforms do this. Added because it reduces submission errors (user sees ₹1.87Cr before submitting and can catch a data entry mistake).

### Deliberately Not Built
**Company reviews and interview Q&A** — AmbitionBox and Glassdoor are built around this. It's out of scope for a compensation intelligence system and would dilute the product focus.

**Job board** — All four platforms have one. Adds complexity without improving compensation data quality.

**Geographic heatmap** — Levels.fyi and Glassdoor have this. Interesting but secondary — most Indian tech jobs are in Bangalore/Hyderabad/Pune and the location signal matters less than the level signal.

**AI offer analysis (like 6figr)** — Valuable feature but requires an LLM integration and offer letter parsing. The data foundation needs to be solid before layering AI on top.

**Social login** — Time constraint. The schema and NextAuth config support adding Google OAuth in one provider addition.
