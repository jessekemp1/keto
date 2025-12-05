# Cloud Sync Implementation Plan

## Problem Statement
Data is currently stored per-browser/device in local storage (AsyncStorage). When users log metrics on different devices (Pixel 8, MacBook, etc.), the data is isolated to each device and not accessible across devices.

## Current State Analysis

### ✅ What Already Exists
1. **Firebase/Firestore infrastructure** - Fully implemented
   - `src/config/firebase.js` - Firebase config (needs environment variables)
   - `src/services/firestoreService.js` - All CRUD operations for cloud storage
   - `src/services/authService.js` - Sign in/up/out functionality

2. **Cloud sync logic** - Partially implemented
   - `src/utils/storage.js` - Has `shouldUseCloud()` and cloud sync functions
   - `src/contexts/AuthContext.js` - Automatically enables cloud sync on sign-in
   - Cloud sync is **opt-in** (only works when user signs in)

3. **UI Components**
   - `src/screens/AuthScreen.js` - Sign in/up screen
   - `src/screens/SettingsScreen.js` - Shows sync status

### ❌ What's Missing
1. **Automatic data migration** - Local data doesn't migrate to cloud on first sign-in
2. **Data loading priority** - Always checks local first, should prioritize cloud when signed in
3. **Onboarding flow** - No prompt to sign in on first use
4. **Firebase configuration** - Needs environment variables set up
5. **Data merge strategy** - No conflict resolution when data exists in both places

## Solution Architecture

### Phase 1: Enable Automatic Cloud Sync (Priority: High)

**Goal**: Make cloud sync work automatically when user signs in, with seamless data migration.

#### 1.1 Update Data Loading Priority
**File**: `src/utils/storage.js`

**Changes**:
- Modify `getDailyMetrics()` to check cloud first when signed in
- If cloud data exists, use it and cache locally
- If no cloud data but local data exists, migrate local to cloud
- Fallback to local if cloud unavailable

**Logic Flow**:
```
1. Check if user is signed in
2. If signed in:
   a. Try to load from cloud
   b. If cloud data exists → use it, cache locally
   c. If no cloud data but local data exists → migrate local to cloud, then use cloud
   d. If cloud fails → fallback to local
3. If not signed in:
   a. Use local storage only
```

#### 1.2 Automatic Data Migration
**File**: `src/utils/storage.js` - `migrateLocalDataToCloud()`

**Current**: Only migrates when explicitly enabling cloud sync
**Needed**: Auto-migrate on first sign-in if local data exists

**Implementation**:
- Add migration flag check: `has_migrated_to_cloud`
- On first sign-in, check if local data exists
- If yes, migrate all local metrics and profile to cloud
- Set migration flag to prevent duplicate migration
- Merge strategy: Cloud data takes precedence if conflict

#### 1.3 Improve Data Sync on Save
**File**: `src/utils/storage.js` - `saveDailyMetric()`

**Current**: Saves to local, then to cloud if enabled
**Needed**: 
- Save to cloud first when signed in (source of truth)
- Then cache locally for offline access
- Handle offline scenarios gracefully

### Phase 2: User Onboarding & Sign-In Flow (Priority: Medium)

#### 2.1 Welcome Screen / Onboarding
**New File**: `src/screens/WelcomeScreen.js` (optional, or enhance App.js)

**Purpose**: 
- Show on first app launch if not signed in
- Explain benefits of cloud sync
- Provide easy path to sign in

**Alternative**: Enhance existing Settings screen to be more prominent

#### 2.2 Auto-Prompt for Sign-In
**File**: `App.js` or `AuthContext.js`

**Logic**:
- On app load, check if user is signed in
- If not signed in AND local data exists:
  - Show gentle prompt: "Sign in to sync your data across devices?"
  - Allow "Not now" option
- If not signed in AND no local data:
  - Show welcome screen with sign-up option

### Phase 3: Firebase Configuration (Priority: High)

#### 3.1 Environment Variables Setup
**File**: `src/config/firebase.js`

