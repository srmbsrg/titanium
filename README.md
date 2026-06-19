# Loadstone — Structured Hydration

> The app currently mounted by this repo is **Loadstone**, the companion app for
> the Loadstone magnetic water flask. The legacy Titanium / Carbon ERP field app
> (documented further down) still lives under `src/` but is no longer mounted by
> `App.tsx`.

A dark, premium, **fully offline** wellness companion for the Loadstone flask.
No backend, no accounts, no cloud sync — everything is stored on-device with
AsyncStorage.

## Screens

| Screen | What it does |
|---|---|
| **Home / Dashboard** | Daily hydration progress ring vs. goal (default 64 oz), time since last drink, structured-water motivation, quick-log shortcuts |
| **Log** | Tap-to-log 8 / 16 / 32 oz (full flask) presets plus a custom-amount stepper; today's entries with remove |
| **Protocol** | The 30-minute Magnetic Structuring Protocol timer with a live pulsing field animation and start / pause / reset |
| **Science** | What structured water is, the Halbach array, and why continuous immersion beats brief exposure |
| **Settings** | Daily goal (oz), reminders toggle, and reminder time picker — all persisted |
| **History** | Full hydration log grouped by day with per-day totals (pushed from the dashboard) |

## Architecture

```
src/loadstone/
  theme.ts            # colors / spacing / typography (bg #060A12, accent #24D8E4)
  types.ts            # DrinkLog, Settings, presets, protocol duration
  storage.ts          # AsyncStorage read/write (defensive, offline-first)
  store.ts            # Zustand store + pure derived helpers (today's total, last drink)
  format.ts           # time-ago, clock, mm:ss, motivational copy
  hooks.ts            # useNow ticking clock
  navigation.tsx      # bottom tabs + Home native stack (Dashboard → History)
  LoadstoneApp.tsx    # root: hydrates persisted state on mount, then renders
  components/         # ProgressRing (SVG), PulseRing (Animated), shared UI
  screens/            # Dashboard, LogDrink, Protocol, Science, Settings, History
```

- **Navigation:** React Navigation 7 — bottom tabs with a native stack on Home.
- **State:** Zustand, loaded from AsyncStorage once on launch and written back
  after every mutation, so logs and settings survive restarts.
- **Persistence test:** `__tests__/loadstone.store.test.ts` proves logged drinks
  round-trip through storage across a simulated restart.

## Verify

```bash
npx tsc --noEmit   # clean
npm test           # store/persistence + render tests pass
```

> Reminder scheduling itself needs a native notifications module and is out of
> scope for this offline build — the reminder preference is stored and ready to
> wire up.

---

# Titanium (Ti — Element 22) — legacy

Field technician mobile app for the **Carbon ERP** platform.

Built by **Foundry Familiars** / Carborundum AI.

---

## What This Is

Titanium is the native mobile companion to Carbon — the ERP for trades businesses (HVAC, plumbing, electrical, auto service, elevator). Field techs use Titanium to:

- View their daily job queue
- Access job details, customer records, and site addresses
- Create and update work orders in the field
- Look up equipment history for a site

Offline-capable by design. Not a PWA.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React Native 0.85 (bare CLI, no Expo) |
| Language | TypeScript |
| Navigation | React Navigation 7 (native stack + bottom tabs) |
| Server state | TanStack React Query |
| Local/UI state | Zustand |
| HTTP | Axios (`src/api/carbonClient.ts`) |

---

## Run

### Prerequisites

- Node 22+
- Ruby (iOS)
- Xcode 15+ (iOS)
- Android Studio + SDK 34 (Android)
- CocoaPods: `bundle install && bundle exec pod install`

### iOS

```bash
cd ios && bundle exec pod install && cd ..
npx react-native run-ios
```

### Android

```bash
npx react-native run-android
```

### Metro bundler (standalone)

```bash
npm start
```

---

## Project Structure

```
src/
  api/
    carbonClient.ts         # Axios client → Carbon ERP backend
  navigation/
    index.tsx               # Root navigator (tabs + stacks)
  screens/
    HomeScreen.tsx          # Today's job queue
    JobDetailScreen.tsx     # Job record + drill-downs
    WorkOrderScreen.tsx     # Create / update work order
    CustomerListScreen.tsx  # Searchable customer list
    CustomerScreen.tsx      # Customer record + equipment
    EquipmentListScreen.tsx # All equipment across sites
    EquipmentScreen.tsx     # Equipment detail + service history
  store/
    index.ts                # Zustand store (auth, offline queue)
  types/
    models.ts               # Domain types (Job, Customer, Equipment, WorkOrder)
    navigation.ts           # Navigator param list types
```

---

## Backend

Carbon ERP API base URL is set via `CARBON_API_URL` env var (see `src/api/carbonClient.ts`).

Default: `https://api.carbonerp.internal/v1`

All screens currently use mock data. Wire up real data by implementing
`useQuery(() => carbonClient.<method>(...))` in each screen.

---

## GitHub

Repository: [github.com/srmbsrg/titanium](https://github.com/srmbsrg/titanium)

### Manual repo setup (if push was not completed automatically)

Store your GitHub PAT at `C:\Users\scott\.secrets\github_pat.txt`, then:

```bash
# Create repo
PAT=$(cat /c/Users/scott/.secrets/github_pat.txt)
curl -X POST https://api.github.com/user/repos \
  -H "Authorization: Bearer $PAT" \
  -H "Content-Type: application/json" \
  -d '{"name":"titanium","description":"Titanium field app — Carbon ERP companion (Foundry Familiars)","private":false}'

# Push
git remote add origin https://github.com/srmbsrg/titanium.git
git push -u origin master
```
