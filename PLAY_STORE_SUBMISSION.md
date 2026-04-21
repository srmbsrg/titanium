# Titanium — Google Play Store Submission Guide

## Prerequisites

- Android Studio or JDK installed (for `keytool` and `gradlew`)
- Google Play Console access under the **carborundum.ai** Google Workspace account
- Node.js and project dependencies installed (`npm install`)

---

## Step 1 — Set real signing passwords

The keystore at `android/app/carborundum-release.keystore` was generated with placeholder passwords.
**Before building a release, regenerate it with real secure passwords:**

```bash
# From the repo root — replace YOUR_STORE_PASS and YOUR_KEY_PASS with real values
keytool -genkeypair -v -storetype PKCS12 \
  -keystore android/app/carborundum-release.keystore \
  -alias carborundum-release \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Carborundum AI, OU=Mobile, O=Carborundum AI, L=Texas, ST=Texas, C=US" \
  -storepass YOUR_STORE_PASS \
  -keypass YOUR_KEY_PASS
```

Then open `android/gradle.properties` and replace the placeholder values:

```properties
CARBORUNDUM_STORE_PASSWORD=YOUR_STORE_PASS   # replace with real value
CARBORUNDUM_KEY_PASSWORD=YOUR_KEY_PASS       # replace with real value
```

> **Important:** Store these passwords somewhere safe (e.g., 1Password).
> The keystore file and these passwords must **never be committed to git**.
> Both are covered by `.gitignore` — verify with `git status` before committing.

---

## Step 2 — Create the .env file for API keys

Create a `.env` file in the repo root (already in `.gitignore`):

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
CARBON_API_URL=https://your-carbon-api-endpoint.carborundum.ai
```

---

## Step 3 — Build the release bundle

```bash
# From the repo root
npm install

cd android
./gradlew bundleRelease
```

The signed `.aab` file will be output to:

```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## Step 4 — Create the app in Play Console

1. Sign in to [Google Play Console](https://play.google.com/console) with your **carborundum.ai** Google Workspace account.
2. Click **Create app**.
3. Fill in:
   - **App name:** Titanium
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** as appropriate
4. Accept the declarations and click **Create app**.

---

## Step 5 — Upload to Internal Testing track first

1. In your new app, go to **Release > Testing > Internal testing**.
2. Click **Create new release**.
3. Upload `android/app/build/outputs/bundle/release/app-release.aab`.
4. Add release notes (e.g., "Initial internal build").
5. Click **Save > Review release > Start rollout to Internal testing**.
6. Add testers via the **Testers** tab using their Google accounts.

> Internal testing lets you verify the signed build end-to-end before promoting to production.

---

## Step 6 — Promote to Production

Once internal testing passes:

1. Go to **Release > Production > Create new release**.
2. Promote the tested `.aab` (or re-upload if needed).
3. Complete the store listing (screenshots, description, content rating, etc.).
4. Submit for review.

---

## App identifiers

| Field | Value |
|---|---|
| Application ID | `ai.carborundum.titanium` |
| Version code | `1` |
| Version name | `1.0.0` |
| Keystore alias | `carborundum-release` |
| Keystore location | `android/app/carborundum-release.keystore` |

---

## Keystore backup reminder

**Back up the keystore file and its passwords securely.** If you lose the keystore you cannot update the app on the Play Store — you would have to publish under a new package name. Store a copy in a secure location (e.g., encrypted cloud storage, team password manager).
