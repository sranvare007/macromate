# NutriTrack (MacroMate) — Food & Macro Tracking App PRD

Version 1.0 · June 2026 · Platform: iOS & Android (React Native / Expo)

An AI-powered nutrition companion that helps users track meals via text or voice and achieve their health goals.

## Executive Summary

NutriTrack simplifies calorie and macro tracking through natural language input — text or voice. Users complete a one-time onboarding that captures physical measurements and goals. The backend calculates a personalised daily macro target (Mifflin-St Jeor BMR + activity multiplier). Users log meals by typing or speaking what they ate; a server-side LLM parses the input and returns per-item and aggregate macros in real time.

**Core value proposition: zero-friction logging.** No barcode scanning, no manual portion entry.

- AI-driven meal parsing (text and audio)
- Personalised daily calorie and macro targets
- Real-time progress tracking on the home screen
- Historical trends with filterable macro graphs
- Streak system to reward consistent tracking
- Settings that automatically recalculate targets on profile update

## Goals & Success Metrics

| Goal | Outcome | KPI |
|---|---|---|
| Reduce logging friction | Log a full meal in under 60 s via voice or text | Avg. meal log time < 60 s |
| Accurate macro calculation | Correct macro breakdown for >90% of common meals | AI accuracy ≥ 90% |
| Daily engagement | Users log at least one meal every day | DAU/MAU ≥ 0.6 |
| Goal adherence | Meet daily macro targets on ≥ 5 of 7 days | Weekly target completion ≥ 70% |
| Retention | 7-day streak within first month | 30-day streak initiation ≥ 40% |

## User Personas

- **A — Gym Enthusiast** (22–35, trains 4–6 days/week): wants lean muscle gain; loves voice logging while meal prepping.
- **B — Weight-Loss Seeker** (28–45, moderately active): wants sustainable loss; loves instant remaining-calories feedback.
- **C — Bulk/Cut Cycler** (20–30, experienced lifter): alternates phases; loves changing goal in Settings and seeing targets adjust instantly.

## Feature Specifications

### 5.1 Onboarding Flow

Screen sequence: **Welcome/Splash → Weight Input (kg/lbs toggle) → Height Input (cm/ft-in toggle) → Goal Selection (4 tappable cards) → Calculating (animated) → Summary (computed targets, CTA to enter app)**.

Goal options:

| Goal | Strategy | Macro Direction |
|---|---|---|
| Increase Lean Muscles | High protein, moderate carbs, low fat surplus | +200–300 kcal, protein ≥ 2.0 g/kg |
| Increase Muscles with Fat | Aggressive bulk | +400–500 kcal, protein ≥ 1.8 g/kg |
| Lose Weight | Deficit with muscle preservation | −500 kcal, protein ≥ 1.6 g/kg |
| Increase Weight | General weight gain | +300–400 kcal, balanced macros |

Backend calculation logic:

- BMR via Mifflin-St Jeor: `(10 × weight_kg) + (6.25 × height_cm) − (5 × age) + gender_factor`
- Activity multiplier applied (default: lightly active = 1.375; editable in Settings v2)
- Calorie target = TDEE ± goal-based adjustment
- Macro split: protein = goal_factor × weight_kg; fat = 25% of total kcal; carbs = remainder
- Fibre target: 14 g per 1000 kcal
- Inputs persisted per user. Changing weight/height/goal in Settings recalculates targets **prospectively only** (historical days unchanged).

### 5.2 Home Screen

- **Daily macro ring**: prominent circular progress (calories consumed vs. target); secondary row of four smaller indicators (Protein, Carbs, Fat, Fibre) each showing grams consumed/target and % arc. Colour coding: green ≤ 100%, amber 100–115%, red > 115%.
- **Today's meal log**: chronological list (Breakfast, Lunch, Dinner, Snack). Each card shows meal type, time, total kcal, top macros; tap to expand inline to full food item list. `+ Add Meal` FAB bottom-right.
- **Streak banner**: persistent banner near top (e.g., "🔥 7-day streak!"). Increments at midnight if all four macro targets met (within 10% tolerance). Gentle 8 PM notification if targets not yet met.

### 5.3 Add Meal Flow

