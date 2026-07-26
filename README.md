# 🥗 Nutrivue — Health & Nutrition Tracker

A multi-user mobile app that analyzes meal photos with AI and checks whether a
meal is safe for **your** specific health conditions. Built with **Expo (React
Native)**, **Supabase** (auth + database), and **Google Gemini** vision for
meal analysis.

## ✨ Features

- 🔐 **Private accounts** — email/password login; every user's data is isolated
- 🩺 **Permanent health profile** — save conditions, allergies & dietary needs once
- 📷 **AI meal analysis** — photograph a plate, get foods, nutrition, a safety
  rating and personalized portion advice based on your conditions
- ⏰ **Reminders & alarms** — recurring medication and hydration notifications
- 📊 **Dashboard** — daily nutrition totals, profile summary, active reminders

---

## 🚀 Setup — follow these steps in order

You'll do this once. Nothing here requires programming — just copy, paste, and
fill in a few values. Every command below can be run in a terminal opened inside
this project folder.

### Step 1 — Install the tools (one time)

You already have **Node.js**. Install the Expo Go app on your Android phone from
the Play Store (this lets you run the app instantly while developing).

Install the project's packages:

```bash
npm install
```

### Step 2 — Create your Supabase project (the backend)

1. Go to **https://supabase.com** → sign up (free) → **New project**.
2. Give it a name and a strong database password, pick a region, click **Create**.
3. Wait ~2 minutes for it to finish provisioning.

### Step 3 — Create the database tables

1. In your Supabase project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file [`supabase/schema.sql`](supabase/schema.sql) from this project,
   copy **all** of it, paste into the editor, and click **Run**.
3. You should see "Success". This creates the tables, security rules, and the
   photo storage bucket.

### Step 4 — Connect the app to Supabase

1. In Supabase: **Project Settings → API**. Copy the **Project URL** and the
   **anon public** key.
2. In this project, make a copy of `.env.example` and name it `.env`:

   ```bash
   cp .env.example .env
   ```

3. Open `.env` and paste your two values:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

### Step 5 — Set up the AI (Google Gemini) securely

The AI key must stay on the server, never in the phone app. We use a Supabase
**Edge Function** for that.

1. Get a free Gemini API key from **https://aistudio.google.com** →
   **Get API key** → **Create API key**.
2. Install the Supabase CLI: **https://supabase.com/docs/guides/cli** (or
   `npm install -g supabase`).
3. In a terminal in this project:

   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase secrets set GEMINI_API_KEY=your-google-ai-studio-key
   supabase functions deploy analyze-meal
   ```

   (`YOUR_PROJECT_REF` is the short ID in your Supabase project URL.)

### Step 6 — Run the app 🎉

```bash
npm start
```

Scan the QR code with **Expo Go** on your phone. Create an account, fill in your
health profile, and scan a meal.

> **Note:** meal scanning and reminders use the camera and notifications, which
> work on a **real phone** (Expo Go), not the web preview.

---

## 📁 Project structure

```
health-nutrition-app/
├── app/                        # Screens (expo-router file-based routing)
│   ├── _layout.tsx             # Root + auth route guard
│   ├── (auth)/                 # login.tsx, signup.tsx
│   ├── (tabs)/                 # index (dashboard), scan, reminders, profile
│   └── meal/result.tsx         # AI analysis result screen
├── src/
│   ├── lib/                    # supabase client + DB types
│   ├── services/               # ai, profile, meals, reminders, notifications
│   ├── store/                  # auth context + result hand-off
│   ├── components/             # ui.tsx, health.tsx (reusable UI)
│   └── theme/                  # colors, spacing, typography
├── supabase/
│   ├── schema.sql              # tables + Row-Level-Security + storage
│   └── functions/analyze-meal/ # secure Edge Function calling Google Gemini
├── assets/                     # placeholder icons (replace before publishing)
└── app.json                    # Expo + Android/Play Store config
```

---

## 📦 Publishing to the Google Play Store

1. Replace the placeholder images in `assets/` with real 1024×1024 artwork.
2. Create a free **Expo account** and install EAS: `npm install -g eas-cli`.
3. `eas build -p android --profile production` produces an `.aab` file.
4. Create a **Google Play Developer** account ($25 one-time) at
   **https://play.google.com/console**, create the app listing, and upload the
   `.aab`. See `PUBLISHING.md` for the full checklist.

---

## ⚠️ Medical disclaimer

Nutrivue gives general, AI-generated guidance and is **not** a medical device or
a substitute for professional advice. Users should always consult a doctor.
