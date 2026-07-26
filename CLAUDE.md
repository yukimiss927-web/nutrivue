# Nutrivue — project notes for Claude

Health & nutrition tracker. Expo (React Native) + Supabase + Google Gemini vision.

## Stack
- **Expo Router** (file-based routing under `app/`). Root `_layout.tsx` holds the
  auth route guard that bounces between `(auth)` and `(tabs)`.
- **Supabase**: auth (email/password), Postgres, storage. Client in
  `src/lib/supabase.ts`, reads `EXPO_PUBLIC_SUPABASE_*` from `.env`.
- **Google Gemini** (model `gemini-2.0-flash`, vision) is called ONLY from the
  Supabase Edge Function `supabase/functions/analyze-meal/`. The `GEMINI_API_KEY`
  is a server secret and must never be added to the app bundle or `.env` with an
  `EXPO_PUBLIC_` prefix. Gemini's `responseSchema` forces the JSON output shape.

## Key conventions
- Import alias `@/` → `src/` (configured in both `babel.config.js` and `tsconfig.json`).
- Design tokens live in `src/theme/`. Use them; don't hardcode colors.
- Data access goes through `src/services/*` (never call `supabase` from screens
  directly except auth via `src/store/auth.tsx`).
- Per-user data isolation is enforced by Row-Level Security in
  `supabase/schema.sql` — every table policy checks `auth.uid()`.

## AI JSON contract
The Edge Function returns `{ result: MealAnalysisResultJson }` (shape in
`src/lib/database.types.ts`). If you change the JSON shape, update BOTH the
Edge Function's SYSTEM_PROMPT and that type.

## Commands
- `npm start` — run in Expo Go
- `npm run typecheck` — tsc --noEmit
- Camera + notifications require a physical device, not web.
