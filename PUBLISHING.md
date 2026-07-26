# 📦 Publishing Nutrivue to the Google Play Store

A step-by-step checklist. Take your time — none of this requires coding.

## 1. Prerequisites

- [ ] A **Google Play Developer account** ($25 one-time) — https://play.google.com/console
- [ ] A free **Expo account** — https://expo.dev
- [ ] EAS CLI installed: `npm install -g eas-cli`, then `eas login`

## 2. Before you build

- [ ] Replace the placeholder images in `assets/` with real artwork:
      - `icon.png` (1024×1024), `adaptive-icon.png` (1024×1024),
        `splash.png`, `notification-icon.png` (white, transparent bg)
- [ ] Confirm `app.json` → `android.package` is your unique id
      (currently `com.nutrivue.health`). It can never be changed after
      the first upload, so pick carefully.
- [ ] Bump `android.versionCode` for each new upload (EAS can auto-increment).

## 3. Build the release file

```bash
eas build:configure       # first time only
eas build -p android --profile production
```

This runs in the cloud and produces an **.aab** (Android App Bundle) file — the
format Google Play requires. Download it when the build finishes.

## 4. Create the Play Store listing

In the Play Console → **Create app**, then complete:

- [ ] App name, short & full description
- [ ] Screenshots (phone), feature graphic (1024×500), app icon
- [ ] **Privacy policy URL** (required — the app collects health data)
- [ ] **Data safety** form: declare health data collection, auth, and that data
      is encrypted in transit and users can request deletion
- [ ] Content rating questionnaire
- [ ] Target audience (not for children, given medical content)

## 5. Health-app specific requirements ⚠️

Google scrutinizes health apps. Be ready to:

- [ ] Provide a clear **medical disclaimer** in-app and in the listing
      (this app already shows one on the results screen)
- [ ] Explain the AI's role and that it is not a diagnosis
- [ ] Justify each permission (camera = meal photos, notifications = reminders)

## 6. Upload & release

- [ ] Create an **Internal testing** release first, upload the `.aab`, and test
      on your own device via the opt-in link.
- [ ] When happy, promote to **Production**. First review can take a few days.

## 7. Updates later

For JS-only changes you can push over-the-air with `eas update`. For native
changes (new permissions, SDK upgrades), rebuild and upload a new `.aab` with a
higher `versionCode`.
