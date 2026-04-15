# Titanium (Ti — Element 22)

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
