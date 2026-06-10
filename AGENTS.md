# MacroMate (NutriTrack)

AI-powered calorie & macro tracking app: users log meals in natural language (text or voice), a server-side LLM parses them into macros, and the app tracks daily progress against personalised targets.

**The full product spec lives in `docs/PRD.md`. Read the relevant section before implementing any feature** — it defines screen flows, data models, macro formulas, streak rules, API contracts, and what is explicitly out of scope for v1.

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v55.0.0/ before writing any code. Do not rely on memorised Expo APIs — verify against SDK 55 docs.

## Tech Stack

- Expo SDK 55 (dev client, **not** Expo Go), React Native 0.83, React 19.2, New Architecture enabled
- TypeScript (strict mode) — no new `.js`/`.jsx` files
- React Navigation 7 (static API) — native-stack + bottom-tabs. This project does **not** use expo-router.
- Entry: `index.tsx` → `src/App.tsx`; screens in `src/navigation/screens/`

## Commands

```bash
npm start          # expo start --dev-client
npm run ios        # expo run:ios
npm run android    # expo run:android
npx tsc --noEmit   # type-check (run before declaring any task done)
```

## Project Structure

Keep new code organised by feature under `src/`:

```
src/
  navigation/        # navigators + linking config (static API in navigation/index.tsx)
    screens/         # one file per screen
  components/        # shared, reusable UI (MacroRing, MealCard, ...)
  features/<name>/   # feature-specific components, hooks, logic (onboarding, meals, history, streaks, settings)
  api/               # API client, endpoint wrappers, request/response types
  store/             # global state
  lib/               # pure utilities (unit conversion, macro math, date helpers)
  theme/             # colors, spacing, typography tokens
  types/             # shared domain types (UserProfile, Meal, MealItem)
```

## TypeScript Rules

- `strict` is on; never use `any` — use `unknown` and narrow, or define the type.
- Type all API payloads. Domain types must mirror the PRD data models (`UserProfile`, `Meal`, `MealItem` in `docs/PRD.md` §Key Data Models).
- Type navigation params via the static API's `StaticParamList` (see `src/types.d.ts` for the `RootStackParamList` registration pattern already in place).
- Prefer discriminated unions for state (`{ status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: string }`) over multiple booleans.

## React / React Native Best Practices

- Functional components + hooks only. No class components.
- Keep components small and presentational; put business logic (macro math, streak rules, unit conversion) in pure functions under `src/lib/` so it is unit-testable without rendering.
- Use `StyleSheet.create` (or a single styling approach once adopted) — no inline style object literals in render for non-dynamic styles.
- Lists: always `FlatList`/`SectionList` with a stable `keyExtractor` — never `.map()` inside a `ScrollView` for data of unbounded length (meal logs, history).
- Memoise deliberately: `React.memo` / `useMemo` / `useCallback` only where a measured re-render problem exists — not by default.
- Never block the JS thread with heavy computation in render; derive expensive values with `useMemo` or compute server-side.
- Use `react-native-safe-area-context` for insets (already installed); never hardcode notch/status-bar offsets.
- Gesture handling goes through `react-native-gesture-handler` (already installed).
- All user-visible async work needs explicit loading, error, and empty states — no silent failures. LLM meal parsing can take up to 3–4 s, so design for it.
- Wrap data fetching in a single API layer (`src/api/`); components never call `fetch` directly.

## Domain Rules (do not violate)

- **Units**: store and compute everything in metric (`weight_kg`, `height_cm`); convert to/from lbs and ft-in only at the UI edge. Unit-toggle state never changes stored values.
- **Macro math** lives in one place (`src/lib/macros.ts`): Mifflin-St Jeor BMR, TDEE multipliers, goal adjustments, fibre = 14 g/1000 kcal — formulas and goal table are in `docs/PRD.md` §Appendix.
- **Target recalculation is prospective only**: profile changes never rewrite historical days' targets.
- **History is read-only in v1**: no editing of past meals.
- **Streak rules** (±10% tolerance on all four macros, midnight increment, reset only on fully missed days) are exactly as specified in PRD §5.6 — don't improvise.
- **Out of scope for v1** (don't build it, even if it seems easy): barcode scanning, hydration, exercise logging, social features, wearables, recipes, dietary filters. Full list in PRD §Out of Scope.

## Accessibility & UX (PRD non-functional requirements)

- WCAG 2.1 AA: every touchable gets `accessibilityRole` + `accessibilityLabel`; minimum 4.5:1 contrast; minimum 44×44 touch targets.
- Progress rings/charts must expose their values to screen readers (e.g., "Calories: 1,450 of 2,200").
- Colour coding (green/amber/red on macro rings) must never be the only signal — pair with text/percentage.

## Workflow

- Run `npx tsc --noEmit` after changes; it must pass before a task is considered done.
- New dependencies: prefer Expo-maintained packages (`npx expo install <pkg>` so versions match SDK 55); justify anything outside the Expo ecosystem.
- Don't edit `app.json` native config or add config plugins without flagging it — it requires a new dev-client build.
- Commit messages: imperative mood, scoped to one logical change.