1. **Meal type selection**: bottom sheet on FAB tap; four chips (Breakfast, Lunch, Dinner, Snack).
2. **Input methods**:
   - *Text*: multiline field, placeholder "e.g., 2 scrambled eggs, 2 slices whole wheat toast, 1 cup black coffee"; submit via keyboard or "Analyse" CTA.
   - *Voice*: microphone button; live transcription shown in text field; auto-stop after 2 s silence or manual stop; transcription editable before submit.
3. **LLM processing (server-side)**: client sends text/transcript to `POST /api/meals/parse`. Server calls LLM with structured prompt; response is a JSON array of `{ food_name, portion_size, unit, calories, protein_g, carbs_g, fat_g, fibre_g }`. Nutritional DB fallback if LLM confidence is low. Totals aggregated server-side. Latency target: < 3 s text, < 4 s voice.
4. **Review & confirm**: editable parsed item list (adjust quantities/delete); totals bar (Calories | Protein | Carbs | Fat | Fibre); "Looks good — Save" CTA; "Edit Manually" for free-form correction. On save: meal persisted, home screen updates in real time.

### 5.4 History Screen

- **Macro trend graph**: line/bar chart of selected macro over time (default last 7 days); filter chips (Calories, Protein, Carbs, Fat, Fibre); range selector (7/30/90 days, custom); target reference line; pinch-to-zoom + horizontal scroll.
- **Daily history list**: most recent first. Each item: date, total calories, P|C|F|Fibre grams, goal-met indicator (green tick / red cross).
- **Day detail screen**: full-day breakdown; collapsible meal sections; food items with macro columns; day totals row. **Read-only** (historical data cannot be edited in v1).

### 5.5 Settings Screen

| Setting | Input Type | When Updated |
|---|---|---|
| Weight | Numeric, kg/lbs toggle | On Save |
| Height | Numeric, cm/ft-in toggle | On Save |
| Goal | Same 4-option selector as onboarding | On Save |
| Daily Targets | Read-only computed display | Auto-refresh after any change |
| Notifications | Daily reminder toggle + time picker | Immediate |
| Account | Email, change password, log out, delete account | Per action |
| App Version | Display only | N/A |

Target recalculation is prospective only — new targets apply from the current day forward.

### 5.6 Streak System

Rules:

- A day is "met" if **all four** macro targets are within ±10% tolerance.
- Streak increments at 00:00 local time if the previous calendar day was met.
- Streak resets to 0 if a day is fully missed (no meals logged).
- Partial days (meals logged, targets not met) do not break the streak but do not increment it.

Milestones: 3 days → Bronze badge (in-app toast); 7 → Silver + confetti (push); 14 → Gold (push); 30 → Platinum + special home theme (push); 60 → Diamond (push).

## System Architecture

### Client (this repo)

- React Native / Expo, cross-platform iOS + Android
- State management: Redux Toolkit (or equivalent)
- Audio recording: native microphone API → PCM/M4A
- Offline queue: local SQLite cache; syncs when connectivity restored

### Backend API

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | Create user account |
| `POST /api/auth/login` | Authenticate, return JWT |
| `POST /api/onboarding` | Save profile, return computed targets |
| `GET /api/targets/today` | Today's calorie + macro targets |
| `POST /api/meals/parse` | Accept text or audio, return parsed meal JSON |
| `POST /api/meals` | Persist confirmed meal |
| `GET /api/meals/today` | All meals logged today |
| `GET /api/history` | Paginated daily summaries |
| `GET /api/history/:date` | Full meal breakdown for a day |
| `PUT /api/profile` | Update weight/height/goal; recalculate targets |
| `GET /api/streaks` | Current streak count + milestone badges |

### AI / LLM Pipeline

- Speech-to-text: Whisper API (or equivalent)
- Meal parsing: GPT-4o / Claude Sonnet via structured tool use; nutritionist-persona system prompt + output schema
- Fallback: USDA FoodData Central API to cross-validate or fill gaps
- Confidence score returned; low-confidence items flagged for user review

### Data Storage

- PostgreSQL: `users`, `profiles`, `meals`, `meal_items`, `daily_summaries`, `streaks`
- Redis: session cache, daily macro totals (invalidated on new meal save)
- S3-compatible object storage: raw audio retained 30 days

## Key Data Models

