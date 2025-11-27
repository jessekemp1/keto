# Firebase Setup Guide

This app uses Firebase for cloud storage, authentication, and data sync across devices.

## Features

- **Authentication**: Email/password sign-in and sign-up
- **Cloud Sync**: Automatic sync of metrics and profile data across devices
- **Offline Support**: Works offline with local storage, syncs when online
- **Data Migration**: Automatically migrates local data to cloud when signing in

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or use an existing project
3. Enter project name (e.g., "keto-tracker")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Register Web App

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register app with nickname (e.g., "Keto Tracker Web")
5. Copy the Firebase config object

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the values from Firebase config:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

### 4. Enable Authentication

1. In Firebase Console, go to **Build** > **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Click "Save"

### 5. Create Firestore Database

1. In Firebase Console, go to **Build** > **Firestore Database**
2. Click "Create database"
3. Select "Start in production mode"
4. Choose a location (closest to your users)
5. Click "Enable"

### 6. Set Firestore Security Rules

1. Go to **Firestore Database** > **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // User can only read/write their own metrics
      match /metrics/{metricId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. Click "Publish"

### 7. Configure Vercel Environment Variables (for deployment)

1. Go to your Vercel project dashboard
2. Click **Settings** > **Environment Variables**
3. Add each Firebase config variable:
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
4. Redeploy your app

## Data Structure

### Firestore Collections

```
/users/{userId}
  - startDate: string (ISO date)
  - currentPhase: number (1-12)
  - phaseStartDate: string (ISO date)
  - targetDrBozRatio: number
  - updatedAt: string (ISO timestamp)

  /metrics/{date}
    - date: string (yyyy-MM-dd)
    - glucose: number (mmol/L)
    - ketones: number (mmol/L)
    - drBozRatio: number
    - weight: number | null
    - energy: number | null (1-10)
    - clarity: number | null (1-10)
    - updatedAt: string (ISO timestamp)
```

## Testing

1. Start the app: `npm start`
2. Go to **Settings** tab
3. Click "Sign In / Create Account"
4. Create a test account
5. Log metrics and verify they appear in Firestore Console

## Troubleshooting

### Auth errors
- Check Firebase Console > Authentication is enabled
- Verify `.env` file has correct values
- Make sure email/password provider is enabled

### Firestore permission errors
- Check Security Rules are correctly set
- Verify user is signed in before accessing data
- Check browser console for detailed error messages

### Data not syncing
- Check internet connection
- Verify Firestore rules allow read/write
- Check browser console for sync errors

## Security Best Practices

✅ **What's secure:**
- User authentication required for cloud access
- Each user can only access their own data
- Passwords hashed by Firebase Auth
- HTTPS encryption for all data transfers

⚠️ **What to avoid:**
- Don't commit `.env` file to git (already in `.gitignore`)
- Don't share Firebase config publicly if you have paid features enabled
- Don't disable Firestore security rules

## Offline Support

The app works offline with these behaviors:

- **Without account**: Data saved to local storage only
- **With account (offline)**: Reads from local cache, syncs when online
- **With account (online)**: Real-time sync to Firebase

## Data Migration

When a user signs in for the first time:
1. All local data (profile + metrics) automatically uploads to Firebase
2. Local storage remains as cache
3. Future updates sync to both local and cloud

This ensures no data loss when transitioning from local-only to cloud sync.
