# Carbon — field-service app (repo: `titanium`)

Carbon is the native mobile app for trades technicians (HVAC, plumbing, electrical, elevator,
auto). A tech signs in, works their dispatch queue, and runs a job end to end: view job
details and customer/site records, create and update work orders, capture time & materials,
take on-site payment, and close the job with a completion report. It is the field-side
counterpart to **Silicon** (the `manifold` ERP), which holds the system of record — Carbon
reads and writes jobs, customers, and parts through Silicon's live APIs.

> The repo is named `titanium` (the app's former element name); `package.json` is now
> `carbon@1.5.0`. A separate "Loadstone" hydration companion once briefly mounted in
> `App.tsx`; it has been **un-mounted** and its modules remain parked under `src/loadstone/`
> for a possible future split. `App.tsx` mounts the Carbon field app.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React Native **0.85** — bare CLI, **not Expo** |
| Language | TypeScript 5 (`npx tsc --noEmit` = 0 errors) |
| React | 19 |
| Navigation | React Navigation 7 (native stack + bottom tabs) |
| Server state | TanStack React Query |
| Local/auth state | Zustand, persisted via AsyncStorage |
| HTTP | Axios (`src/api/carbonClient.ts`) |
| Voice (Trade-Talk) | `@react-native-voice/voice`, `react-native-sound` |

## Install & run locally

### Prerequisites

- Node **>= 22.11**
- Ruby + CocoaPods and Xcode 15+ (iOS)
- Android Studio + Android SDK (Android)

### Commands

```bash
npm install

# iOS
cd ios && bundle install && bundle exec pod install && cd ..
npm run ios            # or: npx react-native run-ios

# Android
npm run android        # or: npx react-native run-android

# Metro bundler standalone
npm start

# Checks
npx tsc --noEmit       # clean
npm test               # jest
```

### Backend configuration

Defaults point at the live Railway-hosted Silicon backend, so the app runs out of the box
with no env setup. To override per environment, set these before the build — they are inlined
into the bundle by `babel-plugin-transform-inline-environment-variables` (see `src/config.ts`):

| Env var | Default | Purpose |
|---|---|---|
| `MANIFOLD_API_URL` | `https://manifold-web-production.up.railway.app/api/erp` | ERP data (customers, work orders, finance) |
| `CARBON_API_URL` | `https://manifold-web-production.up.railway.app/api/carbon` | Carbon jobs API (Job/JobNote/JobPhoto) |
| `MANIFOLD_AUTH_URL` | `https://manifold-web-production.up.railway.app/api/mobile/login` | Mobile sign-in; returns `{ token, techId, techName }` |
| `STRIPE_PUBLISHABLE_KEY` | *(empty)* | On-site card payments (not yet live) |
| `ELEVENLABS_API_KEY` | *(empty)* | Voice features |

## Architecture

```
App.tsx                 # root: rehydrates persisted auth, then gates Login vs RootNavigator
src/
  config.ts             # runtime config + Railway/Silicon default URLs
  api/carbonClient.ts   # Axios clients for /api/erp and /api/carbon + domain methods
  navigation/           # tabs + native stacks
  screens/              # Home, Dispatch, JobDetail, WorkOrder, JobComplete, JobPayment,
                        #   CustomerList, Customer, EquipmentList, Equipment, HowTo,
                        #   Upsell, CarbComm (Trade-Talk voice), Login
  store/                # Zustand store (auth, session); persisted to AsyncStorage
  types/models.ts       # Job, Customer, Equipment, WorkOrder, CompletionReport, ...
  loadstone/            # PARKED — un-mounted hydration app, not part of Carbon
```

- **Auth** persists across restarts: `App.tsx` rehydrates the session from AsyncStorage
  before choosing the login gate or the app, so a signed-in tech stays signed in.
- Job statuses are normalized from the Carbon API vocabulary
  (`scheduled | next | on-site | complete`) to the app's
  (`scheduled | en_route | on_site | completed`).

### Carbon <-> Silicon integration seam

- **Sign-in:** `POST /api/mobile/login` returns a Bearer token; Carbon stores it and attaches
  `Authorization: Bearer <token>` to every request.
- **Jobs/dispatch:** the app uses the dedicated Carbon jobs API (`/api/carbon/jobs`), backed
  by Silicon's Postgres `Job` / `JobNote` / `JobPhoto` models.
- **Job completion → inventory:** on completion, Carbon transmits parts/labor/summary. Parts
  are sent as `{ productId, sku, name, qty }` and the status flips to `complete`; for any part
  carrying a `productId`, this drives **Silicon's inventory-decrement → low-stock-alert loop**.
  The human-readable record (summary + labor hours + parts + signature) is also saved as a job
  note. Customer screens and Work Order save are wired to the live endpoints.

## Current status & known gaps (not yet production-ready)

**Working / verified:**
- `npx tsc --noEmit` = **0 errors**.
- Live backend integration: jobs/dispatch/status, job completion with full parts/labor/summary
  report (drives Silicon inventory decrement), auth persisted via AsyncStorage, Customers and
  Work Order save wired to live endpoints.

**Stubs / next pass:**
- **Equipment & service-history screens** are stubs — the corresponding Silicon backend
  endpoints don't exist yet.
- Maps / navigation, photo capture, and real Stripe card processing are not implemented.
- Trade-Talk voice is not yet working on Android.
- Offline queue is not implemented.

**Release blocker:**
- The Android **`release` build is debug-signed** (`signingConfig signingConfigs.debug` for
  both build types in `android/app/build.gradle`). A real upload keystore is required before
  a Play Store / production release.