**Current**: Uses placeholder values
**Needed**: 
- Create `.env` file with Firebase config
- Use `expo-constants` or `expo-env` for environment variables
- Document setup in README

**Required Variables**:
```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

#### 3.2 Firebase Project Setup
**Steps**:
1. Create Firebase project (if not exists)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Set up Firestore security rules
5. Get config values and add to `.env`

### Phase 4: Data Conflict Resolution (Priority: Low)

#### 4.1 Merge Strategy
**When**: Local and cloud data both exist

**Strategy**:
- Cloud data is source of truth
- On sync, merge by date (most recent wins per date)
- Preserve all unique dates from both sources

#### 4.2 Last-Write-Wins with Timestamps
- Add `updatedAt` timestamp to all metrics
- On conflict, use most recent `updatedAt`
- Log conflicts for user review

## Implementation Steps

### Step 1: Update Storage Logic (Critical)
1. Modify `getDailyMetrics()` to prioritize cloud when signed in
2. Enhance `migrateLocalDataToCloud()` to be automatic
3. Update `saveDailyMetric()` to save cloud-first when signed in
4. Add migration flag tracking

### Step 2: Set Up Firebase
1. Create/configure Firebase project
2. Set up environment variables
3. Test Firebase connection
4. Verify Firestore rules

### Step 3: Enhance User Experience
1. Add sign-in prompt on app launch (optional)
2. Improve Settings screen messaging
3. Add sync status indicator
4. Show "Last synced" timestamp

### Step 4: Testing
1. Test sign-in flow
2. Test data migration (local → cloud)
3. Test cross-device sync (web + mobile)
4. Test offline scenarios
5. Test conflict resolution

## Technical Details

### Data Flow Diagram

```
User Action (Save Metric)
    ↓
Is User Signed In?
    ├─ YES → Save to Cloud (Firestore)
    │         ↓
    │      Success? → Cache to Local
    │         ↓
    │      Fail? → Save to Local (offline mode)
    │
    └─ NO → Save to Local Only
```

```
App Load (Get Metrics)
    ↓
Is User Signed In?
    ├─ YES → Load from Cloud
    │         ↓
    │      Success? → Cache to Local, Return Cloud Data
    │         ↓
    │      No Cloud Data? → Check Local
    │         ↓
    │      Local Data Exists? → Migrate to Cloud, Return Cloud Data
    │         ↓
    │      No Data? → Return Empty
    │
    └─ NO → Load from Local Only
```

### Migration Strategy

**On First Sign-In**:
1. Check `has_migrated_to_cloud` flag
2. If false:
   - Load all local metrics
   - Load local profile
   - Upload to Firestore
   - Set `has_migrated_to_cloud = true`
   - Continue with cloud-first loading

**Conflict Handling**:
- If metric exists in both local and cloud for same date:
  - Compare `updatedAt` timestamps
  - Use most recent
  - If timestamps equal, prefer cloud data

## Security Considerations

1. **Firestore Security Rules**: Ensure users can only access their own data
2. **Authentication**: Require email verification (optional)
3. **Data Privacy**: All data is user-owned, encrypted in transit
4. **Offline Support**: Local cache for offline access

## Success Criteria

✅ User signs in once → data syncs across all devices
✅ Data logged on Pixel 8 → appears on MacBook web app
✅ Data logged on MacBook → appears on Pixel 8
✅ Offline logging works → syncs when connection restored
✅ No data loss during migration
✅ Smooth user experience (no manual steps required)

## Estimated Implementation Time

- **Phase 1** (Core sync): 2-3 hours
- **Phase 2** (UX improvements): 1-2 hours  
- **Phase 3** (Firebase setup): 30 minutes
- **Phase 4** (Conflict resolution): 1-2 hours
- **Testing**: 1-2 hours

**Total**: ~6-10 hours of development time

## Next Steps

1. ✅ Review and approve plan
2. Set up Firebase project and get config
3. Implement Phase 1 (core sync logic)
4. Test with two devices
5. Deploy and verify