**User Profile**: `user_id` (UUID, PK), `email` (unique), `weight_kg` (DECIMAL, always stored in kg), `height_cm` (DECIMAL, always stored in cm), `goal` (ENUM: `lean_muscle | bulk | lose_weight | gain_weight`), `daily_kcal`, `daily_protein_g`, `daily_carbs_g`, `daily_fat_g`, `daily_fibre_g` (computed targets), `created_at`, `targets_updated_at`.

**Meal**: `meal_id` (UUID, PK), `user_id` (FK), `meal_type` (ENUM: `breakfast | lunch | dinner | snack`), `logged_at`, `raw_input` (original text/transcription), `total_kcal`, `total_protein_g`, `total_carbs_g`, `total_fat_g`, `total_fibre_g`.

**Meal Item**: `item_id` (UUID, PK), `meal_id` (FK), `food_name`, `portion_size`, `portion_unit` (g, ml, cup, slice…), `kcal`, `protein_g`, `carbs_g`, `fat_g`, `fibre_g`, `confidence_score` (0–1, from LLM).

## Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Data retrieval < 500 ms; meal parse < 3 s text / < 4 s voice |
| Availability | 99.5% uptime; graceful degradation (manual entry fallback if LLM down) |
| Scalability | Supports 100k DAU without re-platforming |
| Security | JWT auth with refresh tokens; HTTPS; audio encrypted at rest |
| Privacy | GDPR/DPDPA compliant; user can download/delete all data; audio purged after 30 days |
| Accessibility | WCAG 2.1 AA; VoiceOver/TalkBack compatible; ≥ 4.5:1 contrast |
| Offline | Compose meals offline, sync on reconnect; home shows cached data |
| Localisation | v1 English only; metric **and** imperial units throughout |

## Out of Scope (v1)

- Barcode / food label scanning
- Water / hydration tracking
- Exercise / activity logging
- Social features (sharing, challenges)
- Wearable integrations (Apple Health, Google Fit) — v2
- Custom activity level selection during onboarding
- Editing historical meal entries
- Meal planning / recipes
- Dietary restriction filtering (vegan, gluten-free, etc.)

## Release Milestones

1. **M1 — Foundation** (wk 1–3): auth, onboarding, target calculation, DB schema, API scaffolding
2. **M2 — Core Logging** (wk 4–7): add meal (text + voice), LLM parse pipeline, home screen progress
3. **M3 — History & Streaks** (wk 8–10): history list, day detail, macro graphs, streak system
4. **M4 — Settings & Polish** (wk 11–12): settings with recalculation, notifications, performance tuning
5. **M5 — Beta** (wk 13–14): closed beta, bug fixes, LLM accuracy validation
6. **M6 — Launch** (wk 15): App Store & Google Play submission

## Open Questions

- **OQ-1**: Collect date of birth for accurate BMR? (Mifflin-St Jeor requires age)
- **OQ-2**: Include sex/gender input in onboarding, or default to average gender factor?
- **OQ-3**: User-selectable activity multiplier vs. fixed default?
- **OQ-4**: LLM vendor — GPT-4o vs Claude Sonnet (cost/accuracy benchmark needed)
- **OQ-5**: Is ±10% streak tolerance right?
- **OQ-6**: Is 30-day audio retention acceptable? Consider opt-out
- **OQ-7**: Define "partial day" precisely (e.g., ≥ 2 meals logged?)

## Appendix — Macro Calculation Reference

**Mifflin-St Jeor BMR**

- Male: `BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5`
- Female: `BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161`

**Activity multipliers** (`TDEE = BMR × multiplier`): Sedentary 1.2 · Lightly Active 1.375 · Moderately Active 1.55 · Very Active 1.725 · Extra Active 1.9

**Goal-based adjustments**

| Goal | Calorie Target | Protein | Fat | Carbs |
|---|---|---|---|---|
| Lose Weight | TDEE − 500 kcal | ≥ 1.6 g/kg | 20–25% of kcal | Remainder |
| Increase Weight | TDEE + 300 kcal | ≥ 1.6 g/kg | 25% of kcal | Remainder |
| Increase Lean Muscles | TDEE + 250 kcal | ≥ 2.0 g/kg | 25% of kcal | Remainder |
| Muscles with Fat | TDEE + 450 kcal | ≥ 1.8 g/kg | 25% of kcal | Remainder |
